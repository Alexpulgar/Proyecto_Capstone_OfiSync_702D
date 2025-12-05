const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(__dirname, "../uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    let name = path.basename(file.originalname, ext);

    name = name.replace(/%20/g, "_").replace(/\s+/g, "_");

    const finalName = `${Date.now()}-${name}${ext}`;
    cb(null, finalName);
  },
});

const upload = multer({ storage });

module.exports = upload;
