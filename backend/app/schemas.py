from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator, model_validator


class UserRegister(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=255)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=72)
    phone: str | None = Field(None, min_length=5, max_length=50)
    role: str = Field(default="customer", pattern="^(admin|customer)$")

    @model_validator(mode="after")
    def validate_customer_fields(self) -> "UserRegister":
        if self.role == "customer" and not self.phone:
            raise ValueError("Phone is required for customer accounts")
        return self


class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1)


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str
    email: str
    role: str
    customer_id: int | None = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class ProductCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    sku: str = Field(..., min_length=1, max_length=100)
    price: Decimal = Field(..., gt=0)
    quantity_in_stock: int = Field(..., ge=0)


class ProductUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=255)
    sku: str | None = Field(None, min_length=1, max_length=100)
    price: Decimal | None = Field(None, gt=0)
    quantity_in_stock: int | None = Field(None, ge=0)


class ProductResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    sku: str
    price: Decimal
    quantity_in_stock: int


class CustomerCreate(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=255)
    email: EmailStr
    phone: str = Field(..., min_length=5, max_length=50)


class CustomerResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str
    email: str
    phone: str


class OrderItemCreate(BaseModel):
    product_id: int = Field(..., gt=0)
    quantity: int = Field(..., gt=0)


class OrderCreate(BaseModel):
    customer_id: int | None = Field(None, gt=0)
    items: list[OrderItemCreate] = Field(..., min_length=1)

    @field_validator("items")
    @classmethod
    def validate_unique_products(cls, items: list[OrderItemCreate]) -> list[OrderItemCreate]:
        product_ids = [item.product_id for item in items]
        if len(product_ids) != len(set(product_ids)):
            raise ValueError("Duplicate products in the same order are not allowed")
        return items


class CustomerOrderCreate(BaseModel):
    items: list[OrderItemCreate] = Field(..., min_length=1)

    @field_validator("items")
    @classmethod
    def validate_unique_products(cls, items: list[OrderItemCreate]) -> list[OrderItemCreate]:
        product_ids = [item.product_id for item in items]
        if len(product_ids) != len(set(product_ids)):
            raise ValueError("Duplicate products in the same order are not allowed")
        return items


class OrderItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    product_id: int
    quantity: int
    unit_price: Decimal
    product_name: str | None = None


class OrderStatusUpdate(BaseModel):
    status: str = Field(..., pattern="^(pending|processing|delivered|cancelled)$")


class OrderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    customer_id: int
    invoice_number: str
    status: str
    total_amount: Decimal
    created_at: datetime
    customer_name: str | None = None
    items: list[OrderItemResponse] = []


class OrderStatusCounts(BaseModel):
    pending: int = 0
    processing: int = 0
    delivered: int = 0
    cancelled: int = 0


class DashboardStats(BaseModel):
    total_products: int
    total_customers: int
    total_orders: int
    total_revenue: Decimal
    order_status_counts: OrderStatusCounts
    low_stock_products: list[ProductResponse]
    recent_orders: list[OrderResponse] = []


class CustomerDashboardStats(BaseModel):
    my_orders_count: int
    my_total_spent: Decimal
    order_status_counts: OrderStatusCounts
    recent_orders: list[OrderResponse] = []


class InvoiceItemResponse(BaseModel):
    product_name: str
    sku: str | None = None
    quantity: int
    unit_price: Decimal
    line_total: Decimal


class InvoiceResponse(BaseModel):
    invoice_number: str
    order_id: int
    issued_at: datetime
    company_name: str = "Inventory Pro"
    company_tagline: str = "Inventory & Order Management"
    customer_name: str
    customer_email: str
    customer_phone: str
    items: list[InvoiceItemResponse]
    total_amount: Decimal


class ErrorResponse(BaseModel):
    detail: str
