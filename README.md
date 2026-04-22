# Simple E-Commerce API

A REST API for a multi-store e-commerce platform built with Node.js, Express, and MongoDB.

## Features

- JWT Authentication (register / login)
- Role-based access control (`super_admin`, `admin`, `customer`)
- Multi-store support
- Product management with soft delete, pagination, and search
- Order management with stock validation, discount application, and profit analytics
- Discount / coupon codes (percentage & fixed amount)
- Country & City management for shipping addresses
- Store analytics dashboard

---

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Create `.env` file
```bash
cp .env.example .env
```
Fill in your values:
```
PORT=3000
MONGO_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your_super_secret_key
```

### 3. Run
```bash
# Development (auto-restart)
npm run dev

# Production
npm start
```

---

## API Reference

### Auth — `/api/auth`
| Method | Endpoint      | Access  | Description        |
|--------|---------------|---------|--------------------|
| POST   | `/register`   | Public  | Register new user  |
| POST   | `/login`      | Public  | Login, get token   |
| GET    | `/me`         | Any     | Get current user   |

### Categories — `/api/category`
| Method | Endpoint                              | Access        | Description              |
|--------|---------------------------------------|---------------|--------------------------|
| POST   | `/create_category`                    | Admin         | Create category          |
| GET    | `/admin/:store_id/all_categories`     | Admin         | All categories (incl. deleted) |
| GET    | `/store/:store_id/categories`         | Admin/Store   | Non-deleted categories   |
| GET    | `/store/:store_id/active_categories`  | Admin/Store   | Active categories only   |
| GET    | `/:id`                                | Admin/Store   | Get category by ID       |
| PUT    | `/:id`                                | Admin         | Update category          |
| DELETE | `/:id`                                | Admin         | Soft delete category     |

### Products — `/api/product`
| Method | Endpoint                          | Access  | Description                |
|--------|-----------------------------------|---------|----------------------------|
| POST   | `/create`                         | Admin   | Create product             |
| GET    | `/store/:store_id/all`            | Admin   | All products (paginated)   |
| GET    | `/store/:store_id/low_stock`      | Admin   | Products with low stock    |
| GET    | `/:id`                            | Any     | Get product by ID          |
| PUT    | `/:id`                            | Admin   | Update product             |
| DELETE | `/:id`                            | Admin   | Soft delete product        |

Query params for `/store/:store_id/all`: `?page=1&limit=20&category=<id>&search=<term>`

### Orders — `/api/order`
| Method | Endpoint                      | Access    | Description                  |
|--------|-------------------------------|-----------|------------------------------|
| POST   | `/create`                     | Customer  | Place order (validates stock)|
| GET    | `/my_orders`                  | Customer  | Get own orders               |
| GET    | `/store/:store_id/all`        | Admin     | Get all store orders         |
| GET    | `/:id`                        | Any       | Get order by ID              |
| PATCH  | `/:id/status`                 | Admin     | Update order status          |
| PATCH  | `/:id/payment`                | Admin     | Update payment status        |

Query params for store orders: `?page=1&limit=20&status=pending&payment_status=paid`

### Discounts — `/api/discount`
| Method | Endpoint                      | Access    | Description              |
|--------|-------------------------------|-----------|--------------------------|
| POST   | `/create`                     | Admin     | Create discount code     |
| POST   | `/validate`                   | Any       | Validate a discount code |
| GET    | `/store/:store_id/all`        | Admin     | All store discounts      |
| GET    | `/:id`                        | Admin     | Get discount by ID       |
| PUT    | `/:id`                        | Admin     | Update discount          |
| DELETE | `/:id`                        | Admin     | Delete discount          |

### Stores — `/api/store`
| Method | Endpoint          | Access       | Description          |
|--------|-------------------|--------------|----------------------|
| POST   | `/create`         | Super Admin  | Create store         |
| GET    | `/all`            | Super Admin  | List all stores      |
| GET    | `/:id`            | Admin        | Get store by ID      |
| GET    | `/:id/analytics`  | Admin        | Store dashboard      |
| PUT    | `/:id`            | Admin        | Update store         |
| DELETE | `/:id`            | Super Admin  | Delete store         |

### Users — `/api/user`
| Method | Endpoint            | Access       | Description         |
|--------|---------------------|--------------|---------------------|
| GET    | `/all`              | Admin        | List all users      |
| GET    | `/:id`              | Any          | Get user by ID      |
| PUT    | `/:id`              | Any (own)    | Update profile      |
| PATCH  | `/change_password`  | Any          | Change password     |
| DELETE | `/:id`              | Super Admin  | Delete user         |

### Locations — `/api/location`
| Method | Endpoint                          | Access       | Description         |
|--------|-----------------------------------|--------------|---------------------|
| POST   | `/country`                        | Super Admin  | Create country      |
| GET    | `/countries`                      | Any          | List all countries  |
| DELETE | `/country/:id`                    | Super Admin  | Delete country      |
| POST   | `/city`                           | Super Admin  | Create city         |
| GET    | `/country/:country_id/cities`     | Any          | Get cities by country |

---

## User Roles

| Role          | Description                                      |
|---------------|--------------------------------------------------|
| `super_admin` | Full access — manages stores, users, platform    |
| `admin`       | Manages one store — products, orders, discounts  |
| `customer`    | Places orders, views own data                    |

---

## Notes

- All delete operations on Categories and Products are **soft deletes** (set `is_deleted: true`)
- Creating an order automatically **deducts stock** and records sold quantity
- Cancelling an order automatically **restores stock**
- Discount codes are validated for expiry, usage limits, and minimum order amount at order creation
