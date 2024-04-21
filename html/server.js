const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Middleware to parse JSON bodies

// In-memory "database" for simplicity
let players = [];

// Route to register a new player
app.post('/register', (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).send('Name is required');
    
    let player = players.find(p => p.name === name);
    if (!player) {
        player = { name, wins: 0, losses: 0, ties: 0 };
        players.push(player);
    }
    res.status(201).send(player);
});

// Route to get the leaderboard
app.get('/leaderboard', (req, res) => {
    players.sort((a, b) => b.wins - a.wins); // Sort by wins
    res.status(200).send(players);
});

// Route to update player stats
app.put('/update', (req, res) => {
    const { name, wins, losses, ties } = req.body;
    const player = players.find(p => p.name === name);
    
    if (player) {
        player.wins = wins;
        player.losses = losses;
        player.ties = ties;
        res.status(200).send(player);
    } else {
        res.status(404).send('Player not found');
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack); // Log error stack for debugging
    res.status(500).send('Something broke!'); // Send generic error message to client
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
