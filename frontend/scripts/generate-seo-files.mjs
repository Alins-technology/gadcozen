// Runs after `vite build`: writes dist/robots.txt and dist/sitemap.xml.
// Product and category URLs are fetched from the live API, so the sitemap
// is refreshed on every deploy. If the API can't be reached, the sitemap
// still lists the static pages.

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { loadEnv } from "vite";
import { resolveSiteUrl } from "../vite.config.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(__dirname, "..", "dist");

const env = { ...loadEnv("production", path.join(__dirname, ".."), ""), ...process.env };
const siteUrl = resolveSiteUrl(env);
const apiUrl = (env.VITE_API_URL || "").replace(/\/$/, "");

const robots = [
  "User-agent: *",
  "Allow: /",
  "Disallow: /admin",
  "Disallow: /account",
  "Disallow: /cart",
  "Disallow: /checkout",
  "Disallow: /order-confirmation",
  "Disallow: /wishlist",
  "Disallow: /login",
  "Disallow: /register",
  "Disallow: /forgot-password",
  "Disallow: /reset-password",
  siteUrl ? `\nSitemap: ${siteUrl}/sitemap.xml` : "",
].join("\n");
fs.writeFileSync(path.join(DIST, "robots.txt"), `${robots}\n`);

if (!siteUrl) {
  console.warn("[seo] VITE_SITE_URL not set — skipped sitemap.xml (robots.txt written).");
  process.exit(0);
}

const staticPages = [
  ["/", "1.0", "daily"],
  ["/shop", "0.9", "daily"],
  ["/bulk-orders", "0.8", "weekly"],
  ["/about", "0.5", "monthly"],
  ["/contact", "0.5", "monthly"],
  ["/faq", "0.5", "monthly"],
  ["/shipping-policy", "0.3", "yearly"],
  ["/return-refund-policy", "0.3", "yearly"],
  ["/privacy-policy", "0.3", "yearly"],
  ["/terms-and-conditions", "0.3", "yearly"],
];

const getJson = async (url) => {
  const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
  if (!res.ok) throw new Error(`${url} -> ${res.status}`);
  return res.json();
};

const dynamicPages = [];
if (/^https?:\/\//.test(apiUrl)) {
  try {
    const [{ categories }, { products }] = await Promise.all([
      getJson(`${apiUrl}/categories`),
      getJson(`${apiUrl}/products?limit=60`),
    ]);
    categories.forEach((c) => dynamicPages.push([`/category/${c.slug}`, "0.8", "weekly", c.updatedAt]));
    products.forEach((p) => dynamicPages.push([`/product/${p.slug}`, "0.8", "weekly", p.updatedAt]));
  } catch (err) {
    console.warn(`[seo] Could not fetch products for sitemap (${err.message}) — static pages only.`);
  }
}

const today = new Date().toISOString().slice(0, 10);
const urls = [...staticPages, ...dynamicPages]
  .map(
    ([loc, priority, changefreq, lastmod]) => `  <url>
    <loc>${siteUrl}${loc}</loc>
    <lastmod>${(lastmod || today).slice(0, 10)}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
  )
  .join("\n");

fs.writeFileSync(
  path.join(DIST, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
);
console.log(`[seo] sitemap.xml written with ${staticPages.length + dynamicPages.length} URLs.`);
