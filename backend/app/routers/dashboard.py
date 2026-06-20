from decimal import Decimal

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from app.constants import LOW_STOCK_THRESHOLD, ORDER_STATUSES
from app.database import get_db
from app.dependencies import get_current_user
from app.models import Customer, Order, OrderItem, Product, User
from app.permissions import require_admin
from app.routers.orders import _serialize_order
from app.schemas import CustomerDashboardStats, DashboardStats, OrderStatusCounts, ProductResponse

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


def _order_status_counts(db: Session, customer_id: int | None = None) -> OrderStatusCounts:
    query = db.query(Order.status, func.count(Order.id))
    if customer_id:
        query = query.filter(Order.customer_id == customer_id)
    rows = query.group_by(Order.status).all()
    counts = {s: 0 for s in ORDER_STATUSES}
    for order_status, count in rows:
        if order_status in counts:
            counts[order_status] = count
    return OrderStatusCounts(**counts)


def _recent_orders(db: Session, limit: int = 8, customer_id: int | None = None):
    query = db.query(Order).options(
        joinedload(Order.items).joinedload(OrderItem.product), joinedload(Order.customer)
    )
    if customer_id:
        query = query.filter(Order.customer_id == customer_id)
    orders = query.order_by(Order.created_at.desc()).limit(limit).all()
    return [_serialize_order(order) for order in orders]


@router.get("/admin", response_model=DashboardStats)
def get_admin_dashboard(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    total_products = db.query(Product).count()
    total_customers = db.query(Customer).count()
    total_orders = db.query(Order).count()
    revenue = (
        db.query(func.coalesce(func.sum(Order.total_amount), 0))
        .filter(Order.status != "cancelled")
        .scalar()
    )
    low_stock = (
        db.query(Product)
        .filter(Product.quantity_in_stock <= LOW_STOCK_THRESHOLD)
        .order_by(Product.quantity_in_stock)
        .all()
    )
    return DashboardStats(
        total_products=total_products,
        total_customers=total_customers,
        total_orders=total_orders,
        total_revenue=Decimal(str(revenue)),
        order_status_counts=_order_status_counts(db),
        low_stock_products=[ProductResponse.model_validate(p) for p in low_stock],
        recent_orders=_recent_orders(db),
    )


@router.get("/customer", response_model=CustomerDashboardStats)
def get_customer_dashboard(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not current_user.customer_id:
        return CustomerDashboardStats(
            my_orders_count=0,
            my_total_spent=Decimal("0"),
            order_status_counts=OrderStatusCounts(),
            recent_orders=[],
        )

    cid = current_user.customer_id
    my_orders_count = db.query(Order).filter(Order.customer_id == cid).count()
    spent = (
        db.query(func.coalesce(func.sum(Order.total_amount), 0))
        .filter(Order.customer_id == cid, Order.status != "cancelled")
        .scalar()
    )
    return CustomerDashboardStats(
        my_orders_count=my_orders_count,
        my_total_spent=Decimal(str(spent)),
        order_status_counts=_order_status_counts(db, customer_id=cid),
        recent_orders=_recent_orders(db, customer_id=cid),
    )
