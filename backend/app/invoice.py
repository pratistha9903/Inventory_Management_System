from datetime import datetime

from app.models import Order


def generate_invoice_number(order_id: int, created_at: datetime | None = None) -> str:
    year = (created_at or datetime.now()).year
    return f"INV-{year}-{order_id:05d}"


def build_invoice_response(order: Order):
    from app.schemas import InvoiceItemResponse, InvoiceResponse
    from decimal import Decimal

    customer = order.customer
    items = []
    for item in order.items:
        line_total = Decimal(str(item.unit_price)) * item.quantity
        items.append(
            InvoiceItemResponse(
                product_name=item.product.name if item.product else "Product",
                sku=item.product.sku if item.product else None,
                quantity=item.quantity,
                unit_price=item.unit_price,
                line_total=line_total,
            )
        )

    return InvoiceResponse(
        invoice_number=order.invoice_number,
        order_id=order.id,
        issued_at=order.created_at,
        customer_name=customer.full_name if customer else "",
        customer_email=customer.email if customer else "",
        customer_phone=customer.phone if customer else "",
        items=items,
        total_amount=order.total_amount,
    )
