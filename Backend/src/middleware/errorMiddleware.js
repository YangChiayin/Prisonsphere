/**
 * @file errorHandler.js
 * @description Global error handling middleware for handling application errors.
 * @module middleware/errorHandler
 *
 * This middleware:
 * - Captures and logs errors that occur in the application.
 * - Sends a structured JSON response with the appropriate HTTP status code.
 * - Prevents sensitive error details from being exposed to clients.
 *
 * Features:
 * - Logs errors to the console for debugging purposes.
 * - Uses `statusCode` from the error object if available; defaults to `500` (Internal Server Error).
 * - Ensures all responses include a clear and standardized error message.
 *
 * @requires express - Express framework for handling middleware.
 */

/**
 * Global Error Handler Middleware
 * -------------------------------
 * - Captures and processes application errors.
 * - Ensures a structured JSON response with status codes.
 *
 * @middleware errorHandler
 * @param {Object} err - The error object thrown within the application.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */

const errorHandler = (err, req, res, next) => {
  console.error("Error:", err.message); // Logs error message to console for debugging
  res
    .status(err.statusCode || 500)
    .json({ message: err.message || "Server Error" }); // Sends structured error response
};

module.exports = errorHandler;
