const express = require('express');
const router = express.Router();

// Middleware to ensure the user is authenticated and to attach the user to the request
router.use((req, res, next) => {
    // Simulating an authentication middleware that sets req.user
    // You would typically integrate actual authentication here
    req.user = { id: 'authenticatedPlayerId' }; // Placeholder for actual authenticated user ID
    next();
});

// Update route for player scores
router.put('/', (req, res) => {
    try {
        const { playerId, wins, losses, ties, performance } = req.body;
        const authenticatedPlayerId = req.user.id; // Retrieve the authenticated player's ID from the request

        // Check if the authenticated player ID matches the player ID in the request
        if (authenticatedPlayerId !== playerId) {
            return res.status(403).json({ error: 'Forbidden', message: 'You are not authorized to update this player\'s scores' });
        }

        const updatePlayerScoreQuery = `UPDATE players SET wins = ?, losses = ?, ties = ?, performance = ? WHERE id = ?`;
        db.run(updatePlayerScoreQuery, [wins, losses, ties, performance, playerId], function (err) {
            if (err) {
                console.error('Error updating player scores:', err);
                res.status(500).json({ error: 'Internal Server Error' });
            } else {
                res.status(200).json({ message: 'Player scores updated successfully' });
            }
        });
    } catch (error) {
        console.error('Error handling request:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
