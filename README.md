# GADCO ZEN — Full-Stack E-Commerce Store

A complete, production-style MERN (MongoDB, Express, React, Node) e-commerce website for
**GADCO ZEN**, a skincare and personal-care brand. Built with a real backend API and database —
not a static mockup. Cart, wishlist, auth, checkout, orders, and the admin panel all read and
write through the API.

---

## 1. Project Overview

- **Brand:** GADCO ZEN — premium, minimal, aqua/teal skincare identity built around `#037D8F`.
- **Catalog:** 7 seeded products across 5 categories (Cleansers, Hair Care, Body Care, Sun Care,
  Moisturizers), using the real product artwork supplied for this build.
- **Storefront:** home, shop (search/filter/sort), category pages, product detail pages with a
  gallery and tabs, cart, wishlist, multi-step checkout, order history, account management, and
  legal/informational pages.
- **Admin panel:** dashboard, product CRUD with image upload, category CRUD, order management,
  user management, and review moderation — all behind an admin-only, JWT-protected API.
- **Architecture:** built for the current 7 products, but designed to scale to 50–100+ products
  without restructuring (indexed queries, paginated APIs, admin CRUD for every entity).

## 2. Tech Stack

**Frontend:** React 18, Vite, React Router v6, Tailwind CSS, Framer Motion, Axios, Lucide icons.

**Backend:** Node.js, Express, MongoDB, Mongoose, JWT auth, bcrypt password hashing,
express-validator, multer (image uploads).

## 3. Folder Structure

```text
gadco-zen/
├── frontend/                  React + Vite storefront and admin UI
│   ├── public/images/products/  the 7 product images used across the site
│   ├── src/
│   │   ├── components/        shared UI (Navbar, Footer, ProductCard, Modal, etc.)
│   │   ├── pages/              route-level pages, including pages/admin and pages/account
│   │   ├── layouts/            MainLayout (storefront) and AdminLayout
│   │   ├── context/             Auth, Cart, Wishlist, Toast providers
│   │   ├── services/           one file per API resource (axios calls)
│   │   └── utils/               formatting helpers
│   └── package.json
│
├── backend/                   Express API + MongoDB models
│   ├── config/db.js            MongoDB connection
│   ├── controllers/            one file per resource
│   ├── routes/                 one file per resource
│   ├── models/                 Mongoose schemas
│   ├── middleware/             auth, admin, error handling, validation, uploads
│   ├── seed/seed.js             seeds admin/demo users, categories, the 7 products
│   ├── uploads/                 admin-uploaded product images land here (served at /uploads)
│   └── server.js
│
├── package.json                convenience scripts to run both apps together
└── README.md
```

## 4. Prerequisites

- Node.js 18+ and npm
- A MongoDB database — either a local `mongod` instance or a free
  [MongoDB Atlas](https://www.mongodb.com/atlas) cluster

> **A note on this build environment:** this project was generated inside a sandboxed cloud
> workspace with no access to the public npm registry, so `npm install` could not be run here to
> produce a `node_modules` folder or a lockfile. Every backend file was syntax-checked with
> `node --check`, and the whole codebase follows plain, well-supported APIs from each listed
> dependency — but you should run `npm install` yourself the first time you set this project up
> locally, and do a quick smoke test before relying on it.

## 5. Installation

```bash
# from the project root
npm run install:all
# (equivalent to running `npm install` inside both frontend/ and backend/)
```

## 6. Environment Variables

Copy the example env files and fill them in:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

**`backend/.env`**

| Variable | Description |
| --- | --- |
| `PORT` | API port (default `5000`) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Long random string used to sign auth tokens |
| `JWT_EXPIRES_IN` | Token lifetime, e.g. `7d` |
| `CLIENT_URL` | URL of the running frontend, for CORS (default `http://localhost:5173`) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Seeded admin login — **change before production** |
| `DEMO_CUSTOMER_EMAIL` / `DEMO_CUSTOMER_PASSWORD` | Seeded demo customer login |

**`frontend/.env`**

| Variable | Description |
| --- | --- |
| `VITE_API_URL` | Base URL of the backend API, e.g. `http://localhost:5000/api` |

## 7. MongoDB Setup

**Option A — local MongoDB**

```bash
mongod --dbpath /path/to/your/data/dir
```

Then set `MONGO_URI=mongodb://127.0.0.1:27017/gadco-zen` in `backend/.env`.

**Option B — MongoDB Atlas (cloud, free tier works fine)**

1. Create a cluster at mongodb.com/atlas and a database user.
2. Allow your IP (or `0.0.0.0/0` for local development).
3. Copy the connection string into `MONGO_URI` in `backend/.env`.

## 8. Seed the Database

Populates the admin user, a demo customer, the 5 categories, and the 7 GADCO ZEN products:

```bash
npm run seed
```

Re-running `seed` refreshes categories/products/reviews/coupons but leaves existing orders and
users intact (it won't recreate the admin/demo user if they already exist).

To wipe everything instead:

```bash
cd backend && npm run seed:destroy
```

## 9. Running the App

```bash
# from the project root — runs both frontend and backend together
npm run dev
```

Or run them separately:

```bash
cd backend && npm run dev     # http://localhost:5000
cd frontend && npm run dev    # http://localhost:5173
```

Health check: `GET http://localhost:5000/api/health`

## 10. Login Credentials (from the seed script)

- **Storefront admin panel:** `http://localhost:5173/admin/login`
  Email: value of `ADMIN_EMAIL` in `backend/.env` (default `admin@gadcozen.com`)
  Password: value of `ADMIN_PASSWORD` (default `Admin@12345`)

- **Demo customer:** value of `DEMO_CUSTOMER_EMAIL` / `DEMO_CUSTOMER_PASSWORD`
  (defaults `customer@gadcozen.com` / `Customer@12345`)

**Change these credentials before deploying anywhere publicly accessible.**

## 11. Build for Production

```bash
npm run build:frontend   # outputs frontend/dist
```

Serve `frontend/dist` with any static host (Netlify, Vercel, Nginx, etc.), and deploy `backend/`
to any Node host (Render, Railway, Fly.io, a VPS, etc.) with `NODE_ENV=production` and a
production `MONGO_URI`/`JWT_SECRET`. Point `VITE_API_URL` at the deployed backend's `/api` URL
before building the frontend, and update `CLIENT_URL` in the backend's env to the deployed
frontend's URL.

## 12. How to Add Products

Two ways:

1. **Admin panel (recommended):** log in at `/admin/login` → Products → Add Product. Fill in
   category, pricing, stock, description, benefits, ingredients, and upload one or more images
   directly from the form (stored in `backend/uploads/`, served at `/uploads/...`).
2. **Seed file:** add an entry to `productsData` in `backend/seed/seed.js` and re-run `npm run
   seed`.

## 13. How to Replace Product Images

- Product photos shipped with this build live in `frontend/public/images/products/`. Replacing a
  file there (same filename) updates the image everywhere it's referenced from the seed data.
- New images uploaded through the admin panel are stored in `backend/uploads/` and referenced by
  URL in the product's `images` array — no filesystem changes needed.

## 14. How to Change Brand Colors

Edit the `brand` color scale in `frontend/tailwind.config.js`. The primary brand color
(`brand.600`, `#037D8F`) is used throughout buttons, links, and accents — change it there and
rebuild.

## 15. Core Flows to Test

- **Guest:** Home → Shop → Category → Product → Add to Cart → Cart → prompted to Login/Register
  at Checkout.
- **Customer:** Register → Login → Browse → Add to Cart → Wishlist → Checkout (4 steps) → Order
  Confirmation → Account → Orders.
- **Admin:** `/admin/login` → Dashboard → Products (add/edit/delete + image upload) → Categories
  → Orders (update status) → Users (role/status) → Reviews (moderate).

## 16. Notable Design Decisions

- **Guest cart:** unauthenticated users get a cart stored in `localStorage`; on login it's merged
  into their MongoDB-backed cart automatically.
- **Checkout/payment:** the payment step is a clearly-labeled demo flow (mock online payment or
  Cash on Delivery). No real payment gateway is wired up, but the order model and checkout flow
  are structured so a real gateway (Razorpay/Stripe) can be dropped in behind the same endpoint
  without changing the schema.
- **Reviews:** the seed script inserts a few reviews clearly marked `isDemo: true` and labeled
  "Demo review" in the UI — they're never presented as real customer feedback. Authenticated users
  can submit real reviews from any product page, and the review is flagged
  `verifiedPurchase: true` automatically if it comes from a customer who has actually ordered that
  product.
- **Claims:** all product copy (benefits, ingredients, descriptions) matches the information on
  the supplied product packaging — nothing was invented.
