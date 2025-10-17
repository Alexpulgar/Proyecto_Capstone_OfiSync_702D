const express = require("express");
const { agregarEdificio , obtenerEdificios} = require("../controllers/edificioController");
const router = express.Router();

router.get("/", obtenerEdificios);
router.post("/agregar", agregarEdificio)

module.exports = router;