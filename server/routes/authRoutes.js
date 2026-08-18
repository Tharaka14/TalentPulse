const express = require("express");

const {
  register,
  login
} = require("../controllers/authController");

const authenticateToken =
  require("../middleware/authMiddleware");

const authorizeRoles =
  require("../middleware/roleMiddleware");

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);

// Any logged-in user
router.get(
  "/me",
  authenticateToken,
  (req, res) => {
    res.json({
      success: true,
      message: "Protected route accessed successfully",
      user: req.user
    });
  }
);

// Athlete only
router.get(
  "/athlete-only",
  authenticateToken,
  authorizeRoles("ATHLETE"),
  (req, res) => {
    res.json({
      success: true,
      message: "Athlete access granted"
    });
  }
);

// Scout only
router.get(
  "/scout-only",
  authenticateToken,
  authorizeRoles("SCOUT"),
  (req, res) => {
    res.json({
      success: true,
      message: "Scout access granted"
    });
  }
);

// Admin only
router.get(
  "/admin-only",
  authenticateToken,
  authorizeRoles("ADMIN"),
  (req, res) => {
    res.json({
      success: true,
      message: "Admin access granted"
    });
  }
);

module.exports = router;