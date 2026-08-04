const multer = require("multer");
const xlsx = require("xlsx");
const fs = require("fs");
const path = require("path");

// Configure Multer for File Upload
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      file.mimetype === "application/vnd.ms-excel" ||
      file.originalname.endsWith(".xlsx") ||
      file.originalname.endsWith(".xls")
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only Excel files (.xlsx, .xls) are allowed!"), false);
    }
  },
});

const parseExcelDate = (excelDate) => {
  if (!excelDate) return null;

  if (typeof excelDate === "string") {
    const parsedDate = new Date(excelDate);
    return isNaN(parsedDate) ? null : parsedDate;
  }

  if (typeof excelDate === "number") {
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    return new Date(excelEpoch.getTime() + excelDate * 86400000);
  }

  return null;
};

const safeNumberParse = (value, defaultValue = 0) => {
  const parsed = Number(value);
  return isNaN(parsed) ? defaultValue : parsed;
};

const getReportFilePath = (tenant) =>
  path.join(__dirname, "../uploads", `latest_report_${tenant}.xlsx`);

const uploadExcel = async (req, res) => {
  try {
    const Report = req.Report;
    const LaunchGame = req.LaunchGame;
    const tenant = req.tenant;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const uploadDir = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = getReportFilePath(tenant);
    fs.writeFileSync(filePath, req.file.buffer);

    // Also keep legacy filename for 5oak during cutover
    if (tenant === "5oak") {
      fs.writeFileSync(path.join(uploadDir, "latest_report.xlsx"), req.file.buffer);
    }

    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(sheet);

    const uniqueGames = new Set();

    const reports = jsonData.map((row, index) => {
      const summaryDate = parseExcelDate(row.summary);
      const gameName = row.game ? row.game.toString().trim() : "";

      if (!summaryDate || !gameName) {
        console.warn(`Skipping row ${index + 1}: Missing required fields`);
        return null;
      }

      uniqueGames.add(gameName);

      return {
        summary: summaryDate,
        game: gameName,
        betsEuro: safeNumberParse(row.bets ?? row["bets_euro"]),
        winsEuro: safeNumberParse(row.wins ?? row["wins_euro"]),
        ggrEuro: safeNumberParse(row.ggr ?? row["ggr_euro"]),
        avgBet: safeNumberParse(row["avg_bet"]),
        spins: safeNumberParse(row.spins),
        uniquePlayers: safeNumberParse(row["unique_players"]),
      };
    });

    const validReports = reports.filter((report) => report !== null);

    if (validReports.length === 0) {
      return res.status(400).json({ message: "No valid data found in the Excel file" });
    }

    await Report.deleteMany({});
    await Report.insertMany(validReports);

    const excelGameNames = Array.from(uniqueGames);

    // Keep Launch Games in sync with the Excel: drop games no longer in the file
    await LaunchGame.deleteMany({ name: { $nin: excelGameNames } });

    const existingGames = await LaunchGame.find({}, { name: 1 });
    const existingGameNames = new Set(existingGames.map((game) => game.name));
    const newGames = excelGameNames.filter((game) => !existingGameNames.has(game));

    if (newGames.length > 0) {
      const gameDocuments = newGames.map((game) => {
        const gameRows = validReports.filter((report) => report.game === game);
        const earliestSummary = gameRows.reduce((earliest, report) => {
          return !earliest || report.summary < earliest ? report.summary : earliest;
        }, null);
        return {
          name: game,
          launchDate: earliestSummary || new Date(),
        };
      });
      await LaunchGame.insertMany(gameDocuments);
    }

    const games = await LaunchGame.find();

    return res.status(201).json({
      message: "Excel data uploaded successfully",
      tenant,
      data: validReports,
      games,
    });
  } catch (error) {
    console.error("Error uploading Excel file:", error);
    res.status(500).json({
      message: "Server error while uploading file. Please try again.",
      error: error.message,
    });
  }
};

const getAllData = async (req, res) => {
  try {
    const reports = await req.Report.find();
    const games = await req.LaunchGame.find();
    res.status(200).json({ tenant: req.tenant, data: reports, games });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

const getOne = async (req, res) => {
  try {
    const { id } = req.params;
    const game = await req.LaunchGame.findById(id);
    if (game) {
      const reports = await req.Report.find({ game: game.name });
      return res.status(200).json({ tenant: req.tenant, game, reports: reports || [] });
    }

    res.status(404).json({ message: "Data not found" });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

const downloadExcel = async (req, res) => {
  try {
    const tenant = req.tenant;
    let filePath = getReportFilePath(tenant);

    // Fallback to legacy filename for 5oak
    if (!fs.existsSync(filePath) && tenant === "5oak") {
      filePath = path.join(__dirname, "../uploads/latest_report.xlsx");
    }

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "No uploaded file available for download" });
    }

    res.setHeader("Content-Disposition", `attachment; filename=latest_report_${tenant}.xlsx`);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

    res.sendFile(filePath);
  } catch (error) {
    console.error("Error downloading Excel file:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

module.exports = { upload, uploadExcel, getAllData, getOne, downloadExcel };
