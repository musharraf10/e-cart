## NoorFit – MERN PWA E‑Commerce

**Tagline**: Crafted for Comfort. Designed for Life.

NoorFit is a scalable MERN‑stack Progressive Web App (PWA) for a clothing e‑commerce brand.

### Tech Stack

- **Frontend**: React, Vite, React Router, Redux Toolkit, Tailwind CSS, PWA (service worker + manifest)
- **Backend**: Node.js, Express, JWT auth, MVC structure
- **Database**: MongoDB (Mongoose)
- **Infra**: Docker + docker‑compose

### Apps

- `client`: React PWA storefront + admin panel
- `server`: REST API, auth, orders, products, reviews, coupons, inventory

### Quick Start (Dev)

1. Install dependencies:

   ```bash
   cd server && npm install
   cd ../client && npm install
   ```

2. Environment:
   - Copy `server/.env.example` to `.env` and adjust values.
   - For admin image uploads, add Cloudinary credentials:

   ```env
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

### Stripe CLI Webhooks (Local Testing)

1. Install and authenticate Stripe CLI (one-time):
   - `stripe login`
2. Forward Stripe events to your webhook route:
   - `stripe listen --forward-to localhost:5000/api/payments/webhook`
3. Stripe CLI will print a line like:
   - `STRIPE_WEBHOOK_SECRET=whsec_xxx`
4. Paste that value into `server/.env` as `STRIPE_WEBHOOK_SECRET=...` and restart the server.

5. Run with Docker (recommended):

   ```bash
   docker compose up --build
   ```

   - API: `http://10.16.38.220:5000`
   - Client: `http://10.16.38.220:5173/`
   - MongoDB: `mongodb://mongo:27017/noorfit`

6. Run locally without Docker:

   ```bash
   # terminal 1
   cd server
   npm run dev

   # terminal 2
   cd client
   npm run dev
   ```

### High‑Level Features

- Product catalog, details, search, filters
- Cart, checkout, online payment stub, cash on delivery
- User auth (JWT), order history, wishlist, reviews
- Admin dashboard, product CRUD, visibility, drops, order & revenue analytics, review moderation
- Inventory tracking, coupon system, image upload, SEO‑friendly metadata

### Docker

- `docker-compose.yml` runs:
  - `client` (Vite dev/prod server)
  - `server` (Node API)
  - `mongo` (MongoDB + volume)

Adjust images, ports, and env as needed for production.

image upload options + final and push notifications

### React StrictMode note (development only)

In development, the client is wrapped with `React.StrictMode` in `client/src/main.jsx`.
React intentionally double-invokes some lifecycle paths/effects to help surface side effects.
That can look like duplicate network activity in DevTools even though production behavior is single-pass.

This repo now uses RTK Query for product/detail/review catalog data, so identical in-flight requests are deduplicated by query key and shared from cache across components.
If you are debugging custom `useEffect` diagnostics in development, prefer idempotent effects or lightweight dev guards to reduce log noise.

### SEO prerender output (production build)

`client` build now generates static prerendered HTML files for key crawl routes:

- `/`
- `/shop`
- `/about`
- `/support`
- top product detail pages at `/product/<slug>`

By default, top products are fetched from `http://10.16.38.220:5000/api/products?sort=rating` during build.
You can override behavior with build-time env vars:

```bash
PRERENDER_API_BASE_URL=https://api.example.com/api
PRERENDER_SITE_ORIGIN=https://www.example.com
PRERENDER_PRODUCT_LIMIT=12
```

Run:

```bash
cd client
npm run build
```

The generated files are written under `client/dist`, including per-route `index.html` files containing pre-populated title/canonical/Open Graph/Twitter metadata for crawlers.
