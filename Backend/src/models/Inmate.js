/**
 * @file inmateModel.js
 * @description Defines the Mongoose schema for the Inmate collection.
 * @module models/Inmate
 *
 * This schema represents inmates in the PrisonSphere system and includes:
 * - Personal details (name, DOB, gender).
 * - Admission details (inmate ID, admission date, sentence duration, crime details).
 * - Status tracking (incarceration, parole, or release).
 * - Behavior reports reference.
 * - Assigned cell and profile image.
 * - A virtual field to calculate the estimated release date.
 *
 * @requires mongoose - MongoDB ODM library.
 */

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/**
 * @typedef Inmate
 * @property {String} firstName - Inmate's first name (required).
 * @property {String} lastName - Inmate's last name (required).
 * @property {String} inmateID - Unique identifier for the inmate (required, unique).
 * @property {Date} dateOfBirth - Inmate's date of birth (required).
 * @property {String} gender - Gender of the inmate (Male, Female, Other) (required).
 * @property {Date} admissionDate - Date the inmate was admitted (required).
 * @property {Number} sentenceDuration - Duration of the sentence in months (required).
 * @property {String} crimeDetails - Description of the crime committed (required).
 * @property {String} status - Inmate status (Incarcerated, Released, Parole), default: Incarcerated.
 * @property {String} assignedCell - The cell assigned to the inmate.
 * @property {Array<ObjectId>} behaviorReports - References to behavior reports.
 * @property {String} profileImage - URL of the inmate's profile image (default: empty string).
 */

const inmateSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    inmateID: { type: String, required: true, unique: true },
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
    admissionDate: { type: Date, required: true },
    sentenceDuration: { type: Number, required: true },
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
    profileImage: { type: String, default: "" },
  },
  { timestamps: true }
);

// Export the model for use in the application
module.exports = mongoose.model("Inmate", inmateSchema);
