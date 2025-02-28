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
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204,
};


// Middleware
app.use(cors(corsOptions));
// app.use(bodyParser.urlencoded({ limit: '10mb', extended: false }));
// app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());

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
