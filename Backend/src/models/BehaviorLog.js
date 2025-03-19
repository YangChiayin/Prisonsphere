/**
 * @file BehavioralLog.js
 * @description Defines the schema for logging inmate behavior during work programs.
 * @module models/BehavioralLog
 *
 * Features:
 * - Logs inmate behavior on a weekly basis.
 * - Tracks work ethic, cooperation, incident reports, and social skills.
 * - Used for calculating performance rating when work programs are completed.
 *
 * @requires mongoose - MongoDB ODM library.
 */

const mongoose = require("mongoose");

/**
 * @typedef BehavioralLog
 * @property {ObjectId} inmateId - Reference to the assigned inmate.
 * @property {ObjectId} workProgramId - Reference to the work program enrollment.
 * @property {Number} workEthic - Rating (1-5) for work ethic.
 * @property {Number} cooperation - Rating (1-5) for cooperation.
 * @property {Number} incidentReports - Number of incidents (lower is better).
 * @property {Number} socialSkills - Rating (1-5) for social adaptability.
 * @property {Date} loggedAt - The date the behavior was logged (weekly).
 */
const behavioralLogSchema = new mongoose.Schema(
  {
    inmateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Inmate",
      required: true,
    },
    workProgramId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WorkProgramEnrollment",
      required: true,
    },
    workEthic: { type: Number, required: true, min: 1, max: 5 },
    cooperation: { type: Number, required: true, min: 1, max: 5 },
    incidentReports: { type: Number, default: 0, min: 0 },
    socialSkills: { type: Number, required: true, min: 1, max: 5 },
    loggedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BehaviorLog", behavioralLogSchema);
