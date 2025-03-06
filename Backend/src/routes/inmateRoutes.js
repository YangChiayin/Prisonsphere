/**
 * @file inmateRoutes.js
 * @description Defines API routes for inmate-related operations in the PrisonSphere system.
 * @module routes/inmateRoutes
 *
 * This route file includes:
 * - Inmate registration (with file upload).
 * - Fetching all inmates, searching, and retrieving a specific inmate.
 * - Updating and deleting inmate records.
 * - Protecting routes using authentication and role-based access control.
 *
 * @requires express - Express framework for handling routes.
 * @requires registerInmate - Controller function for registering an inmate.
 * @requires getNextInmateID - Controller function for generating the next available inmate ID.
 * @requires getAllInmates - Controller function for fetching all inmates.
 * @requires searchInmate - Controller function for searching inmates.
 * @requires getInmateById - Controller function for retrieving a specific inmate.
 * @requires updateInmate - Controller function for updating inmate details.
 * @requires deleteInmate - Controller function for deleting an inmate record.
 * @requires protect - Middleware function for authentication.
 * @requires isWarden - Middleware function for role-based access control (Warden only).
 * @requires upload - Middleware function for handling profile image uploads.
 */

const express = require("express");
const {
  registerInmate,
  getNextInmateID,
  getAllInmates,
  searchInmate,
  getInmateById,
  updateInmate,
  deleteInmate,
} = require("../controllers/inmateController");

const { protect, isWarden } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware"); // Middleware for handling image uploads

const router = express.Router();

/**
 * @route   POST /prisonsphere/inmates
 * @desc    Register a new inmate (with profile image upload).
 * @access  Private (Warden only)
 * @middleware protect - Ensures user is authenticated.
 * @middleware isWarden - Restricts access to wardens only.
 * @middleware upload.single("profileImage") - Handles image upload.
 */
router.post(
  "/",
  protect,
  isWarden,
  upload.single("profileImage"),
  registerInmate
);

/**
 * @route   GET /prisonsphere/inmates/next-id
 * @desc    Get the next available Inmate ID.
 * @access  Private (Admin & Warden)
 * @middleware protect - Ensures user is authenticated.
 */
router.get("/next-id", protect, getNextInmateID);

/**
 * @route   GET /prisonsphere/inmates
 * @desc    Retrieve all inmates (with optional pagination and search).
 * @access  Private (Admin & Warden)
 * @middleware protect - Ensures user is authenticated.
 */
router.get("/", protect, getAllInmates);

/**
 * @route   GET /prisonsphere/inmates/search
 * @desc    Search for an inmate by Inmate ID or Full Name.
 * @access  Private (Admin & Warden)
 * @middleware protect - Ensures user is authenticated.
 */
router.get("/search", protect, searchInmate);

/**
 * @route   GET /prisonsphere/inmates/:id
 * @desc    Get a single inmate's details by ID.
 * @access  Private (Admin & Warden)
 * @middleware protect - Ensures user is authenticated.
 */
router.get("/:id", protect, getInmateById);

/**
 * @route   PUT /prisonsphere/inmates/:id
 * @desc    Update an inmate's details (including profile image).
 * @access  Private (Warden only)
 * @middleware protect - Ensures user is authenticated.
 * @middleware isWarden - Restricts access to wardens only.
 * @middleware upload.single("profileImage") - Handles image upload.
 */
router.put(
  "/:id",
  protect,
  isWarden,
  upload.single("profileImage"),
  updateInmate
);

/**
 * @route   DELETE /prisonsphere/inmates/:id
 * @desc    Delete an inmate record (soft delete).
 * @access  Private (Warden only)
 * @middleware protect - Ensures user is authenticated.
 * @middleware isWarden - Restricts access to wardens only.
 */
router.delete("/:id", protect, isWarden, deleteInmate);

// Export the router to be used in the main application
module.exports = router;
