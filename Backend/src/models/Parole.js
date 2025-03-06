/**
 * @file paroleModel.js
 * @description Defines the Mongoose schema for parole applications.
 * @module models/Parole
 *
 * This schema:
 * - Links a parole application to a specific inmate.
 * - Tracks the application and hearing dates.
 * - Maintains the parole status (Pending, Approved, Denied).
 * - Stores decision notes from the parole board.
 *
 * @requires mongoose - MongoDB ODM library.
 */

const mongoose = require("mongoose");

/**
 * @typedef Parole
 * @property {ObjectId} inmate - Reference to the associated inmate (required).
 * @property {Date} applicationDate - Date the parole application was submitted (default: now).
 * @property {Date} hearingDate - Date scheduled for the parole hearing.
 * @property {String} status - Current status of the parole application (Pending, Approved, Denied).
 * @property {String} decisionNotes - Notes on the parole decision (optional).
 */
const paroleSchema = new mongoose.Schema(
  {
    inmate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Inmate",
      required: true,
    },
    applicationDate: { type: Date, default: Date.now },
    hearingDate: { type: Date },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Denied"],
      default: "Pending",
    },
    decisionNotes: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Parole", paroleSchema);
