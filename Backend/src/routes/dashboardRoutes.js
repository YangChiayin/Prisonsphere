const express = require("express");

const {
  getDashboardStats,
  getDashboardAnalytics,
} = require("../controllers/dashboardController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();
router.get("/stats", protect, getDashboardStats); // Dashboard Stats
router.get("/analytics", protect, getDashboardAnalytics); //  Analytics Data

module.exports = router;
