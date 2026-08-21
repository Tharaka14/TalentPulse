const db = require("../config/db");

// ADD WORKOUT
const addWorkout = async (req, res) => {
  try {
    const athleteId = req.user.id;

    const {
      workout_date,
      activity_type,
      duration_minutes,
      distance_km,
      notes
    } = req.body;

    if (!workout_date || !activity_type) {
      return res.status(400).json({
        success: false,
        message: "Workout date and activity type are required"
      });
    }

    const [result] = await db.query(
      `
      INSERT INTO workout_logs
      (
        athlete_id,
        workout_date,
        activity_type,
        duration_minutes,
        distance_km,
        notes
      )
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        athleteId,
        workout_date,
        activity_type,
        duration_minutes || null,
        distance_km || null,
        notes || null
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Workout logged successfully",
      workout_id: result.insertId
    });

  } catch (error) {
    console.error("ADD WORKOUT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to add workout"
    });
  }
};


// GET OWN WORKOUTS
const getMyWorkouts = async (req, res) => {
  try {
    const athleteId = req.user.id;

    const [rows] = await db.query(
      `
      SELECT
        id,
        workout_date,
        activity_type,
        duration_minutes,
        distance_km,
        notes,
        created_at
      FROM workout_logs
      WHERE athlete_id = ?
      ORDER BY workout_date DESC, id DESC
      `,
      [athleteId]
    );

    return res.status(200).json({
      success: true,
      count: rows.length,
      workouts: rows
    });

  } catch (error) {
    console.error("GET WORKOUTS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve workouts"
    });
  }
};


// DELETE OWN WORKOUT
const deleteWorkout = async (req, res) => {
  try {
    const athleteId = req.user.id;
    const workoutId = req.params.id;

    const [result] = await db.query(
      `
      DELETE FROM workout_logs
      WHERE id = ?
      AND athlete_id = ?
      `,
      [workoutId, athleteId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Workout not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Workout deleted successfully"
    });

  } catch (error) {
    console.error("DELETE WORKOUT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete workout"
    });
  }
};


module.exports = {
  addWorkout,
  getMyWorkouts,
  deleteWorkout
};