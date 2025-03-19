/**
 * @file server.js
 * @description Entry point for the PrisonSphere backend server.
 * @module server
 *
 * This file:
 * - Configures and initializes the Express application.
 * - Connects to MongoDB using Mongoose.
 * - Sets up middleware for security, authentication, and error handling.
 * - Defines API routes for different system modules.
 *
 * Security Features:
 * - Uses CORS with defined origins to prevent unauthorized API access.
 * - Implements cookie-based authentication for session management.
 * - Configures error handling middleware to catch application errors.
 *
 * @requires express - Express framework for building the backend API.
 * @requires dotenv - Loads environment variables.
 * @requires cookie-parser - Parses cookies for authentication.
 * @requires cors - Enables Cross-Origin Resource Sharing (CORS).
 * @requires connectDB - MongoDB connection utility.
 * @requires errorHandler - Middleware for handling errors.
 */

// Node Imports
const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require("cors");

//Project files Imports
const connectDB = require("./src/config/db");
const errorHandler = require("./src/middleware/errorMiddleware");
const { protect, isWarden } = require("./src/middleware/authMiddleware");

// **Import API Routes**
const authRoutes = require("./src/routes/authRoutes");
const inmateRoutes = require("./src/routes/inmateRoutes");
const visitorRoutes = require("./src/routes/visitorRoutes");
const paroleRoutes = require("./src/routes/paroleRoutes");
const workProgramRoutes = require("./src/routes/workProgramRoute");
const workProgramEnrollmentRoutes = require("./src/routes/workProgramEnrollmentRoutes"); // Work Program Enrollments
const behaviorLogRoutes = require("./src/routes/behaviorLogRoutes"); // Behavioral Logs
const activityLogRoutes = require("./src/routes/activityLogRoutes"); // Activity Logs
const dashboardRoutes = require("./src/routes/dashboardRoutes");
const recentActivityLogRoutes = require("./src/routes/recentActivityLogRoutes");

// **Load environment variables**
dotenv.config();

// **Cleanup scheduled tasks (e.g., log deletion)**
require("./utils/logCleanup");

//connect to DB
connectDB();

//Instantiate an Instance of an express App
const app = express();

// Allow requests from frontend and include credentials
const allowedOrigins = ["http://localhost:5173"]; // Frontend URL

//Middleware Setup
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded data

//Security Middleware
app.use(cookieParser()); // Parse cookies for authentication
app.use(
  cors({
    origin: allowedOrigins, // Restrict API access to frontend origin
    credentials: true, // Allow cookies/session tokens
    methods: ["GET", "POST", "PUT", "DELETE"], // Allowed methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
  })
);

/**
 * API Routes
 * ----------
 * - Defines routes for handling authentication, inmate records, visitor logs, parole applications, and more.
 * - Uses `protect` middleware where authentication is required.
 */
app.use("/prisonsphere/auth", authRoutes);
app.use("/prisonsphere/dashboard", dashboardRoutes);
app.use("/prisonsphere/recent-activities", recentActivityLogRoutes);
app.use("/prisonsphere/inmates", inmateRoutes);
app.use("/prisonsphere/visitors", visitorRoutes);
app.use("/prisonsphere/paroles", paroleRoutes);
app.use("/prisonsphere/work-programs", workProgramRoutes);
app.use("/prisonsphere/work-programs/enrollments", workProgramEnrollmentRoutes);
app.use("/prisonsphere/behavior-logs", behaviorLogRoutes);
app.use("/prisonsphere/activity-logs", activityLogRoutes);

// **Use Global Error Handling Middleware**
app.use(errorHandler);

/**
 * Start Server (Only if not in Test Mode)
 * ---------------------------------------
 * - Ensures the server is only started in development/production.
 * - Exports `app` for testing purposes.
 */
if (process.env.NODE_ENV !== "test") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

// Export app for testing Purpose
module.exports = app;
