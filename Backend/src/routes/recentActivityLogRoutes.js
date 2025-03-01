const express = require("express");
const {
  getRecentActivities,
} = require("../controllers/recentActivityLogController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Get Recent Activities (Last 24 Hours)
router.get("/", protect, getRecentActivities);

module.exports = router;
