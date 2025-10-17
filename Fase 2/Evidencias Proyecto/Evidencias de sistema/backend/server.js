const app = require('./index'); // Importamos la app

const port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log(`API corriendo en http://localhost:${port}`);
});