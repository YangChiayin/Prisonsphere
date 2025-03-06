/**
 * @file visitorModel.js
 * @description Defines the Mongoose schema for visitor records.
 * @module models/Visitor
 *
 * This schema:
 * - Links visitors to inmates via `inmate` field.
 * - Tracks visitor details, including contact information and purpose of visit.
 * - Records visit timestamps and duration for tracking.
 *
 * @requires mongoose - MongoDB ODM library.
 */

const mongoose = require("mongoose");

/**
 * @typedef Visitor
 * @property {ObjectId} inmate - Reference to the associated inmate (required).
 * @property {String} visitorName - Name of the visitor (required).
 * @property {String} relationshipToInmate - Relationship between visitor and inmate (required).
 * @property {String} contactNumber - Contact number of the visitor (required).
 * @property {String} email - Visitor's email address (required).
 * @property {Date} visitTimestamp - Date and time of the visit (defaults to current time).
 * @property {Number} durationMinutes - Duration of the visit in minutes (required).
 * @property {String} purposeOfVisit - Purpose or reason for the visit (required).
 * @property {String} staffNotes - Notes entered by staff regarding the visit (optional).
 */

const visitorSchema = new mongoose.Schema(
  {
    inmate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Inmate",
      required: true, // Ensure visitor must be linked to an inmate
    },
    visitorName: { type: String, required: true },
    relationshipToInmate: { type: String, required: true },
    contactNumber: { type: String, required: true },
    email: { type: String, required: true },
    visitTimestamp: { type: Date, required: true, default: Date.now },
    durationMinutes: { type: Number, required: true },
    purposeOfVisit: { type: String, required: true },
    staffNotes: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Visitor", visitorSchema);
