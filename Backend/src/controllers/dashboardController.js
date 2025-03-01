const Inmate = require("../models/Inmate");
const Report = require("../models/Report");
const Parole = require("../models/Parole");

/**
 * @desc Get Dashboard Stats
 * @route GET /prisonsphere/dashboard/stats
 * @access Admin & Warden
 *
 * Provides key prison statistics:
 * - Total inmates
 * - Inmates in rehabilitation
 * - Upcoming parole hearings
 * - Recent reports generated
 */

const getDashboardStats = async (req, res) => {
  try {
    const totalInmates = await Inmate.countDocuments();
    const inRehabilitation = await Inmate.countDocuments({
      status: "In Rehabilitation",
    });
    const upcomingParole = await Parole.countDocuments({
      hearingDate: { $gte: new Date() },
    });
    const recentReports = await Report.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
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
 * @desc Get Dashboard Analytics Data
 * @route GET /prisonsphere/dashboard/analytics
 * @access Admin & Warden
 *
 * Provides:
 * - Inmate count per month (last 6 months) for the line chart.
 * - Inmate distribution (Incarcerated, Released, Parole) for the pie chart.
 */
const getDashboardAnalytics = async (req, res) => {
  try {
    const now = new Date();
    const sixMonthsAgo = new Date(now.setMonth(now.getMonth() - 6));

    // Fetch monthly inmate count for the last 6 months
    const monthlyInmateStats = await Inmate.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { $month: "$createdAt" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } }, // Ensure months are sorted correctly
    ]);

    // Fetch inmate distribution
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
