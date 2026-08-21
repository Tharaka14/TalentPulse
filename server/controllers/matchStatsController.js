const db = require("../config/db");

// ADD MATCH STAT
const addMatchStat = async (req, res) => {
  try {
    const athleteId = req.user.id;

    const {
      sport,
      match_date,
      event_name,
      metric_name,
      metric_value,
      notes
    } = req.body;

    if (!sport || !match_date || !metric_name || metric_value === undefined) {
      return res.status(400).json({
        success: false,
        message: "Sport, match date, metric name and metric value are required"
      });
    }

    const [result] = await db.query(
      `
      INSERT INTO match_stats
      (
        athlete_id,
        sport,
        match_date,
        event_name,
        metric_name,
        metric_value,
        notes
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        athleteId,
        sport,
        match_date,
        event_name || null,
        metric_name,
        metric_value,
        notes || null
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Match statistic added successfully",
      stat_id: result.insertId
    });

  } catch (error) {
    console.error("ADD MATCH STAT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to add match statistic"
    });
  }
};


// GET OWN MATCH STATS
const getMyMatchStats = async (req, res) => {
  try {
    const athleteId = req.user.id;

    const [rows] = await db.query(
      `
      SELECT
        id,
        sport,
        match_date,
        event_name,
        metric_name,
        metric_value,
        notes,
        created_at
      FROM match_stats
      WHERE athlete_id = ?
      ORDER BY match_date DESC, id DESC
      `,
      [athleteId]
    );

    return res.status(200).json({
      success: true,
      count: rows.length,
      stats: rows
    });

  } catch (error) {
    console.error("GET MATCH STATS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve match statistics"
    });
  }
};


// DELETE OWN MATCH STAT
const deleteMatchStat = async (req, res) => {
  try {
    const athleteId = req.user.id;
    const statId = req.params.id;

    const [result] = await db.query(
      `
      DELETE FROM match_stats
      WHERE id = ?
        AND athlete_id = ?
      `,
      [statId, athleteId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Match statistic not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Match statistic deleted successfully"
    });

  } catch (error) {
    console.error("DELETE MATCH STAT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete match statistic"
    });
  }
};

module.exports = {
  addMatchStat,
  getMyMatchStats,
  deleteMatchStat
};