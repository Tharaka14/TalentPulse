const db = require("../config/db");

// CREATE OR UPDATE ATHLETE PROFILE
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


// GET OWN PROFILE
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

module.exports = {
  saveProfile,
  getMyProfile
};