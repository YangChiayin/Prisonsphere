const WorkProgram = require("../models/WorkProgram");
const WorkProgramEnrollment = require("../models/WorkProgramEnrollment");
const Inmate = require("../models/Inmate");
const {
  logRecentActivity,
} = require("../controllers/recentActivityLogController"); // Import logging function

/**
 * Fetch All Work Programs
 * -----------------------
 * - Retrieves all available work programs.
 * - Used for dropdown selection when enrolling inmates.
 *
 * @route  GET /prisonsphere/work-programs
 * @access Admin & Warden
 */
const getWorkPrograms = async (req, res) => {
  try {
    const programs = await WorkProgram.find();
    res.status(200).json(programs);
  } catch (error) {
    console.error("❌ Error fetching work programs:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Enroll an Inmate in a Work Program
 * ----------------------------------
 * - Enrolls an inmate in a work program.
 * - Ensures both inmate and work program exist before enrollment.
 * - Logs the activity as "WORK_PROGRAM_ENROLLED".
 *
 * @route  POST /prisonsphere/work-programs/enroll
 * @access Admin & Warden
 */
const enrollInWorkProgram = async (req, res) => {
  try {
    // Extract enrollment details from request body
    const {
      inmate,
      workProgram,
      startDate,
      expectedCompletionDate,
      performanceRating,
    } = req.body;

    // Validate that both the inmate and work program exist
    const existingInmate = await Inmate.findById(inmate);
    const existingProgram = await WorkProgram.findById(workProgram);

    if (!existingInmate || !existingProgram) {
      return res
        .status(404)
        .json({ message: "Inmate or Work Program not found" });
    }

    // Create enrollment record
    const enrollment = await WorkProgramEnrollment.create({
      inmate,
      workProgram,
      startDate,
      expectedCompletionDate,
      performanceRating,
    });

    // Log activity: Inmate enrolled in work program
    await logRecentActivity("WORK_PROGRAM_ENROLLED");

    res.status(201).json({ message: "Enrollment successful", enrollment });
  } catch (error) {
    console.error("❌ Error enrolling in work program:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Fetch All Work Program Enrollments
 * ----------------------------------
 * - Retrieves all enrollments and populates related inmate and work program details.
 *
 * @route  GET /prisonsphere/work-programs/enrollments
 * @access Admin & Warden
 */
const getEnrollments = async (req, res) => {
  try {
    // Fetch all enrollments and populate inmate & program details
    const enrollments = await WorkProgramEnrollment.find()
      .populate("inmate", "firstName lastName inmateID")
      .populate("workProgram", "name");

    res.status(200).json(enrollments);
  } catch (error) {
    console.error("❌ Error fetching enrollments:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Export controller functions for use in routes
module.exports = { getWorkPrograms, enrollInWorkProgram, getEnrollments };
