/**
 * @file cloudinary.js
 * @description Configures Cloudinary for secure image uploads in the PrisonSphere system.
 * @module utils/cloudinary
 *
 * This module:
 * - Loads Cloudinary credentials from environment variables.
 * - Enables secure and scalable image uploads within the application.
 * - Ensures sensitive credentials are never hardcoded.
 *
 * Usage:
 * - This module exports a configured Cloudinary instance.
 * - Import it wherever Cloudinary image uploads or retrievals are needed.
 *
 * Security Considerations:
 * - Uses environment variables to keep API credentials secure.
 * - Ensures authentication keys are not exposed in the source code.
 *
 * @requires cloudinary - Cloudinary SDK for handling image uploads.
 * @requires dotenv - Loads environment variables from a .env file.
 */

const cloudinary = require("cloudinary").v2; // Import Cloudinary's v2 API

// Load environment variables from a .env file
require("dotenv").config();

/**
 * Cloudinary Configuration
 * -------------------------
 * - Configures Cloudinary with credentials stored in environment variables.
 * - Ensures API authentication is secure and reusable across the application.
 */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // Your Cloudinary cloud name
  api_key: process.env.CLOUDINARY_API_KEY, // Your Cloudinary API key (used for authentication)
  api_secret: process.env.CLOUDINARY_API_SECRET, // Your API secret (used for secure API calls)
});

module.exports = cloudinary;
