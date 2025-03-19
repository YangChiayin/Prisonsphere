const express = require("express");
const {
  logBehavior,
  getLatestBehaviorLog,
} = require("../controllers/behaviorLogController");
const { protect, isWarden } = require("../middleware/authMiddleware");

const router = express.Router();

// Route to log or update behavior
router.post("/", protect, isWarden, logBehavior);

// Route to get the latest behavioral log for an inmate
router.get("/inmate/:inmateId", protect, getLatestBehaviorLog);

module.exports = router;
