import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const DIST_DIR = path.resolve("dist");
const TEMPLATE_PATH = path.join(DIST_DIR, "index.html");
const DEFAULT_API_BASE = "https://noorfit.onrender.com/api";
const API_BASE = (
  process.env.PRERENDER_API_BASE_URL ||
  process.env.VITE_API_BASE_URL ||
  DEFAULT_API_BASE
).replace(/\/$/, "");
const PRODUCT_LIMIT = Number(process.env.PRERENDER_PRODUCT_LIMIT || 12);
const SITE_ORIGIN = (
  process.env.PRERENDER_SITE_ORIGIN || "https://www.noorfit.com"
).replace(/\/$/, "");

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");

const absoluteUrl = (urlPath) => {
  if (!urlPath) return `${SITE_ORIGIN}/`;
  if (/^https?:\/\//i.test(urlPath)) return urlPath;
  return `${SITE_ORIGIN}${urlPath.startsWith("/") ? "" : "/"}${urlPath}`;
};

const imageFromProduct = (product) =>
  product.thumbnail ||
  product.images?.[0]?.url ||
  product.images?.[0] ||
  product.variants?.find(
    (variant) => Array.isArray(variant.images) && variant.images.length > 0,
  )?.images?.[0] ||
  "/favicon.ico";

function buildMetaTags(meta) {
  const title = escapeHtml(meta.title);
  const description = escapeHtml(meta.description);
  const canonicalUrl = escapeHtml(absoluteUrl(meta.canonicalUrl));
  const imageUrl = escapeHtml(absoluteUrl(meta.image || "/favicon.ico"));
  const type = escapeHtml(meta.type || "website");

  return [
    `<meta name=\"description\" content=\"${description}\" />`,
    `<link rel=\"canonical\" href=\"${canonicalUrl}\" />`,
    `<meta property=\"og:title\" content=\"${title}\" />`,
    `<meta property=\"og:description\" content=\"${description}\" />`,
    `<meta property=\"og:type\" content=\"${type}\" />`,
    `<meta property=\"og:url\" content=\"${canonicalUrl}\" />`,
    `<meta property=\"og:image\" content=\"${imageUrl}\" />`,
    `<meta name=\"twitter:card\" content=\"summary_large_image\" />`,
    `<meta name=\"twitter:title\" content=\"${title}\" />`,
    `<meta name=\"twitter:description\" content=\"${description}\" />`,
    `<meta name=\"twitter:image\" content=\"${imageUrl}\" />`,
    `<meta name=\"twitter:url\" content=\"${canonicalUrl}\" />`,
  ].join("\n    ");
}

function injectMeta(template, meta, bodyMarkup = "") {
  const tags = buildMetaTags(meta);
  const titlePattern = /<title>[\s\S]*?<\/title>/i;

  let html = template;
  if (titlePattern.test(html)) {
    html = html.replace(
      titlePattern,
      `<title>${escapeHtml(meta.title)}</title>`,
    );
  }

  html = html
    .replace(/\s*<meta\s+name=\"description\"[^>]*>\s*/gi, "\n")
    .replace(/\s*<link\s+rel=\"canonical\"[^>]*>\s*/gi, "\n")
    .replace(
      /\s*<meta\s+(?:name|property)=\"(?:twitter:[^\"]+|og:[^\"]+)\"[^>]*>\s*/gi,
      "\n",
    );

  html = html.replace("</head>", `    ${tags}\n  </head>`);

  if (bodyMarkup) {
    html = html.replace(
      '<div id="root"></div>',
      `<div id=\"root\">${bodyMarkup}</div>`,
    );
  }

  return html;
}

async function fetchTopProducts() {
  try {
    const response = await fetch(
      `${API_BASE}/products?limit=${PRODUCT_LIMIT}&sort=rating`,
    );
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const payload = await response.json();
    return Array.isArray(payload.items) ? payload.items : [];
  } catch (error) {
    console.warn(
      `[prerender] Unable to fetch top products from ${API_BASE}:`,
      error.message,
    );
    return [];
  }
}

function routeToPath(route) {
  if (route === "/") return TEMPLATE_PATH;
  return path.join(DIST_DIR, route.replace(/^\//, ""), "index.html");
}

async function writePrerenderedPage(template, route, meta, bodyMarkup = "") {
  const outputPath = routeToPath(route);
  await mkdir(path.dirname(outputPath), { recursive: true });
  const html = injectMeta(template, meta, bodyMarkup);
  await writeFile(outputPath, html, "utf8");
  console.log(`[prerender] wrote ${route}`);
}

async function run() {
  const template = await readFile(TEMPLATE_PATH, "utf8");

  const staticRoutes = [
    {
      route: "/",
      meta: {
        title: "NoorFit | Modest Activewear & New Drops",
        description:
          "Discover NoorFit essentials, trending activewear, and new drops designed for everyday comfort and confidence.",
        canonicalUrl: "/",
      },
    },
    {
      route: "/shop",
      meta: {
        title: "Shop NoorFit | Performance Clothing for Everyday Movement",
        description:
          "Browse the NoorFit shop by category, size, color, and price to find performance-ready styles that match your routine.",
        canonicalUrl: "/shop",
      },
    },
    {
      route: "/about",
      meta: {
        title: "About NoorFit | Purpose-Driven Activewear",
        description:
          "Learn about NoorFit's mission to deliver reliable quality, thoughtful design, and everyday confidence in every product.",
        canonicalUrl: "/about",
      },
    },
    {
      route: "/support",
      meta: {
        title: "Support NoorFit | Help with Orders, Returns & Account",
        description:
          "Contact NoorFit support for order updates, returns, delivery questions, and account help.",
        canonicalUrl: "/support",
      },
    },
  ];

  for (const entry of staticRoutes) {
    await writePrerenderedPage(template, entry.route, entry.meta);
  }

  const products = await fetchTopProducts();
  for (const product of products) {
    if (!product?.slug) continue;

    const route = `/product/${product.slug}`;
    const description =
      product.summary ||
      product.shortDescription ||
      product.description ||
      "Premium NoorFit product crafted for all-day comfort.";

    await writePrerenderedPage(
      template,
      route,
      {
        title: `${product.name} | NoorFit`,
        description,
        canonicalUrl: route,
        type: "product",
        image: imageFromProduct(product),
      },
      `<article data-prerendered=\"product\"><h1>${escapeHtml(product.name)}</h1><p>${escapeHtml(description)}</p></article>`,
    );
  }
}

run().catch((error) => {
  console.error("[prerender] build failed", error);
  process.exitCode = 1;
});
