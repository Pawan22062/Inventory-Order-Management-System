from decimal import Decimal

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models import Customer, Order, Product
from app.schemas import DashboardStats

LOW_STOCK_THRESHOLD = 10


def get_dashboard_stats(db: Session) -> DashboardStats:
    total_products = db.query(func.count(Product.id)).scalar() or 0
    total_customers = db.query(func.count(Customer.id)).scalar() or 0
    total_orders = db.query(func.count(Order.id)).scalar() or 0
    low_stock_count = (
        db.query(func.count(Product.id))
        .filter(Product.quantity_in_stock <= LOW_STOCK_THRESHOLD)
        .scalar()
        or 0
    )
    inventory_value = (
        db.query(func.coalesce(func.sum(Product.price * Product.quantity_in_stock), 0)).scalar()
    )
    return DashboardStats(
        total_products=total_products,
        total_customers=total_customers,
        total_orders=total_orders,
        low_stock_count=low_stock_count,
        total_inventory_value=Decimal(str(inventory_value or 0)),
    )
