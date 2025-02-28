
const Employee = require('../models/Employee');
const multer = require('multer');
const fs = require('fs');
const path = require('path');


// Set up storage engine
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = 'uploads/employees';
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

        const employees = await Employee.find();

        res.status(201).json({ data: employees });
    } catch (error) {
        next(error);
    }
};

exports.getOne = async (req, res, next) => {
    try {
        const { id } = req.params;
    
        // Find the employee record by ID
        const employee = await Employee.findById(id);
    
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }
    
        res.status(200).json({ data: employee });
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
        const { name, title, profile } = req.body;
        const imagePath = req.file ? req.file.path : null;


        try {
            // Create a new Game document
            const employee = new Employee({
                name,
                title,
                profile,
                imagePath: imagePath,
            });
        
            // Save the Employee document to the database
            await employee.save();

            res.status(201).json({
                message: 'File uploaded and data saved successfully',
                data: employee
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
        const { name, title, profile } = req.body;

        const employee = await Employee.findById(id);

        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        if( req.file ) {
            const existingImagePath = path.resolve(employee.imagePath);
    
            // Delete the existing image if it exists
            if (fs.existsSync(existingImagePath)) {
                fs.unlinkSync(existingImagePath); // Delete the file
            }
    
            // Update the employee with the new image path
            employee.imagePath = `uploads/employees/${req.file.filename}`;
        }

        try {

             // Update the employee record with the new data
            employee.name = name || employee.name;
            employee.title = title || employee.title;
            employee.profile = profile || employee.profile;

            // Save the updated employee record
            await employee.save();

            res.status(201).json({
                message: 'File uploaded and data saved successfully',
                data: employee
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
        const employee = await Employee.findById(id);
    
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        const imagePath = path.resolve(employee.imagePath);
        // Remove the image file from the server
    
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath); // Delete the file
        }
    
        // Delete the employee record from MongoDB
        await Employee.findByIdAndDelete(id);
    
        res.status(200).json({ message: 'Employee deleted successfully' });
      } catch (error) {
        next(error);
      }
};