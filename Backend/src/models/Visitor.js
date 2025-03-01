const mongoose = require("mongoose");

const visitorSchema = new mongoose.Schema(
  {
    inmate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Inmate",
      required: true, // Ensure visitor must be linked to an inmate
    },
    visitorName: { type: String, required: true },
    relationshipToInmate: { type: String, required: true },
    visitDate: { type: Date, required: true, default: Date.now },
    purposeOfVisit: { type: String, required: true },
    staffNotes: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Visitor", visitorSchema);
