/**
 * @file RecentActivityLog.js
 * @description Defines the Mongoose schema for logging recent activities in the PrisonSphere system.
 * @module models/RecentActivityLog
 *
 * This schema:
 * - Tracks recent activities performed in the system.
 * - Prevents excessive log entries by grouping similar activities within short time windows.
 * - Counts occurrences instead of creating duplicate logs.
 *
 * Performance Considerations:
 * - Uses a `count` field to track repeated activities instead of inserting redundant records.
 * - `lastUpdated` helps ensure logs remain relevant while reducing unnecessary database writes.
 *
 * @requires mongoose - MongoDB ODM library.
 */

const mongoose = require("mongoose");

/**
 * @typedef RecentActivityLog
 * @property {String} activityType - Type of activity logged (e.g., "INMATE_ADDED", "PAROLE_APPROVED").
 * @property {Number} count - Tracks occurrences of the same activity (default: 1).
 * @property {Date} lastUpdated - Timestamp of the last occurrence of the activity.
 */

const recentActivityLogSchema = new mongoose.Schema(
  {
    activityType: { type: String, required: true },
    count: { type: Number, default: 1 },
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("RecentActivityLog", recentActivityLogSchema);
