const express = require("express");

const {
  addMatchStat,
  getMyMatchStats,
  deleteMatchStat
} = require("../controllers/matchStatsController");

const authenticateToken =
  require("../middleware/authMiddleware");

const authorizeRoles =
  require("../middleware/roleMiddleware");

const router = express.Router();

// ADD MATCH STAT
router.post(
  "/",
  authenticateToken,
  authorizeRoles("ATHLETE"),
  addMatchStat
);

// GET OWN MATCH STATS
router.get(
  "/me",
  authenticateToken,
  authorizeRoles("ATHLETE"),
  getMyMatchStats
);

// DELETE OWN MATCH STAT
router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("ATHLETE"),
  deleteMatchStat
);

module.exports = router;