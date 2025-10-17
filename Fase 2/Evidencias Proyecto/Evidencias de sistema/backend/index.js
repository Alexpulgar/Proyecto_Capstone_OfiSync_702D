const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config(); // Para gestionar variables de entorno

// Importación de todas las rutas de la aplicación
const oficinaRoutes = require("./routes/oficinaRoutes");
const pisoRoutes = require("./routes/pisoRoutes");
const personaRoutes = require("./routes/personaRoutes");
const edificioRoutes = require("./routes/edificioRoutes.js");
const gastoComunRoutes = require("./routes/gastoComunRoutes");
const reservationsRoutes = require("./routes/reservationsRoutes"); // Rutas integradas

const app = express();

// Middlewares principales
app.use(cors()); // Habilita CORS para todas las rutas
app.use(express.json()); // Permite al servidor entender JSON en los cuerpos de las peticiones

// Middleware para servir archivos estáticos (imágenes, PDFs, etc.)
// Esto permite acceder a los archivos subidos a través de una URL.
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Conexión de todas las rutas a la aplicación de Express
app.use("/api/oficinas", oficinaRoutes);
app.use("/api/pisos", pisoRoutes);
app.use("/api/personas", personaRoutes);
app.use("/api/edificios", edificioRoutes);
app.use("/api/gasto-comun", gastoComunRoutes);
app.use("/api/reservations", reservationsRoutes); // Rutas de reservaciones integradas

// Manejador de errores para rutas no encontradas (404)
// Se ejecuta si ninguna de las rutas anteriores coincide.
app.use((req, res, next) => {
  res.status(404).json({ error: "Endpoint no encontrado" });
});

// Manejador de errores general (500)
// Captura cualquier error que ocurra en los controladores de las rutas.
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Error interno del servidor" });
});

// Exportamos la app para que pueda ser utilizada por `server.js` y los archivos de prueba
module.exports = app;