from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import CustomerCreate, CustomerResponse
from app.services import customers as customer_service

router = APIRouter(prefix="/customers", tags=["Customers"])


@router.post("", response_model=CustomerResponse, status_code=201)
def create_customer(data: CustomerCreate, db: Session = Depends(get_db)):
    return customer_service.create_customer(db, data)


@router.get("", response_model=List[CustomerResponse])
def list_customers(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return customer_service.get_customers(db, skip=skip, limit=limit)


@router.get("/{customer_id}", response_model=CustomerResponse)
def get_customer(customer_id: int, db: Session = Depends(get_db)):
    return customer_service.get_customer(db, customer_id)


@router.delete("/{customer_id}", status_code=204)
def delete_customer(customer_id: int, db: Session = Depends(get_db)):
    customer_service.delete_customer(db, customer_id)
