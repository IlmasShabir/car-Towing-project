const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const bookingRoutes = require("./routes/bookingRoutes");
const userRoutes = require("./routes/userRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const adminRoutes = require("./routes/adminRoutes");
const serviceRoutes = require("./routes/serviceRoutes");

dotenv.config();
connectDB();

const app = express();

// Parse CLIENT_URL and strip any trailing slashes
const clientUrl = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.trim().replace(/\/+$/, "")
  : null;

// Allow configured CLIENT_URL, its www variant, and local development origins
const allowedOrigins = [
  clientUrl,
  clientUrl ? clientUrl.replace("://", "://www.") : null,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like Postman, mobile apps, or server-to-server)
      if (!origin) return callback(null, true);

      // Clean trailing slash from incoming origin header
      const cleanOrigin = origin.replace(/\/+$/, "");

      const isLocalhost = /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(
        cleanOrigin,
      );

      if (isLocalhost || allowedOrigins.includes(cleanOrigin)) {
        return callback(null, true);
      }

      console.error(`Blocked by CORS: ${origin}`);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);

app.use(express.json({ limit: "10mb" }));

app.get("/", (req, res) => {
  res.send("Usama Towing Service API is running");
});

app.get("/health", (req, res) => res.json({ ok: true }));

app.use("/api/bookings", bookingRoutes);
app.use("/api/users", userRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/services", serviceRoutes);

// Fallback error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(500)
    .json({ message: err.message || "Something went wrong on the server" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () =>
  console.log(`Server running on port ${PORT}`),
);
