const express = require("express");
const pool = require("../models/db.js");
const upload = require("../middlewares/upload.js");
const {
  getAllServices,
  getUserRes,
  cancelRes,
  getRoomReservationsByDate,
  postReservation,
  getAllReservationsAdmin,
  completeReservationManual,
  completePastReservations,
} = require("../controllers/reservationsController.js");

const router = express.Router();

router.get("/services", getAllServices);
router.get("/user/:id", getUserRes);
router.put("/:id/cancel", cancelRes);
router.get("/room/:serviceId/:date", getRoomReservationsByDate);
router.post("/", upload.single("file"), postReservation);
router.get("/admin/all", getAllReservationsAdmin);
router.put("/:id/complete", completeReservationManual);
router.put("/complete-past", completePastReservations);

module.exports = router;
