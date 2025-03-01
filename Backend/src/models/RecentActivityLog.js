const mongoose = require("mongoose");

const recentActivityLogSchema = new mongoose.Schema(
  {
    activityType: { type: String, required: true }, // e.g., "INMATE_ADDED", "PAROLE_APPROVED"
    count: { type: Number, default: 1 }, // Track occurrences
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("RecentActivityLog", recentActivityLogSchema);
