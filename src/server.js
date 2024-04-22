require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const setupDatabase = require('./db');
const db = setupDatabase();
const port = process.env.PORT || 8080;
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';

const app = express();

// Middleware
app.use(cors({
    origin: corsOrigin
}));
app.use(express.json());
app.use(morgan('tiny'));

// Serve static files
app.use('/html', express.static(path.join(__dirname, 'html', 'dist')));
app.get('/html/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'html', 'dist', 'home.html'));
});

// Routes
app.use('/api/v1/register', require('./routes/register'));
app.use('/api/v1/leaderboard', require('./routes/leaderboard'));
app.use('/api/v1/update', require('./routes/update'));
app.use('/api/v1/login', require('./routes/login'));


// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
