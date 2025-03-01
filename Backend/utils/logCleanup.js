const cron = require("node-cron");
const RecentActivityLog = require("../src/models/RecentActivityLog");

// Runs every 24 hours at midnight
cron.schedule("0 0 * * *", async () => {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    await RecentActivityLog.deleteMany({ lastUpdated: { $lt: yesterday } });
    console.log("Old activity logs cleared.");
  } catch (error) {
    console.error(" Error clearing old logs:", error);
  }
});
