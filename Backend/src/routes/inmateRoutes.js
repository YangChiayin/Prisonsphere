const express = require("express");
const {
  registerInmate,
  getNextInmateID,
  getAllInmates,
  searchInmate,
  getInmateById,
  updateInmate,
  deleteInmate,
} = require("../controllers/inmateController");
const { protect, isWarden } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware"); // Import upload middleware

const router = express.Router();

router.post(
  "/",
  protect,
  isWarden,
  upload.single("profileImage"),
  registerInmate
);
router.get("/next-id", protect, getNextInmateID);
router.get("/", protect, getAllInmates);
router.get("/search", protect, searchInmate);
router.get("/:id", protect, getInmateById);
router.put(
  "/:id",
  protect,
  isWarden,
  upload.single("profileImage"),
  updateInmate
);
router.delete("/:id", protect, isWarden, deleteInmate);

module.exports = router;
