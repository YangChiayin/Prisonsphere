/**
 * @file paroleController.js
 * @description Handles parole applications, approvals, and history for inmates in the PrisonSphere system.
 * @module controllers/paroleController
 *
 * This controller:
 * - Submits parole applications.
 * - Retrieves all parole applications (with filtering & pagination).
 * - Gets upcoming parole hearings.
 * - Fetches a single parole record.
 * - Retrieves parole history for a specific inmate.
 * - Updates parole status (Approve/Deny).
 *
 * @requires mongoose - MongoDB ODM library.
 * @requires Parole - Parole model schema.
 * @requires Inmate - Inmate model schema.
 * @requires logRecentActivity - Function to log recent system activities.
 */

const Parole = require("../models/Parole");
const Inmate = require("../models/Inmate");
const {
  logRecentActivity,
} = require("../controllers/recentActivityLogController");

/**
 * Submit a Parole Application
 * ---------------------------
 * - Submits a new parole application for an inmate.
 * - Ensures the inmate exists before proceeding.
 * - Logs the activity as "PAROLE_SUBMITTED".
 *
 * @route  POST /prisonsphere/paroles
 * @access Warden Only
 */
const submitParoleApplication = async (req, res) => {
  try {
    const { inmate, hearingDate } = req.body;

    // Ensure the inmate exists before proceeding
    const existingInmate = await Inmate.findById(inmate);
    if (!existingInmate)
      return res.status(404).json({ message: "Inmate not found" });

    // Create a new parole application
    const parole = await Parole.create({
      inmate,
      hearingDate: new Date(hearingDate + "T00:00:00.000Z"),
    });

    // Log activity
    await logRecentActivity("PAROLE_SUBMITTED");

    res
      .status(201)
      .json({ message: "Parole application submitted successfully", parole });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Get All Parole Applications (With Filtering & Pagination)
 * ---------------------------------------------------------
 * - Retrieves all parole applications with optional search and filtering.
 * - Supports searching by inmate ID or name.
 * - Filters by parole status and hearing date range.
 *
 * @route  GET /prisonsphere/paroles
 * @access Admin & Warden
 */
const getAllParoleApplications = async (req, res) => {
  try {
    const {
      search,
      status,
      startDate,
      endDate,
      page = 1,
      limit = 8,
    } = req.query;

    let query = {};

    // Search by inmate ID or name
    if (search) {
      const inmateFilter = await Inmate.find({
        $or: [
          { inmateID: { $regex: search, $options: "i" } }, // Search by Inmate ID
          { firstName: { $regex: search, $options: "i" } }, // Search by first name
          { lastName: { $regex: search, $options: "i" } }, // Search by last name
          {
            $expr: {
              $regexMatch: {
                input: { $concat: ["$firstName", " ", "$lastName"] },
                regex: search,
                options: "i",
              },
            },
          }, // Search by full name
        ],
      }).select("_id"); // Select only the IDs of matching inmates

      if (inmateFilter.length > 0) {
        query.inmate = { $in: inmateFilter.map((inmate) => inmate._id) };
      } else {
        return res.json({ paroles: [], totalParoles: 0, totalPages: 0 }); // No results found
      }
    }

    // Filter by parole status (Pending, Approved, Denied)
    if (status) {
      query.status = status;
    }

    // Filter by hearing date range
    if (startDate && endDate) {
      query.hearingDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    // Fetch filtered parole records
    const totalParoles = await Parole.countDocuments(query);
    const paroles = await Parole.find(query)
      .populate("inmate", "firstName lastName inmateID profilePicture")
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ hearingDate: 1 })
      .lean();

    // Convert hearingDate to local time before sending response
    paroles.forEach((parole) => {
      parole.hearingDate = new Date(parole.hearingDate)
        .toISOString()
        .split("T")[0]; // Keep YYYY-MM-DD format
    });

    res.status(200).json({
      paroles,
      totalParoles,
      totalPages: Math.ceil(totalParoles / limit),
      currentPage: Number(page),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Get Upcoming Parole Hearings
 * ----------------------------
 * - Retrieves upcoming parole hearings for inmates.
 * - Limits results to 10 for performance reasons.
 *
 * @route  GET /prisonsphere/paroles/upcoming
 * @access Admin & Warden
 */
const getUpcomingParoles = async (req, res) => {
  try {
    const upcomingParoles = await Parole.find({
      hearingDate: { $gte: new Date() }, // Only future hearings
    })
      .populate("inmate", "firstName lastName inmateID profilePicture")
      .sort({ hearingDate: 1 }) // Earliest first
      .limit(10); // Limit to 10 notifications for performance

    res.status(200).json(upcomingParoles);
  } catch (error) {
    console.error("Error fetching upcoming paroles:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Get a Single Parole Record by ID
 * --------------------------------
 * - Fetches details of a specific parole application.
 *
 * @route  GET /prisonsphere/paroles/:id
 * @access Admin & Warden
 */
const getParoleById = async (req, res) => {
  try {
    const parole = await Parole.findById(req.params.id).populate(
      "inmate",
      "firstName lastName inmateID profilePicture admissionDate"
    );

    if (!parole) {
      return res.status(404).json({ message: "Parole application not found" });
    }

    res.status(200).json(parole);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Get Parole History for a Specific Inmate
 * ----------------------------------------
 * - Retrieves all past parole applications for a given inmate.
 *
 * @route  GET /prisonsphere/paroles/inmate/:inmateId
 * @access Admin & Warden
 */
const getParoleHistoryByInmate = async (req, res) => {
  try {
    const { inmateId } = req.params;
    const paroles = await Parole.find({ inmate: inmateId }).populate(
      "inmate",
      "firstName lastName inmateID"
    );

    res.status(200).json(paroles);
  } catch (error) {
    console.error("❌ Error fetching parole history:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Update Parole Status (Approve/Deny)
 * -----------------------------------
 * - Updates the status of a parole application.
 * - Logs the decision in the activity log.
 *
 * @route  PUT /prisonsphere/paroles/:id
 * @access Warden Only
 */
const updateParoleStatus = async (req, res) => {
  try {
    const { status, decisionNotes } = req.body;

    if (!["Pending", "Approved", "Denied"].includes(status)) {
      return res
        .status(400)
        .json({ message: "Invalid parole status provided" });
    }

    const parole = await Parole.findById(req.params.id);
    if (!parole) {
      return res.status(404).json({ message: "Parole application not found" });
    }

    if (parole.status !== "Pending") {
      return res
        .status(400)
        .json({ message: "This parole decision has already been made" });
    }

    parole.status = status;
    parole.decisionNotes = decisionNotes;
    await parole.save();

    if (status === "Approved") {
      const updatedInmate = await Inmate.findByIdAndUpdate(
        parole.inmate,
        { status: "Parole" },
        { new: true }
      );

      if (!updatedInmate) {
        return res
          .status(404)
          .json({ message: "Inmate not found while updating parole status" });
      }

      await logRecentActivity("PAROLE_APPROVED");
    } else if (status === "Denied") {
      await logRecentActivity("PAROLE_DENIED");
    }

    res
      .status(200)
      .json({ message: "Parole status updated successfully", parole });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  submitParoleApplication,
  getAllParoleApplications,
  getUpcomingParoles,
  getParoleById,
  getParoleHistoryByInmate,
  updateParoleStatus,
};
