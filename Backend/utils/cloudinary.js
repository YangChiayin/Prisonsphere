/**
 * Cloudinary Configuration Module
 *
 * This module sets up and configures Cloudinary for handling image uploads in the application.
 *
 * Purpose:
 * - Securely load Cloudinary credentials from environment variables.
 * - Enable easy and reusable Cloudinary integration across the app.
 * - Ensure sensitive credentials are not hardcoded in the source code.
 *
 * Usage:
 * - This module exports a configured Cloudinary instance that can be used in any part of the application.
 * - Import it wherever Cloudinary image upload or retrieval is needed.
 */

// Import the Cloudinary library and use its v2 version
const cloudinary = require("cloudinary").v2;

// Load environment variables from a .env file (for security)
require("dotenv").config();

// Configure Cloudinary with credentials stored in environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // Your Cloudinary cloud name
  api_key: process.env.CLOUDINARY_API_KEY, // Your Cloudinary API key (used for authentication)
  api_secret: process.env.CLOUDINARY_API_SECRET, // Your API secret (used for secure API calls)
});

// Export the configured Cloudinary instance for use in other parts of the application
module.exports = cloudinary;
