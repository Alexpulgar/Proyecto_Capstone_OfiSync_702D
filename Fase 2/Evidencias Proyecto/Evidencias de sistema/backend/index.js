const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

// Importación de todas las rutas de la aplicación
const oficinaRoutes = require("./routes/oficinaRoutes");
const pisoRoutes = require("./routes/pisoRoutes");
const personaRoutes = require("./routes/personaRoutes");
const edificioRoutes = require("./routes/edificioRoutes.js");
const gastoComunRoutes = require("./routes/gastoComunRoutes");
const reservationsRoutes = require("./routes/reservationsRoutes");
const usuarioRoutes = require('./routes/usuarioRoutes');
const insumoRoutes = require("./routes/insumoRoutes.js")
const app = express();

// Middlewares principales
app.use(cors());
app.use(express.json());

// --- INICIO DE LA MODIFICACIÓN ---

// 1. COMENTAMOS la línea que da problemas
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// 2. AÑADIMOS un manejador manual que busca el archivo con %20
app.get('/uploads/*', (req, res, next) => {
  try {
    // req.path decodifica, pero req.originalUrl mantiene los %20
    // Necesitamos extraer el nombre del archivo de req.originalUrl
    
    // Extraemos la parte del path que viene después de /uploads/
    const fileName = req.originalUrl.split('/uploads/')[1];

    if (!fileName) {
      return res.status(404).json({ error: "Archivo no especificado" });
    }
    
    // Construimos el path al archivo en el disco
    // path.join maneja los separadores de directorio correctamente
    // fileName AÚN CONTIENE los %20
    const filePath = path.join(__dirname, "uploads", fileName);

    // res.download usará ese path (con %20) para buscar el archivo
    res.download(filePath, (err) => {
      if (err) {
        if (!res.headersSent) {
          console.error("Error al intentar descargar:", filePath, err.message);
          res.status(404).json({ error: "Archivo no disponible." });
        }
      }
    });

  } catch (error) {
    console.error("Error en el handler de descargas:", error);
    next(error); // Pasa al manejador de errores 500
  }
});
// --- FIN DE LA MODIFICACIÓN ---


// Conexión de todas las rutas a la aplicación de Express
app.use("/api/oficinas", oficinaRoutes);
app.use("/api/pisos", pisoRoutes);
app.use("/api/personas", personaRoutes);
app.use("/api/edificios", edificioRoutes);
app.use("/api/gasto-comun", gastoComunRoutes);
app.use("/api/reservations", reservationsRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use("/api/insumos", insumoRoutes);

// Manejador de errores para rutas no encontradas (404)
app.use((req, res, next) => {
  res.status(404).json({ error: "Endpoint no encontrado" });
});

// Manejador de errores general (500)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Error interno del servidor" });
});

module.exports = app;