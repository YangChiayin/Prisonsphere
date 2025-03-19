/**
 * @file ActivityLog.js
 * @description Defines the schema for tracking inmate activities during work programs.
 * @module models/ActivityLog
 *
 * Features:
 * - Logs inmate participation in work programs.
 * - Tracks counseling, education, and work performance.
 * - Used for tracking rehabilitation engagement.
 *
 * @requires mongoose - MongoDB ODM library.
 */

const mongoose = require("mongoose");

/**
 * @typedef ActivityLog
 * @property {ObjectId} inmateId - Reference to the assigned inmate.
 * @property {String} activityType - Type of activity logged.
 * @property {String} description - Detailed description of the activity.
 * @property {Date} logDate - The date the activity was logged.
 */
const activityLogSchema = new mongoose.Schema(
  {
    inmateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Inmate",
      required: true,
    },
    activityType: {
      type: String,
      enum: [
        "Counseling",
        "Education",
        "Conflict",
        "Recreation",
        "Health Session",
      ],
      required: true,
    },
    description: { type: String, required: true },
    logDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ActivityLog", activityLogSchema);
