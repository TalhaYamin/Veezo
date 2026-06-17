# VEEZO Ecommerce Platform

This workspace includes a working storefront foundation, an admin inventory page, and a backend ecommerce API for products and checkout.

## What is ready

- Frontend: React 19 + Vite + Tailwind CSS
- Backend: Express + Node.js
- Admin panel: /admin
- Checkout flow: /checkout (cash on delivery)
- Product API: /api/products
- Admin inventory API: /api/admin/products
- Checkout route: /api/checkout/place-order

## Run locally

1. Open PowerShell in the project folder.
2. If scripts are blocked, run:
   Set-ExecutionPolicy -Scope CurrentUser RemoteSigned -Force
3. Install dependencies:
   npm install
   npm run install:all
4. Start the frontend:
   npm run dev
5. Start the backend in another terminal:
   npm run dev:backend

The frontend runs on http://localhost:5173 and the backend on http://localhost:5000.

## Environment setup

Create a backend `.env` file (see `backend/.env.example`):

```
PORT=5000
FRONTEND_URL=http://localhost:5173
MONGO_URI=mongodb://127.0.0.1:27017/veezo
```

Orders use cash on delivery — customers pay when the order is delivered. No payment gateway keys are required.

## Deploy backend (Render)

The backend is a plain Express app — **no build step**.

| Render setting | Value |
|----------------|--------|
| Root Directory | `backend` |
| Build Command | `npm install` |
| Start Command | `node server.js` |

Do **not** use `npm run build` for the backend.

Environment variables: `MONGO_URI`, `FRONTEND_URL`, `ADMIN_PASSWORD`, `ADMIN_TOKEN`

## Deploy frontend (Vercel)

| Vercel setting | Value |
|----------------|--------|
| Root Directory | `frontend` |
| Build Command | `npm run build` |
| Output Directory | `dist` |

Environment variable: `VITE_API_URL=https://your-api.onrender.com/api`
