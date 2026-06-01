from datetime import datetime
from decimal import Decimal

from sqlalchemy import (
    CheckConstraint,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship

from app.database import Base


class Product(Base):
    __tablename__ = "products"
    __table_args__ = (
        CheckConstraint("quantity_in_stock >= 0", name="ck_products_quantity_non_negative"),
        CheckConstraint("price >= 0", name="ck_products_price_non_negative"),
    )

    id = Column(Integer, primary_key=True, index=True)
    product_name = Column(String(255), nullable=False)
    sku = Column(String(100), nullable=False, unique=True, index=True)
    price = Column(Numeric(12, 2), nullable=False)
    quantity_in_stock = Column(Integer, nullable=False, default=0)

    order_items = relationship("OrderItem", back_populates="product")


class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False, unique=True, index=True)
    phone_number = Column(String(50), nullable=False)

    orders = relationship("Order", back_populates="customer")


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id", ondelete="RESTRICT"), nullable=False)
    total_amount = Column(Numeric(12, 2), nullable=False, default=Decimal("0.00"))
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    customer = relationship("Customer", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    __tablename__ = "order_items"
    __table_args__ = (CheckConstraint("quantity > 0", name="ck_order_items_quantity_positive"),)

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="RESTRICT"), nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Numeric(12, 2), nullable=False)
    line_total = Column(Numeric(12, 2), nullable=False)

    order = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="order_items")
