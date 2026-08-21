const db = require("../config/db");

// GET ACTIVE ATHLETES WITH OPTIONAL FILTERS
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

    if (sport) {
      query += ` AND ap.sport = ?`;
      params.push(sport);
    }

    if (district) {
      query += ` AND ap.district = ?`;
      params.push(district);
    }

    if (playing_role) {
      query += ` AND ap.playing_role LIKE ?`;
      params.push(`%${playing_role}%`);
    }

    if (min_height) {
      query += ` AND ap.height_cm >= ?`;
      params.push(min_height);
    }

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
    console.error("SEARCH ATHLETES ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to search athletes"
    });
  }
};


// GET ONE ATHLETE FULL PROFILE
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
    console.error("GET ATHLETE PROFILE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve athlete profile"
    });
  }
};

module.exports = {
  searchAthletes,
  getAthleteProfile
};