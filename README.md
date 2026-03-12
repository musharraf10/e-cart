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

3. Run with Docker (recommended):

   ```bash
   docker compose up --build
   ```

   - API: `http://localhost:5000`
   - Client: `http://localhost:5173`
   - MongoDB: `mongodb://mongo:27017/noorfit`

4. Run locally without Docker:

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

