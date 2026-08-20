const express = require("express");

const {
  getPendingVerifications,
  approveVerification,
  rejectVerification
} = require("../controllers/adminController");

const authenticateToken =
  require("../middleware/authMiddleware");

const authorizeRoles =
  require("../middleware/roleMiddleware");

const router = express.Router();

router.get(
  "/verifications/pending",
  authenticateToken,
  authorizeRoles("ADMIN"),
  getPendingVerifications
);

router.put(
  "/verifications/:documentId/approve",
  authenticateToken,
  authorizeRoles("ADMIN"),
  approveVerification
);

router.put(
  "/verifications/:documentId/reject",
  authenticateToken,
  authorizeRoles("ADMIN"),
  rejectVerification
);

module.exports = router;