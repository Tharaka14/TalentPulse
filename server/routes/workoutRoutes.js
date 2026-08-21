const express = require("express");

const {
  addWorkout,
  getMyWorkouts,
  deleteWorkout
} = require("../controllers/workoutController");

const authenticateToken =
  require("../middleware/authMiddleware");

const authorizeRoles =
  require("../middleware/roleMiddleware");

const router = express.Router();

// ADD WORKOUT
router.post(
  "/",
  authenticateToken,
  authorizeRoles("ATHLETE"),
  addWorkout
);

// GET OWN WORKOUTS
router.get(
  "/me",
  authenticateToken,
  authorizeRoles("ATHLETE"),
  getMyWorkouts
);

// DELETE OWN WORKOUT
router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("ATHLETE"),
  deleteWorkout
);

module.exports = router;