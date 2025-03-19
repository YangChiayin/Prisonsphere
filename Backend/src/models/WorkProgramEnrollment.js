/**
 * @file WorkProgramEnrollment.js
 * @description Stores inmate work program enrollments and progress tracking.
 * @module models/WorkProgramEnrollment
 *
 * Features:
 * - References the `WorkProgram` model instead of using fixed enums.
 * - Stores the performance rating upon completion.
 * - Ensures an inmate is only assigned to one active work program.
 *
 * @requires mongoose - MongoDB ODM library.
 */

const mongoose = require("mongoose");

/**
 * @typedef WorkProgramEnrollment
 * @property {ObjectId} inmateId - Reference to the assigned inmate.
 * @property {ObjectId} workProgramId - Reference to the work program.
 * @property {Date} startDate - Program start date.
 * @property {Date} endDate - Program expected completion date.
 * @property {Date} completionDate - Actual completion date (auto-set).
 * @property {Number} performanceRating - Final rating upon completion (1-5 stars).
 * @property {String} status - Active, Completed, or Cancelled.
 */
const workProgramEnrollmentSchema = new mongoose.Schema(
  {
    inmateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Inmate",
      required: true,
    },
    workProgramId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WorkProgram",
      required: true,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    completionDate: { type: Date, default: null },
    performanceRating: { type: Number, min: 1, max: 5, default: null },
    status: {
      type: String,
      enum: ["Active", "Completed", "Cancelled"],
      default: "Active",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "WorkProgramEnrollment",
  workProgramEnrollmentSchema
);
