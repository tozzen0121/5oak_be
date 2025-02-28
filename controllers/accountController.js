
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

exports.me = async (req, res, next) => {
    try {
        const user = {
            ...req.user, 
            name: `${req.user.firstName} ${req.user.lastName}`
        }

        res.status(201).json({ message: 'User logged in', user });
    } catch (error) {
        next(error);
    }
};

exports.register = async (req, res, next) => {
    const { firstName, lastName, email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            // throw new Error('User already exists');
            return res.status(404).json({ message: 'User already exists' });
        }

        const newUser = new User({
            firstName,
            lastName,
            email,
            password
        });

        await newUser.save();

        res.status(201).json({ message: 'User logged in', user: newUser });
    } catch (err) {
        console.error('Error registering user:', err);
        next(err);
    }
};

exports.login = async (req, res, next) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            // throw new Error('User not found');
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            // throw new Error('Invalid password');
            return res.status(404).json({ message: 'Invalid password' });
        }

        // User authenticated, generate serviceToken (JWT)
        const serviceToken = jwt.sign(
            {
                id: user._id, // Include user ID or other information
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
            },
            JWT_SECRET, // Secret key for signing the token
            { expiresIn: '1h' } // Token expiration time (1 hour in this case)
        );

        res.status(201).json({ message: 'User logged in', user, serviceToken });
    } catch (err) {
        next(err);
    }
};

exports.check = async (req, res, next) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            // throw new Error('User not found');
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            // throw new Error('Invalid password');
            return res.status(404).json({ message: 'Invalid password' });
        }


        res.status(201).json({ message: 'User is valid', data: true });
    } catch (err) {
        next(err);
    }
};