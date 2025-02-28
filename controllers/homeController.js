
const Home = require('../models/Home');


exports.save = async (req, res, next) => {
    const { id, home } = req.body;

    try {

        if (id) {
            // Update existing document
            const updatedHome = await Home.findByIdAndUpdate(id, home, { new: true });
            if (updatedHome) {
                return res.status(200).json({ message: 'Home content updated successfully', home: updatedHome });
            } else {
                return res.status(404).json({ message: 'Home content not found' });
            }
        } else {
            // Create new document
            const newHome = new Home(home);
            await newHome.save();
            return res.status(201).json({ message: 'Home content created successfully', home: newHome });
        }
    } catch (error) {
        next(error);
    }
};


exports.get = async (req, res, next) => {
    try {

        const home = await Home.findOne();

        res.status(201).json({ data: home });
    } catch (error) {
        next(error);
    }
};