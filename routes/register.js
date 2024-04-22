const express = require('express');
const router = express.Router();


router.post('/', async (req, res) => {
    try {
        const { name, password } = req.body;
        // Your registration logic here, such as inserting the user into the database
        const insertQuery = 'INSERT INTO players (name, password) VALUES (?, ?)';
        db.run(insertQuery, [name, password], function (err) {
            if (err) {
                console.error('Error registering user:', err);
                res.status(500).json({ error: 'Internal Server Error' });
            } else {
                res.status(201).json({ name, password });
            }
        });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


module.exports = router;