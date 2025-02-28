const multer = require("multer");
const xlsx = require("xlsx");
const Report = require("../models/Report");
const LaunchGame = require("../models/LaunchGame");

// Configure Multer for File Upload
const storage = multer.memoryStorage();
const upload = multer({ storage });

const parseExcelDate = (excelDate) => {
    if (!excelDate) return null;
  
    // If it's already a string, try to parse it directly
    if (typeof excelDate === "string") {
      const parsedDate = new Date(excelDate);
      return isNaN(parsedDate) ? null : parsedDate;
    }
  
    // If it's a number (Excel serial number), convert to date
    if (typeof excelDate === "number") {
      const excelEpoch = new Date(Date.UTC(1899, 11, 30)); // Excel date starts from 1899-12-30
      return new Date(excelEpoch.getTime() + excelDate * 86400000); // Convert serial number to date
    }
  
    return null;
}

const safeNumberParse = (value, defaultValue = 0) => {
    const parsed = Number(value);
    return isNaN(parsed) ? defaultValue : parsed;
};

// Function to parse Excel file and save data
const uploadExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Read the uploaded Excel file
    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0]; // Get first sheet
    const sheet = workbook.Sheets[sheetName];

    // Convert sheet to JSON
    const jsonData = xlsx.utils.sheet_to_json(sheet);

    // Extract unique games
    const uniqueGames = new Set();

    // Validate and Save Data in MongoDB
    const reports = jsonData.map((row, index) => {
        const summaryDate = parseExcelDate(row.summary);
        const gameName = row.game ? row.game.toString().trim() : "";

        if (!summaryDate || !gameName) {
            console.warn(`Skipping row ${index + 1}: Missing required fields`);
            return null; // Skip invalid rows
        }

        uniqueGames.add(gameName);

        return {
            summary: summaryDate,
            game: gameName,
            betsEuro: safeNumberParse(row["bets_euro"]),
            winsEuro: safeNumberParse(row["wins_euro"]),
            ggrEuro: safeNumberParse(row["ggr_euro"]),
            avgBet: safeNumberParse(row["avg_bet"]),
            spins: safeNumberParse(row.spins),
            uniquePlayers: safeNumberParse(row["unique_players"]),
        };
    });

    // Filter out invalid rows
    const validReports = reports.filter((report) => report !== null);

    if (validReports.length === 0) {
        return res.status(400).json({ message: "No valid data found in the Excel file" });
    }

    await Report.deleteMany({});
    await Report.insertMany(validReports);


    // const games = Array.from(uniqueGames).map((game) => ({ name: game, launchDate: new Date() }));
    // await LaunchGame.deleteMany({});
    // await LaunchGame.insertMany(games);

    // Fetch existing game names from the database
    const existingGames = await LaunchGame.find({}, { name: 1 });
    const existingGameNames = new Set(existingGames.map((game) => game.name));

    // Filter only new games
    const newGames = Array.from(uniqueGames).filter((game) => !existingGameNames.has(game));

    if (newGames.length > 0) {
        const gameDocuments = newGames.map((game) => ({ name: game, launchDate: new Date() }));
        await LaunchGame.insertMany(gameDocuments);
    }

    const games = await LaunchGame.find();

    
    return res.status(201).json({ message: "Excel data uploaded successfully", data: validReports, games: games });

  } catch (error) {
    console.error("Error uploading Excel file:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

const getAllData = async (req, res) => {
    try {
        const reports = await Report.find();
        const games = await LaunchGame.find();
        res.status(200).json({ data: reports, games });
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).json({ message: "Server error", error });
    }
};

const getOne = async (req, res) => {
  try {
      const { id } = req.params;

      const game = await LaunchGame.findById(id);
      if (game) {
        const reports = await Report.find({ game: game.name });
        if ( reports ) {
            return res.status(200).json({ game, reports });
        }
          return res.status(200).json({ game, reports: [] });
      }

      res.status(404).json({ message: "Data not found" });
  } catch (error) {
      console.error("Error fetching data:", error);
      res.status(500).json({ message: "Server error", error });
  }
};


module.exports = { upload, uploadExcel, getAllData, getOne };