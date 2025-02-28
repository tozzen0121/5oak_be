
const Applicant = require('../models/Applicant');
const multer = require('multer');
const fs = require('fs');
const path = require('path');


// Set up storage engine
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = 'uploads/applicants';
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

        const applicants = await Applicant.find();

        res.status(201).json({ data: applicants });
    } catch (error) {
        next(error);
    }
};

exports.getOne = async (req, res, next) => {
    try {
        const { id } = req.params;
    
        // Find the Applicant record by ID
        const applicant = await Applicant.findById(id);
    
        if (!applicant) {
            return res.status(404).json({ message: 'Applicant not found' });
        }
    
        res.status(200).json({ data: applicant });
    } catch (error) {
        next(error);
    }
};

exports.save = async (req, res, next) => {
    // Handle file upload
    upload.fields([
        { name: 'cv', maxCount: 1 },
        { name: 'cover', maxCount: 1 },
    ])(req, res, async function (err) {
        if (err) {
            return next(err);
        }

        // Get the other form data
        const { name, email, phone, job_title } = req.body;

        const coverPath = req.files['cover'] ? req.files['cover'][0].path : null;
        const cvPath = req.files['cv'] ? req.files['cv'][0].path : null;


        try {
            // Create a new Applicant document
            const applicant = new Applicant({
                name,
                email, 
                phone,
                job_title,
                coverPath,
                cvPath,
            });
        
            // Save the Applicant document to the database
            await applicant.save();

            res.status(201).json({
                message: 'File uploaded and data saved successfully',
                data: applicant
            });
        } catch (error) {
            next(error);
        }
    });
};

exports.update = async (req, res, next) => {
    // Handle file uploads (for both single and multiple images)
    upload.fields([
        { name: 'cv', maxCount: 1 },
        { name: 'cover', maxCount: 11 },
    ])(req, res, async function (err) {
        if (err) {
            return next(err);
        }

        const { id } = req.params;
        const { name, email, phone, job_title } = req.body;

        try {
            const applicant = await Applicant.findById(id);

            if (!applicant) {
                return res.status(404).json({ message: 'Applicant not found' });
            }

            // Update the cv image if a new one is uploaded
            if (req.files['cv']) {
                const existingImagePath = path.resolve(applicant.cvPath);

                // Delete the existing image if it exists
                if (fs.existsSync(existingImagePath)) {
                    fs.unlinkSync(existingImagePath);
                }

                // Update the Applicant with the new image path
                applicant.cvPath = req.files['cv'][0].path;
            }

            // Update the cover image if a new one is uploaded
            if (req.files['cover']) {
                const existingImagePath = path.resolve(applicant.coverPath);

                // Delete the existing image if it exists
                if (fs.existsSync(existingImagePath)) {
                    fs.unlinkSync(existingImagePath);
                }

                // Update the Applicant with the new image path
                applicant.coverPath = req.files['cover'][0].path;
            }

            // Update the Applicant record with the new data
            applicant.name = name || applicant.name;
            applicant.email = email || applicant.email;
            applicant.phone = phone || applicant.phone;
            applicant.job_title = job_title || applicant.job_title;

            // Save the updated Applicant record
            await applicant.save();

            res.status(201).json({
                message: 'Applicant updated successfully',
                data: applicant
            });
        } catch (error) {
            next(error);
        }
    });
};


exports.remove = async (req, res, next) => {
    try {
        const { id } = req.params;
    
        // Find the Applicant record by ID
        const applicant = await Applicant.findById(id);
    
        if (!applicant) {
            return res.status(404).json({ message: 'Applicant not found' });
        }

        // Remove the image file from the server
        const cvPath = path.resolve(applicant.cvPath);
        if (fs.existsSync(cvPath)) {
            fs.unlinkSync(cvPath); // Delete the file
        }

        const coverPath = path.resolve(applicant.coverPath);
        if (fs.existsSync(coverPath)) {
            fs.unlinkSync(coverPath); // Delete the file
        }

        // Delete the applicant record from MongoDB
        await Applicant.findByIdAndDelete(id);
    
        res.status(200).json({ message: 'Applicant deleted successfully' });
      } catch (error) {
        next(error);
      }
};