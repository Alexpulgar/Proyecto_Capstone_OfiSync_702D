const express = require("express");
const router = express.Router();
const {
  getDashboardStats,
  getReservationsByService,
  getRevenueLast7Days,
} = require("../controllers/dashboardController.js");
const authMiddleware = require("../middlewares/authMiddleware.js");

router.get("/stats", authMiddleware, getDashboardStats);
router.get("/reservas-por-servicio", authMiddleware, getReservationsByService);
router.get("/ingresos-7dias", authMiddleware, getRevenueLast7Days);

module.exports = router;
