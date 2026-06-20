from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, engine
from app.dependencies import get_current_user
from app.routers import auth, customers, dashboard, orders, products
from app.startup import backfill_invoices, link_customers_to_users, run_migrations, seed_admin

Base.metadata.create_all(bind=engine)
run_migrations()
backfill_invoices()
link_customers_to_users()
seed_admin()

app = FastAPI(
    title="Inventory Pro API",
    description="Production-ready Inventory & Order Management System",
    version="1.0.0",
)

origins = [origin.strip() for origin in settings.cors_origins.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)

protected = [Depends(get_current_user)]
app.include_router(products.router, dependencies=protected)
app.include_router(customers.router, dependencies=protected)
app.include_router(orders.router, dependencies=protected)
app.include_router(dashboard.router, dependencies=protected)


@app.get("/health")
def health_check():
    return {"status": "healthy"}
