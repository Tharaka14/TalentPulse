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

router.put(
  "/profile",
  authenticateToken,
  authorizeRoles("ATHLETE"),
  saveProfile
);

router.get(
  "/profile/me",
  authenticateToken,
  authorizeRoles("ATHLETE"),
  getMyProfile
);

module.exports = router;