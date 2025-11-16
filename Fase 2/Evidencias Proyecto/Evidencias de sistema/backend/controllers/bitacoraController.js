const bitacoraLogic = require("../logic/bitacora/bitacoraLogic");

const crearEntrada = async (req, res) => {
  try {
    const datosParaLogica = {
      ...req.body,
      autorId: req.user.id,
      autorNombre: req.user.nombre_usuario,
    };

    const nuevaEntrada = await bitacoraLogic.crearEntrada(datosParaLogica);

    res.status(201).json(nuevaEntrada);
  } catch (err) {
    console.error("Error en bitacoraController.crearEntrada:", err);
    res.status(500).json({ error: err.message });
  }
};

const obtenerEntradas = async (req, res) => {
  try {
    const entradas = await bitacoraLogic.obtenerEntradas();
    res.json(entradas);
  } catch (err) {
    console.error("Error en bitacoraController.obtenerEntradas:", err);
    res.status(500).json({ error: "Error al obtener bitácora" });
  }
};

//Actualizar
const actualizarEntrada = async (req, res) => {
  try {
    const id = req.params.id;
    const datos = req.body;

    const entradaActualizada = await bitacoraLogic.actualizarEntrada(id, datos);
    res.status(200).json(entradaActualizada);
  } catch (err) {
    console.error("Error en bitacoraController.actualizarEntrada:", err);

    if (err.message.includes("encontrada")) {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: "Error interno al actualizar entrada" });
  }
};

const borrarEntrada = async (req, res) => {
  try {
    const { id } = req.params;
    const resultado = await bitacoraLogic.borrarEntrada(id);
    res.status(200).json(resultado);
  } catch (err) {
    console.error("Error en bitacoraController.borrarEntrada:", err);

    if (err.message.includes("encontrada")) {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: "Error interno al borrar entrada" });
  }
};

module.exports = {
  crearEntrada,
  obtenerEntradas,
  actualizarEntrada,
  borrarEntrada,
};
