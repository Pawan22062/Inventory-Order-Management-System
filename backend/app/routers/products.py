from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import ProductCreate, ProductResponse, ProductUpdate
from app.services import products as product_service

router = APIRouter(prefix="/products", tags=["Products"])


@router.post("", response_model=ProductResponse, status_code=201)
def create_product(data: ProductCreate, db: Session = Depends(get_db)):
    return product_service.create_product(db, data)


@router.get("", response_model=List[ProductResponse])
def list_products(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return product_service.get_products(db, skip=skip, limit=limit)


@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db)):
    return product_service.get_product(db, product_id)


@router.put("/{product_id}", response_model=ProductResponse)
def update_product(product_id: int, data: ProductUpdate, db: Session = Depends(get_db)):
    return product_service.update_product(db, product_id, data)


@router.delete("/{product_id}", status_code=204)
def delete_product(product_id: int, db: Session = Depends(get_db)):
    product_service.delete_product(db, product_id)
