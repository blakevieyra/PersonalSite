const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = 8080;

// Configure CORS correctly
app.use(cors({
    origin: 'http://18.189.252.60:8080'  // Assuming your client is served from this URL
}));

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files - Assuming the static files are located in a folder named 'html' within the same directory as your server script
app.use('/html', express.static('html'));

// Open a database connection
let db = new sqlite3.Database('./players.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
        console.error('Error opening database ' + err.message);
    } else {
        db.run('CREATE TABLE IF NOT EXISTS players(' +
            'id INTEGER PRIMARY KEY AUTOINCREMENT,' +
            'name TEXT NOT NULL UNIQUE,' +
            'wins INTEGER DEFAULT 0,' +
            'losses INTEGER DEFAULT 0,' +
            'ties INTEGER DEFAULT 0)', (err) => {
                if (err) {
                    console.error('Error creating table ' + err.message);
                }
            });
    }
});

// Routes
app.post('/register', (req, res) => {
    const { name } = req.body;
    if (!name) {
        return res.status(400).send('Name is required');
    }

    db.run('INSERT INTO players (name) VALUES (?)', [name], function (err) {
        if (err) {
            res.status(400).send(`Error registering player: ${err.message}`);
        } else {
            res.status(201).send({ id: this.lastID, name, wins: 0, losses: 0, ties: 0 });
        }
    });
});

app.get('/leaderboard', (req, res) => {
    db.all('SELECT * FROM players ORDER BY wins DESC', [], (err, rows) => {
        if (err) {
            res.status(400).send(`Error fetching players: ${err.message}`);
        } else {
            res.status(200).send(rows);
        }
    });
});

app.put('/update', (req, res) => {
    const { id, wins, losses, ties } = req.body;
    db.run('UPDATE players SET wins = ?, losses = ?, ties = ? WHERE id = ?', [wins, losses, ties, id], function (err) {
        if (err) {
            res.status(400).send(`Error updating player: ${err.message}`);
        } else {
            res.status(200).send({ id, wins, losses, ties });
        }
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
