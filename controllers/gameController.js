
const Game = require('../models/Game');
const multer = require('multer');
const fs = require('fs');
const path = require('path');


// Set up storage engine
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = 'uploads/games';
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

        const games = await Game.find();

        res.status(201).json({ data: games });
    } catch (error) {
        next(error);
    }
};

exports.getOne = async (req, res, next) => {
    try {
        const { id } = req.params;
    
        // Find the game record by ID
        const game = await Game.findById(id);
    
        if (!game) {
            return res.status(404).json({ message: 'Game not found' });
        }
    
        res.status(200).json({ data: game });
    } catch (error) {
        next(error);
    }
};

exports.save = async (req, res, next) => {
    // Handle file upload
    upload.fields([
        { name: 'image', maxCount: 1 },       // Single file field
        { name: 'images[]', maxCount: 10 },   // Multiple files field
    ])(req, res, async function (err) {
        if (err) {
            return next(err);
        }

        // Get the other form data
        const { name, description } = req.body;
        // const imagePath = req.file ? req.file.path : null;
        const imagePath = req.files['image'] ? req.files['image'][0].path : null;

        const imagesPaths = req.files['images[]']
            ? req.files['images[]'].map(file => file.path)
            : [];

        try {
            // Create a new Game document
            const game = new Game({
                name,
                description,
                imagePath,
                imagesPaths
            });
        
            // Save the Game document to the database
            await game.save();

            res.status(201).json({
                message: 'File uploaded and data saved successfully',
                data: game
            });
        } catch (error) {
            next(error);
        }
    });
};

exports.update = async (req, res, next) => {
    // Handle file uploads (for both single and multiple images)
    upload.fields([
        { name: 'image', maxCount: 1 },
        { name: 'images[]', maxCount: 10 },
    ])(req, res, async function (err) {
        if (err) {
            return next(err);
        }

        const { id } = req.params;
        const { name, description, images_paths = [] } = req.body;

        try {
            const game = await Game.findById(id);

            if (!game) {
                return res.status(404).json({ message: 'Game not found' });
            }

            // Update the main image if a new one is uploaded
            if (req.files['image']) {
                const existingImagePath = path.resolve(game.imagePath);

                // Delete the existing image if it exists
                if (fs.existsSync(existingImagePath)) {
                    fs.unlinkSync(existingImagePath);
                }

                // Update the game with the new image path
                game.imagePath = req.files['image'][0].path;
            }

            // Handle the images array
            let updatedImagesPaths = [];

            // Add paths that were not removed by the user
            if (Array.isArray(images_paths)) {
                updatedImagesPaths = images_paths.filter((imagePath) => 
                    game.imagesPaths.includes(imagePath)
                );
            }

            // Delete images that were removed by the user
            const removedImages = game.imagesPaths.filter((imagePath) => 
                !images_paths.includes(imagePath)
            );

            removedImages.forEach((imagePath) => {
                const absolutePath = path.resolve(imagePath);
                if (fs.existsSync(absolutePath)) {
                    fs.unlinkSync(absolutePath); // Delete the file
                }
            });

            // Add new uploaded images to the array
            if (req.files['images[]']) {
                const newImagePaths = req.files['images[]'].map((file) => file.path);
                updatedImagesPaths = updatedImagesPaths.concat(newImagePaths);
            }

            // Update the game record with the new data
            game.name = name || game.name;
            game.description = description || game.description;
            game.imagesPaths = updatedImagesPaths;

            // Save the updated game record
            await game.save();

            res.status(201).json({
                message: 'Game updated successfully',
                data: game
            });
        } catch (error) {
            next(error);
        }
    });
};


exports.remove = async (req, res, next) => {
    try {
        const { id } = req.params;
    
        // Find the game record by ID
        const game = await Game.findById(id);
    
        if (!game) {
            return res.status(404).json({ message: 'Game not found' });
        }

        const imagePath = path.resolve(game.imagePath);
        // Remove the image file from the server
    
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath); // Delete the file
        }

        // Remove all images in the `images` array from the server
        for (const imagePath of game.imagesPaths) {
            const resolvedImagePath = path.resolve(imagePath);
            if (fs.existsSync(resolvedImagePath)) {
                fs.unlinkSync(resolvedImagePath); // Delete each image file
            }
        }
    
        // Delete the game record from MongoDB
        await Game.findByIdAndDelete(id);
    
        res.status(200).json({ message: 'Game deleted successfully' });
      } catch (error) {
        next(error);
      }
};