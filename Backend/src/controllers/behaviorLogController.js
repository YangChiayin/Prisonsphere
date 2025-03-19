/**
 * @file behavioralLogController.js
 * @description Controller for managing inmate behavioral logs in work programs.
 * @module controllers/behavioralLogController
 *
 * Features:
 * - Logs behavioral performance once per work program.
 * - Retrieves behavioral logs for an inmate.
 * - Updates an existing log instead of creating duplicates.
 *
 * @requires mongoose - MongoDB ODM library.
 * @requires BehavioralLog - The Behavioral Log model.
 * @requires logRecentActivity - Function to log activities in the system.
 */

const BehavioralLog = require("../models/BehaviorLog");
const WorkProgramEnrollment = require("../models/WorkProgramEnrollment");

/**
 * Log or Update Inmate Behavior in a Work Program
 * -----------------------------------------------
 * - If a behavioral log already exists for this inmate and work program, update it.
 * - Otherwise, create a new log entry.
 *
 * @route   POST /prisonsphere/behavioral-logs
 * @access  Warden
 */
const logBehavior = async (req, res) => {
  try {
    const {
      inmateId,
      workProgramId,
      workEthic,
      cooperation,
      incidentReports,
      socialSkills,
    } = req.body;

    // Ensure inmate is enrolled in a work program
    const activeWorkProgram = await WorkProgramEnrollment.findOne({
      inmateId,
      status: "Active", // Check for active program
    });

    if (!activeWorkProgram) {
      return res.status(200).json({
        success: false,
        message:
          "⚠ Inmate must be enrolled in an active work program before logging behavior.",
      });
    }

    // Ensure numeric values are properly parsed
    const parsedWorkEthic = parseInt(workEthic);
    const parsedCooperation = parseInt(cooperation);
    const parsedIncidentReports = parseInt(incidentReports);
    const parsedSocialSkills = parseInt(socialSkills);

    // Validate star ratings (1-5)
    if (
      ![parsedWorkEthic, parsedCooperation, parsedSocialSkills].every(
        (val) => val >= 1 && val <= 5
      )
    ) {
      return res
        .status(400)
        .json({ message: "Ratings must be between 1 and 5." });
    }

    // Validate incident severity scale (0-10)
    if (parsedIncidentReports < 0 || parsedIncidentReports > 10) {
      return res
        .status(400)
        .json({ message: "Incident severity must be between 0 and 10." });
    }

    // Determine incident severity label for logging
    let incidentLabel = "No Incident";
    if (parsedIncidentReports >= 1 && parsedIncidentReports < 4)
      incidentLabel = "Minor Incident";
    else if (parsedIncidentReports >= 4 && parsedIncidentReports < 7)
      incidentLabel = "Moderate Incident";
    else if (parsedIncidentReports >= 7) incidentLabel = "Critical Incident";

    // Check if a behavioral log already exists for this work program
    let behavioralLog = await BehavioralLog.findOne({
      inmateId,
      workProgramId: activeWorkProgram._id,
    });

    if (behavioralLog) {
      // Update existing log
      behavioralLog.workEthic = parsedWorkEthic;
      behavioralLog.cooperation = parsedCooperation;
      behavioralLog.incidentReports = parsedIncidentReports;
      behavioralLog.socialSkills = parsedSocialSkills;

      await behavioralLog.save();

      return res
        .status(200)
        .json({ message: "Behavioral log updated successfully!" });
    }

    // Create a new log if none exists
    const newBehaviorLog = new BehavioralLog({
      inmateId,
      workProgramId: activeWorkProgram._id,
      workEthic: parsedWorkEthic,
      cooperation: parsedCooperation,
      incidentReports: parsedIncidentReports,
      socialSkills: parsedSocialSkills,
    });

    await newBehaviorLog.save();

    res.status(201).json({ message: "Behavior logged successfully!" });
  } catch (error) {
    console.error("Error logging behavior:", error.message); // Log in backend only
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Fetch the Latest Behavioral Log for an Inmate
 * ---------------------------------------------
 * - Retrieves the most recent behavioral log for an inmate.
 * - Uses `updatedAt` to determine how recently the log was modified.
 *
 * @route   GET /prisonsphere/behavioral-logs/inmate/:inmateId
 * @access  Admin & Warden
 */
const getLatestBehaviorLog = async (req, res) => {
  try {
    const { inmateId } = req.params;

    const latestLog = await BehavioralLog.findOne({ inmateId })
      .sort({ updatedAt: -1 }) // Fetch the most recent log based on update time
      .lean(); // Optimize query performance

    if (!latestLog) {
      // Return default values if no log exists
      return res.status(200).json({
        inmateId,
        workProgramId: null,
        workEthic: 0,
        cooperation: 0,
        incidentReports: 0,
        socialSkills: 0,
        timeAgo: "No behavioral log recorded yet",
      });
    }

    // Compute how long ago the log was updated
    const now = new Date();
    const lastUpdated = new Date(latestLog.updatedAt);
    const timeDiff = Math.floor((now - lastUpdated) / (1000 * 60 * 60 * 24));

    latestLog.timeAgo =
      timeDiff === 0 ? "Updated today" : `Updated ${timeDiff} day(s) ago`;

    res.status(200).json(latestLog);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { logBehavior, getLatestBehaviorLog };
