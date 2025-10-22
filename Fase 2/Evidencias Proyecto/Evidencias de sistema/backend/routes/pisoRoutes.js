const express = require("express");
const { obtenerPisos,obtenerPisosPorEdificio, agregarPiso,eliminarPisosPorCantidad } = require("../controllers/pisoController");
const router = express.Router();

router.get("/", obtenerPisos); // GET /api/pisos
router.get("/por-edificio", obtenerPisosPorEdificio);
router.post("/agregar", agregarPiso)
router.post("/borrar-por-cantidad", eliminarPisosPorCantidad);
module.exports = router;
