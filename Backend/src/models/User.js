/**
 * @file User.js
 * @description Defines the Mongoose schema for user authentication and role management.
 * @module models/User
 *
 * This schema:
 * - Manages user authentication and role-based access control (RBAC).
 * - Uses bcrypt.js for secure password hashing.
 * - Defines user roles (warden, admin) for restricted access to system features.
 *
 * Security Features:
 * - **Unique usernames** ensure no duplicate accounts.
 * - **Hashed passwords** prevent storing plain-text credentials.
 * - **Pre-save middleware** automatically hashes passwords before storing them.
 *
 * Relationships:
 * - Used for authentication & role-based authorization across the system.
 *
 * @requires mongoose - MongoDB ODM library.
 * @requires bcryptjs - Library for hashing passwords securely.
 */

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

/**
 * @typedef User
 * @property {String} username - Unique username for the user (required).
 * @property {String} password - Hashed password for authentication (required).
 * @property {String} role - Defines the user's access level (warden, admin).
 */

const userSchema = new mongoose.Schema(
  {
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["warden", "admin"],
      required: true,
      lowercase: true, // Ensures consistent role formatting
    },
  },
  { timestamps: true } // Automatically adds `createdAt` and `updatedAt` fields
);

/**
 * Password Hashing Middleware
 * ---------------------------
 * - Automatically hashes the password before saving a new user.
 * - Ensures passwords are never stored in plain text.
 */
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model("User", userSchema);
