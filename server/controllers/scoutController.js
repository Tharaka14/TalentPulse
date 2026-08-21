const db = require("../config/db");


// =====================================================
// GET ACTIVE ATHLETES WITH OPTIONAL FILTERS
// =====================================================
const searchAthletes = async (req, res) => {
  try {
    const {
      sport,
      district,
      playing_role,
      min_height,
      max_age
    } = req.query;

    let query = `
      SELECT
        u.id,
        u.full_name,
        u.email,
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

      INNER JOIN athlete_profiles ap
        ON u.id = ap.user_id

      WHERE u.role = 'ATHLETE'
        AND u.status = 'ACTIVE'
    `;

    const params = [];

    // Filter by sport
    if (sport) {
      query += ` AND ap.sport = ?`;
      params.push(sport);
    }

    // Filter by district
    if (district) {
      query += ` AND ap.district = ?`;
      params.push(district);
    }

    // Filter by playing role
    if (playing_role) {
      query += ` AND ap.playing_role LIKE ?`;
      params.push(`%${playing_role}%`);
    }

    // Filter by minimum height
    if (min_height) {
      query += ` AND ap.height_cm >= ?`;
      params.push(min_height);
    }

    // Filter by maximum age
    if (max_age) {
      query += `
        AND TIMESTAMPDIFF(
          YEAR,
          ap.date_of_birth,
          CURDATE()
        ) <= ?
      `;

      params.push(max_age);
    }

    query += ` ORDER BY u.full_name ASC`;

    const [athletes] = await db.query(query, params);

    return res.status(200).json({
      success: true,
      count: athletes.length,
      athletes
    });

  } catch (error) {
    console.error(
      "SEARCH ATHLETES ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to search athletes"
    });
  }
};


// =====================================================
// GET ONE VERIFIED ATHLETE FULL PROFILE
// =====================================================
const getAthleteProfile = async (req, res) => {
  try {
    const athleteId = req.params.id;

    const [athletes] = await db.query(
      `
      SELECT
        u.id,
        u.full_name,
        u.email,
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
        AND u.role = 'ATHLETE'
        AND u.status = 'ACTIVE'
      `,
      [athleteId]
    );

    if (athletes.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Verified athlete not found"
      });
    }

    // Get athlete match statistics
    const [stats] = await db.query(
      `
      SELECT
        id,
        sport,
        match_date,
        event_name,
        metric_name,
        metric_value,
        notes
      FROM match_stats
      WHERE athlete_id = ?
      ORDER BY match_date DESC
      `,
      [athleteId]
    );

    // Get athlete workout history
    const [workouts] = await db.query(
      `
      SELECT
        id,
        workout_date,
        activity_type,
        duration_minutes,
        distance_km,
        notes
      FROM workout_logs
      WHERE athlete_id = ?
      ORDER BY workout_date DESC
      `,
      [athleteId]
    );

    return res.status(200).json({
      success: true,
      athlete: athletes[0],
      match_stats: stats,
      workouts
    });

  } catch (error) {
    console.error(
      "GET ATHLETE PROFILE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve athlete profile"
    });
  }
};


// =====================================================
// ADD ATHLETE TO SCOUT SHORTLIST
// =====================================================
const addToShortlist = async (req, res) => {
  try {
    const scoutId = req.user.id;
    const athleteId = req.params.athleteId;

    // Check athlete exists and is verified / active
    const [athletes] = await db.query(
      `
      SELECT id
      FROM users
      WHERE id = ?
        AND role = 'ATHLETE'
        AND status = 'ACTIVE'
      `,
      [athleteId]
    );

    if (athletes.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Verified athlete not found"
      });
    }

    // Check whether athlete is already shortlisted
    const [existing] = await db.query(
      `
      SELECT id
      FROM shortlists
      WHERE scout_id = ?
        AND athlete_id = ?
      `,
      [scoutId, athleteId]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Athlete is already in your shortlist"
      });
    }

    const [result] = await db.query(
      `
      INSERT INTO shortlists
      (
        scout_id,
        athlete_id
      )
      VALUES (?, ?)
      `,
      [
        scoutId,
        athleteId
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Athlete added to shortlist successfully",
      shortlist_id: result.insertId
    });

  } catch (error) {
    console.error(
      "ADD SHORTLIST ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to add athlete to shortlist"
    });
  }
};


// =====================================================
// GET SCOUT'S SHORTLIST
// =====================================================
const getMyShortlist = async (req, res) => {
  try {
    const scoutId = req.user.id;

    const [rows] = await db.query(
      `
      SELECT
        s.id AS shortlist_id,
        s.created_at,

        u.id AS athlete_id,
        u.full_name,
        u.email,
        u.status,

        ap.sport,
        ap.district,
        ap.date_of_birth,
        ap.playing_role,
        ap.height_cm,
        ap.weight_kg,
        ap.profile_picture,
        ap.bio,
        ap.phone

      FROM shortlists s

      JOIN users u
        ON s.athlete_id = u.id

      LEFT JOIN athlete_profiles ap
        ON u.id = ap.user_id

      WHERE s.scout_id = ?

      ORDER BY s.created_at DESC
      `,
      [scoutId]
    );

    return res.status(200).json({
      success: true,
      count: rows.length,
      shortlist: rows
    });

  } catch (error) {
    console.error(
      "GET SHORTLIST ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve shortlist"
    });
  }
};


// =====================================================
// REMOVE ATHLETE FROM SCOUT SHORTLIST
// =====================================================
const removeFromShortlist = async (req, res) => {
  try {
    const scoutId = req.user.id;
    const athleteId = req.params.athleteId;

    const [result] = await db.query(
      `
      DELETE FROM shortlists
      WHERE scout_id = ?
        AND athlete_id = ?
      `,
      [
        scoutId,
        athleteId
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Athlete was not found in your shortlist"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Athlete removed from shortlist successfully"
    });

  } catch (error) {
    console.error(
      "REMOVE SHORTLIST ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to remove athlete from shortlist"
    });
  }
};


// =====================================================
// EXPORT CONTROLLER FUNCTIONS
// =====================================================
module.exports = {
  searchAthletes,
  getAthleteProfile,
  addToShortlist,
  getMyShortlist,
  removeFromShortlist
};