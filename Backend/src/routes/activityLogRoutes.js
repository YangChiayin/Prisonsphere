/**
 * @file activityLogRoutes.js
 * @description Defines routes for managing inmate activity logs, including logging new activities
 * and retrieving activity logs for a specific inmate.
 *
 * @module routes/activityLogRoutes
 *
 * Features:
 * - Allows wardens to log new inmate activities.
 * - Enables administrators and wardens to fetch activity logs for specific inmates.
 * - Uses middleware for authentication and role-based access control.
 *
 * @requires express - Express framework for defining routes.
 * @requires activityLogController - Controller handling activity log logic.
 * @requires authMiddleware - Middleware for authentication and role-based access control.
 */
const express = require("express");
const {
  logActivity,
  getActivityLogsForInmate,
} = require("../controllers/activityLogController");
const { protect, isWarden } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, isWarden, logActivity);
router.get("/inmate/:inmateId", protect, getActivityLogsForInmate);

module.exports = router;
