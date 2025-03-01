/**
 * Report Model
 * ------------
 * Stores two types of reports:
 * - Inmate Information Report → Full bio-data details of an inmate.
 * - Rehabilitation Status Report → Tracks the rehabilitation progress of an inmate.
 *
 * Fields:
 * - title → The name of the report.
 * - type → Specifies whether it's "Inmate Info" or "Rehabilitation Status".
 * - inmate → References the inmate this report is about.
 * - details → Stores JSON-formatted report data.
 * - createdBy → Admin/Warden who generated the report.
 * - createdAt → Timestamp of report creation.
 */

const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    type: {
      type: String,
      enum: ["Inmate Info", "Rehabilitation Status"],
      required: true,
    },
    inmate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Inmate",
      required: true,
    },
    details: { type: Object, required: true }, // JSON structure for report content
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Report", reportSchema);
