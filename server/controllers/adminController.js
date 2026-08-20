const db = require("../config/db");

// GET ALL PENDING VERIFICATION DOCUMENTS
const getPendingVerifications = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        vd.id AS document_id,
        vd.document_type,
        vd.file_path,
        vd.review_status,
        vd.uploaded_at,

        u.id AS athlete_id,
        u.full_name,
        u.email,
        u.status AS athlete_status,

        ap.sport,
        ap.district,
        ap.playing_role

      FROM verification_documents vd

      JOIN users u
        ON vd.athlete_id = u.id

      LEFT JOIN athlete_profiles ap
        ON u.id = ap.user_id

      WHERE vd.review_status = 'PENDING'

      ORDER BY vd.uploaded_at DESC
    `);

    return res.status(200).json({
      success: true,
      count: rows.length,
      verifications: rows
    });

  } catch (error) {
    console.error("PENDING VERIFICATIONS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve pending verifications"
    });
  }
};


// APPROVE ATHLETE VERIFICATION
const approveVerification = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const documentId = req.params.documentId;

    await connection.beginTransaction();

    const [documents] = await connection.query(
      `
      SELECT athlete_id
      FROM verification_documents
      WHERE id = ?
      `,
      [documentId]
    );

    if (documents.length === 0) {
      await connection.rollback();

      return res.status(404).json({
        success: false,
        message: "Verification document not found"
      });
    }

    const athleteId = documents[0].athlete_id;

    await connection.query(
      `
      UPDATE verification_documents
      SET
        review_status = 'APPROVED',
        admin_note = 'Verification approved by administrator'
      WHERE id = ?
      `,
      [documentId]
    );

    await connection.query(
      `
      UPDATE users
      SET status = 'ACTIVE'
      WHERE id = ?
        AND role = 'ATHLETE'
      `,
      [athleteId]
    );

    await connection.commit();

    return res.status(200).json({
      success: true,
      message: "Athlete verification approved successfully",
      athlete_id: athleteId,
      status: "ACTIVE"
    });

  } catch (error) {
    await connection.rollback();

    console.error("APPROVE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to approve athlete verification"
    });

  } finally {
    connection.release();
  }
};


// REJECT ATHLETE VERIFICATION
const rejectVerification = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const documentId = req.params.documentId;
    const { admin_note } = req.body;

    await connection.beginTransaction();

    const [documents] = await connection.query(
      `
      SELECT athlete_id
      FROM verification_documents
      WHERE id = ?
      `,
      [documentId]
    );

    if (documents.length === 0) {
      await connection.rollback();

      return res.status(404).json({
        success: false,
        message: "Verification document not found"
      });
    }

    const athleteId = documents[0].athlete_id;

    await connection.query(
      `
      UPDATE verification_documents
      SET
        review_status = 'REJECTED',
        admin_note = ?
      WHERE id = ?
      `,
      [
        admin_note || "Verification rejected by administrator",
        documentId
      ]
    );

    await connection.query(
      `
      UPDATE users
      SET status = 'REJECTED'
      WHERE id = ?
        AND role = 'ATHLETE'
      `,
      [athleteId]
    );

    await connection.commit();

    return res.status(200).json({
      success: true,
      message: "Athlete verification rejected",
      athlete_id: athleteId,
      status: "REJECTED"
    });

  } catch (error) {
    await connection.rollback();

    console.error("REJECT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to reject athlete verification"
    });

  } finally {
    connection.release();
  }
};


module.exports = {
  getPendingVerifications,
  approveVerification,
  rejectVerification
};