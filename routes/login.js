const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const { name, password } = req.body;
        // Your login logic here, such as verifying the user's credentials
        const loginQuery = 'SELECT name, password FROM players WHERE name = ? AND password = ?';
        db.all(loginQuery, [name, password], function (err, rows) {
            if (err) {
                console.error('Error logging in user:', err);
                res.status(500).json({ error: 'Internal Server Error' });
            } else {
                if (rows.length > 0) {
                    res.status(200).json({ message: 'Login successful', user: rows[0] });
                } else {
                    res.status(401).json({ error: 'Unauthorized', message: 'Invalid credentials' });
                }
            }
        });
    } catch (error) {
        console.error('Error logging user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
