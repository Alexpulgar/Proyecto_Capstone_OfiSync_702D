const express = require("express");
const { calcularGastoComun } = require("../controllers/gastoComunController");
const { getGastosPorOficina } = require("../controllers/gastoComunController");
const router = express.Router();

router.post("/calcular", calcularGastoComun);

router.get("/oficina/:id", getGastosPorOficina);

module.exports = router;
