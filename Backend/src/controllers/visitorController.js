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
      visitDate,
      purposeOfVisit,
      staffNotes,
    } = req.body;
    const { inmateId } = req.params;

    // Check if the inmate exists before logging a visitor
    const inmate = await Inmate.findById(inmateId);
    if (!inmate) {
      return res.status(404).json({ message: "Inmate not found" });
    }

    // Create the visitor record
    const visitor = await Visitor.create({
      inmate: inmateId,
      visitorName,
      relationshipToInmate,
      visitDate,
      purposeOfVisit,
      staffNotes,
    });

    // Log activity: Visitor logged
    await logRecentActivity("VISITOR_LOGGED");

    res.status(201).json({ message: "Visitor logged successfully", visitor });
  } catch (error) {
    console.error("❌ Error logging visitor:", error);
    res.status(500).json({ message: "Server error", error: error.message });
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

    // Check if the inmate exists before fetching visitors
    const inmate = await Inmate.findById(inmateId);
    if (!inmate) {
      return res.status(404).json({ message: "Inmate not found" });
    }

    // Fetch visitor logs for the specified inmate
    const visitors = await Visitor.find({ inmate: inmateId });

    res.status(200).json(visitors);
  } catch (error) {
    console.error("❌ Error fetching visitors:", error);
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
    console.error("❌ Error fetching visitor details:", error);
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
    console.error("❌ Error updating visitor:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Delete a Visitor Record
 * -----------------------
 * - Deletes a visitor entry from the system.
 * - Ensures only Wardens can delete visitor records.
 * - Logs the activity as "VISITOR_DELETED".
 *
 * @route  DELETE /prisonsphere/visitors/details/:visitorId
 * @access Warden Only
 */
const deleteVisitor = async (req, res) => {
  try {
    // Ensure only a warden can delete a visitor record
    if (req.user.role !== "warden") {
      return res.status(403).json({ message: "Access denied" });
    }

    const visitor = await Visitor.findByIdAndDelete(req.params.visitorId);
    if (!visitor) {
      return res.status(404).json({ message: "Visitor not found" });
    }

    // Log activity: Visitor deleted
    await logRecentActivity("VISITOR_DELETED");

    res.status(200).json({ message: "Visitor record deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting visitor:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Export controller functions for use in routes
module.exports = {
  logVisitor,
  getVisitorsByInmate,
  getVisitorById,
  updateVisitor,
  deleteVisitor,
};
