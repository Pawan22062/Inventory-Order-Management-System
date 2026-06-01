from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import OrderCreate, OrderResponse
from app.services import orders as order_service

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.post("", response_model=OrderResponse, status_code=201)
def create_order(data: OrderCreate, db: Session = Depends(get_db)):
    return order_service.create_order(db, data)


@router.get("", response_model=List[OrderResponse])
def list_orders(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return order_service.get_orders(db, skip=skip, limit=limit)


@router.get("/{order_id}", response_model=OrderResponse)
def get_order(order_id: int, db: Session = Depends(get_db)):
    return order_service.get_order(db, order_id)


@router.delete("/{order_id}", status_code=204)
def delete_order(order_id: int, db: Session = Depends(get_db)):
    order_service.delete_order(db, order_id)
