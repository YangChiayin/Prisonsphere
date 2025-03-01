/**
 * Cloudinary Storage Configuration for Image Uploads
 *
 * This module configures `multer` with `multer-storage-cloudinary` to handle file uploads
 * directly to Cloudinary. It ensures that all uploaded images are securely stored
 * in a designated Cloudinary folder.
 *
 * Purpose:
 * - Integrates `multer` with Cloudinary for seamless image uploads.
 * - Specifies allowed image formats (`jpg`, `png`, `jpeg`).
 * - Organizes uploaded files into the "prisonsphere_inmates" folder in Cloudinary.
 *
 * Usage:
 * - Import this module and use it as a middleware in routes where image uploads are required.
 * - Example:
 *     router.post('/upload', upload.single('image'), (req, res) => { ... });
 */

const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../../utils/cloudinary"); // Import Cloudinary configuration

// Configure storage for Cloudinary using Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary, // Use the configured Cloudinary instance
  params: {
    folder: "prisonsphere_inmates", // Cloudinary folder name where images will be stored
    allowed_formats: ["jpg", "png", "jpeg"], // Restrict allowed image file types
  },
});

// Initialize Multer upload middleware with Cloudinary storage
const upload = multer({ storage });

// Export the configured Multer instance for use in route handlers
module.exports = upload;
