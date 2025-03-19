const WorkProgram = require("../models/WorkProgram");

/**
 * Fetch All Work Programs
 * -----------------------
 * - Retrieves all available work programs.
 *
 * @route   GET /prisonsphere/work-programs
 * @access  Private (Admin & Warden)
 */
const getWorkPrograms = async (req, res) => {
  try {
    const programs = await WorkProgram.find();
    res.status(200).json(programs);
  } catch (error) {
    console.error("Error fetching work programs:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { getWorkPrograms };
