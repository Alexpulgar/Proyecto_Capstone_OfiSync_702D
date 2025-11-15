const express = require("express");
const {
  calcularGastoComun,
  getGastosPorOficina,
  subirComprobante,
  getVouchersEnRevision,
  reviewVoucher,
  getGastoStatus,
} = require("../controllers/gastoComunController");
const router = express.Router();
const upload = require("../middlewares/upload");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/calcular", calcularGastoComun);
router.get("/oficina/:id", getGastosPorOficina);

router.post(
  "/subir-comprobante",
  upload.single("comprobante"),
  subirComprobante
);

router.get("/revision", getVouchersEnRevision);

router.put("/review", reviewVoucher);

router.get("/status", authMiddleware, getGastoStatus);

module.exports = router;
