/**
 * @file workProgramEnrollmentRoutes.js
 * @description Defines API routes for inmate work program enrollments.
 * @module routes/workProgramEnrollmentRoutes
 *
 * Features:
 * - Assigns inmates to work programs.
 * - Fetches all enrollments.
 * - Retrieves work program details for a specific inmate.
 *
 * Middleware:
 * - **protect**: Ensures only authenticated users can access routes.
 *
 * @requires express - Express framework for handling routes.
 * @requires workProgramEnrollmentController - Work Program Enrollment Controller.
 * @requires authMiddleware - Middleware for authentication.
 */

const express = require("express");
const {
  assignInmateToWorkProgram,
  getAllWorkProgramEnrollments,
  getWorkProgramEnrollmentByInmate,
  getLatestCompletedWorkProgram,
  getWorkProgramSampleDisplay,
} = require("../controllers/workProgramEnrollmentController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * @route   POST /prisonsphere/work-programs/enrollments
 * @desc    Assigns an inmate to a work program.
 * @access  Private (Admin)
 */
router.post("/", protect, assignInmateToWorkProgram);

/**
 * @route   GET /prisonsphere/work-programs/enrollments
 * @desc    Fetches all work program enrollments.
 * @access  Private (Admin & Warden)
 */
router.get("/", protect, getAllWorkProgramEnrollments);

/**
 * @route   GET /prisonsphere/work-programs/enrollments/inmate/:inmateId
 * @desc    Fetches work programs for a specific inmate.
 * @access  Private (Admin & Warden)
 */
router.get("/inmate/:inmateId", protect, getWorkProgramEnrollmentByInmate);

/**
 * @route   GET /prisonsphere/work-programs/enrollments/inmate/:inmateId/latest
 * @desc    Fetches the latest completedwork programs for a specific inmate.
 * @access  Private (Admin & Warden)
 */
router.get("/inmate/:inmateId/latest", protect, getLatestCompletedWorkProgram);

// New Route: Fetch Sample Work Program Display Data
router.get("/display-sample", protect, getWorkProgramSampleDisplay);

module.exports = router;
