import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "./config/db.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

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

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

connectDB();

// Allow the configured CLIENT_URL plus a range of localhost dev ports, since
// Vite silently picks the next free port (5173, 5174, 5175, ...) if the
// default one is already in use - without this, that port drift breaks the
// frontend's API calls with a silent CORS error.
const devPortOrigins = Array.from(
  { length: 10 },
  (_, i) => `http://localhost:${5173 + i}`
);
// CLIENT_URL may hold a single origin or a comma-separated list (e.g. the
// apex domain, its www subdomain, and the Vercel preview URL all at once).
const clientOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((url) => url.trim())
  .filter(Boolean);
const allowedOrigins = [...clientOrigins, ...devPortOrigins];

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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", brand: "GADCO ZEN", time: new Date().toISOString() });
});

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

// Serve uploaded product images statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`[server] GADCO ZEN API running on port ${PORT} (${process.env.NODE_ENV || "development"})`);
});

export default app;
