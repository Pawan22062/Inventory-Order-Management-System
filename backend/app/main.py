import time

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.exc import OperationalError

from app.config import settings
from app.database import Base, engine
from app.exceptions import AppException
from app.routers import customers, dashboard, orders, products

app = FastAPI(
    title="Inventory & Order Management API",
    description="Production-ready API for products, customers, and orders",
    version="1.0.0",
)

origins = [o.strip() for o in settings.cors_origins.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(AppException)
async def app_exception_handler(_: Request, exc: AppException):
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.message})


@app.on_event("startup")
def startup():
    for attempt in range(30):
        try:
            Base.metadata.create_all(bind=engine)
            break
        except OperationalError:
            if attempt == 29:
                raise
            time.sleep(2)


@app.get("/health")
def health_check():
    return {"status": "healthy"}


app.include_router(products.router, prefix="/api")
app.include_router(customers.router, prefix="/api")
app.include_router(orders.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
