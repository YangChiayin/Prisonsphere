/**
 * Report Controller
 * -----------------
 * Handles generating reports for inmates:
 * - Inmate Information Report
 * - Rehabilitation Status Report
 *
 * Enhancements:
 * - Now stores reports in MongoDB using the Report model.
 * - Allows fetching previous reports.
 */

const Inmate = require("../models/Inmate");
const WorkProgramEnrollment = require("../models/WorkProgramEnrollment");
const BehaviorLog = require("../models/BehaviorLog");
const ActivityLog = require("../models/ActivityLog");
const Report = require("../models/Report");
const {
  logRecentActivity,
} = require("../controllers/recentActivityLogController"); //Import logging Function

/**
 * Generate and Save Inmate Information Report
 * -------------------------------------------
 * This function generates a full profile report for an inmate and saves it in MongoDB.
 */
const generateInmateInformationReport = async (req, res) => {
  try {
    if (!["warden", "admin"].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const { id } = req.params;
    const inmate = await Inmate.findById(id);
    if (!inmate) return res.status(404).json({ message: "Inmate not found" });

    const workPrograms = await WorkProgramEnrollment.find({
      inmate: id,
    }).populate("workProgram", "name");
    const behaviorLogs = await BehaviorLog.find({ inmate: id });
    const activityLogs = await ActivityLog.find({ inmate: id });

    // Report Content
    const reportData = {
      title: "Inmate Information Report",
      type: "Inmate Info",
      inmate: inmate._id,
      details: {
        firstName: inmate.firstName,
        lastName: inmate.lastName,
        inmateID: inmate.inmateID,
        dateOfBirth: inmate.dateOfBirth,
        gender: inmate.gender,
        admissionDate: inmate.admissionDate,
        releaseDate: inmate.releaseDate,
        crimeDetails: inmate.crimeDetails,
        status: inmate.status,
        assignedCell: inmate.assignedCell,
        workPrograms,
        behaviorLogs,
        activityLogs,
      },
      createdBy: req.user.id,
    };

    // Save Report to DB
    const report = await Report.create(reportData);

    // Log activity: Inmate Information Report generated
    await logRecentActivity(
      "REPORT_GENERATED_INMATE",
      "Inmate Info Report generated",
      "📜"
    );

    res
      .status(201)
      .json({ message: "Inmate Info Report Generated & Saved", report });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error generating report", error: error.message });
  }
};

/**
 * Generate and Save Rehabilitation Status Report
 * ----------------------------------------------
 * This function generates a report on an inmate's rehabilitation progress and saves it.
 */
const generateRehabilitationStatusReport = async (req, res) => {
  try {
    if (!["warden", "admin"].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const { id } = req.params;
    const inmate = await Inmate.findById(id);
    if (!inmate) return res.status(404).json({ message: "Inmate not found" });

    const behaviorLogs = await BehaviorLog.find({ inmate: id });
    const workPrograms = await WorkProgramEnrollment.find({ inmate: id });
    const activityLogs = await ActivityLog.find({ inmate: id });

    // Evaluation Logic
    const workEthicAvg =
      behaviorLogs.reduce((acc, log) => acc + (log.workEthicRating || 0), 0) /
      (behaviorLogs.length || 1);
    const cooperationAvg =
      behaviorLogs.reduce((acc, log) => acc + (log.cooperationRating || 0), 0) /
      (behaviorLogs.length || 1);
    const incidentCount = behaviorLogs.filter(
      (log) => log.incidentReports
    ).length;

    const overallRating =
      (workEthicAvg + cooperationAvg) / 2 - incidentCount * 0.5;
    let status = "Needs More Rehabilitation";
    if (overallRating > 4) status = "Highly Rehabilitated";
    else if (overallRating > 3) status = "Moderately Rehabilitated";

    // Report Content
    const reportData = {
      title: "Rehabilitation Status Report",
      type: "Rehabilitation Status",
      inmate: inmate._id,
      details: {
        behaviorLogs,
        workPrograms,
        activityLogs,
        evaluation: {
          workEthicAvg: workEthicAvg.toFixed(2),
          cooperationAvg: cooperationAvg.toFixed(2),
          incidentCount,
          overallRating: overallRating.toFixed(2),
          status,
        },
      },
      createdBy: req.user.id,
    };

    // Save Report to DB
    const report = await Report.create(reportData);

    // Log activity: Rehabilitation Status Report generated
    await logRecentActivity(
      "REPORT_GENERATED_REHAB",
      "Rehabilitation Status Report generated",
      "📄"
    );

    res.status(201).json({
      message: "Rehabilitation Status Report Generated & Saved",
      report,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error generating report", error: error.message });
  }
};

/**
 * Get All Reports
 * ---------------
 * Allows admins & wardens to retrieve previously generated reports.
 */
const getAllReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate("inmate", "firstName lastName inmateID")
      .populate("createdBy", "username");
    res.status(200).json(reports);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching reports", error: error.message });
  }
};

module.exports = {
  generateInmateInformationReport,
  generateRehabilitationStatusReport,
  getAllReports,
};
