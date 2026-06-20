from sqlalchemy import text

from app.config import settings
from app.database import SessionLocal, engine
from app.invoice import generate_invoice_number
from app.models import Customer, Order, User
from app.security import hash_password

MIGRATIONS = [
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'customer'",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS customer_id INTEGER REFERENCES customers(id)",
    "ALTER TABLE orders ADD COLUMN IF NOT EXISTS invoice_number VARCHAR(50)",
    "ALTER TABLE orders ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending'",
]


def run_migrations():
    with engine.begin() as conn:
        for stmt in MIGRATIONS:
            conn.execute(text(stmt))


def backfill_invoices():
    db = SessionLocal()
    try:
        orders = db.query(Order).filter((Order.invoice_number == None) | (Order.invoice_number == "PENDING")).all()
        for order in orders:
            order.invoice_number = generate_invoice_number(order.id, order.created_at)
        no_status = db.query(Order).filter((Order.status == None) | (Order.status == "")).all()
        for order in no_status:
            order.status = "pending"
        if orders or no_status:
            db.commit()
    finally:
        db.close()


def link_customers_to_users():
    db = SessionLocal()
    try:
        users = db.query(User).filter(User.role == "customer", User.customer_id == None).all()
        if not users:
            return
        for user in users:
            customer = db.query(Customer).filter(Customer.email == user.email).first()
            if not customer:
                customer = Customer(
                    full_name=user.full_name,
                    email=user.email,
                    phone="0000000000",
                )
                db.add(customer)
                db.flush()
            user.customer_id = customer.id
        db.commit()
    finally:
        db.close()


def seed_admin():
    db = SessionLocal()
    try:
        admin = db.query(User).filter(User.email == settings.admin_email.lower()).first()
        if admin:
            if admin.role != "admin":
                admin.role = "admin"
                db.commit()
            return

        admin = User(
            full_name="System Admin",
            email=settings.admin_email.lower(),
            hashed_password=hash_password(settings.admin_password),
            role="admin",
        )
        db.add(admin)
        db.commit()
    finally:
        db.close()
