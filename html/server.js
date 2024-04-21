const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json()); // Middleware to parse JSON bodies

// In-memory "database" for simplicity
let players = [];

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

app.get('/leaderboard', (req, res) => {
    players.sort((a, b) => b.wins - a.wins); // Sort by wins
    res.status(200).send(players);
});

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

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
