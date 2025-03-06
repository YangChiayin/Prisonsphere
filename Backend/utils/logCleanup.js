/**
 * @file cronJob.js
 * @description Automated cleanup of old activity logs using `node-cron`.
 * @module utils/cronJob
 *
 * This script:
 * - Runs a scheduled task every 24 hours at midnight (UTC).
 * - Removes old records from the `RecentActivityLog` collection.
 * - Keeps the database optimized by preventing unnecessary storage growth.
 *
 * Purpose:
 * - Ensures outdated logs do not accumulate and impact performance.
 * - Maintains a clean, efficient database for improved query speeds.
 *
 * @requires node-cron - Library for scheduling recurring tasks in Node.js.
 * @requires mongoose - MongoDB ODM library.
 * @requires RecentActivityLog - The model for logging recent activities.
 */

const cron = require("node-cron");
const RecentActivityLog = require("../src/models/RecentActivityLog");

/**
 * Scheduled Cron Job: Daily Cleanup of Old Logs
 * ---------------------------------------------
 * - Runs automatically at **midnight (UTC) every day**.
 * - Deletes activity logs where `lastUpdated` is older than one day.
 *
 * Schedule Format:
 * - `"0 0 * * *"` → Runs at 00:00 (midnight) UTC every day.
 */
cron.schedule("0 0 * * *", async () => {
  try {
    // **Calculate the date for "yesterday" (1 day before the current date)**
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    // **Delete all logs where `lastUpdated` is older than yesterday**
    await RecentActivityLog.deleteMany({ lastUpdated: { $lt: yesterday } });

    console.log("Old activity logs cleared successfully.");
  } catch (error) {
    console.error("Error clearing old logs:", error);
  }
});
