/**
 * @file authMiddleware.js
 * @description Middleware for authentication and role-based access control (RBAC).
 * @module middleware/authMiddleware
 *
 * This module:
 * - Protects API routes by enforcing authentication using JWT.
 * - Restricts access to certain routes based on user roles.
 * - Ensures only authorized users can perform specific actions.
 *
 * Security Features:
 * - Extracts JWT from HTTP-only cookies or Authorization headers.
 * - Verifies and decodes the token to authenticate users.
 * - Prevents access to unauthorized users based on role.
 *
 * @requires jsonwebtoken - Library for verifying JWT tokens.
 */

const jwt = require("jsonwebtoken");

/**
 * Protect Middleware (Authentication)
 * -----------------------------------
 * - Ensures that only authenticated users with a valid JWT token can access protected routes.
 * - Extracts JWT from either:
 *   - HTTP-only cookies (`req.cookies.token`).
 *   - Authorization header (`Bearer Token` format).
 * - If the token is valid, attaches the decoded user object to `req.user` and allows access.
 * - If invalid or missing, returns a `401 Unauthorized` response.
 *
 * @middleware protect
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
const protect = (req, res, next) => {
  let token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user details to request
    next(); // Proceed to next middleware or route handler
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

/**
 * Role-Based Access Control (RBAC) - Warden Only
 * ----------------------------------------------
 * - Ensures that only users with the "warden" role can access certain routes.
 * - Assumes that `protect` middleware has already authenticated the user.
 * - If the user is not a warden, returns a `403 Forbidden` response.
 *
 * @middleware isWarden
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */

const isWarden = (req, res, next) => {
  if (req.user.role !== "warden") {
    return res.status(403).json({ message: "Access denied" });
  }
  next();
};

module.exports = { protect, isWarden };
