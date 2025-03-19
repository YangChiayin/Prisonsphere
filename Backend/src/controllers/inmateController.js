/**
 * @file inmateController.js
 * @description Manages CRUD operations for inmate records in the PrisonSphere system.
 * @module controllers/inmateController
 *
 * This module provides functionalities to:
 * - Register new inmates.
 * - Retrieve, search, and paginate inmate records.
 * - Update inmate details (including status updates).
 * - Implement soft deletion (marking an inmate as "Released").
 * - Generate sequential inmate IDs to maintain record integrity.
 *
 * @requires mongoose - ODM library for MongoDB.
 * @requires Inmate - Inmate model schema.
 * @requires logRecentActivity - Logs inmate-related activities.
 */

const axios = require("axios");
const PdfPrinter = require("pdfmake");
const path = require("path");
const mongoose = require("mongoose");
const Inmate = require("../models/Inmate");
const WorkProgramEnrollment = require("../models/WorkProgramEnrollment");
const BehaviorLog = require("../models/BehaviorLog");
const Parole = require("../models/Parole");
const Visitor = require("../models/Visitor");
const ActivityLog = require("../models/ActivityLog");
const {
  logRecentActivity,
} = require("../controllers/recentActivityLogController");

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
    const nextInmateID = await generateNextInmateID();

    // Assign profile image if uploaded
    const profileImage = req.file ? req.file.path : "";

    // Create and store the inmate record
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
    });
  } catch (error) {
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
    console.error("Error fetching next Inmate ID:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Retrieve All Inmates
 * --------------------
 * - Fetches all inmate records with optional search and pagination.
 *
 * @route  GET /prisonsphere/inmates
 * @access Admin & Warden
 */
const getAllInmates = async (req, res) => {
  try {
    let { page, limit, search } = req.query; // Get query parameters
    let query = {}; // Default empty query

    // If a search query exists, filter by Inmate ID or Full Name
    if (search) {
      query = {
        $or: [
          { inmateID: { $regex: search, $options: "i" } },
          { firstName: { $regex: search, $options: "i" } },
          { lastName: { $regex: search, $options: "i" } },
          {
            $expr: {
              $regexMatch: {
                input: { $concat: ["$firstName", " ", "$lastName"] },
                regex: search,
                options: "i",
              },
            },
          },
        ],
      };
    }

    // Check if pagination is requested
    let inmatesQuery = Inmate.find(query).sort({ createdAt: -1 });

    if (page && limit) {
      page = parseInt(page);
      limit = parseInt(limit);
      inmatesQuery = inmatesQuery.skip((page - 1) * limit).limit(limit);
    }

    const inmates = await inmatesQuery.lean(); // Fetch inmates
    const totalInmates = await Inmate.countDocuments(query); // Count matching inmates

    res.status(200).json({
      inmates,
      totalInmates,
      totalPages: limit ? Math.ceil(totalInmates / limit) : 1,
      currentPage: page || 1,
    });
  } catch (error) {
    console.error("Error fetching inmates:", error);
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
    console.error("Error searching inmate:", error);
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
    console.error("Error fetching inmate:", error);
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

    // Ensure only Wardens can edit inmate details**
    if (req.user.role !== "Warden") {
      return res.status(403).json({
        message: "You do not have permission to edit inmate details.",
      });
    }

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
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @function getInmateByIDReport
 * @description Fetches full inmate data for report generation, including related records.
 * @route GET /prisonsphere/inmates/report/:id
 * @access Private (Admin & Warden)
 */
const getInmateByIDReport = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch inmate details
    const inmate = await Inmate.findById(id).lean();

    if (!inmate) {
      return res.status(404).json({ message: "Inmate not found" });
    }

    // Fetch Work Program Enrollments separately
    const workPrograms = await WorkProgramEnrollment.find({ inmateId: id })
      .populate("workProgramId", "name startDate endDate performanceRating")
      .lean();

    // Fetch Behavior Logs separately
    const behaviorLogs = await BehaviorLog.find({ inmateId: id })
      .select("workEthic cooperation incidentReports socialSkills loggedAt")
      .lean();

    // Fetch Parole Records separately
    const paroleRecords = await Parole.find({ inmate: id })
      .select("applicationDate hearingDate status decisionNotes")
      .sort({ hearingDate: -1 })
      .limit(3)
      .lean();

    // Fetch Visitor Records separately
    const visitorRecords = await Visitor.find({ inmate: id })
      .select("_id")
      .lean();
    const totalVisits = visitorRecords.length;

    // Fetch Activity Logs separately
    const activityLogs = await ActivityLog.find({ inmateId: id })
      .select("activityType description logDate")
      .sort({ logDate: -1 })
      .limit(3)
      .lean();

    // Fetch Profile Image (Cloudinary URL is already stored in inmate.profileImage)
    const profileImageUrl = inmate.profileImage || "";

    // Compute rehabilitation score (0-100%)
    let workEthicAvg = 0,
      cooperationAvg = 0,
      incidentCount = 0;
    if (behaviorLogs.length) {
      workEthicAvg =
        behaviorLogs.reduce((acc, log) => acc + log.workEthic, 0) /
        behaviorLogs.length;
      cooperationAvg =
        behaviorLogs.reduce((acc, log) => acc + log.cooperation, 0) /
        behaviorLogs.length;
      incidentCount = behaviorLogs.reduce(
        (acc, log) => acc + log.incidentReports,
        0
      );
    }

    let maxPossibleScore = 10; // Max Score (5 for Work Ethic + 5 for Cooperation)
    let baseScore = ((workEthicAvg + cooperationAvg) / maxPossibleScore) * 100;
    let penalty = incidentCount * 5; // Deduct 5% per incident
    let rehabilitationScore = Math.max(0, baseScore - penalty);

    let status = "Needs More Rehabilitation";
    if (rehabilitationScore >= 80) status = "Highly Rehabilitated";
    else if (rehabilitationScore >= 60) status = "Moderately Rehabilitated";
    else if (rehabilitationScore >= 40) status = "Partially Rehabilitated";

    // Construct report response
    const reportData = {
      inmateID: inmate.inmateID,
      fullName: `${inmate.firstName} ${inmate.lastName}`,
      gender: inmate.gender,
      dateOfBirth: inmate.dateOfBirth,
      age:
        new Date().getFullYear() - new Date(inmate.dateOfBirth).getFullYear(),
      admissionDate: inmate.admissionDate,
      crimeDetails: inmate.crimeDetails,
      sentenceDuration: inmate.sentenceDuration,
      assignedCell: inmate.assignedCell,
      status: inmate.status,
      profileImageUrl,
      workPrograms: workPrograms,
      behaviorLogs: behaviorLogs,
      paroleRecords: paroleRecords,
      visitorCount: totalVisits,
      activityLogs: activityLogs,
      rehabilitationScore: rehabilitationScore.toFixed(2),
      evaluationStatus: status,
    };

    res.status(200).json(reportData);
  } catch (error) {
    console.error("Error fetching inmate report:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @function fetchImageAsBase64
 * @description Fetches an image from a remote URL and converts it to Base64 format
 * @param {string} imageUrl - The URL of the image (Cloudinary)
 * @returns {Promise<string>} - Base64 encoded image string
 */
const fetchImageAsBase64 = async (imageUrl) => {
  try {
    const response = await axios.get(imageUrl, {
      responseType: "arraybuffer", // Fetches image as binary data
    });
    const base64 = Buffer.from(response.data, "binary").toString("base64");
    const mimeType = response.headers["content-type"];
    return `data:${mimeType};base64,${base64}`;
  } catch (error) {
    console.error("Error fetching image:", error.message);
    return null; // Return null if image fetch fails
  }
};

//  Load Custom Fonts for Pdfmake
const fonts = {
  Roboto: {
    normal: path.join(__dirname, "../fonts/Roboto-Regular.ttf"),
    bold: path.join(__dirname, "../fonts/Roboto-Bold.ttf"),
  },
};

// Define the background watermark logo path
const backgroundLogo = path.resolve(__dirname, "../assets/logoBlue.png");

const printer = new PdfPrinter(fonts);

// Function to Generate Star Ratings with Unicode Characters
const generateStars = (rating, filledStarBase64, emptyStarBase64) => {
  const maxStars = 5;
  const starSize = 12; // Adjust size if needed

  return [
    ...Array(Math.round(rating))
      .fill(null)
      .map(() => ({
        image: filledStarBase64,
        width: starSize,
        margin: [2, 0, 2, 0],
      })),
    ...Array(maxStars - Math.round(rating))
      .fill(null)
      .map(() => ({
        image: emptyStarBase64,
        width: starSize,
        margin: [2, 0, 2, 0],
      })),
  ];
};

/**
 * @function getInmatePDFReport
 * @description Generates a PDF report using Pdfmake
 * @route GET /prisonsphere/inmates/report/:id/pdf
 * @access Private (Admin & Warden)
 */

const getInmatePDFReport = async (req, res) => {
  try {
    const { id, type } = req.params;

    // Fetch inmate details
    const inmate = await Inmate.findById(id).lean();
    if (!inmate) {
      return res.status(404).json({ message: "Inmate not found" });
    }

    // Fetch related data
    const workPrograms = await WorkProgramEnrollment.find({ inmateId: id })
      .populate("workProgramId", "name startDate endDate performanceRating")
      .lean();

    const behaviorLogs = await BehaviorLog.find({ inmateId: id })
      .select("workEthic cooperation socialSkills loggedAt")
      .lean();

    const paroleRecords = await Parole.find({ inmate: id })
      .select("applicationDate hearingDate status decisionNotes")
      .sort({ hearingDate: -1 })
      .limit(3)
      .lean();

    const visitorRecords = await Visitor.find({ inmate: id })
      .select("_id")
      .lean();
    const totalVisits = visitorRecords.length;

    const activityLogs = await ActivityLog.find({ inmateId: id })
      .select("activityType description logDate")
      .sort({ logDate: -1 })
      .limit(3)
      .lean();

    // Fetch Profile Image as Base64
    let profileImageBase64 = null;
    if (inmate.profileImage) {
      profileImageBase64 = await fetchImageAsBase64(inmate.profileImage);
    }

    //fetch  star images
    let filledStar64 = null;
    let emptyStar64 = null;

    const filledStar =
      "https://res.cloudinary.com/dhy3bommi/image/upload/v1742303907/filledStar_wxbcvs.png";
    const emptyStar =
      "https://res.cloudinary.com/dhy3bommi/image/upload/v1742303908/emptyStar_wxhlp5.png";

    if (filledStar) {
      filledStar64 = await fetchImageAsBase64(filledStar);
    }
    if (emptyStar) {
      emptyStar64 = await fetchImageAsBase64(emptyStar);
    }

    // Compute Rehabilitation Score
    let workEthicAvg = 0,
      cooperationAvg = 0,
      incidentCount = 0;
    if (behaviorLogs.length) {
      workEthicAvg =
        behaviorLogs.reduce((acc, log) => acc + log.workEthic, 0) /
        behaviorLogs.length;
      cooperationAvg =
        behaviorLogs.reduce((acc, log) => acc + log.cooperation, 0) /
        behaviorLogs.length;
      incidentCount = behaviorLogs.reduce(
        (acc, log) => acc + (log.incidentReports || 0),
        0
      );
    }

    let baseScore = ((workEthicAvg + cooperationAvg) / 10) * 100;
    let rehabilitationScore = Math.max(0, baseScore - incidentCount * 5);
    let status = "Needs More Rehabilitation";
    if (rehabilitationScore >= 80) status = "Highly Rehabilitated";
    else if (rehabilitationScore >= 60) status = "Moderately Rehabilitated";
    else if (rehabilitationScore >= 40) status = "Partially Rehabilitated";

    // Determine the title based on report type
    const reportTitle =
      type === "rehabilitation"
        ? "Inmate Rehabilitation Report"
        : "Inmate Information Report";

    // Document Content (Varies Based on Report Type)
    let docContent = [
      {
        text: reportTitle, // Add the title dynamically
        style: "title",
        alignment: "center",
        fontSize: 18,
        bold: true,
        margin: [0, 0, 0, 15], // Space below title
      },
      {
        image: backgroundLogo,
        width: 400,
        absolutePosition: { x: 100, y: 150 },
        opacity: 0.09,
      },
    ];

    // Common Header (Profile Image & Basic Info)
    docContent.push({
      columns: [
        profileImageBase64
          ? { image: profileImageBase64, width: 100, height: 100 }
          : {},
      ],
      margin: [0, 0, 0, 10],
    });

    // Common Header (Profile Image & Basic Info)
    docContent.push({
      table: {
        widths: [90, "*"], // Column widths: 100px for labels, remaining space for values
        body: [
          [
            { text: "Inmate ID:", bold: true, alignment: "left" },
            { text: inmate.inmateID, alignment: "left" },
          ],
          [
            { text: "Full Name:", bold: true, alignment: "left" },
            {
              text: `${inmate.firstName} ${inmate.lastName}`,
              alignment: "left",
            },
          ],
          [
            { text: "DOB:", bold: true, alignment: "left" },
            {
              text: `${formatDate(inmate.dateOfBirth)} (Age: ${
                new Date().getFullYear() -
                new Date(inmate.dateOfBirth).getFullYear()
              })`,
              alignment: "left",
            },
          ],
          [
            { text: "Status:", bold: true, alignment: "left" },
            { text: inmate.status, alignment: "left" },
          ],
        ],
      },
      layout: "noBorders", // Removes table borders for a cleaner look
      margin: [0, 5, 0, 10], // Adds spacing
    });

    if (type === "information") {
      docContent.push(
        { text: "Inmate Admission Information", style: "section" },
        {
          table: {
            widths: [140, "*"], // Ensures labels are aligned well
            body: [
              [
                { text: "Admission Date:", bold: true },
                { text: formatDate(inmate.admissionDate) },
              ],
              [{ text: "Crime:", bold: true }, { text: inmate.crimeDetails }],
              [
                { text: "Sentence Duration:", bold: true },
                { text: `${inmate.sentenceDuration} years` },
              ],
              [
                { text: "Assigned Cell:", bold: true },
                { text: inmate.assignedCell },
              ],
              [
                { text: "Total Visitors:", bold: true },
                { text: totalVisits.toString() },
              ],
            ],
          },
          layout: "noBorders",
          margin: [0, 5, 0, 15], // Spacing below this section
        }
      );
      // Work Program & Parole Record Side by Side
      docContent.push({
        columns: [
          {
            width: "50%",
            stack: [
              { text: "Work Program Details", style: "section" },
              workPrograms.length > 0
                ? {
                    table: {
                      widths: ["*", 70], // Two columns for work program name and status
                      body: [
                        [
                          { text: "Program", bold: true },
                          { text: "Status", bold: true },
                        ],
                        ...workPrograms.map((program) => [
                          { text: program.workProgramId.name },
                          { text: program.status },
                        ]),
                      ],
                    },
                    layout: "lightHorizontalLines",
                    margin: [0, 5, 10, 0],
                  }
                : { text: "No Work Programs Assigned" },
            ],
          },
          {
            width: "50%",
            stack: [
              { text: "Parole Record", style: "section" },
              paroleRecords.length > 0
                ? {
                    table: {
                      widths: ["*", 70], // Parole hearing date and status
                      body: [
                        [
                          { text: "Hearing Date", bold: true },
                          { text: "Decision", bold: true },
                        ],
                        ...paroleRecords.map((record) => [
                          { text: formatDate(record.hearingDate) },
                          { text: record.status },
                        ]),
                      ],
                    },
                    layout: "lightHorizontalLines",
                    margin: [10, 5, 0, 0],
                  }
                : { text: "No Parole Records" },
            ],
          },
        ],
        margin: [0, 10, 0, 20], // Space before the next section
      });
    } else if (type === "rehabilitation") {
      docContent.push(
        // Rehabilitation Status Section
        { text: "Rehabilitation Status Details", style: "section" },
        {
          columns: [
            // Work Programs Column
            {
              width: "50%",
              stack: [
                { text: "Work Programs", style: "section" },
                {
                  ul: workPrograms.map(
                    (program) =>
                      `${program.workProgramId.name} - ${program.status}`
                  ),
                },
              ],
            },
            // Activity Logs Column
            {
              width: "50%",
              stack: [
                { text: "Activity Logs", style: "section" },
                {
                  ul: activityLogs.map(
                    (log) =>
                      `${formatDate(log.logDate)} - ${log.activityType}: ${
                        log.description
                      }`
                  ),
                },
              ],
            },
          ],
          columnGap: 20, // Space between columns
          margin: [0, 10, 0, 20], // Adds spacing before the next section
        },

        // Behavior Logs (Full Width Below)
        { text: "Behavior Logs", style: "section", margin: [0, 15, 0, 5] },

        behaviorLogs.length > 0
          ? {
              stack: behaviorLogs.map((log, index) => ({
                margin: [0, index === 0 ? 0 : 10, 0, 5], // Adds spacing between each log entry
                stack: [
                  {
                    columns: [
                      {
                        text: "Work Ethic:",
                        width: "auto",
                        margin: [0, 2, 10, 2],
                      }, // Text with spacing
                      ...generateStars(
                        log.workEthic,
                        filledStar64,
                        emptyStar64
                      ),
                    ],
                  },

                  {
                    columns: [
                      {
                        text: "Cooperation:",
                        width: "auto",
                        margin: [0, 2, 10, 2],
                      },
                      ...generateStars(
                        log.cooperation,
                        filledStar64,
                        emptyStar64
                      ),
                    ],
                  },

                  {
                    columns: [
                      {
                        text: "Social Skills:",
                        width: "auto",
                        margin: [0, 2, 10, 2],
                      },
                      ...generateStars(
                        log.socialSkills,
                        filledStar64,
                        emptyStar64
                      ),
                    ],
                  },

                  {
                    text: `Logged At: ${formatDate(log.loggedAt)}`,
                    margin: [0, 2],
                  },
                ],
              })),
            }
          : {
              text: "No Behavior Logs Available",
              margin: [0, 5],
            },

        // Rehabilitation Score & Evaluation Status (Centered at Bottom)
        {
          text: `Rehabilitation Score: ${rehabilitationScore.toFixed(2)}%`,
          style: "scoreText",
          margin: [0, 10, 0, 5],
        },
        {
          text: `Evaluation Status: ${status}`,
          style: "statusText",
        }
      );
    }

    // Signature Section at the Bottom
    docContent.push(
      { text: "\n\n" },
      {
        columns: [
          {
            text: "____________________\nWarden Signature",
            alignment: "center",
          },
          {
            text: "____________________\nAuthorized Signature",
            alignment: "center",
          },
        ],
        margin: [0, 50, 0, 0],
      }
    );

    // Definition of `docDefinition`
    const docDefinition = {
      content: docContent,
      styles: {
        section: { bold: true, margin: [0, 10, 0, 5] },
        stars: { fontSize: 14, bold: true }, // Makes stars more visible
      },
    };

    // Generate PDF
    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    const chunks = [];

    // Collect PDF Data
    pdfDoc.on("data", (chunk) => chunks.push(chunk));

    pdfDoc.on("end", () => {
      const pdfBuffer = Buffer.concat(chunks);
      res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="inmate_report_${inmate.inmateID}.pdf"`,
        "Content-Length": pdfBuffer.length,
      });
      res.send(pdfBuffer);
    });

    pdfDoc.end();
  } catch (error) {
    console.error("Error generating PDF report:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Helper Function: Format Date as DD-MM-YYYY
const formatDate = (dateString) => {
  if (!dateString) return "N/A"; // Handle missing dates gracefully
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB"); // UK format (DD/MM/YYYY)
};

// Export controller functions for use in routes
module.exports = {
  registerInmate,
  getNextInmateID,
  getAllInmates,
  searchInmate,
  getInmateById,
  updateInmate,
  getInmateByIDReport,
  getInmatePDFReport,
};
