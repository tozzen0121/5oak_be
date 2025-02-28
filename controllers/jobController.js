
const Job = require('../models/Job');


exports.get = async (req, res, next) => {
    try {

        const jobs = await Job.find();

        res.status(201).json({ data: jobs });
    } catch (error) {
        next(error);
    }
};

exports.getOne = async (req, res, next) => {
    try {
        const { id } = req.params;
    
        // Find the Job record by ID
        const jobs = await Job.findById(id);
    
        if (!jobs) {
            return res.status(404).json({ message: 'Job not found' });
        }
    
        res.status(200).json({ data: jobs });
    } catch (error) {
        next(error);
    }
};

exports.save = async (req, res, next) => {
    
    const { name, location, description } = req.body;
    try {
        // Create a new Job document
        const job = new Job({
            name,
            location, 
            description,
        });
    
        // Save the Job document to the database
        await job.save();

        res.status(201).json({
            message: 'Data saved successfully',
            data: job
        });
    } catch (error) {
        next(error);
    }
};

exports.update = async (req, res, next) => {
    // Handle file upload

    const { id } = req.params;
    const { name, location, description } = req.body;

    const job = await Job.findById(id);

    if (!job) {
        return res.status(404).json({ message: 'Job not found' });
    }

    try {

            // Update the Job record with the new data
        job.name = name || job.name;
        job.location = location || job.location;
        job.description = description || job.description;

        // Save the updated Job record
        await job.save();

        res.status(201).json({
            message: 'File uploaded and data saved successfully',
            data: job
        });
    } catch (error) {
        next(error);
    }
};


exports.remove = async (req, res, next) => {
    try {
        const { id } = req.params;
    
        // Find the news record by ID
        const job = await Job.findById(id);
    
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        // Delete the Job record from MongoDB
        await Job.findByIdAndDelete(id);
    
        res.status(200).json({ message: 'Job deleted successfully' });
    } catch (error) {
        next(error);
    }
};