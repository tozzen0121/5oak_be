const express = require("express");
const { upload, uploadExcel, getAllData, downloadExcel, getOne } = require("../controllers/reportController");

const router = express.Router();

// Upload Excel file and save data
router.get("/", getAllData);
router.get("/download", downloadExcel);
router.get("/:id", getOne);

// Upload route with multer error handling
router.post("/upload", (req, res, next) => {
  upload.single("file")(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File too large. Maximum size is 50MB.' });
      }
      if (err.message) {
        return res.status(400).json({ message: err.message });
      }
      return res.status(400).json({ message: 'File upload error' });
    }
    next();
  });
}, uploadExcel);

module.exports = router;