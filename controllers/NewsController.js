
const News = require('../models/News');
const multer = require('multer');
const fs = require('fs');
const path = require('path');


// Set up storage engine
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = 'uploads/news';
        fs.mkdirSync(dir, { recursive: true }); // Ensure the directory exists
        cb(null, dir); // Set the folder to save files  
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`); // Generate a unique filename
    },
});

// Initialize upload variable with the configured storage
const upload = multer({ storage: storage });


exports.get = async (req, res, next) => {
    try {

        const news = await News.find();

        res.status(201).json({ data: news });
    } catch (error) {
        next(error);
    }
};

exports.getOne = async (req, res, next) => {
    try {
        const { id } = req.params;
    
        // Find the news record by ID
        const news = await News.findById(id);
    
        if (!news) {
            return res.status(404).json({ message: 'News not found' });
        }
    
        res.status(200).json({ data: news });
    } catch (error) {
        next(error);
    }
};

exports.save = async (req, res, next) => {
    // Handle file upload
    upload.single('image')(req, res, async function (err) {
        if (err) {
            return next(err);
        }

        // Get the other form data
        const { name, description } = req.body;
        const imagePath = req.file ? req.file.path : null;


        try {
            // Create a new News document
            const news = new News({
                name,
                description,
                imagePath: imagePath,
            });
        
            // Save the News document to the database
            await news.save();

            res.status(201).json({
                message: 'File uploaded and data saved successfully',
                data: news
            });
        } catch (error) {
            next(error);
        }
    });
};

exports.update = async (req, res, next) => {
    // Handle file upload
    upload.single('image')(req, res, async function (err) {
        if (err) {
            return next(err);
        }

        const { id } = req.params;
        const { name, description } = req.body;

        const news = await News.findById(id);

        if (!news) {
            return res.status(404).json({ message: 'News not found' });
        }

        if( req.file ) {
            const existingImagePath = path.resolve(news.imagePath);
    
            // Delete the existing image if it exists
            if (fs.existsSync(existingImagePath)) {
                fs.unlinkSync(existingImagePath); // Delete the file
            }
    
            // Update the News with the new image path
            news.imagePath = `uploads/news/${req.file.filename}`;
        }

        try {

             // Update the News record with the new data
            news.name = name || news.name;
            news.description = description || news.description;

            // Save the updated news record
            await news.save();

            res.status(201).json({
                message: 'File uploaded and data saved successfully',
                data: news
            });
        } catch (error) {
            next(error);
        }
    });
};


exports.remove = async (req, res, next) => {
    try {
        const { id } = req.params;
    
        // Find the news record by ID
        const news = await News.findById(id);
    
        if (!news) {
            return res.status(404).json({ message: 'News not found' });
        }

        const imagePath = path.resolve(news.imagePath);
        // Remove the image file from the server
    
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath); // Delete the file
        }
    
        // Delete the News record from MongoDB
        await News.findByIdAndDelete(id);
    
        res.status(200).json({ message: 'News deleted successfully' });
      } catch (error) {
        next(error);
      }
};