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

// Middleware para servir archivos estáticos (imágenes, PDFs, etc.)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

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