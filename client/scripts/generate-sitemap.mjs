import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientRoot = path.resolve(__dirname, "..");
const appFilePath = path.join(clientRoot, "src", "App.jsx");
const sitemapFilePath = path.join(clientRoot, "public", "sitemap.xml");

const SITE_URL = (
  process.env.SITE_URL ||
  process.env.VITE_SITE_URL ||
  "https://<your-domain>"
).replace(/\/$/, "");
const API_BASE_URL = (
  process.env.SITEMAP_API_BASE_URL ||
  process.env.VITE_API_BASE_URL ||
  "http://localhost:5000/api"
).replace(/\/$/, "");

function escapeXml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

async function getStaticRoutesFromApp() {
  const appSource = await readFile(appFilePath, "utf8");
  const matches = [...appSource.matchAll(/path="([^"]+)"/g)].map(
    (match) => match[1],
  );

  return [
    ...new Set(
      matches.filter(
        (routePath) =>
          routePath.startsWith("/") &&
          routePath !== "*" &&
          !routePath.includes(":"),
      ),
    ),
  ];
}

async function fetchAllProducts() {
  const products = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const response = await fetch(
      `${API_BASE_URL}/products?page=${page}&limit=1000`,
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch products (page ${page}): ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();
    const items = Array.isArray(data?.items) ? data.items : [];
    products.push(...items);

    totalPages = Number(data?.totalPages) || 1;
    page += 1;
  }

  return products;
}

async function fetchCategories() {
  const response = await fetch(`${API_BASE_URL}/categories`);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch categories: ${response.status} ${response.statusText}`,
    );
  }

  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

function buildSitemapXml(urls) {
  const lastmod = new Date().toISOString();
  const rows = urls
    .sort((a, b) => a.localeCompare(b))
    .map(
      (url) =>
        `  <url>\n    <loc>${escapeXml(url)}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${rows}\n</urlset>\n`;
}

async function main() {
  const staticRoutes = await getStaticRoutesFromApp();

  let productUrls = [];
  let categoryUrls = [];

  try {
    const [products, categories] = await Promise.all([
      fetchAllProducts(),
      fetchCategories(),
    ]);

    productUrls = products
      .map((product) => product?.slug)
      .filter(Boolean)
      .map((slug) => `/product/${encodeURIComponent(slug)}`);

    categoryUrls = categories
      .map((category) => category?.slug || category?._id)
      .filter(Boolean)
      .map(
        (categoryIdentifier) =>
          `/shop?category=${encodeURIComponent(categoryIdentifier)}`,
      );
  } catch (error) {
    console.warn(
      `[sitemap] Continuing with static routes only because dynamic route fetch failed: ${error.message}`,
    );
  }

  const allUrls = [
    ...new Set(
      [...staticRoutes, ...productUrls, ...categoryUrls].map(
        (routePath) => `${SITE_URL}${routePath}`,
      ),
    ),
  ];

  const sitemapXml = buildSitemapXml(allUrls);
  await writeFile(sitemapFilePath, sitemapXml, "utf8");
  console.log(
    `[sitemap] Generated ${allUrls.length} URLs at ${sitemapFilePath}`,
  );
}

main().catch((error) => {
  console.error("[sitemap] Failed to generate sitemap", error);
  process.exit(1);
});
