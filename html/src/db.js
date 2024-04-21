// Import the sql.js library
const SQL = require('sql.js');

// Create a new database in memory
const db = new SQL.Database();

// Create a new table
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS players (
    id INTEGER PRIMARY KEY,
    data TEXT
  )
`;
db.run(createTableQuery);

// Insert some data into the table
const insertDataQuery = `
  INSERT INTO players (data) VALUES (?)
`;
// Assuming players data is stored in a variable named `players`
const playersJSON = JSON.stringify(players);
db.run(insertDataQuery, [playersJSON]);

// Query the data from the table
const query = 'SELECT data FROM players WHERE id = 1'; // Assuming there's only one row for players data
const results = db.exec(query);

// Log the results to the console
console.log(results);

// Update Score in the Database
const updateQuery = `UPDATE players SET wins = ?, losses = ?, ties = ? WHERE name = ?`;
db.run(updateQuery, [wins, losses, ties, name]);
