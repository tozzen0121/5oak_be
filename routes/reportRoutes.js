const express = require("express");
const { upload, uploadExcel, getAllData, downloadExcel, getOne } = require("../controllers/reportController");

const router = express.Router();

// Upload Excel file and save data
router.get("/", getAllData);
router.get("/download", downloadExcel);
router.get("/:id", getOne);
router.post("/upload", upload.single("file"), uploadExcel);

module.exports = router;