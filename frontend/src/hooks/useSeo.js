import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Per-page SEO without extra dependencies: sets <title>, meta description,
// canonical URL, Open Graph / Twitter tags, robots and optional JSON-LD.
// Everything is reset to the site defaults when the next page mounts.

const SITE_NAME = "GADCO ZEN";
const DEFAULT_TITLE = "GADCO ZEN | Skincare That Feels As Good As It Looks";
const DEFAULT_DESCRIPTION =
  "GADCO ZEN — simple, effective skincare and personal care essentials: face washes, sunscreens, hair care and body care. Free shipping above ₹999.";
const DEFAULT_IMAGE = "/images/products/fusion-sunscreen/fusion-sunscreen-1200.webp";

// Prefer the configured production URL so canonicals never point at a
// Vercel preview domain.
const siteUrl = () => (import.meta.env.VITE_SITE_URL || window.location.origin).replace(/\/$/, "");

const absolute = (url) => (!url ? url : /^https?:\/\//.test(url) ? url : `${siteUrl()}${url}`);

const setMeta = (attr, key, content) => {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!content) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
};

const setCanonical = (href) => {
  let el = document.head.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
};

const setJsonLd = (data) => {
  document.head.querySelectorAll("script[data-seo-jsonld]").forEach((el) => el.remove());
  const blocks = (Array.isArray(data) ? data : [data]).filter(Boolean);
  for (const block of blocks) {
    const el = document.createElement("script");
    el.type = "application/ld+json";
    el.dataset.seoJsonld = "true";
    el.textContent = JSON.stringify(block);
    document.head.appendChild(el);
  }
};

/**
 * @param {object} opts
 * @param {string} [opts.title]        page title (brand is appended)
 * @param {string} [opts.description]
 * @param {string} [opts.image]        relative or absolute image URL
 * @param {string} [opts.type]         og:type, default "website"
 * @param {boolean} [opts.noindex]     keep private pages (cart, account...) out of Google
 * @param {object|object[]} [opts.jsonLd] structured data
 */
export default function useSeo({ title, description, image, type = "website", noindex = false, jsonLd } = {}) {
  const { pathname } = useLocation();
  const jsonLdKey = jsonLd ? JSON.stringify(jsonLd) : "";

  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE;
    const desc = (description || DEFAULT_DESCRIPTION).replace(/\s+/g, " ").trim().slice(0, 160);
    const url = `${siteUrl()}${pathname}`;
    const img = absolute(image || DEFAULT_IMAGE);

    document.title = fullTitle;
    setMeta("name", "description", desc);
    setMeta("name", "robots", noindex ? "noindex, nofollow" : "index, follow");
    setCanonical(url);

    setMeta("property", "og:site_name", SITE_NAME);
    setMeta("property", "og:title", fullTitle);
    setMeta("property", "og:description", desc);
    setMeta("property", "og:type", type);
    setMeta("property", "og:url", url);
    setMeta("property", "og:image", img);
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", fullTitle);
    setMeta("name", "twitter:description", desc);
    setMeta("name", "twitter:image", img);

    setJsonLd(jsonLd ? JSON.parse(jsonLdKey) : null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, description, image, type, noindex, pathname, jsonLdKey]);
}

export { siteUrl, absolute };
