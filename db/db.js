const sqlite3 = require('sqlite3').verbose();

// Function to setup the database and return the db object
function setupDatabase() {
  const db = new sqlite3.Database('./players.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
      console.error('Error opening database ' + err.message);
      throw err;  // Depending on your error handling strategy, you might want to handle this differently
    }
  });

  createTables(db);
  return db;
}

// Function to create necessary tables
function createTables(db) {
  const query = `
    CREATE TABLE IF NOT EXISTS players (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        wins INTEGER DEFAULT 0,
        losses INTEGER DEFAULT 0,
        ties INTEGER DEFAULT 0,
        performance REAL DEFAULT 0,
        date DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TRIGGER update_performance AFTER UPDATE OF wins, losses ON players
    BEGIN
        UPDATE players
        SET performance =
            CASE
                WHEN (NEW.wins + NEW.losses) = 0 THEN 0 -- Avoid division by zero
                ELSE (NEW.wins * 1.0) / (NEW.wins + NEW.losses) * 100
            END
        WHERE id = NEW.id;
    END;
`;

  db.run(query, (err) => {
    if (err) {
      console.error('Error creating table ' + err.message);
    }
  });
}

// Export the database setup function
module.exports = setupDatabase;
