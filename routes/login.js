const bcrypt = require('bcrypt');

router.post('/', async (req, res) => {
    const { name, password } = req.body;

    try {
        // Only retrieve the hash from the database
        const user = await db.get('SELECT name, password FROM players WHERE name = ?', [name]);
        if (user && await bcrypt.compare(password, user.password)) {
            res.status(200).json({ message: 'Login successful', user: { name: user.name } });
        } else {
            res.status(401).json({ error: 'Unauthorized', message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Error logging user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
