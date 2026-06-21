import "dotenv/config";
import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import {
  notFoundHandler,
  globalErrorHandler,
} from "./middleware/error.middleware";
import { startExpiredReservationCleaner } from "./utils/cron";

// Route imports
import authRoutes from "./features/Authentication/Authentication.route";
import eventRoutes from "./features/Event/Event.route";
import reservationRoutes from "./features/Reservation/Revservation.route";
import bookingRoutes from "./features/Booking/Booling.route";
import connectDB from "./config/database.config";

// ─────────────────────────────────────────────────────────────────────────────
// App bootstrap
// ─────────────────────────────────────────────────────────────────────────────
const app: Application = express();

// ─────────────────────────────────────────────────────────────────────────────
// Security & parsing middleware
// ─────────────────────────────────────────────────────────────────────────────
app.use(helmet()); // Set secure HTTP headers

app.use(
  cors({
    origin: (process.env.ALLOWED_ORIGINS ?? "http://localhost:3000").split(","),
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json({ limit: "10kb" })); // Parse JSON bodies (limit payload size)
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev")); // Request logging
}

// ─────────────────────────────────────────────────────────────────────────────
// Rate limiting — protect all API endpoints
// ─────────────────────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Max 100 requests per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message:
      "Too many requests from this IP, please try again after 15 minutes",
  },
});

app.use("/api", limiter);

// ─────────────────────────────────────────────────────────────────────────────
// Health check
// ─────────────────────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// API Routes
// ─────────────────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/reserve", reservationRoutes);
app.use("/api/bookings", bookingRoutes);

// ─────────────────────────────────────────────────────────────────────────────
// Error handling (must come AFTER routes)
// ─────────────────────────────────────────────────────────────────────────────
app.use(notFoundHandler);
app.use(globalErrorHandler);

// ─────────────────────────────────────────────────────────────────────────────
// Start server
// ─────────────────────────────────────────────────────────────────────────────
const PORT = Number(process.env.PORT) || 5000;

const startServer = async (): Promise<void> => {
  // Connect to MongoDB first
  await connectDB();

  // Start background cron jobs
  startExpiredReservationCleaner();

  app.listen(PORT, () => {
    console.log(
      `🚀  Server running in ${process.env.NODE_ENV} mode on port ${PORT}`,
    );
  });

  // Graceful shutdown
  process.on("SIGTERM", () => {
    console.log("SIGTERM received. Shutting down gracefully...");
    process.exit(0);
  });

  process.on("unhandledRejection", (reason: Error) => {
    console.error("Unhandled Rejection:", reason);
    process.exit(1);
  });

  process.on("uncaughtException", (err: Error) => {
    console.error("Uncaught Exception:", err);
    process.exit(1);
  });
};

startServer();

export default app;
