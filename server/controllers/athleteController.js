const db = require("../config/db");


// =====================================================
// CREATE OR UPDATE ATHLETE PROFILE
// =====================================================
const saveProfile = async (req, res) => {
  try {
    const athleteId = req.user.id;

    const {
      sport,
      district,
      date_of_birth,
      gender,
      playing_role,
      height_cm,
      weight_kg,
      bio,
      phone
    } = req.body;

    if (!sport) {
      return res.status(400).json({
        success: false,
        message: "Sport is required"
      });
    }

    if (!["CRICKET", "FOOTBALL"].includes(sport)) {
      return res.status(400).json({
        success: false,
        message: "Sport must be CRICKET or FOOTBALL"
      });
    }

    await db.query(
      `
      INSERT INTO athlete_profiles
      (
        user_id,
        sport,
        district,
        date_of_birth,
        gender,
        playing_role,
        height_cm,
        weight_kg,
        bio,
        phone
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)

      ON DUPLICATE KEY UPDATE
        sport = VALUES(sport),
        district = VALUES(district),
        date_of_birth = VALUES(date_of_birth),
        gender = VALUES(gender),
        playing_role = VALUES(playing_role),
        height_cm = VALUES(height_cm),
        weight_kg = VALUES(weight_kg),
        bio = VALUES(bio),
        phone = VALUES(phone)
      `,
      [
        athleteId,
        sport,
        district || null,
        date_of_birth || null,
        gender || null,
        playing_role || null,
        height_cm || null,
        weight_kg || null,
        bio || null,
        phone || null
      ]
    );

    return res.status(200).json({
      success: true,
      message: "Athlete profile saved successfully"
    });

  } catch (error) {
    console.error("SAVE PROFILE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while saving athlete profile"
    });
  }
};


// =====================================================
// GET OWN ATHLETE PROFILE
// =====================================================
const getMyProfile = async (req, res) => {
  try {
    const athleteId = req.user.id;

    const [rows] = await db.query(
      `
      SELECT
        u.id,
        u.full_name,
        u.email,
        u.role,
        u.status,
        ap.sport,
        ap.district,
        ap.date_of_birth,
        ap.gender,
        ap.playing_role,
        ap.height_cm,
        ap.weight_kg,
        ap.bio,
        ap.profile_picture,
        ap.phone
      FROM users u

      LEFT JOIN athlete_profiles ap
        ON u.id = ap.user_id

      WHERE u.id = ?
      `,
      [athleteId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Athlete not found"
      });
    }

    return res.status(200).json({
      success: true,
      profile: rows[0]
    });

  } catch (error) {
    console.error("GET PROFILE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while retrieving profile"
    });
  }
};


// =====================================================
// UPLOAD PROFILE PICTURE
// =====================================================
const uploadProfilePicture = async (req, res) => {
  try {
    const athleteId = req.user.id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Profile picture is required"
      });
    }

    const filePath =
      `/uploads/profiles/${req.file.filename}`;

    const [result] = await db.query(
      `
      UPDATE athlete_profiles
      SET profile_picture = ?
      WHERE user_id = ?
      `,
      [filePath, athleteId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Create your athlete profile first"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile picture uploaded successfully",
      profile_picture: filePath
    });

  } catch (error) {
    console.error(
      "PROFILE PICTURE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to upload profile picture"
    });
  }
};


// =====================================================
// UPLOAD VERIFICATION DOCUMENT
// =====================================================
const uploadVerificationDocument = async (req, res) => {
  try {
    const athleteId = req.user.id;

    const { document_type } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Verification document is required"
      });
    }

    const filePath =
      `/uploads/verifications/${req.file.filename}`;

    const [result] = await db.query(
      `
      INSERT INTO verification_documents
      (
        athlete_id,
        document_type,
        file_path,
        review_status
      )
      VALUES (?, ?, ?, 'PENDING')
      `,
      [
        athleteId,
        document_type || "Other",
        filePath
      ]
    );

    return res.status(201).json({
      success: true,
      message:
        "Verification document uploaded successfully",

      document: {
        id: result.insertId,
        document_type:
          document_type || "Other",
        file_path: filePath,
        review_status: "PENDING"
      }
    });

  } catch (error) {
    console.error(
      "VERIFICATION UPLOAD ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to upload verification document"
    });
  }
};


// =====================================================
// GET MY VERIFICATION DOCUMENTS
// =====================================================
const getMyVerificationDocuments =
  async (req, res) => {

    try {
      const athleteId = req.user.id;

      const [documents] = await db.query(
        `
        SELECT
          id,
          document_type,
          file_path,
          review_status,
          admin_note,
          uploaded_at
        FROM verification_documents
        WHERE athlete_id = ?
        ORDER BY uploaded_at DESC
        `,
        [athleteId]
      );

      return res.status(200).json({
        success: true,
        documents
      });

    } catch (error) {
      console.error(
        "GET DOCUMENTS ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to retrieve verification documents"
      });
    }
  };


// =====================================================
// EXPORT FUNCTIONS
// =====================================================
module.exports = {
  saveProfile,
  getMyProfile,
  uploadProfilePicture,
  uploadVerificationDocument,
  getMyVerificationDocuments
};