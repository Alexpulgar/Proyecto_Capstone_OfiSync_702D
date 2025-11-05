const express = require("express");
const router = express.Router();
const {
    crearEntrada,
    obtenerEntradas
} = require("../controllers/bitacoraController");

const {validateBitacora} = require("../logic/bitacoraValidator");

//creamos el middleware de validacion
const middlewareValidar = (req, res, next) => {
    const { isValid, errors } = validateBitacora(req.body);
    if (!isValid) {
        return res.status(400).json({errors: errors.join(", ") });
    }
    //si es valido, pasa al siguiente paso (el controlador 'crearEntradas')
    next();
};

//aplicar el middleware SOLO A la ruta post
router.post("/", middlewareValidar, crearEntrada);

router.get("/", obtenerEntradas);

module.exports = router;