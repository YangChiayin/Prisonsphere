/**
 * @file uploadMiddleware.js
 * @description Configures `multer` with `multer-storage-cloudinary` to handle secure file uploads to Cloudinary.
 * @module middleware/uploadMiddleware
 *
 * This module:
 * - Integrates `multer` with Cloudinary for seamless image uploads.
 * - Restricts allowed image formats (`jpg`, `png`, `jpeg`) for security.
 * - Organizes uploaded files into the "prisonsphere_inmates" folder in Cloudinary.
 *
 * Usage:
 * - Import this middleware and use it in routes that require image uploads.
 * - Example:
 *     router.post('/upload', upload.single('image'), (req, res) => { ... });
 *
 * Security Considerations:
 * - Ensures only images are uploaded by restricting file formats.
 * - Uses a designated folder to keep inmate images organized.
 *
 * @requires multer - Middleware for handling file uploads.
 * @requires multer-storage-cloudinary - Cloudinary storage engine for Multer.
 * @requires cloudinary - Cloudinary configuration utility.
 */

const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../../utils/cloudinary"); // Import Cloudinary configuration

/**
 * Cloudinary Storage Configuration
 * ---------------------------------
 * - Uses Cloudinary as the storage provider for image uploads.
 * - Stores images in the "prisonsphere_inmates" folder.
 * - Restricts uploads to `jpg`, `png`, and `jpeg` formats.
 */
const storage = new CloudinaryStorage({
  cloudinary: cloudinary, // Use the configured Cloudinary instance
  params: {
    folder: "prisonsphere_inmates", // Cloudinary folder name where images will be stored
    allowed_formats: ["jpg", "png", "jpeg"], // Restrict allowed image file types
  },
});

/**
 * Multer Middleware for File Uploads
 * -----------------------------------
 * - Configures Multer with Cloudinary storage.
 * - Allows uploading images in defined routes.
 */
const upload = multer({ storage });

// Export the configured Multer instance for use in route handlers
module.exports = upload;
