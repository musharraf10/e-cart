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

### High‑Level Features

- Product catalog, details, search, filters
- Cart, checkout, online payment stub, cash on delivery
- User auth (JWT), order history, wishlist, reviews
- Admin dashboard, product CRUD, visibility, drops, order & revenue analytics, review moderation
- Inventory tracking, coupon system, image upload, SEO‑friendly metadata

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

# Thank You 🙏

## For Visiting 👁‍🗨️

### Shaik Musharaf. (●'◡'●)
