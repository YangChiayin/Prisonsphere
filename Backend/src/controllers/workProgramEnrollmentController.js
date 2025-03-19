/**
 * @file workProgramEnrollmentController.js
 * @description Controller for managing inmate work program enrollments in the PrisonSphere system.
 * @module controllers/workProgramEnrollmentController
 *
 * Features:
 * - Assigns an inmate to a work program.
 * - Fetches all work program enrollments for inmates.
 * - Retrieves the latest completed work program.
 * - Auto-completes work programs when the end date is met.
 * - Calculates performance ratings based on behavioral logs.
 * - Ensures inmates can only have one active work program at a time.
 *
 * @requires mongoose - MongoDB ODM library.
 * @requires WorkProgramEnrollment - The Work Program Enrollment model.
 * @requires WorkProgram - The Work Program model.
 * @requires Inmate - The Inmate model.
 * @requires BehavioralLog - The Behavioral Log model.
 * @requires logRecentActivity - Function to log activities in the system.
 */

const mongoose = require("mongoose");
const WorkProgramEnrollment = require("../models/WorkProgramEnrollment");
const WorkProgram = require("../models/WorkProgram");
const Inmate = require("../models/Inmate");
const BehavioralLog = require("../models/BehaviorLog");
const ActivityLog = require("../models/ActivityLog");
const { logRecentActivity } = require("./recentActivityLogController");

/**
 * Assign an Inmate to a Work Program
 * ----------------------------------
 * - Ensures an inmate cannot be enrolled in more than one active work program.
 * - Logs the assignment as a recent activity.
 *
 * @route   POST /prisonsphere/work-programs/enroll
 * @access  Admin
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
const assignInmateToWorkProgram = async (req, res) => {
  try {
    const { inmateId, workProgramId, startDate, endDate } = req.body;

    // Validate the work program
    const workProgram = await WorkProgram.findById(workProgramId);
    if (!workProgram) {
      return res
        .status(400)
        .json({ message: "Invalid work program selected." });
    }

    // Ensure the inmate exists
    const inmate = await Inmate.findById(inmateId);
    if (!inmate) {
      return res.status(404).json({ message: "Inmate not found." });
    }

    // Check if the inmate is incarcerated**
    if (inmate.status !== "Incarcerated") {
      return res.status(400).json({
        message:
          "⚠ Work program assignment denied. This inmate is not incarcerated.",
      });
    }

    // Check if the inmate is already in an active work program
    const existingEnrollment = await WorkProgramEnrollment.findOne({
      inmateId,
      status: "Active",
    });

    if (existingEnrollment) {
      return res.status(200).json({
        success: false,
        message: "Inmate is already enrolled in an active work program.",
      });
    }

    // Create a new work program enrollment
    const newEnrollment = new WorkProgramEnrollment({
      inmateId,
      workProgramId,
      startDate,
      endDate,
    });

    await newEnrollment.save();

    // Log recent activity
    await logRecentActivity("WORK_PROGRAM_ENROLLED");

    res.status(201).json({ message: "Work program assigned successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Fetch All Work Program Enrollments with Pagination
 * -------------------------------------------------
 * - Retrieves paginated list of work program enrollments.
 * - Supports filtering by status (active/completed).
 *
 * @route   GET /prisonsphere/work-programs/enrollments
 * @access  Private (Admin & Warden)
 */
const getAllWorkProgramEnrollments = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const filters = {};
    if (status && status !== "all") {
      filters.status = status.charAt(0).toUpperCase() + status.slice(1); // Capitalize first letter
    }

    // Fetch total count
    const totalEnrollments = await WorkProgramEnrollment.countDocuments(
      filters
    );

    // Fetch paginated results
    const enrollments = await WorkProgramEnrollment.find(filters)
      .populate("inmateId", "firstName lastName profileImage inmateID")
      .populate("workProgramId", "name")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    if (!enrollments) {
      return res.status(404).json({ message: "No enrollments found." });
    }

    // Compute performance rating correctly per enrollment
    const enrollmentsWithRating = await Promise.all(
      enrollments.map(async (enrollment) => {
        const behavioralLogs = await BehavioralLog.find({
          inmateId: enrollment.inmateId._id,
        });

        let performanceRating = 0;
        if (behavioralLogs.length > 0) {
          const totalScore = behavioralLogs.reduce(
            (acc, log) =>
              acc +
              log.workEthic +
              log.cooperation +
              log.socialSkills +
              (5 - log.incidentReports), // Convert incident reports to a positive scale
            0
          );
          performanceRating = Math.min(
            5,
            Math.max(1, totalScore / (behavioralLogs.length * 4))
          );
        }

        return {
          ...enrollment.toObject(),
          performanceRating, // Assign computed rating
        };
      })
    );

    res.status(200).json({
      enrollments: enrollmentsWithRating,
      totalEnrollments,
      totalPages: Math.ceil(totalEnrollments / limit),
    });
  } catch (error) {
    console.error("Error fetching work program enrollments:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Fetch Work Program Enrollments for a Specific Inmate
 * ----------------------------------------------------
 * - Retrieves all work program enrollments for a given inmate.
 *
 * @route   GET /prisonsphere/work-programs/inmate/:inmateId
 * @access  Admin & Warden
 */
const getWorkProgramEnrollmentByInmate = async (req, res) => {
  try {
    const { inmateId } = req.params;

    const enrollments = await WorkProgramEnrollment.find({
      inmateId,
      status: "Active",
    })
      .populate(
        "workProgramId",
        "name description startDate endDate performanceRating"
      )
      .sort({ startDate: -1 });

    res.status(200).json(enrollments || {});
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Fetch the Latest Completed Work Program for an Inmate
 * -----------------------------------------------------
 * - Retrieves the most recent completed work program for an inmate.
 *
 * @route   GET /prisonsphere/work-programs/inmate/:inmateId/latest
 * @access  Admin & Warden
 */
const getLatestCompletedWorkProgram = async (req, res) => {
  try {
    const { inmateId } = req.params;

    const latestCompleted = await WorkProgramEnrollment.findOne({
      inmateId,
      status: "Completed",
    }).sort({ completionDate: -1 });

    res.status(200).json(latestCompleted || {});
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Auto-Complete Work Programs
 * ---------------------------
 * - Marks work programs as completed when their end date is met.
 * - Automatically updates status and sets completionDate.
 * - Logs completion as a recent activity.
 */
const autoCompleteWorkPrograms = async () => {
  try {
    const today = new Date();

    // Find all active programs whose end date has passed
    const programsToComplete = await WorkProgramEnrollment.find({
      status: "Active",
      endDate: { $lt: today },
    });

    for (const program of programsToComplete) {
      // Calculate final performance rating from behavioral logs
      const finalRating = await calculatePerformanceRating(program._id);

      program.status = "Completed";
      program.completionDate = today;
      program.performanceRating = finalRating;
      await program.save();
    }

    if (programsToComplete.length > 0) {
      // Log recent activity
      await logRecentActivity("WORK_PROGRAM_COMPLETED");
    }

    console.log(`${programsToComplete.length} Work Programs Auto-Completed.`);
  } catch (error) {
    console.error("Error running auto-completion check:", error);
  }
};

// Set up auto-completion to run daily
setInterval(autoCompleteWorkPrograms, 24 * 60 * 60 * 1000);

/**
 * Calculate Final Performance Rating for a Work Program
 * -----------------------------------------------------
 * - Averages all weekly behavioral logs.
 * - Deducts points if there are incident reports.
 *
 * @param {ObjectId} workProgramId - The work program enrollment ID.
 * @returns {Number} - Final performance rating (1-5 stars).
 */
const calculatePerformanceRating = async (workProgramId) => {
  const logs = await BehavioralLog.find({ workProgramId });

  if (logs.length === 0) return 3; // Default to "Average" if no logs exist

  let totalWorkEthic = 0;
  let totalCooperation = 0;
  let totalSocialSkills = 0;
  let totalIncidentReports = 0;
  let count = logs.length;

  logs.forEach((log) => {
    totalWorkEthic += log.workEthic;
    totalCooperation += log.cooperation;
    totalSocialSkills += log.socialSkills;
    totalIncidentReports += log.incidentReports;
  });

  const weightedScore =
    (totalWorkEthic * 30 + totalCooperation * 30 + totalSocialSkills * 20) /
      (count * 80) -
    (totalIncidentReports * 20) / 100;

  return Math.max(1, Math.min(5, weightedScore * 5));
};

/**
 * Fetches work program display data for INM001
 * ---------------------------------------------
 * - Retrieves active work program for INM001.
 * - Fetches inmate details (profileImage, name, ID).
 * - Computes average performance rating from behavioral logs.
 * - Fetches the latest 3 activity logs.
 *
 * @route   GET /prisonsphere/work-programs/display-sample
 * @access  Private (Admin & Warden)
 */
const getWorkProgramSampleDisplay = async (req, res) => {
  try {
    const inmateId = "67b016627d5ccd2b6c17f26a"; // Sample data

    // Fetch Active Work Program
    const activeProgram = await WorkProgramEnrollment.findOne({
      inmateId,
      status: "Active",
    }).populate("workProgramId", "name description startDate endDate");

    if (!activeProgram) {
      return res.status(404).json({ message: "No active work program found." });
    }

    // Fetch Inmate Details (Ensure Profile Image & ID)
    const inmate = await Inmate.findById(inmateId).select(
      "firstName lastName profileImage inmateID"
    );

    if (!inmate) {
      return res.status(404).json({ message: "Inmate not found." });
    }

    // Fetch the Latest Behavioral Log
    const latestBehavioralLog = await BehavioralLog.findOne({ inmateId })
      .sort({ createdAt: -1 }) // Get most recent entry
      .select("workEthic cooperation incidentReports socialSkills createdAt");

    // Compute Performance Rating (Average of 4 categories)
    let performanceRating = 0;
    if (latestBehavioralLog) {
      const totalScore =
        latestBehavioralLog.workEthic +
        latestBehavioralLog.cooperation +
        latestBehavioralLog.socialSkills +
        (5 - latestBehavioralLog.incidentReports); // Reverse scale for incidents

      performanceRating = Math.min(5, Math.max(1, totalScore / 4)); // Normalize between 1-5
    }

    // Fetch Latest 3 Activity Logs
    const latestActivityLogs = await ActivityLog.find({ inmateId })
      .sort({ logDate: -1 })
      .limit(3)
      .select("activityType description logDate");

    // Send response to frontend
    res.status(200).json({
      inmate,
      workProgram: activeProgram,
      performanceRating,
      behavioralLog: latestBehavioralLog || null,
      activityLogs: latestActivityLogs,
    });
  } catch (error) {
    console.error("Error fetching sample work program display:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Export controllers
module.exports = {
  assignInmateToWorkProgram,
  getAllWorkProgramEnrollments,
  getWorkProgramEnrollmentByInmate,
  getLatestCompletedWorkProgram,
  getWorkProgramSampleDisplay,
};
