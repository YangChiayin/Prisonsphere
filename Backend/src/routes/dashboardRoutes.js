/**
 * @file dashboardRoutes.js
 * @description Defines routes for fetching dashboard statistics and analytics data.
 * @module routes/dashboardRoutes
 *
 * This module:
 * - Provides key prison statistics for the dashboard.
 * - Retrieves analytics data for visualization (inmate trends, parole stats, etc.).
 *
 * Routes:
 * - `GET /prisonsphere/dashboard/stats` → Fetches key dashboard statistics.
 * - `GET /prisonsphere/dashboard/analytics` → Retrieves analytics data for charts and reports.
 *
 * Middleware:
 * - **protect**: Ensures only authenticated users can access dashboard data.
 *
 * @requires express - Express framework for handling routes.
 * @requires dashboardController - Controller for fetching dashboard stats and analytics.
 * @requires authMiddleware - Middleware for authentication enforcement.
 */

const express = require("express");
const {
  getDashboardStats,
  getDashboardAnalytics,
} = require("../controllers/dashboardController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * @route   GET /prisonsphere/dashboard/stats
 * @desc    Fetches key prison statistics for the dashboard.
 * @access  Private (Admin & Warden)
 * @middleware protect - Ensures only authenticated users can access the dashboard.
 */
router.get("/stats", protect, getDashboardStats);

/**
 * @route   GET /prisonsphere/dashboard/analytics
 * @desc    Retrieves analytics data for inmate trends and reports.
 * @access  Private (Admin & Warden)
 * @middleware protect - Ensures only authenticated users can access the dashboard analytics.
 */
router.get("/analytics", protect, getDashboardAnalytics);

module.exports = router;
