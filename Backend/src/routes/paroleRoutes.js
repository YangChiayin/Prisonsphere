const express = require("express");
const {
  submitParoleApplication,
  getAllParoleApplications,
  getParoleHistoryByInmate,
  updateParoleStatus,
  filterParolesByDate,
} = require("../controllers/paroleController");

const { protect, isWarden } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, isWarden, submitParoleApplication);
router.get("/", protect, getAllParoleApplications);
router.get("/inmate/:inmateId", protect, getParoleHistoryByInmate);
router.put("/:id", protect, isWarden, updateParoleStatus);
router.get("/filter", protect, filterParolesByDate);

module.exports = router;
