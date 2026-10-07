import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "./config/db.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import { razorpayWebhook } from "./controllers/orderController.js";
import { expireStalePendingPayments } from "./services/orderLifecycle.js";
import { ensureMedicalSupplies } from "./services/ensureMedicalSupplies.js";
import { isRazorpayConfigured } from "./config/store.js";
import { isEmailConfigured } from "./utils/sendEmail.js";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import couponRoutes from "./routes/couponRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import siteContentRoutes from "./routes/siteContentRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import subscriberRoutes from "./routes/subscriberRoutes.js";
import configRoutes from "./routes/configRoutes.js";
import bulkEnquiryRoutes from "./routes/bulkEnquiryRoutes.js";

dotenv.config();

const isProduction = process.env.NODE_ENV === "production";

if (!process.env.JWT_SECRET || (isProduction && process.env.JWT_SECRET.length < 32)) {
  console.error("[server] JWT_SECRET is missing or too short (use at least 32 random characters).");
  process.exit(1);
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Render/Railway/Heroku etc. sit behind a proxy — needed for correct client
// IPs in rate limiting and https URLs.
app.set("trust proxy", 1);

connectDB();
// Adds the Medical Supplies category/products if they are missing (insert-only).
ensureMedicalSupplies();

// Allow the configured CLIENT_URL plus a range of localhost dev ports, since
// Vite silently picks the next free port (5173, 5174, 5175, ...) if the
// default one is already in use - without this, that port drift breaks the
// frontend's API calls with a silent CORS error.
const devPortOrigins = isProduction
  ? []
  : Array.from({ length: 10 }, (_, i) => `http://localhost:${5173 + i}`);
// CLIENT_URL may hold a single origin or a comma-separated list (e.g. the
// apex domain, its www subdomain, and the Vercel preview URL all at once).
const clientOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((url) => url.trim().replace(/\/$/, ""))
  .filter(Boolean);
const allowedOrigins = [...clientOrigins, ...devPortOrigins];

app.use(
  helmet({
    // Product images in /uploads are loaded by the frontend from another origin.
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, server-to-server, Postman, etc.)
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);

// Razorpay webhooks are verified against the exact raw bytes, so this route
// must be registered before express.json() parses the body.
app.post(
  "/api/payments/razorpay/webhook",
  express.raw({ type: "application/json" }),
  razorpayWebhook
);

app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());
if (process.env.NODE_ENV !== "test") {
  app.use(morgan(isProduction ? "combined" : "dev"));
}

const limiter = (max, windowMinutes = 15) =>
  rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many requests, please try again in a few minutes." },
  });

app.use("/api", limiter(600));
app.use(["/api/auth/login", "/api/auth/register", "/api/auth/forgot-password", "/api/auth/reset-password"], limiter(20));
app.use(["/api/contact", "/api/subscribers"], limiter(10));
// Only throttle public quote submissions, not the admin list/update calls.
app.post("/api/bulk-enquiries", limiter(10));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", brand: "GADCO ZEN", time: new Date().toISOString() });
});

// Short browser/CDN caching for public catalogue reads — cuts repeat API
// calls while browsing. Anything user-specific (cart, orders...) is untouched.
const publicCache = (seconds) => (req, res, next) => {
  if (req.method === "GET" && !req.headers.authorization) {
    res.set("Cache-Control", `public, max-age=${seconds}, stale-while-revalidate=${seconds * 5}`);
  }
  next();
};
app.use(["/api/products", "/api/categories", "/api/reviews/featured", "/api/config"], publicCache(60));

app.use("/api/config", configRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/site-content", siteContentRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/subscribers", subscriberRoutes);
app.use("/api/bulk-enquiries", bulkEnquiryRoutes);

// Serve uploaded product images statically
app.use("/uploads", express.static(path.join(__dirname, "uploads"), { maxAge: "7d" }));

app.use(notFound);
app.use(errorHandler);

// Unpaid online orders hold stock; release it if payment never completes.
if (isRazorpayConfigured() && process.env.NODE_ENV !== "test") {
  setInterval(() => {
    expireStalePendingPayments().catch((err) =>
      console.error("[orders] Pending-payment cleanup failed:", err.message)
    );
  }, 5 * 60 * 1000).unref();
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`[server] GADCO ZEN API running on port ${PORT} (${process.env.NODE_ENV || "development"})`);
  console.log(
    `[server] Razorpay: ${isRazorpayConfigured() ? "configured" : "NOT configured"} · Email: ${
      isEmailConfigured() ? "configured" : "NOT configured (emails are logged only)"
    }`
  );
});

export default app;
