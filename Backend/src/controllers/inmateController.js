const mongoose = require("mongoose");
const Inmate = require("../models/Inmate");
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
    // Validation Check
    if (!req.body.firstName)
      return res.status(400).json({ message: "Please enter the first name." });
    if (!req.body.lastName)
      return res.status(400).json({ message: "Please enter the last name." });
    if (!req.body.dateOfBirth)
      return res
        .status(400)
        .json({ message: "Please enter a valid date of birth." });
    if (!["Male", "Female", "Other"].includes(req.body.gender))
      return res.status(400).json({ message: "Please select a gender." });
    if (!req.body.admissionDate)
      return res
        .status(400)
        .json({ message: "Please enter a valid admission date." });
    if (!req.body.sentenceDuration || isNaN(req.body.sentenceDuration))
      return res
        .status(400)
        .json({ message: "Please enter the sentence duration in months." });
    if (!req.body.crimeDetails)
      return res.status(400).json({ message: "Please provide crime details." });

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
      sentenceDuration,
      crimeDetails,
      assignedCell,
    } = req.body;

    // Generate the next available Inmate ID
    const nextInmateID = await generateNextInmateID();

    // Save image URL from Cloudinary if uploaded
    const profileImage = req.file ? req.file.path : "";

    // Create and save the inmate record
    const inmate = await Inmate.create({
      firstName,
      lastName,
      inmateID: nextInmateID,
      dateOfBirth,
      gender,
      admissionDate,
      sentenceDuration,
      crimeDetails,
      assignedCell,
      profileImage,
    });

    // Log activity: Inmate registered
    await logRecentActivity("INMATE_ADDED");

    res.status(201).json({
      message: "Inmate registered successfully",
      inmate,
      nextInmateID,
      calculatedReleaseDate: inmate.calculatedReleaseDate,
    });
  } catch (error) {
    console.error("❌ Error registering inmate:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Get the Next Available Inmate ID
 * --------------------------------
 * - Finds the last inmate and determines the next ID in the sequence.
 *
 * @route  GET /prisonsphere/inmates/next-id
 * @access Admin & Warden
 */
const generateNextInmateID = async () => {
  const lastInmate = await Inmate.findOne().sort({ createdAt: -1 });

  let nextInmateID = "INM001";
  if (lastInmate && lastInmate.inmateID) {
    const lastIDNumber = parseInt(lastInmate.inmateID.replace("INM", ""), 10);
    nextInmateID = `INM${String(lastIDNumber + 1).padStart(3, "0")}`;
  }

  // Ensure unique ID by checking for duplicates before returning
  const existingInmate = await Inmate.findOne({ inmateID: nextInmateID });
  if (existingInmate) {
    return generateNextInmateID(); // Retry generating a unique ID
  }

  return nextInmateID;
};

const getNextInmateID = async (req, res) => {
  try {
    const nextInmateID = await generateNextInmateID();
    res.status(200).json({ nextInmateID });
  } catch (error) {
    console.error("❌ Error fetching next Inmate ID:", error);
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
    let { page = 1, limit = 5 } = req.query; // Default limit changed to 5
    page = parseInt(page);
    limit = parseInt(limit);

    const totalInmates = await Inmate.countDocuments(); // Total count
    const inmates = await Inmate.find()
      .sort({ createdAt: -1 }) // Sort newest inmates first
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    res.status(200).json({
      inmates,
      totalInmates,
      totalPages: Math.ceil(totalInmates / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error("❌ Error fetching inmates:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Search Inmate
 * ----------------------
 * - Searches for an inmate by Inmate ID or Full Name.
 *
 * @route  GET /prisonsphere/inmates/search?query=value
 * @access Admin & Warden
 */
const searchInmate = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ message: "Search query is required." });
    }

    // Search inmates based on ID or Full Name (case-insensitive)
    const inmates = await Inmate.find({
      $or: [
        { inmateID: { $regex: query, $options: "i" } },
        { firstName: { $regex: query, $options: "i" } },
        { lastName: { $regex: query, $options: "i" } },
        {
          $expr: {
            $regexMatch: {
              input: { $concat: ["$firstName", " ", "$lastName"] },
              regex: query,
              options: "i",
            },
          },
        },
      ],
    }).lean();

    if (!inmates.length) {
      return res.status(404).json({ message: "No inmates found." });
    }

    res.status(200).json(inmates);
  } catch (error) {
    console.error("❌ Error searching inmate:", error);
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
 * - Logs the activity as "INMATE_UPDATED".
 *
 * @route  PUT /prisonsphere/inmates/:id
 * @access Warden Only
 */
const updateInmate = async (req, res) => {
  try {
    const { status } = req.body; // Extract status if provided
    const behaviorReports = req.body.behaviorReports || [];
    let updatedData = { ...req.body };

    // Ensure correct date formatting
    if (req.body.dateOfBirth) {
      updatedData.dateOfBirth = new Date(req.body.dateOfBirth);
    }
    if (req.body.admissionDate) {
      updatedData.admissionDate = new Date(req.body.admissionDate);
    }

    // Handle profile image update
    if (req.file) {
      updatedData.profileImage = req.file.path;
    }

    // behaviorReports` Issue**
    if (behaviorReports && Array.isArray(behaviorReports)) {
      updatedData.behaviorReports = behaviorReports.filter(
        (report) => report && report.length === 24 // Only include valid ObjectIds
      );
    } else {
      updatedData.behaviorReports = [];
    }

    // Validate the status update (if present)
    if (status && !["Incarcerated", "Released"].includes(status)) {
      return res.status(400).json({ message: "Invalid status provided" });
    }

    // Update inmate details
    const inmate = await Inmate.findByIdAndUpdate(req.params.id, updatedData, {
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
    const inmate = await Inmate.findById(req.params.id);
    if (!inmate) {
      return res.status(404).json({ message: "Inmate not found" });
    }

    inmate.status = "Released"; // Change status instead of deleting for soft delete
    await inmate.save();

    await logRecentActivity("INMATE_RELEASED");

    res.status(200).json({ message: "Inmate marked as released", inmate });
  } catch (error) {
    console.error("❌ Error updating inmate status:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Export controller functions for use in routes
module.exports = {
  registerInmate,
  getNextInmateID,
  getAllInmates,
  searchInmate,
  getInmateById,
  updateInmate,
  deleteInmate,
};
