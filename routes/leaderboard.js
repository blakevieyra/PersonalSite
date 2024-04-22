const express = require('express');
const router = express.Router();

// Assuming db is properly defined and connected
const loadPlayersFromDB = require('./leaderboard'); // Import the function to fetch players from the external API

// Register route
router.get('/', async (req, res) => {
    try {
        // Load players from the external API
        const playersFromAPI = await loadPlayersFromDB();

        // Assuming db is properly defined and connected
        const retrievePlayersQuery = 'SELECT * FROM players';
        db.all(retrievePlayersQuery, function (err, rows) {
            if (err) {
                console.error('Error retrieving users:', err);
                res.status(500).json({ error: 'Internal Server Error' });
            } else {
                // Combine players from API and database
                const allPlayers = [...playersFromAPI, ...rows];
                res.status(200).json(allPlayers);
            }
        });
    } catch (error) {
        console.error('Error retrieving players:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
