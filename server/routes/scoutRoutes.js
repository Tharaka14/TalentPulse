const express = require("express");

const {
  searchAthletes,
  getAthleteProfile
} = require("../controllers/scoutController");

const authenticateToken =
  require("../middleware/authMiddleware");

const authorizeRoles =
  require("../middleware/roleMiddleware");

const router = express.Router();

// SEARCH / FILTER VERIFIED ATHLETES
router.get(
  "/athletes",
  authenticateToken,
  authorizeRoles("SCOUT"),
  searchAthletes
);

// VIEW ONE VERIFIED ATHLETE FULL PROFILE
router.get(
  "/athletes/:id",
  authenticateToken,
  authorizeRoles("SCOUT"),
  getAthleteProfile
);

module.exports = router;