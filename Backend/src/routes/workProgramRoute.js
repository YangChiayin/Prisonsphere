const express = require("express");
const { getWorkPrograms } = require("../controllers/workProgramController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * @route   GET /prisonsphere/work-programs
 * @desc    Fetch all available work programs.
 * @access  Private (Admin & Warden)
 */
router.get("/", protect, getWorkPrograms);

module.exports = router;
