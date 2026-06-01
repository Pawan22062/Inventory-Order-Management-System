# Inventory & Order Management System

Production-ready full-stack application for managing products, customers, and orders with automatic inventory control.

## Tech Stack

| Layer    | Technology        |
|----------|-------------------|
| Frontend | React (JavaScript)|
| Backend  | FastAPI (Python)  |
| Database | PostgreSQL        |
| DevOps   | Docker & Compose  |

## Features

### Products
- Create, list, get by ID, update, delete
- Fields: `id`, `product_name`, `sku`, `price`, `quantity_in_stock`

### Customers
- Create, list, get by ID, delete
- Fields: `id`, `full_name`, `email`, `phone_number`

### Orders
- Create, list, get by ID, delete
- Automatic total calculation and stock deduction on order creation

### Business Rules
- **SKU** must be unique
- **Customer email** must be unique
- **Quantity** cannot be negative (validated in API and DB constraints)
- Orders blocked when stock is insufficient
- Stock reduced automatically after successful order creation
- Order total computed from line items at creation time

## Quick Start (Docker)

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Run the stack

```bash
docker compose up --build
```

| Service   | URL                          |
|-----------|------------------------------|
| Frontend  | http://localhost:3000        |
| Backend   | http://localhost:8000      |
| API Docs  | http://localhost:8000/docs   |
| PostgreSQL| localhost:5432               |

Stop services:

```bash
docker compose down
```

Remove database volume:

```bash
docker compose down -v
```

## API Endpoints

Base URL: `http://localhost:8000/api`

### Products
| Method | Endpoint              | Description      |
|--------|-----------------------|------------------|
| POST   | `/products`           | Create product   |
| GET    | `/products`           | List products    |
| GET    | `/products/{id}`      | Get product      |
| PUT    | `/products/{id}`      | Update product   |
| DELETE | `/products/{id}`    | Delete product   |

### Customers
| Method | Endpoint              | Description       |
|--------|-----------------------|-------------------|
| POST   | `/customers`          | Create customer   |
| GET    | `/customers`          | List customers    |
| GET    | `/customers/{id}`     | Get customer      |
| DELETE | `/customers/{id}`   | Delete customer   |

### Orders
| Method | Endpoint              | Description     |
|--------|-----------------------|-----------------|
| POST   | `/orders`             | Create order    |
| GET    | `/orders`             | List orders     |
| GET    | `/orders/{id}`        | Get order       |
| DELETE | `/orders/{id}`        | Delete order    |

### Dashboard
| Method | Endpoint              | Description        |
|--------|-----------------------|--------------------|
| GET    | `/dashboard/stats`    | Summary statistics |

### Create order example

```json
POST /api/orders
{
  "customer_id": 1,
  "items": [
    { "product_id": 1, "quantity": 2 },
    { "product_id": 2, "quantity": 1 }
  ]
}
```

## Local Development (without Docker)

### Database
Run PostgreSQL and create database `inventory_db`, or use the `db` service only:

```bash
docker compose up db -d
```

### Backend

```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate
# macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
set DATABASE_URL=postgresql://postgres:postgres@localhost:5432/inventory_db
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
set REACT_APP_API_URL=http://localhost:8000/api
npm start
```

## Project Structure

```
├── backend/
│   ├── app/
│   │   ├── main.py           # FastAPI app
│   │   ├── models.py         # SQLAlchemy models
│   │   ├── schemas.py        # Pydantic schemas
│   │   ├── routers/          # API routes
│   │   └── services/         # Business logic
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── pages/            # Dashboard, Products, Customers, Orders
│   │   ├── components/
│   │   └── services/api.js
│   ├── Dockerfile
│   └── nginx.conf
├── docker-compose.yml
├── .dockerignore
└── README.md
```

## Environment Variables

Copy `.env.example` to `.env` and adjust as needed:

| Variable           | Description                          | Default                                              |
|--------------------|--------------------------------------|------------------------------------------------------|
| `DATABASE_URL`     | PostgreSQL connection string         | `postgresql://postgres:postgres@db:5432/inventory_db` |
| `CORS_ORIGINS`     | Allowed frontend origins (comma-separated) | `http://localhost:3000`                      |
| `REACT_APP_API_URL`| Frontend API base URL (build-time) | `http://localhost:8000/api`                        |

## Health Check

```bash
curl http://localhost:8000/health
```

## License

MIT
