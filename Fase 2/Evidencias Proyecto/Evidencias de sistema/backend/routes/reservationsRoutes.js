const express = require("express");
const pool = require("../models/db.js");
const upload = require("../middlewares/upload.js");
const {
  getAllServices,
  getUserRes,
  cancelRes,
  getRoomReservationsByDate,
  postReservation,
} = require("../controllers/reservationsController.js");

const router = express.Router();

router.get("/services", getAllServices);
router.get("/user/:id", getUserRes);
router.put("/:id/cancel", cancelRes);
router.get("/room/:serviceId/:date", getRoomReservationsByDate);
router.post("/", upload.single("file"), postReservation);

router.put("/complete-past", async (req, res) => {
  try {
    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const currentTime = now.toTimeString().slice(0, 8);

    const query = `
      UPDATE reservations
      SET status = 'completada'
      WHERE status = 'pendiente'
      AND (
        (date < $1) OR
        (date = $1 AND end_time <= $2)
      )
      RETURNING *;
    `;

    const values = [today, currentTime];
    const result = await pool.query(query, values);

    res.json({ message: `${result.rowCount} reservas completadas`, updated: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error actualizando reservas" });
  }
});

module.exports = router;