from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, joinedload

from app.constants import ORDER_STATUSES, VALID_TRANSITIONS
from app.database import get_db
from app.dependencies import get_current_user
from app.invoice import build_invoice_response, generate_invoice_number
from app.models import Customer, Order, OrderItem, Product, User
from app.permissions import require_admin
from app.schemas import CustomerOrderCreate, InvoiceResponse, OrderCreate, OrderItemResponse, OrderResponse, OrderStatusUpdate

router = APIRouter(prefix="/orders", tags=["Orders"])


def _serialize_order(order: Order) -> OrderResponse:
    return OrderResponse(
        id=order.id,
        customer_id=order.customer_id,
        invoice_number=order.invoice_number,
        status=order.status or "pending",
        total_amount=order.total_amount,
        created_at=order.created_at,
        customer_name=order.customer.full_name if order.customer else None,
        items=[
            OrderItemResponse(
                id=item.id,
                product_id=item.product_id,
                quantity=item.quantity,
                unit_price=item.unit_price,
                product_name=item.product.name if item.product else None,
            )
            for item in order.items
        ],
    )


def _restore_stock(db: Session, order: Order):
    for item in order.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if product:
            product.quantity_in_stock += item.quantity


def _cancel_order(db: Session, order: Order):
    if order.status == "delivered":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Delivered orders cannot be cancelled")
    if order.status == "cancelled":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Order is already cancelled")
    _restore_stock(db, order)
    order.status = "cancelled"


def _resolve_customer_id(db: Session, user: User) -> int:
    if user.role != "customer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only customer accounts can place orders. Please sign up or log in as a customer.",
        )

    if user.customer_id:
        return user.customer_id

    existing = db.query(Customer).filter(Customer.email == user.email).first()
    if existing:
        user.customer_id = existing.id
        db.commit()
        db.refresh(user)
        return existing.id

    customer = Customer(
        full_name=user.full_name,
        email=user.email,
        phone="0000000000",
    )
    try:
        db.add(customer)
        db.flush()
        user.customer_id = customer.id
        db.commit()
        db.refresh(user)
        return customer.id
    except IntegrityError:
        db.rollback()
        existing = db.query(Customer).filter(Customer.email == user.email).first()
        if existing:
            user.customer_id = existing.id
            db.commit()
            return existing.id
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not link your account to a customer profile",
        )


def _create_order_for_customer(db: Session, customer_id: int, items_data) -> Order:
    products: dict[int, Product] = {}
    for item in items_data:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with id {item.product_id} not found",
            )
        if product.quantity_in_stock < item.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Insufficient stock for '{product.name}'. "
                    f"Available: {product.quantity_in_stock}, Requested: {item.quantity}"
                ),
            )
        products[item.product_id] = product

    order = Order(customer_id=customer_id, total_amount=Decimal("0"), invoice_number="PENDING", status="pending")
    db.add(order)
    db.flush()

    order.invoice_number = generate_invoice_number(order.id)
    total_amount = Decimal("0")

    for item in items_data:
        product = products[item.product_id]
        line_total = Decimal(str(product.price)) * item.quantity
        total_amount += line_total
        db.add(
            OrderItem(
                order_id=order.id,
                product_id=product.id,
                quantity=item.quantity,
                unit_price=product.price,
            )
        )
        product.quantity_in_stock -= item.quantity

    order.total_amount = total_amount
    db.commit()

    return (
        db.query(Order)
        .options(joinedload(Order.items).joinedload(OrderItem.product), joinedload(Order.customer))
        .filter(Order.id == order.id)
        .first()
    )


def _get_order_or_404(db: Session, order_id: int) -> Order:
    order = (
        db.query(Order)
        .options(joinedload(Order.items).joinedload(OrderItem.product), joinedload(Order.customer))
        .filter(Order.id == order_id)
        .first()
    )
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    return order


def _ensure_order_access(order: Order, user: User):
    if user.role == "admin":
        return
    if user.role == "customer" and user.customer_id == order.customer_id:
        return
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")


@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(
    order_data: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role == "customer":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Use /orders/place to submit your order")

    if not order_data.customer_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="customer_id is required")

    customer = db.query(Customer).filter(Customer.id == order_data.customer_id).first()
    if not customer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")

    order = _create_order_for_customer(db, order_data.customer_id, order_data.items)
    return _serialize_order(order)


@router.post("/place", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def place_order(
    order_data: CustomerOrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "customer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only customer accounts can place orders here",
        )

    customer_id = _resolve_customer_id(db, current_user)
    order = _create_order_for_customer(db, customer_id, order_data.items)
    return _serialize_order(order)


@router.get("", response_model=list[OrderResponse])
def get_orders(
    status_filter: str | None = Query(None, alias="status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Order).options(
        joinedload(Order.items).joinedload(OrderItem.product), joinedload(Order.customer)
    )
    if current_user.role == "customer":
        if not current_user.customer_id:
            return []
        query = query.filter(Order.customer_id == current_user.customer_id)

    if status_filter:
        if status_filter not in ORDER_STATUSES:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid status filter")
        query = query.filter(Order.status == status_filter)

    orders = query.order_by(Order.created_at.desc()).all()
    return [_serialize_order(order) for order in orders]


@router.get("/{order_id}", response_model=OrderResponse)
def get_order(order_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    order = _get_order_or_404(db, order_id)
    _ensure_order_access(order, current_user)
    return _serialize_order(order)


@router.get("/{order_id}/invoice", response_model=InvoiceResponse)
def get_invoice(order_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    order = _get_order_or_404(db, order_id)
    _ensure_order_access(order, current_user)
    return build_invoice_response(order)


@router.patch("/{order_id}/status", response_model=OrderResponse)
def update_order_status(
    order_id: int,
    payload: OrderStatusUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    order = _get_order_or_404(db, order_id)
    current = order.status or "pending"
    new_status = payload.status

    if new_status == current:
        return _serialize_order(order)

    allowed = VALID_TRANSITIONS.get(current, set())
    if new_status not in allowed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot transition order from '{current}' to '{new_status}'",
        )

    if new_status == "cancelled":
        _restore_stock(db, order)

    order.status = new_status
    db.commit()
    db.refresh(order)
    return _serialize_order(order)


@router.post("/{order_id}/cancel", response_model=OrderResponse)
def cancel_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    order = _get_order_or_404(db, order_id)
    _ensure_order_access(order, current_user)

    if current_user.role == "customer" and order.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You can only cancel orders that are still pending",
        )

    _cancel_order(db, order)
    db.commit()
    db.refresh(order)
    return _serialize_order(order)


@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_order(
    order_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    order = db.query(Order).options(joinedload(Order.items)).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    _cancel_order(db, order)
    db.commit()
