const express = require('express');
const router = express.Router();
const db = require('./db'); // Make sure db is promisified or supports promises

// Function to fetch players from the database
async function fetchPlayersFromDatabase() {
    const query = 'SELECT * FROM players';
    return db.all(query); // Assuming db.all returns a promise
}

// Function to load players from an external API
const loadPlayersFromDB = require('./leaderboard');

// Register route
router.get('/', async (req, res) => {
    try {
        const playersFromAPI = await loadPlayersFromDB();
        const playersFromDB = await fetchPlayersFromDatabase();

        const allPlayers = [...playersFromAPI, ...playersFromDB];
        res.status(200).json(allPlayers);
    } catch (error) {
        console.error('Error retrieving players:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
