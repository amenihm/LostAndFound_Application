// sets up the Express application, middleware, and routes.
const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");
const app = express();
const connectDB = require("./config/database");
const path = require("path");
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");

dotenv.config();

// Connect to MongoDB
connectDB();

// CORS configuration
app.use(
  cors({
    origin: "http://localhost:4200",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Middleware
app.use(express.json());

// Routes
app.use("/api/items", require("./routes/item"));
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
module.exports = app;
