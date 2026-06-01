from decimal import Decimal
from typing import List, Optional

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.exceptions import AppException
from app.models import Product
from app.schemas import ProductCreate, ProductUpdate


def get_products(db: Session, skip: int = 0, limit: int = 100) -> List[Product]:
    return db.query(Product).offset(skip).limit(limit).all()


def get_product(db: Session, product_id: int) -> Product:
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise AppException("Product not found", 404)
    return product


def create_product(db: Session, data: ProductCreate) -> Product:
    if data.quantity_in_stock < 0:
        raise AppException("Quantity cannot be negative")

    product = Product(**data.model_dump())
    db.add(product)
    try:
        db.commit()
        db.refresh(product)
    except IntegrityError:
        db.rollback()
        raise AppException("SKU must be unique", 409)
    return product


def update_product(db: Session, product_id: int, data: ProductUpdate) -> Product:
    product = get_product(db, product_id)
    update_data = data.model_dump(exclude_unset=True)

    if "quantity_in_stock" in update_data and update_data["quantity_in_stock"] < 0:
        raise AppException("Quantity cannot be negative")

    for field, value in update_data.items():
        setattr(product, field, value)

    try:
        db.commit()
        db.refresh(product)
    except IntegrityError:
        db.rollback()
        raise AppException("SKU must be unique", 409)
    return product


def delete_product(db: Session, product_id: int) -> None:
    product = get_product(db, product_id)
    db.delete(product)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise AppException("Cannot delete product referenced by orders", 409)
