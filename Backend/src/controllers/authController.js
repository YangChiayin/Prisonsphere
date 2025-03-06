/**
 * @file authController.js
 * @description Handles user authentication within the PrisonSphere system.
 * @module controllers/authController
 *
 * This module:
 * - Manages user login, logout, and session verification.
 * - Uses bcrypt.js for password hashing and verification.
 * - Implements JWT authentication with HTTP-only cookies.
 *
 * Authentication Features:
 * - **Secure Password Handling**: Uses bcrypt to compare hashed passwords.
 * - **JWT Tokens**: Generates authentication tokens valid for 1 hour.
 * - **HTTP-only Cookies**: Stores JWT tokens securely to prevent client-side access.
 *
 * Security:
 * - Prevents unauthorized access by verifying user credentials.
 * - Ensures passwords are never exposed in responses.
 * - Uses HTTP-only, secure, and SameSite cookies to mitigate CSRF attacks.
 */

const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

/**
 * Login User
 * ----------
 * - Authenticates a user and issues a JWT token.
 * - Verifies credentials against the database.
 * - Stores the JWT in an HTTP-only cookie.
 *
 * @route  POST /prisonsphere/auth/login
 * @access Public
 *
 * @param {Object} req - Express request object containing username and password.
 * @param {Object} res - Express response object.
 */
const login_post = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    // Generate JWT Token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Set cookie with JWT
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
    });
    res.json({ message: "Login successful", token, role: user.role });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Verify Login Status
 * -------------------
 * - Checks if a user is logged in by verifying the stored JWT token.
 *
 * @route  GET /prisonsphere/auth/status
 * @access Private
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */

const login_get = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "Not logged in" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ message: "Authenticated", user: decoded });
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired session" });
  }
};

/**
 * Logout User
 * -----------
 * - Logs out a user by clearing the JWT cookie.
 *
 * @route  GET /prisonsphere/auth/logout
 * @access Private
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
const logout = async (req, res) => {
  res.cookie("token", "", { expires: new Date(0) }); // Expire the JWT token
  res.json({ message: "Logged out successfully" });
};

module.exports = { login_post, login_get, logout };
