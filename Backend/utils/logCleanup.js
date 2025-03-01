/**
 * Cron Job: Automatic Cleanup of Old Activity Logs
 *
 * This script uses the `node-cron` package to schedule a task that runs daily at midnight.
 * It removes old records from the `RecentActivityLog` collection where `lastUpdated` is older than one day.
 *
 * Purpose:
 * - Keeps the database clean by removing outdated activity logs.
 * - Prevents unnecessary database bloat and improves performance.
 */

const cron = require("node-cron");
const RecentActivityLog = require("../src/models/RecentActivityLog");

// Schedule a cron job to run every 24 hours at midnight (UTC)
cron.schedule("0 0 * * *", async () => {
  try {
    // Calculate the date for "yesterday" (1 day before the current date)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    // Delete all logs where `lastUpdated` is older than yesterday
    await RecentActivityLog.deleteMany({ lastUpdated: { $lt: yesterday } });

    console.log(" Old activity logs cleared successfully.");
  } catch (error) {
    console.error(" Error clearing old logs:", error);
  }
});
