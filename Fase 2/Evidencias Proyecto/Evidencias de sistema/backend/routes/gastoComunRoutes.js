const express = require("express");
const { calcularGastoComun } = require("../controllers/gastoComunController");
const router = express.Router();

router.post("/calcular", calcularGastoComun);

module.exports = router;
