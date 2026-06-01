from datetime import datetime
from decimal import Decimal
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class ProductBase(BaseModel):
    product_name: str = Field(..., min_length=1, max_length=255)
    sku: str = Field(..., min_length=1, max_length=100)
    price: Decimal = Field(..., ge=0)
    quantity_in_stock: int = Field(..., ge=0)


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    product_name: Optional[str] = Field(None, min_length=1, max_length=255)
    sku: Optional[str] = Field(None, min_length=1, max_length=100)
    price: Optional[Decimal] = Field(None, ge=0)
    quantity_in_stock: Optional[int] = Field(None, ge=0)


class ProductResponse(ProductBase):
    model_config = ConfigDict(from_attributes=True)

    id: int


class CustomerBase(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=255)
    email: EmailStr
    phone_number: str = Field(..., min_length=1, max_length=50)


class CustomerCreate(CustomerBase):
    pass


class CustomerResponse(CustomerBase):
    model_config = ConfigDict(from_attributes=True)

    id: int


class OrderItemCreate(BaseModel):
    product_id: int = Field(..., gt=0)
    quantity: int = Field(..., gt=0)


class OrderCreate(BaseModel):
    customer_id: int = Field(..., gt=0)
    items: List[OrderItemCreate] = Field(..., min_length=1)

    @field_validator("items")
    @classmethod
    def validate_items_not_empty(cls, v: List[OrderItemCreate]) -> List[OrderItemCreate]:
        if not v:
            raise ValueError("Order must contain at least one item")
        return v


class OrderItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    product_id: int
    quantity: int
    unit_price: Decimal
    line_total: Decimal
    product_name: Optional[str] = None


class OrderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    customer_id: int
    total_amount: Decimal
    created_at: datetime
    items: List[OrderItemResponse] = []
    customer_name: Optional[str] = None


class DashboardStats(BaseModel):
    total_products: int
    total_customers: int
    total_orders: int
    low_stock_count: int
    total_inventory_value: Decimal
