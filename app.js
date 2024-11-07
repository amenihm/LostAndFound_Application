// sets up the Express application, middleware, and routes.

require('dotenv').config();

const express = require('express');
const app = express();
const connectDB = require('./config/database');

/*
// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());

// Routes
app.use('/api', userRoutes);
*/
module.exports = app;