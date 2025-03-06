/**
 * @file recentActivityLogController.js
 * @description Handles logging and retrieval of recent activities within the PrisonSphere system.
 * @module controllers/recentActivityLogController
 *
 * This module:
 * - Logs user activities to track changes within the system.
 * - Prevents duplicate logs by updating count instead of creating new entries.
 * - Retrieves recent activity logs with human-readable timestamps.
 *
 * @requires mongoose - MongoDB ODM library.
 * @requires RecentActivityLog - Recent Activity Log model schema.
 */

const RecentActivityLog = require("../models/RecentActivityLog");

/**
 * Log a Recent Activity (Count-Based)
 * -----------------------------------
 * - If a similar activity exists within 1 hour, update its count.
 * - Otherwise, create a new log entry.
 * - Ensures logs are not duplicated within a short time window.
 *
 * @param {String} activityType - The type of activity to be logged.
 */
const logRecentActivity = async (activityType) => {
  try {
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);

    // Find an existing log for the same activity type within the last hour
    const existingLog = await RecentActivityLog.findOne({
      activityType,
      lastUpdated: { $gte: oneHourAgo }, // Checks if log was updated within the last hour
    });

    if (existingLog) {
      // If an existing log is found, increase the count and update timestamp
      existingLog.count += 1;
      existingLog.lastUpdated = new Date();
      existingLog.message = generateActivityMessage(
        activityType,
        existingLog.count
      );
      await existingLog.save();
    } else {
      // Otherwise, create a new activity log
      await RecentActivityLog.create({
        activityType,
        count: 1,
        message: generateActivityMessage(activityType, 1),
      });
    }
  } catch (error) {
    console.error("Error logging recent activity:", error);
  }
};

/**
 * Get Recent Activities
 * ---------------------
 * - Fetches activities recorded within the last 24 hours.
 * - Groups logs together and provides human-readable time labels.
 * - Returns formatted data for the frontend.
 *
 * @route  GET /prisonsphere/dashboard/recent-activities
 * @access Admin & Warden
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Array} - List of recent activities formatted with time labels.
 */
const getRecentActivities = async (req, res) => {
  try {
    const last24Hours = new Date();
    last24Hours.setDate(last24Hours.getDate() - 1);

    // Fetch logs from the last 24 hours, sorted by most recent first
    let recentActivities = await RecentActivityLog.find({
      lastUpdated: { $gte: last24Hours },
    }).sort({ lastUpdated: -1 });

    // Format time labels for better readability
    recentActivities = recentActivities.map((activity) => {
      const timeDiff = Math.floor(
        (new Date() - new Date(activity.lastUpdated)) / (1000 * 60) // Convert milliseconds to minutes
      );

      // Determine the best human-readable time label
      let timeLabel =
        timeDiff < 1
          ? "just now"
          : timeDiff < 5
          ? "a few moments ago"
          : timeDiff < 30
          ? "a few minutes ago"
          : timeDiff < 60
          ? `${timeDiff} minutes ago`
          : `${Math.floor(timeDiff / 60)} hour(s) ago`;

      return {
        activityType: activity.activityType, // Used in frontend to map icons
        message: `${generateActivityMessage(
          activity.activityType,
          activity.count
        )} (${timeLabel})`, // Human-readable log message
      };
    });

    res.status(200).json(recentActivities);
  } catch (error) {
    console.error("❌ Error fetching recent activities:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Generate Activity Log Messages Dynamically
 * ------------------------------------------
 * - Generates human-readable messages based on activity type and count.
 * - Uses pluralization to ensure correct wording.
 *
 * @param {String} activityType - The type of activity.
 * @param {Number} count - Number of times the activity has occurred.
 * @returns {String} - A formatted message describing the activity.
 */
const generateActivityMessage = (activityType, count) => {
  // Function to pluralize words based on count (e.g., "1 inmate" vs. "2 inmates")
  const pluralize = (word, count) =>
    count > 1 ? `${count} ${word}s` : `1 ${word}`;

  // Predefined messages for each activity type
  const messages = {
    INMATE_ADDED: `${pluralize("inmate", count)} was added to the system`,
    INMATE_UPDATED: `An inmate record was updated`,
    INMATE_DELETED: `${pluralize("inmate", count)} was removed from the system`,

    //Parole Messages
    PAROLE_SUBMITTED: `${pluralize("parole application", count)} was submitted`,
    PAROLE_APPROVED: `${pluralize("parole application", count)} was approved`,
    PAROLE_DENIED: `${pluralize("parole application", count)} was denied`,

    //Visitor Messages
    VISITOR_LOGGED: `${pluralize(
      "visitor log",
      count
    )} was recorded for an inmate`,
    VISITOR_UPDATED: `A visitor's record was updated`,
    VISITOR_DELETED: `${pluralize(
      "visitor log",
      count
    )} was removed from the system`,

    // Work Program Messages
    WORK_PROGRAM_ENROLLED: `${pluralize(
      "inmate",
      count
    )} enrolled in a work program`,

    REPORT_GENERATED: `An inmate report was generated`,
  };

  // Return the appropriate message or a default one if the type isn't defined
  return messages[activityType] || `${count} activity performed`;
};

// Export controller functions for use in routes
module.exports = { getRecentActivities, logRecentActivity };
