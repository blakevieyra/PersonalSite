// // Import the sql.js library
// const SQL = require('sql.js');
// const fs = require('fs');

// // Create a new database in memory
// const db = new SQL.Database();

// // Create a new table
// const createTableQuery = `
//   CREATE TABLE IF NOT EXISTS players (
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     name TEXT,
//     wins INTEGER DEFAULT 0,
//     losses INTEGER DEFAULT 0,
//     ties INTEGER DEFAULT 0
//   )
// `;
// db.run(createTableQuery);

// // Insert some player data into the table
// const players = [
//   { name: 'Alice', wins: 5, losses: 2, ties: 1 },
//   { name: 'Bob', wins: 3, losses: 3, ties: 2 }
// ];

// players.forEach(player => {
//   const insertDataQuery = `
//     INSERT INTO players (name, wins, losses, ties) VALUES (?, ?, ?, ?)
//   `;
//   db.run(insertDataQuery, [player.name, player.wins, player.losses, player.ties]);
// });

// // Query the data from the table
// const query = 'SELECT * FROM players';
// const results = db.exec(query);

// // Log the results to the console
// console.log(results[0].values); // This will log array of arrays with the row data

// // Update Score in the Database
// const updateQuery = `UPDATE players SET wins = ?, losses = ?, ties = ? WHERE name = ?`;
// db.run(updateQuery, [6, 3, 2, 'Alice']); // Example updating Alice's record

// // Save the database to a file
// const data = db.export();
// const buffer = Buffer.from(data);
// fs.writeFileSync('players.sqlite', buffer);
