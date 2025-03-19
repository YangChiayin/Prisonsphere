/**
 * @file WorkProgram.js
 * @description Defines the schema for work programs available in the PrisonSphere system.
 * @module models/WorkProgram
 *
 * Features:
 * - Stores predefined work programs (e.g., Kitchen, Carpentry, Cleaning).
 * - Allows dynamic addition and modification by administrators.
 * - Prevents redundancy with unique work program names.
 *
 * @requires mongoose - MongoDB ODM library.
 */

const mongoose = require("mongoose");

/**
 * @typedef WorkProgram
 * @property {String} name - Name of the work program (Unique).
 * @property {String} description - Short description of the work program.
 */
const workProgramSchema = new mongoose.Schema(
  {
    name: { type: String, unique: true, required: true },
    description: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("WorkProgram", workProgramSchema);
