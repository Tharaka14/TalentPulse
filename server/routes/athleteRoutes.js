const express = require("express");

const {
  saveProfile,
  getMyProfile,
  uploadProfilePicture,
  uploadVerificationDocument,
  getMyVerificationDocuments
} = require("../controllers/athleteController");

const authenticateToken =
  require("../middleware/authMiddleware");

const authorizeRoles =
  require("../middleware/roleMiddleware");

const upload =
  require("../middleware/uploadMiddleware");

const router = express.Router();


// CREATE / UPDATE ATHLETE PROFILE
router.put(
  "/profile",
  authenticateToken,
  authorizeRoles("ATHLETE"),
  saveProfile
);


// GET OWN PROFILE
router.get(
  "/profile/me",
  authenticateToken,
  authorizeRoles("ATHLETE"),
  getMyProfile
);


// UPLOAD PROFILE PICTURE
router.put(
  "/profile/picture",
  authenticateToken,
  authorizeRoles("ATHLETE"),
  upload.single("profile_picture"),
  uploadProfilePicture
);


// UPLOAD VERIFICATION DOCUMENT
router.post(
  "/verification-document",
  authenticateToken,
  authorizeRoles("ATHLETE"),
  upload.single("verification_document"),
  uploadVerificationDocument
);


// GET OWN VERIFICATION DOCUMENTS
router.get(
  "/verification-documents/me",
  authenticateToken,
  authorizeRoles("ATHLETE"),
  getMyVerificationDocuments
);


module.exports = router;