const express = require("express");
const { obtenerPersonas, agregarPersona } = require("../controllers/personaController");
const router = express.Router();

router.get("/", obtenerPersonas); // GET /api/personas

router.post("/agregar" ,agregarPersona)// POS /api/personas

module.exports = router;
