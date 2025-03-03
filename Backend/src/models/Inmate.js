const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const inmateSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    inmateID: { type: String, required: true, unique: true },
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
    admissionDate: { type: Date, required: true },
    sentenceDuration: { type: Number, required: true }, // Sentence duration in months
    crimeDetails: { type: String, required: true },
    status: {
      type: String,
      enum: ["Incarcerated", "Released", "Parole"],
      default: "Incarcerated",
    },
    assignedCell: { type: String },
    behaviorReports: [
      { type: mongoose.Schema.Types.ObjectId, ref: "BehaviorReport" },
    ],
    profileImage: { type: String, default: "" }, // Cloudinary Image URL
  },
  { timestamps: true }
);

// Virtual field to calculate release date dynamically
inmateSchema.virtual("calculatedReleaseDate").get(function () {
  if (this.sentenceDuration && this.admissionDate) {
    let releaseDate = new Date(this.admissionDate);
    releaseDate.setMonth(releaseDate.getMonth() + this.sentenceDuration);
    return releaseDate;
  }
  return null;
});

module.exports = mongoose.model("Inmate", inmateSchema);
