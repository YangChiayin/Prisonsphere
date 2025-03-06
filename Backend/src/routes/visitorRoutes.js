/**
 * @file visitorRoutes.js
 * @description Defines API routes for visitor-related operations in the PrisonSphere system.
 * @module routes/visitorRoutes
 *
 * This route file:
 * - Logs visitor visits for specific inmates.
 * - Retrieves all visitors for an inmate.
 * - Fetches detailed visitor records.
 * - Updates visitor details.
 *
 * @requires express - Express framework for handling routes.
 * @requires logVisitor - Controller function for logging a visitor visit.
 * @requires getVisitorsByInmate - Controller function for fetching all visitors for a given inmate.
 * @requires getVisitorById - Controller function for retrieving a specific visitor's details.
 * @requires updateVisitor - Controller function for updating visitor details.
 * @requires protect - Middleware function for authentication.
 * @requires isWarden - Middleware function for role-based access control (Warden only).
 */

const express = require("express");
const {
  logVisitor,
  getVisitorsByInmate,
  getVisitorById,
  updateVisitor,
} = require("../controllers/visitorController");
const { protect, isWarden } = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * @route   POST /prisonsphere/visitors/:inmateId
 * @desc    Log a visitor visit for a specific inmate.
 * @access  Private (Admin & Warden)
 * @middleware protect - Ensures user is authenticated.
 */
router.post("/:inmateId", protect, logVisitor);

/**
 * @route   GET /prisonsphere/visitors/:inmateId
 * @desc    Retrieve all visitors for a specific inmate.
 * @access  Private (Admin & Warden)
 * @middleware protect - Ensures user is authenticated.
 */
router.get("/:inmateId", protect, getVisitorsByInmate);

/**
 * @route   GET /prisonsphere/visitors/details/:visitorId
 * @desc    Get a single visitor's details.
 * @access  Private (Admin & Warden)
 * @middleware protect - Ensures user is authenticated.
 */
router.get("/details/:visitorId", protect, getVisitorById);

/**
 * @route   PUT /prisonsphere/visitors/details/:visitorId
 * @desc    Update visitor details.
 * @access  Private (Warden Only)
 * @middleware protect - Ensures user is authenticated.
 * @middleware isWarden - Restricts access to wardens only.
 */
router.put("/details/:visitorId", protect, isWarden, updateVisitor);

module.exports = router;
