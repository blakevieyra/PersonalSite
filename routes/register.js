const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();

router.post('/', async (req, res) => {
    const { name, password } = req.body;

    // Check if the username already exists
    const checkUserQuery = 'SELECT * FROM players WHERE name = ?';
    db.get(checkUserQuery, [name], async (err, row) => {
        if (err) {
            console.error('Error checking user:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        if (row) {
            return res.status(409).json({ error: 'Username already exists' });
        }

        // Proceed to register the user if the username is unique
        try {
            const saltRounds = 10; // Salt rounds for bcrypt
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            const insertQuery = 'INSERT INTO players (name, password) VALUES (?, ?)';
            db.run(insertQuery, [name, hashedPassword], function (err) {
                if (err) {
                    console.error('Error registering user:', err);
                    return res.status(500).json({ error: 'Unable to register user' });
                }
                res.status(201).json({ message: 'User registered successfully', name });
            });
        } catch (error) {
            console.error('Error hashing password:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });
});

module.exports = router;
