const Parole = require("../models/Parole");
const Inmate = require("../models/Inmate");
const {
  logRecentActivity,
} = require("../controllers/recentActivityLogController"); //Import logging Function

// @desc   Submit Parole Application
// @route  POST /prisonsphere/paroles
// @access Warden Only
const submitParoleApplication = async (req, res) => {
  try {
    const { inmate, hearingDate } = req.body;

    const existingInmate = await Inmate.findById(inmate);
    if (!existingInmate)
      return res.status(404).json({ message: "Inmate not found" });

    const parole = await Parole.create({
      inmate,
      hearingDate,
    });

    // Log activity: Parole application submitted
    await logRecentActivity("PAROLE_SUBMITTED");

    res
      .status(201)
      .json({ message: "Parole application submitted successfully", parole });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc   Get All Parole Applications
// @route  GET /prisonsphere/paroles
// @access Admin & Warden
const getAllParoleApplications = async (req, res) => {
  try {
    const paroles = await Parole.find().populate(
      "inmate",
      "firstName lastName inmateID"
    );
    res.status(200).json(paroles);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc   Update Parole Status (Approve/Deny)
// @route  PUT /prisonsphere/paroles/:id
// @access Warden Only
const updateParoleStatus = async (req, res) => {
  try {
    const { status, decisionNotes } = req.body;

    // Validate status input
    if (!["Pending", "Approved", "Denied"].includes(status)) {
      return res
        .status(400)
        .json({ message: "Invalid parole status provided" });
    }

    // Find the parole request
    const parole = await Parole.findById(req.params.id);
    if (!parole) {
      return res.status(404).json({ message: "Parole application not found" });
    }

    // Update parole status
    parole.status = status;
    parole.decisionNotes = decisionNotes;
    await parole.save();

    // If parole is approved, update the inmate's status to "Parole"
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

      //  Log activity: Parole approved
      await logRecentActivity("PAROLE_APPROVED");
    } else if (status === "Denied") {
      //  Log activity: Parole denied
      await logRecentActivity("PAROLE_DENIED");
    }

    res
      .status(200)
      .json({ message: "Parole status updated successfully", parole });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc   Filter Parole Hearings by Date
// @route  GET /prisonsphere/paroles/filter
// @access Admin & Warden
const filterParolesByDate = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const paroles = await Parole.find({
      hearingDate: { $gte: new Date(startDate), $lte: new Date(endDate) },
    }).populate("inmate", "firstName lastName inmateID");

    res.status(200).json(paroles);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  submitParoleApplication,
  getAllParoleApplications,
  updateParoleStatus,
  filterParolesByDate,
};
