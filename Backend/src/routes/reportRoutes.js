const express = require("express");
const {
  generateInmateInformationReport,
  generateRehabilitationStatusReport,
  getAllReports,
} = require("../controllers/reportController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Generate Reports
router.post("/inmate-info/:id", protect, generateInmateInformationReport);
router.post("/rehab-status/:id", protect, generateRehabilitationStatusReport);

// Fetch Reports
router.get("/", protect, getAllReports);

module.exports = router;
