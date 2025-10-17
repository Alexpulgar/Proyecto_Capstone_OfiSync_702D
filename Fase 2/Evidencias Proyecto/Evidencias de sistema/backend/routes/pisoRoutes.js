const express = require("express");
const { obtenerPisos,obtenerPisosPorEdificio, agregarPiso } = require("../controllers/pisoController");
const router = express.Router();

router.get("/", obtenerPisos); // GET /api/pisos
router.get("/por-edificio", obtenerPisosPorEdificio);
router.post("/agregar", agregarPiso)

module.exports = router;
