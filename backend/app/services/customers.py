from typing import List

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.exceptions import AppException
from app.models import Customer
from app.schemas import CustomerCreate


def get_customers(db: Session, skip: int = 0, limit: int = 100) -> List[Customer]:
    return db.query(Customer).offset(skip).limit(limit).all()


def get_customer(db: Session, customer_id: int) -> Customer:
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise AppException("Customer not found", 404)
    return customer


def create_customer(db: Session, data: CustomerCreate) -> Customer:
    customer = Customer(**data.model_dump())
    db.add(customer)
    try:
        db.commit()
        db.refresh(customer)
    except IntegrityError:
        db.rollback()
        raise AppException("Customer email must be unique", 409)
    return customer


def delete_customer(db: Session, customer_id: int) -> None:
    customer = get_customer(db, customer_id)
    db.delete(customer)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise AppException("Cannot delete customer with existing orders", 409)
