// sets up the Express application, middleware, and routes.
const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");
const app = express();
const connectDB = require("./config/database");
const path = require("path");

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

module.exports = app;
