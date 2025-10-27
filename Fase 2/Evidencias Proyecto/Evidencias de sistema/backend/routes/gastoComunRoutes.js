const express = require("express");
const {
  calcularGastoComun,
  getGastosPorOficina,
  subirComprobante,
} = require("../controllers/gastoComunController");
const router = express.Router();
const upload = require("../middlewares/upload");

router.post("/calcular", calcularGastoComun);
router.get("/oficina/:id", getGastosPorOficina);

router.post(
  "/subir-comprobante",
  upload.single("comprobante"),
  subirComprobante
);

module.exports = router;