/**
 * @file authRoutes.js
 * @description Defines authentication-related routes for user login and logout.
 * @module routes/authRoutes
 *
 * This module:
 * - Manages authentication endpoints for the PrisonSphere system.
 * - Handles user login, session verification, and logout functionality.
 *
 * Routes:
 * - `POST /prisonsphere/auth/login` → Authenticates the user and returns a JWT token.
 * - `GET /prisonsphere/auth/login` → Checks if the user is logged in and returns session info.
 * - `GET /prisonsphere/auth/logout` → Logs the user out and invalidates the session.
 *
 * Middleware:
 * - Authentication and session handling is managed via the **authController**.
 *
 * @requires express - Express framework for handling routes.
 * @requires authController - Controller for managing authentication.
 */

const express = require("express");
const {
  login_post,
  login_get,
  logout,
} = require("../controllers/authController");

const router = express.Router();

/**
 * @route   POST /prisonsphere/auth/login
 * @desc    Authenticates the user and issues a JWT token.
 * @access  Public
 * @middleware login_post - Processes user credentials and returns authentication response.
 */
router.post("/login", login_post);

/**
 * @route   GET /prisonsphere/auth/login
 * @desc    Checks if the user is currently logged in.
 * @access  Private
 * @middleware login_get - Verifies if a valid session exists.
 */
router.get("/login", login_get);

/**
 * @route   GET /prisonsphere/auth/logout
 * @desc    Logs the user out and clears authentication cookies.
 * @access  Private
 * @middleware logout - Clears the user's session token.
 */
router.get("/logout", logout);

module.exports = router;
