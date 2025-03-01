const mongoose = require("mongoose");
const Inmate = require("../models/Inmate");
const Parole = require("../models/Parole");
const {
  logRecentActivity,
} = require("../controllers/recentActivityLogController"); // Import logging function

/**
 * Register a New Inmate
 * ---------------------
 * - Adds a new inmate to the system.
 * - Ensures inmate ID is unique.
 * - Logs the activity as "INMATE_ADDED".
 *
 * @route  POST /prisonsphere/inmates
 * @access Warden Only
 */
const registerInmate = async (req, res) => {
  try {
    // console.log("DEBUG: Register Inmate Request from User", req.user);

    // Check if user is authorized to register an inmate
    if (req.user.role !== "warden") {
      return res.status(403).json({ message: "Access denied" });
    }

    // Extract inmate details from request body
    const {
      firstName,
      lastName,
      dateOfBirth,
      gender,
      admissionDate,
      crimeDetails,
      assignedCell,
    } = req.body;

    // Get the last inmate entry to determine the next ID
    const lastInmate = await Inmate.findOne().sort({ createdAt: -1 });

    let nextInmateID = "INM001"; // Default for the first record

    if (lastInmate && lastInmate.inmateID) {
      // Extract numeric part and increment
      const lastIDNumber = parseInt(lastInmate.inmateID.replace("INM", ""), 10);
      nextInmateID = `INM${String(lastIDNumber + 1).padStart(3, "0")}`;
    }

    // Save image URL from Cloudinary if uploaded
    const profileImage = req.file ? req.file.path : "";

    // Create and save the inmate record
    const inmate = await Inmate.create({
      firstName,
      lastName,
      inmateID: nextInmateID, // Automatically generated ID
      dateOfBirth,
      gender,
      admissionDate,
      crimeDetails,
      assignedCell,
      profileImage,
    });

    // Log activity: Inmate registered
    await logRecentActivity("INMATE_ADDED");

    res
      .status(201)
      .json({
        message: "Inmate registered successfully",
        inmate,
        nextInmateID,
      });
  } catch (error) {
    console.error("❌ Error registering inmate:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Get All Inmates
 * ---------------
 * - Retrieves all inmates in the system.
 * - Accessible by Admin and Warden.
 *
 * @route  GET /prisonsphere/inmates
 * @access Admin & Warden
 */
const getAllInmates = async (req, res) => {
  try {
    const inmates = await Inmate.find();
    res.status(200).json(inmates);
  } catch (error) {
    console.error("❌ Error fetching inmates:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Get a Single Inmate by ID
 * -------------------------
 * - Retrieves details of a specific inmate.
 * - Validates the inmate ID format before querying.
 *
 * @route  GET /prisonsphere/inmates/:id
 * @access Admin & Warden
 */
const getInmateById = async (req, res) => {
  try {
    // Validate that ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid inmate ID format" });
    }

    const inmate = await Inmate.findById(req.params.id);
    if (!inmate) {
      return res.status(404).json({ message: "Inmate not found" });
    }

    res.status(200).json(inmate);
  } catch (error) {
    console.error("❌ Error fetching inmate:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Update Inmate Details (Including Status)
 * ----------------------------------------
 * - Updates an inmate's details.
 * - Ensures valid status updates (e.g., "Parole" requires an approved parole request).
 * - Logs the activity as "INMATE_UPDATED".
 *
 * @route  PUT /prisonsphere/inmates/:id
 * @access Warden Only
 */
const updateInmate = async (req, res) => {
  try {
    const { status } = req.body; // Extract status if provided

    // Validate the status update (if present)
    if (status && !["Incarcerated", "Released", "Parole"].includes(status)) {
      return res.status(400).json({ message: "Invalid status provided" });
    }

    // If setting status to "Parole", ensure a parole request exists
    if (status === "Parole") {
      const existingParole = await Parole.findOne({ inmate: req.params.id });

      if (!existingParole) {
        return res.status(400).json({
          message:
            "No parole request found. A parole request must be submitted first.",
        });
      }

      // Prevent parole status update if the last request was denied
      if (existingParole.status === "Denied") {
        return res.status(400).json({
          message:
            "Previous parole request was denied. A new request must be submitted first.",
        });
      }

      // If parole was already approved, prevent redundant update
      if (existingParole.status === "Approved") {
        return res.status(200).json({
          message: "Inmate is already on parole. No changes made.",
        });
      }
    }

    // Update inmate details
    const inmate = await Inmate.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!inmate) {
      return res.status(404).json({ message: "Inmate not found" });
    }

    // Log activity: Inmate details updated
    await logRecentActivity("INMATE_UPDATED");

    res.status(200).json({ message: "Inmate updated successfully", inmate });
  } catch (error) {
    console.error("❌ Error updating inmate:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Delete an Inmate
 * ----------------
 * - Deletes an inmate record from the system.
 * - Ensures the inmate exists before deletion.
 * - Logs the activity as "INMATE_DELETED".
 *
 * @route  DELETE /prisonsphere/inmates/:id
 * @access Warden Only
 */
const deleteInmate = async (req, res) => {
  try {
    const inmate = await Inmate.findByIdAndDelete(req.params.id);
    if (!inmate) {
      return res.status(404).json({ message: "Inmate not found" });
    }

    // Log activity: Inmate deleted
    await logRecentActivity("INMATE_DELETED");

    res.status(200).json({ message: "Inmate deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting inmate:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Export controller functions for use in routes
module.exports = {
  registerInmate,
  getAllInmates,
  getInmateById,
  updateInmate,
  deleteInmate,
};
