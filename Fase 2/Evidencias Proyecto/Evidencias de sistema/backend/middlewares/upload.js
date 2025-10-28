const multer = require("multer");
const path = require("path");

// Carpeta donde se guardarán los archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${file.originalname.replace(ext, "")}${ext}`;
    cb(null, name);
  },
});

const upload = multer({ storage });

module.exports = upload;