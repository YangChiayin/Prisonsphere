const express = require("express");
const {
  logVisitor,
  getVisitorsByInmate,
  getVisitorById,
  updateVisitor,
  deleteVisitor,
} = require("../controllers/visitorController");
const { protect, isWarden } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/:inmateId", protect, logVisitor);
router.get("/:inmateId", protect, getVisitorsByInmate);
router.get("/details/:visitorId", protect, getVisitorById);
router.put("/details/:visitorId", protect, isWarden, updateVisitor);
router.delete("/details/:visitorId", protect, isWarden, deleteVisitor);

module.exports = router;
