const express = require("express");

const {
  saveProfile,
  getMyProfile
} = require("../controllers/athleteController");

const authenticateToken =
  require("../middleware/authMiddleware");

const authorizeRoles =
  require("../middleware/roleMiddleware");

const router = express.Router();

// Athlete creates or updates own profile
router.put(
  "/profile",
  authenticateToken,
  authorizeRoles("ATHLETE"),
  saveProfile
);

// Athlete views own profile
router.get(
  "/profile/me",
  authenticateToken,
  authorizeRoles("ATHLETE"),
  getMyProfile
);

module.exports = router;