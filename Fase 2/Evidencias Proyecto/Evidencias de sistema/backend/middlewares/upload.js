const multer = require("multer");
const path = require("path");

// Carpeta donde se guardarán los archivos (relativa a la raíz del backend)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Asegúrate de que esta carpeta exista en la raíz de 'backend'
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${file.originalname.replace(ext, "")}${ext}`;
    cb(null, name);
  },
});

const upload = multer({ storage });

module.exports = upload;