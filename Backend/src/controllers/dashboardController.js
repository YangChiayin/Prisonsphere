/**
 * @file dashboardController.js
 * @description Handles dashboard-related data retrieval for key prison statistics and analytics.
 * @module controllers/dashboardController
 *
 * This module:
 * - Provides prison-wide statistics for the dashboard.
 * - Fetches inmate distribution and trends over time.
 * - Uses MongoDB aggregation for optimized data retrieval.
 *
 * @requires mongoose - MongoDB ODM library.
 * @requires Inmate - Inmate model schema.
 * @requires Report - Report model schema.
 * @requires Parole - Parole model schema.
 */

const Inmate = require("../models/Inmate");
const Report = require("../models/Report");
const Parole = require("../models/Parole");

/**
 * Get Dashboard Stats
 * -------------------
 * - Retrieves key prison statistics for dashboard display.
 * - Includes total inmates, rehabilitation count, upcoming parole hearings, and recent reports.
 *
 * @route  GET /prisonsphere/dashboard/stats
 * @access Admin & Warden
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Object} JSON response with total inmate count, rehabilitation count, upcoming parole hearings, and recent reports.
 */
const getDashboardStats = async (req, res) => {
  try {
    // **Count total inmates in the system**
    const totalInmates = await Inmate.countDocuments();

    // **Count inmates currently in rehabilitation**
    const inRehabilitation = await Inmate.countDocuments({
      status: "In Rehabilitation",
    });

    // **Count upcoming parole hearings (future dates)**
    const upcomingParole = await Parole.countDocuments({
      hearingDate: { $gte: new Date() },
    });

    // **Count reports generated in the last 30 days**
    const recentReports = await Report.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, // Last 30 days
    });

    res.json({ totalInmates, inRehabilitation, upcomingParole, recentReports });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching dashboard stats",
      error: error.message,
    });
  }
};

/**
 * Get Dashboard Analytics Data
 * ----------------------------
 * - Provides inmate count trends and distribution for visual analytics.
 * - Includes:
 *   - Inmate count per month (last 6 months) for a line chart.
 *   - Inmate distribution (Incarcerated, Released, Parole) for a pie chart.
 *
 * @route  GET /prisonsphere/dashboard/analytics
 * @access Admin & Warden
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Object} JSON response with inmate count trends and distribution data.
 */
const getDashboardAnalytics = async (req, res) => {
  try {
    const now = new Date();
    const sixMonthsAgo = new Date(now.setMonth(now.getMonth() - 6));

    // Fetch monthly inmate count for the last 6 months
    const monthlyInmateStats = await Inmate.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } }, // Filter by last 6 months
      {
        $group: {
          _id: { $month: "$createdAt" }, // Group by month
          count: { $sum: 1 }, // Count inmates per month
        },
      },
      { $sort: { _id: 1 } }, // Ensure months are sorted correctly
    ]);

    // **Fetch inmate distribution for a pie chart**
    const incarceratedCount = await Inmate.countDocuments({
      status: "Incarcerated",
    });
    const releasedCount = await Inmate.countDocuments({ status: "Released" });
    const paroleCount = await Inmate.countDocuments({ status: "Parole" });

    res.status(200).json({
      monthlyInmateStats,
      inmateDistribution: { incarceratedCount, releasedCount, paroleCount },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching analytics data", error: error.message });
  }
};

module.exports = { getDashboardStats, getDashboardAnalytics };
