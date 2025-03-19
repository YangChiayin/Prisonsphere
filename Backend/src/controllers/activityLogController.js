/**
 * @file activityLogController.js
 * @description Controller for managing inmate activity logs in work programs.
 * @module controllers/activityLogController
 *
 * Features:
 * - Logs inmate participation in work-related activities.
 * - Fetches activity logs for a specific inmate.
 *
 * @requires mongoose - MongoDB ODM library.
 * @requires ActivityLog - The Activity Log model.
 * @requires logRecentActivity - Function to log activities in the system.
 */

const ActivityLog = require("../models/ActivityLog");

/**
 * Log Inmate Activity in a Work Program
 * -------------------------------------
 * - Records daily participation in work-related activities.
 *
 * @route   POST /prisonsphere/activity-logs
 * @access  Warden
 *
 * @param {Object} req - Express request object containing log details.
 * @param {Object} res - Express response object.
 */
const logActivity = async (req, res) => {
  try {
    const { inmateId, activityType, description } = req.body;

    if (!inmateId || !activityType || !description) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const newActivityLog = new ActivityLog({
      inmateId,
      activityType,
      description,
    });

    await newActivityLog.save();

    res.status(201).json({ message: "Activity logged successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Fetch All Activity Logs for an Inmate
 * -------------------------------------
 * - Retrieves all activity logs recorded for an inmate.
 *
 * @route   GET /prisonsphere/activity-logs/inmate/:inmateId
 * @access  Admin & Warden
 */
const getActivityLogsForInmate = async (req, res) => {
  try {
    const { inmateId } = req.params;
    const { page = 1, limit = 2 } = req.query; // Default to page 1, 2 logs per page

    const skip = (page - 1) * limit;

    const totalLogs = await ActivityLog.countDocuments({ inmateId });

    const logs = await ActivityLog.find({ inmateId })
      .sort({ createdAt: -1 }) // Show latest logs first
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      logs,
      totalLogs,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { logActivity, getActivityLogsForInmate };
