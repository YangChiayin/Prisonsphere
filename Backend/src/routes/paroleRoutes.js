/**
 * @file paroleRoutes.js
 * @description Defines API routes for parole-related operations in the PrisonSphere system.
 * @module routes/paroleRoutes
 *
 * This route file:
 * - Submits parole applications.
 * - Retrieves all parole applications (with filtering & pagination).
 * - Fetches upcoming parole hearings.
 * - Gets a single parole record by ID.
 * - Retrieves parole history for a specific inmate.
 * - Updates parole status (Approve/Deny).
 *
 * @requires express - Express framework for handling routes.
 * @requires submitParoleApplication - Controller function for submitting a parole application.
 * @requires getAllParoleApplications - Controller function for fetching all parole applications.
 * @requires getUpcomingParoles - Controller function for retrieving upcoming parole hearings.
 * @requires getParoleById - Controller function for fetching a single parole record.
 * @requires getParoleHistoryByInmate - Controller function for retrieving parole history by inmate.
 * @requires updateParoleStatus - Controller function for updating the status of a parole application.
 * @requires protect - Middleware function for authentication.
 * @requires isWarden - Middleware function for role-based access control (Warden only).
 */

const express = require("express");
const {
  submitParoleApplication,
  getAllParoleApplications,
  getUpcomingParoles,
  getParoleById,
  getParoleHistoryByInmate,
  updateParoleStatus,
} = require("../controllers/paroleController");

const { protect, isWarden } = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * @route   POST /prisonsphere/paroles
 * @desc    Submit a parole application.
 * @access  Private (Warden Only)
 * @middleware protect - Ensures user is authenticated.
 * @middleware isWarden - Restricts access to wardens only.
 */
router.post("/", protect, isWarden, submitParoleApplication);

/**
 * @route   GET /prisonsphere/paroles
 * @desc    Retrieve all parole applications with optional filtering and pagination.
 * @access  Private (Admin & Warden)
 * @middleware protect - Ensures user is authenticated.
 */
router.get("/", protect, getAllParoleApplications);

/**
 * @route   GET /prisonsphere/paroles/upcoming
 * @desc    Get upcoming parole hearings.
 * @access  Public
 */
router.get("/upcoming", getUpcomingParoles);

/**
 * @route   GET /prisonsphere/paroles/:id
 * @desc    Get a single parole application by ID.
 * @access  Private (Admin & Warden)
 * @middleware protect - Ensures user is authenticated.
 */
router.get("/:id", protect, getParoleById);

/**
 * @route   GET /prisonsphere/paroles/inmate/:inmateId
 * @desc    Retrieve parole history for a specific inmate.
 * @access  Private (Admin & Warden)
 * @middleware protect - Ensures user is authenticated.
 */
router.get("/inmate/:inmateId", protect, getParoleHistoryByInmate);

/**
 * @route   PUT /prisonsphere/paroles/:id
 * @desc    Update the status of a parole application (Approve/Deny).
 * @access  Private (Warden Only)
 * @middleware protect - Ensures user is authenticated.
 * @middleware isWarden - Restricts access to wardens only.
 */
router.put("/:id", protect, isWarden, updateParoleStatus);

module.exports = router;
