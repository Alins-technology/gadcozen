import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// Public URL of the storefront, used for canonical/Open Graph tags in index.html.
// Set VITE_SITE_URL (e.g. https://gadcozen.com) in Vercel; falls back to
// Vercel's production domain.
export const resolveSiteUrl = (env) =>
  (
    env.VITE_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "")
  ).replace(/\/$/, "");

export default defineConfig(({ mode }) => {
  const env = { ...loadEnv(mode, process.cwd(), ""), ...process.env };
  const siteUrl = resolveSiteUrl(env);

  return {
    plugins: [
      react(),
      {
        name: "inject-site-url",
        transformIndexHtml: (html) => html.replaceAll("__SITE_URL__", siteUrl),
      },
    ],
    build: {
      rollupOptions: {
        output: {
          // Libraries change rarely — separate chunks stay cached across deploys.
          manualChunks: {
            react: ["react", "react-dom", "react-router-dom"],
            motion: ["framer-motion"],
          },
        },
      },
    },
    server: {
      port: 5173,
      proxy: {
        "/api": {
          target: process.env.VITE_API_PROXY_TARGET || "http://localhost:5000",
          changeOrigin: true,
        },
        "/uploads": {
          target: process.env.VITE_API_PROXY_TARGET || "http://localhost:5000",
          changeOrigin: true,
        },
      },
    },
  };
});
