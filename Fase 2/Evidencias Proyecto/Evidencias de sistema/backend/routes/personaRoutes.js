const express = require("express");
const { obtenerPersonas, agregarPersona , actualizarPersonaParcial,obtenerPersonaPorRut } = require("../controllers/personaController");
const router = express.Router();

router.get("/", obtenerPersonas); // GET /api/personas

router.post("/agregar" ,agregarPersona)// POS /api/personas

router.get('/rut/:rut', obtenerPersonaPorRut)

router.put('/:id', actualizarPersonaParcial);

module.exports = router;
