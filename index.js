require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const methodOverride = require('method-override');

const homeRoutes = require('./routes/homeRoutes');
const accountRoutes = require('./routes/accountRoutes');
const gameRoutes = require('./routes/gameRoutes');
const newsRoutes = require('./routes/newsRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const jobRoutes = require('./routes/jobRoutes');
const contactRoutes = require('./routes/contactRoutes');
const applicantRoutes = require('./routes/applicantRoutes');
const reportRoutes = require('./routes/reportRoutes');
const launchGameRoutes = require('./routes/launchGameRoutes');

const errorHandler = require('./middlewares/errorHandler');

const app = express();



// MongoDB connection
const dbUri = process.env.MONGO_URI || 'mongodb://localhost:27017/5oka';
mongoose.connect(dbUri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log('MongoDB connection error:', err));

// CORS configuration
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        // List of allowed origins
        const allowedOrigins = [
            'https://5oakgames.com',
            'https://www.5oakgames.com',
            'http://localhost:3000',
            'http://localhost:5173',
            'http://localhost:3006'
        ];
        
        if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
            callback(null, true);
        } else {
            callback(null, true); // Allow all origins for now, but log it
            console.warn(`CORS: Request from unlisted origin: ${origin}`);
        }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: false, // Set to false when using multiple origins
    optionsSuccessStatus: 204,
};


// Middleware
app.use(cors(corsOptions));
// Configure body parser with proper limits for file uploads
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(bodyParser.json({ limit: '50mb' }));

// Middleware to handle method override
app.use(methodOverride('_method'));

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// routes
app.use('/api/home', homeRoutes);
app.use('/api/account', accountRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/employee', employeeRoutes);
app.use('/api/job', jobRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/applicant', applicantRoutes);
app.use("/api/reports", reportRoutes);
app.use('/api/launchGames', launchGameRoutes);

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 3006;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
