/**
 * @file visitorController.js
 * @description Manages visitor logging and retrieval for inmates in the PrisonSphere system.
 * @module controllers/visitorController
 *
 * This controller:
 * - Logs visitor visits for specific inmates.
 * - Retrieves all visitors for a given inmate.
 * - Fetches detailed visitor records.
 * - Updates visitor details.
 *
 * @requires mongoose - ODM library for MongoDB.
 * @requires Visitor - Visitor model schema.
 * @requires Inmate - Inmate model schema.
 * @requires logRecentActivity - Function to log recent system activities.
 */

const Visitor = require("../models/Visitor");
const Inmate = require("../models/Inmate");
const {
  logRecentActivity,
} = require("../controllers/recentActivityLogController"); // Import logging function

/**
 * Log a Visitor for an Inmate
 * ---------------------------
 * - Registers a visitor visit for a specific inmate.
 * - Ensures the inmate exists before logging the visit.
 * - Logs the activity as "VISITOR_LOGGED".
 *
 * @route  POST /prisonsphere/visitors/:inmateId
 * @access Admin & Warden
 */
const logVisitor = async (req, res) => {
  try {
    // Extract visitor details from request body
    const {
      visitorName,
      relationshipToInmate,
      contactNumber,
      email,
      visitTimestamp,
      durationMinutes,
      purposeOfVisit,
      staffNotes,
    } = req.body;
    const { inmateId } = req.params;

    // **Validation Checks**
    if (!visitorName)
      return res.status(400).json({ message: "⚠ Visitor Name is required." });

    if (!relationshipToInmate)
      return res.status(400).json({ message: "⚠ Relationship is required." });

    if (!contactNumber || !/^\d{10,15}$/.test(contactNumber))
      return res
        .status(400)
        .json({ message: "⚠ Enter a valid contact number (10-15 digits)." });

    if (!email || !/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email))
      return res
        .status(400)
        .json({ message: "⚠ Enter a valid email address." });

    // **Ensure visit duration is a valid positive integer**
    const parsedVisitDate = new Date(visitTimestamp);
    if (isNaN(parsedVisitDate.getTime())) {
      return res
        .status(400)
        .json({ message: "⚠ Please select a valid visit date & time." });
    }

    // **Check if inmate exists before logging the visit**
    const parsedDuration = parseInt(durationMinutes, 10);
    if (isNaN(parsedDuration) || parsedDuration <= 0) {
      return res
        .status(400)
        .json({ message: "⚠ Enter a valid visit duration in minutes." });
    }

    if (!purposeOfVisit)
      return res
        .status(400)
        .json({ message: "⚠ Purpose of visit is required." });

    // Check if inmate exists before logging the visit
    const inmate = await Inmate.findById(inmateId);
    if (!inmate) {
      return res.status(404).json({ message: "⚠ Inmate not found." });
    }

    // **Prevent visit logging if inmate is not incarcerated**
    if (inmate.status !== "Incarcerated") {
      return res.status(400).json({
        message: "⚠ Visitor logging denied. This inmate is not incarcerated.",
      });
    }

    // Create the visitor record
    const visitor = await Visitor.create({
      inmate: inmateId,
      visitorName,
      relationshipToInmate,
      contactNumber,
      email,
      visitTimestamp: parsedVisitDate,
      durationMinutes: parsedDuration,
      purposeOfVisit,
      staffNotes,
    });

    // Log activity: Visitor logged
    await logRecentActivity("VISITOR_LOGGED");

    res.status(201).json({ message: "Visitor logged successfully!", visitor });
  } catch (error) {
    console.error("Error logging visitor:", error);
    res
      .status(500)
      .json({ message: "⚠ Server error. Please try again later." });
  }
};

/**
 * Get All Visitors for a Specific Inmate
 * --------------------------------------
 * - Retrieves all visitor logs for a given inmate.
 * - Ensures the inmate exists before querying.
 *
 * @route  GET /prisonsphere/visitors/:inmateId
 * @access Admin & Warden
 */
const getVisitorsByInmate = async (req, res) => {
  try {
    const { inmateId } = req.params;
    const { page = 1, limit = 5, startDate, endDate, search } = req.query;

    const skip = (page - 1) * limit;

    // Check if inmate exists
    const inmate = await Inmate.findById(inmateId);
    if (!inmate) {
      return res.status(404).json({ message: "Inmate not found" });
    }

    // Build query filters
    let filters = { inmate: inmateId };

    if (startDate && endDate) {
      filters.visitTimestamp = {
        $gte: new Date(startDate).setHours(0, 0, 0, 0),
        $lte: new Date(endDate).setHours(23, 59, 59, 999),
      };
    }

    // Apply search filter for visitor name or purpose
    if (search) {
      filters.$or = [
        { visitorName: { $regex: search, $options: "i" } },
        { purposeOfVisit: { $regex: search, $options: "i" } },
      ];
    }

    // Get total count
    const totalVisitors = await Visitor.countDocuments(filters);

    // Fetch visitors sorted by latest visit date
    const visitors = await Visitor.find(filters)
      .sort({ visitTimestamp: -1 }) // Sort newest visits first
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      visitors,
      totalVisitors,
      totalPages: Math.ceil(totalVisitors / limit),
    });
  } catch (error) {
    console.error("Error fetching visitors:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Get a Single Visitor's Details
 * ------------------------------
 * - Retrieves details of a specific visitor.
 * - Populates inmate information for context.
 *
 * @route  GET /prisonsphere/visitors/details/:visitorId
 * @access Admin & Warden
 */
const getVisitorById = async (req, res) => {
  try {
    const visitor = await Visitor.findById(req.params.visitorId).populate(
      "inmate",
      "firstName lastName inmateID"
    );

    if (!visitor) {
      return res.status(404).json({ message: "Visitor not found" });
    }

    res.status(200).json(visitor);
  } catch (error) {
    console.error("Error fetching visitor details:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Update a Visitor's Details
 * --------------------------
 * - Updates the visitor record.
 * - Logs the activity as "VISITOR_UPDATED".
 *
 * @route  PUT /prisonsphere/visitors/details/:visitorId
 * @access Warden Only
 */
const updateVisitor = async (req, res) => {
  try {
    const visitor = await Visitor.findByIdAndUpdate(
      req.params.visitorId,
      req.body,
      { new: true }
    );

    if (!visitor) {
      return res.status(404).json({ message: "Visitor not found" });
    }

    // Log activity: Visitor details updated
    await logRecentActivity("VISITOR_UPDATED");

    res
      .status(200)
      .json({ message: "Visitor details updated successfully", visitor });
  } catch (error) {
    console.error("Error updating visitor:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Export controller functions for use in routes
module.exports = {
  logVisitor,
  getVisitorsByInmate,
  getVisitorById,
  updateVisitor,
};
