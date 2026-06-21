# Inventory Pro

Production-ready **Inventory & Order Management System** — full-stack technical assessment project with JWT authentication, role-based access, order workflows, invoices, and Docker deployment.

## Live Demo

| Service | URL |
|---------|-----|
| Frontend | _https://inventory-management-system-alpha-jade.vercel.app/login_ |
| Backend API | _Add your Render/Railway URL here_ |
| API Docs | _https://your-backend.onrender.com/docs_ |

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, Tailwind CSS, React Router |
| Backend | Python 3.12, FastAPI, SQLAlchemy, Pydantic |
| Database | PostgreSQL 16 |
| Auth | JWT (python-jose), bcrypt password hashing |
| Containerization | Docker, Docker Compose, Nginx |

## Features

### Core (Assessment Requirements)

- **Products** — Full CRUD, unique SKU, price & stock management
- **Customers** — Create, list, view, delete with unique email validation
- **Orders** — Multi-item orders, automatic totals, stock deduction on place
- **Dashboard** — Product/customer/order counts, low-stock alerts, revenue
- **Business rules** — No negative stock, block orders when inventory is insufficient, restore stock on cancel
- **Docker** — Multi-container setup (db + backend + frontend)

### Extended Features

- **JWT authentication** — Register, login, protected APIs, session via Bearer token
- **Roles** — Admin vs Customer (selected at signup)
- **Admin panel** — Products, customers, all orders, analytics dashboard
- **Customer portal** — Shop with cart, place orders, view/cancel orders, invoices
- **Order status workflow** — Pending → Processing → Delivered / Cancelled
- **Invoices** — Auto-generated invoice numbers, printable professional layout
- **Search & filters** — Products (search, low stock), customers (search), orders (status)
- **Currency** — Indian Rupees (₹) throughout the UI

## Quick Start (Docker)

**Prerequisites:** [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

```powershell
cd Inventory_Pro
copy .env.example .env    # Windows (or: cp .env.example .env on Mac/Linux)
docker compose up --build
```

Or from the project root:

```powershell
npm run docker:up
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| API Docs (Swagger) | http://localhost:8000/docs |
| Health Check | http://localhost:8000/health |

### Default Admin (seeded on startup)

Configure in `.env`:

| Variable | Default |
|----------|---------|
| `ADMIN_EMAIL` | `admin@inventory.pro` |
| `ADMIN_PASSWORD` | `admin123` |

New users can also **sign up** and choose **Admin** or **Customer** at registration.

### Stop containers

```powershell
docker compose down
# Reset database (after schema changes):
docker compose down -v
```

## Local Development (without Docker)

### 1. PostgreSQL

Run Postgres locally (or use Docker for db only):

```powershell
docker compose up db -d
```

### 2. Backend

```powershell
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt

set DATABASE_URL=postgresql://inventory:inventory@localhost:5432/inventory_db
set JWT_SECRET=your-local-secret
set CORS_ORIGINS=http://localhost:5173,http://localhost:3000

uvicorn app.main:app --reload --port 8000
```

### 3. Frontend

```powershell
cd frontend
npm install
set VITE_API_URL=http://localhost:8000
npm run dev
```

Frontend dev server: http://localhost:5173

## Environment Variables

Create a `.env` file in the project root (see `.env.example`):

| Variable | Description |
|----------|-------------|
| `POSTGRES_USER` | Database username |
| `POSTGRES_PASSWORD` | Database password |
| `POSTGRES_DB` | Database name |
| `DATABASE_URL` | Full PostgreSQL connection string |
| `CORS_ORIGINS` | Comma-separated allowed frontend origins |
| `JWT_SECRET` | Secret key for signing JWT tokens |
| `ADMIN_EMAIL` | Seeded admin email |
| `ADMIN_PASSWORD` | Seeded admin password |
| `VITE_API_URL` | Backend URL (used when building frontend) |

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register (role: `admin` or `customer`) |
| POST | `/auth/login` | Login, returns JWT |
| GET | `/auth/me` | Current user profile |

### Products

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/products` | Create product (admin) |
| GET | `/products` | List products (`?search=`, `?low_stock=true`) |
| GET | `/products/{id}` | Get product |
| PUT | `/products/{id}` | Update product (admin) |
| DELETE | `/products/{id}` | Delete product (admin, if not in orders) |

### Customers

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/customers` | Create customer (admin) |
| GET | `/customers` | List customers (`?search=`) |
| GET | `/customers/{id}` | Get customer |
| DELETE | `/customers/{id}` | Delete customer (admin, if no orders) |

### Orders

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/orders` | Create order for customer (admin) |
| POST | `/orders/place` | Customer checkout |
| GET | `/orders` | List orders (`?status=pending`) |
| GET | `/orders/{id}` | Get order |
| PATCH | `/orders/{id}/status` | Update order status (admin) |
| POST | `/orders/{id}/cancel` | Cancel order |
| GET | `/orders/{id}/invoice` | Get invoice data |
| DELETE | `/orders/{id}` | Cancel order (admin) |

### Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard/admin` | Admin analytics |
| GET | `/dashboard/customer` | Customer analytics |

> All endpoints except `/auth/register`, `/auth/login`, and `/health` require `Authorization: Bearer <token>`.

## Deployment

### Step 1 — Push to GitHub

```powershell
git init
git add .
git commit -m "Inventory Pro - full stack project"
git remote add origin https://github.com/YOUR_USERNAME/inventory-pro.git
git push -u origin main
```

Do **not** commit `.env` (secrets).

### Step 2 — Backend + Database (Render recommended)

> **Important:** Render defaults to Python 3.14, which breaks `pydantic-core` builds. This repo pins **Python 3.12.8** via `backend/.python-version`. If deploy still fails, set **Environment → PYTHON_VERSION = 3.12.8** in the Render dashboard.

1. Create a **PostgreSQL** instance on [Render](https://render.com)
2. Create a **Web Service** connected to your GitHub repo
3. Set **Root Directory** to `backend`
4. **Build command:** `pip install -r requirements.txt`
5. **Start command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. **Environment variables:**

| Key | Value |
|-----|--------|
| `DATABASE_URL` | Render Postgres connection string |
| `CORS_ORIGINS` | Your frontend URL (e.g. `https://inventory-pro.vercel.app`) |
| `JWT_SECRET` | Long random secret |
| `ADMIN_EMAIL` | Your admin email |
| `ADMIN_PASSWORD` | Strong password |

7. Verify: `https://YOUR-BACKEND.onrender.com/docs`

**Alternatives:** Railway, Fly.io, or any host that runs Python + Postgres.

### Step 3 — Frontend (Vercel recommended)

1. Import repo on [Vercel](https://vercel.com)
2. Set **Root Directory** to `frontend`
3. **Build command:** `npm run build`
4. **Output directory:** `dist`
5. **Environment variable:**

| Key | Value |
|-----|--------|
| `VITE_API_URL` | `https://YOUR-BACKEND.onrender.com` |

6. After deploy, update backend `CORS_ORIGINS` with your Vercel URL and redeploy backend.

**Alternatives:** Netlify, Cloudflare Pages.

### Step 4 — Docker Hub (optional)

```powershell
docker login

cd backend
docker build -t YOUR_USERNAME/inventory-pro-backend .
docker push YOUR_USERNAME/inventory-pro-backend

cd ../frontend
docker build --build-arg VITE_API_URL=https://YOUR-BACKEND.onrender.com -t YOUR_USERNAME/inventory-pro-frontend .
docker push YOUR_USERNAME/inventory-pro-frontend
```

## Project Structure

```
Inventory_Pro/
├── docker-compose.yml          # Orchestrates db + backend + frontend
├── package.json                # Root scripts (docker:up, dev, build)
├── .env.example                # Environment template
│
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app/
│       ├── main.py             # FastAPI app entry, CORS, routers
│       ├── models.py           # SQLAlchemy models (User, Product, Order...)
│       ├── schemas.py          # Pydantic request/response schemas
│       ├── database.py         # DB engine & session
│       ├── security.py         # JWT + password hashing
│       ├── startup.py          # Migrations, admin seed, data backfill
│       ├── permissions.py      # Role-based access helpers
│       ├── invoice.py          # Invoice generation
│       ├── constants.py        # Order statuses, thresholds
│       └── routers/
│           ├── auth.py
│           ├── products.py
│           ├── customers.py
│           ├── orders.py
│           └── dashboard.py
│
└── frontend/
    ├── Dockerfile              # Vite build + Nginx
    ├── nginx.conf
    └── src/
        ├── App.jsx             # Routes & role-based layout
        ├── main.jsx
        ├── index.css           # Tailwind + invoice print styles
        ├── components/         # Sidebar, Modal, InvoiceModal, StatusBadge...
        ├── pages/              # Dashboard, Shop, Orders, Login, Signup...
        ├── context/            # AuthContext, ToastContext
        ├── services/api.js     # API client with JWT
        └── utils/              # Currency, order statuses
```

## Architecture

```
Browser (React)
    │  HTTP + JWT Bearer token
    ▼
FastAPI Backend (port 8000)
    │  SQLAlchemy ORM
    ▼
PostgreSQL (port 5432)
```

### Roles

| Role | Access |
|------|--------|
| **Admin** | Full dashboard, products, customers, all orders, status updates |
| **Customer** | Shop, cart, own orders, invoices, cancel pending orders |

## Business Rules

- Product SKU must be unique
- Customer email must be unique
- Stock cannot go below zero
- Orders are rejected if requested quantity exceeds available stock
- Stock is deducted when an order is placed
- Stock is restored when an order is cancelled
- Order total is calculated automatically from line items
- Products used in orders cannot be deleted
- Customers with order history cannot be deleted
- Revenue excludes cancelled orders

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `no configuration file provided` | Run `docker compose` from inside `Inventory_Pro` folder |
| Schema / column errors | `docker compose down -v` then `docker compose up --build` |
| Frontend can't reach API | Check `VITE_API_URL` and rebuild frontend |
| CORS errors on live site | Add frontend URL to backend `CORS_ORIGINS` |
| Render build fails on `pydantic-core` | Pin Python **3.12.8** (`backend/.python-version` or env `PYTHON_VERSION=3.12.8`) |
| Customer can't place order | Sign up/log in as **Customer** (not Admin) |
| Delete product/customer fails | Item is linked to existing orders — expected behavior |

## License

MIT
