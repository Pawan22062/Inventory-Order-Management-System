from decimal import Decimal
from typing import List

from sqlalchemy.orm import Session, joinedload

from app.exceptions import AppException
from app.models import Customer, Order, OrderItem, Product
from app.schemas import OrderCreate, OrderItemResponse, OrderResponse


def _build_order_response(order: Order) -> OrderResponse:
    items = [
        OrderItemResponse(
            id=item.id,
            product_id=item.product_id,
            quantity=item.quantity,
            unit_price=item.unit_price,
            line_total=item.line_total,
            product_name=item.product.product_name if item.product else None,
        )
        for item in order.items
    ]
    return OrderResponse(
        id=order.id,
        customer_id=order.customer_id,
        total_amount=order.total_amount,
        created_at=order.created_at,
        items=items,
        customer_name=order.customer.full_name if order.customer else None,
    )


def get_orders(db: Session, skip: int = 0, limit: int = 100) -> List[OrderResponse]:
    orders = (
        db.query(Order)
        .options(joinedload(Order.items).joinedload(OrderItem.product), joinedload(Order.customer))
        .order_by(Order.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return [_build_order_response(o) for o in orders]


def get_order(db: Session, order_id: int) -> OrderResponse:
    order = (
        db.query(Order)
        .options(joinedload(Order.items).joinedload(OrderItem.product), joinedload(Order.customer))
        .filter(Order.id == order_id)
        .first()
    )
    if not order:
        raise AppException("Order not found", 404)
    return _build_order_response(order)


def create_order(db: Session, data: OrderCreate) -> OrderResponse:
    customer = db.query(Customer).filter(Customer.id == data.customer_id).first()
    if not customer:
        raise AppException("Customer not found", 404)

    product_ids = [item.product_id for item in data.items]
    if len(product_ids) != len(set(product_ids)):
        raise AppException("Duplicate products in the same order are not allowed", 400)

    products = db.query(Product).filter(Product.id.in_(product_ids)).with_for_update().all()
    product_map = {p.id: p for p in products}

    if len(product_map) != len(product_ids):
        missing = set(product_ids) - set(product_map.keys())
        raise AppException(f"Products not found: {sorted(missing)}", 404)

    order_items_data = []
    total_amount = Decimal("0.00")

    for item in data.items:
        product = product_map[item.product_id]
        if product.quantity_in_stock < item.quantity:
            raise AppException(
                f"Insufficient stock for '{product.product_name}'. "
                f"Available: {product.quantity_in_stock}, requested: {item.quantity}",
                400,
            )
        unit_price = Decimal(str(product.price))
        line_total = unit_price * item.quantity
        total_amount += line_total
        order_items_data.append((product, item.quantity, unit_price, line_total))

    order = Order(customer_id=data.customer_id, total_amount=total_amount)
    db.add(order)
    db.flush()

    for product, quantity, unit_price, line_total in order_items_data:
        db.add(
            OrderItem(
                order_id=order.id,
                product_id=product.id,
                quantity=quantity,
                unit_price=unit_price,
                line_total=line_total,
            )
        )
        product.quantity_in_stock -= quantity

    db.commit()
    db.refresh(order)
    order = (
        db.query(Order)
        .options(joinedload(Order.items).joinedload(OrderItem.product), joinedload(Order.customer))
        .filter(Order.id == order.id)
        .first()
    )
    return _build_order_response(order)


def delete_order(db: Session, order_id: int) -> None:
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise AppException("Order not found", 404)
    db.delete(order)
    db.commit()
