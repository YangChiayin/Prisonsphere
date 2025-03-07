/**
 * @file recentActivityLogRoutes.js
 * @description Defines the route for fetching recent activity logs within the last 24 hours.
 * @module routes/recentActivityLogRoutes
 *
 * Features:
 * - Uses `express.Router()` to define an API endpoint.
 * - Implements role-based access using authentication middleware.
 * - Fetches recent activities from the system logs.
 *
 * @requires express - Express.js framework for routing.
 * @requires getRecentActivities - Controller function that retrieves the activity log.
 * @requires protect - Middleware that ensures only authenticated users can access this route.
 */

const express = require("express");
const {
  getRecentActivities,
} = require("../controllers/recentActivityLogController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * @route GET /prisonsphere/recent-activities
 * @description Retrieves recent activity logs from the past 24 hours.
 * @access Protected (Authenticated Users)
 * @middleware protect - Ensures only logged-in users can access the endpoint.
 * @controller getRecentActivities - Fetches the recent activity logs.
 */
router.get("/", protect, getRecentActivities);

module.exports = router;
