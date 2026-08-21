const express = require("express");

const {
  searchAthletes,
  getAthleteProfile,
  addToShortlist,
  getMyShortlist,
  removeFromShortlist
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


// ADD ATHLETE TO SHORTLIST
router.post(
  "/shortlist/:athleteId",
  authenticateToken,
  authorizeRoles("SCOUT"),
  addToShortlist
);


// VIEW MY SHORTLIST
router.get(
  "/shortlist",
  authenticateToken,
  authorizeRoles("SCOUT"),
  getMyShortlist
);


// REMOVE ATHLETE FROM SHORTLIST
router.delete(
  "/shortlist/:athleteId",
  authenticateToken,
  authorizeRoles("SCOUT"),
  removeFromShortlist
);


module.exports = router;