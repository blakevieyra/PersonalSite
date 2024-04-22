const express = require('express');
const router = express.Router();

// Assuming you have implemented user authentication and retrieved the authenticated player's ID
const authenticatedPlayerId = req.user.id; // Example: Retrieve the authenticated player's ID from the request

// Register route
router.put('/', (req, res) => {
    try {
        // Assuming req.body contains updated player scores
        const { playerId, wins, loss, ties, performance } = req.body;

        // Check if the authenticated player ID matches the player ID in the request
        if (authenticatedPlayerId !== playerId) {
            return res.status(403).json({ error: 'Forbidden', message: 'You are not authorized to update this player\'s scores' });
        }

        const updatePlayerScoreQuery = `UPDATE players SET wins = ?, loss = ?, ties = ?, performance = ? WHERE id = ?`;

        db.run(updatePlayerScoreQuery, [wins, loss, ties, performance, playerId], function (err) {
            if (err) {
                console.error('Error updating player scores:', err);
                res.status(500).json({ error: 'Internal Server Error' });
            } else {
                res.status(200).json({ message: 'Player scores updated successfully' });
            }
        });
    } catch (error) {
        console.error('Error updating player scores:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
