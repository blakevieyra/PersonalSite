document.addEventListener('DOMContentLoaded', function () {
    // Register form submission handling
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async function (event) {
            event.preventDefault();

            const usernameInput = document.getElementById('username');
            const passwordInput = document.getElementById('password');

            const username = usernameInput.value.trim();
            const password = passwordInput.value.trim();

            if (!username || !password) {
                alert("Please enter both a username and a password.");
                return;
            }

            try {
                // Register the user
                await registerUser(username, password);
                alert("Registration successful!");
                // Optionally, redirect the user to a login page or perform other actions
            } catch (error) {
                console.error('Error registering user:', error);
                alert("An error occurred while registering. Please try again.");
            }

            // Clear the form after submission
            registerForm.reset();
        });
    } else {
        console.error('Register form element not found');
    }

    // Player registration form submission handling
    const form = document.getElementById('playerForm');
    if (form) {
        form.addEventListener('submit', async function (event) {
            event.preventDefault();
            const playerNameInput = document.getElementById('playerName');
            const playerName = playerNameInput.value.trim();
            if (!playerName) {
                alert("Please enter a valid name.");
                return;
            }

            try {
                const players = await loadPlayersFromDB(db);
                const currentPlayer = registerOrUpdatePlayer(players, playerName);
                initGames(currentPlayer);
                populateLeaderboard();
                form.reset(); // Reset form after submission
            } catch (error) {
                console.error('Error:', error);
            }
        });
    } else {
        console.error('Form element not found');
    }

    document.getElementById('clearLeaderboard').addEventListener('click', clearLeaderboard);
});

// Function to handle scrolling event
function handleScroll() {
    const fadeIns = document.querySelectorAll('.fade-in');
    fadeIns.forEach(element => {
        if (isInViewport(element)) {
            element.classList.add('visible');
        }
    });
}

function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// Attach the handleScroll function to the scroll event listener
window.addEventListener('scroll', handleScroll);

// Initial check on page load
handleScroll();

async function clearLeaderboard() {
    try {
        // Clear players data from the database
        await clearPlayersFromDB(db);
        const tbody = document.querySelector('#globalLeaderboard tbody');
        tbody.innerHTML = '';
        populateLeaderboard(); // Re-populate to show empty state or updated data
    } catch (error) {
        console.error('Error:', error);
    }
}

function registerOrUpdatePlayer(players, playerName) {
    let currentPlayer = players.find(p => p.name === playerName);
    if (!currentPlayer) {
        currentPlayer = { name: playerName, wins: 0, losses: 0, ties: 0 };
        players.push(currentPlayer);
        savePlayersToDB(players);
    }
    return currentPlayer;
}

async function savePlayersToDB(players) {
    const playersJSON = JSON.stringify(players);
    const updateQuery = `UPDATE players SET data = ? WHERE id = 1`; // Assuming there's only one row for players data

    try {
        await db.run(updateQuery, [playersJSON]);
        console.log('Player data saved to the database successfully.');
    } catch (error) {
        console.error('Error saving player data to the database:', error);
    }
}

async function loadPlayersFromDB(db) {
    const query = `SELECT data FROM players WHERE id = 1`; // Assuming there's only one row for players data

    try {
        const row = await db.get(query);
        if (row) {
            const playersJSON = row.data;
            const players = JSON.parse(playersJSON);
            console.log('Player data loaded from the database successfully.');
            return players;
        } else {
            console.log('No player data found in the database.');
            return []; // Return empty array if no data found
        }
    } catch (error) {
        console.error('Error loading player data from the database:', error);
        throw error; // Re-throw the error to handle it in the calling function
    }
}

async function clearPlayersFromDB(db) {
    const deleteQuery = `DELETE FROM players WHERE id = 1`; // Assuming there's only one row for players data

    try {
        await db.run(deleteQuery);
        console.log('Player data cleared from the database.');
    } catch (error) {
        console.error('Error clearing player data from the database:', error);
        throw error; // Re-throw the error to handle it in the calling function
    }
}
function updateScoreInDB(name, wins, losses, ties) {
    const updateQuery = `UPDATE players SET wins = ?, losses = ?, ties = ? WHERE name = ?`;

    db.run(updateQuery, [wins, losses, ties, name], function (err) {
        if (err) {
            // Handle error
            console.error('Error updating score in the database:', err);
        } else {
            console.log('Score updated in the database successfully.');
        }
    });
}
const Hangman = require('./Hangman');
const RockPaperScissors = require('./RockPaperScissors');
const TicTacToe = require('./TicTacToe');

// Your existing code...

function initGames(currentPlayer) {
    try {
        const hangman = new Hangman(currentPlayer);
        hangman.init('easy');

        const rockPaperScissors = new RockPaperScissors(currentPlayer);
        rockPaperScissors.init();

        const ticTacToe = new TicTacToe(currentPlayer);
        ticTacToe.init();
    } catch (error) {
        console.error('Failed to initialize games:', error);
        displayError('Failed to start some games, please try again.'); // Show user-friendly error
    }
}


function displayError(message) {
    const errorContainer = document.getElementById('errorContainer');
    errorContainer.textContent = message;
    errorContainer.style.display = 'block';
}


function populateLeaderboard() {
    const players = loadPlayers() || [];
    const tbody = document.getElementById('globalLeaderboard').getElementsByTagName('tbody')[0];
    tbody.innerHTML = "";

    players.sort((a, b) => b.wins - a.wins);

    players.forEach(player => {
        const row = tbody.insertRow();
        row.insertCell(0).textContent = player.name;
        row.insertCell(1).textContent = player.wins;
        row.insertCell(2).textContent = player.losses;
        row.insertCell(3).textContent = player.ties;
    });
}

function savePlayers(players) {
    localStorage.setItem('players', JSON.stringify(players));
}

function loadPlayers() {
    const savedData = localStorage.getItem('players');
    if (savedData) {
        return JSON.parse(savedData);
    } else {
        return [];
    }
}

function updateScore(name, wins, losses, ties) {
    fetch('http://localhost:3000/update', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, wins, losses, ties })
    }).then(response => {
        if (response.ok) return response.json();
        throw new Error('Failed to update score');
    })
    .then(data => {
        console.log('Score update successful:', data);
        updateGlobalLeaderboard(data); // Refresh leaderboard with new data
    })
    .catch(error => console.error('Error:', error));
}

let lastLeaderboardData = [];

function updateGlobalLeaderboard(data) {
    const leaderboard = document.getElementById('globalLeaderboard');
    if (!leaderboard) {
        console.error('Global leaderboard element not found');
        return;
    }

    // Compare new data with last known data
    if (JSON.stringify(lastLeaderboardData) === JSON.stringify(data)) {
        console.log('No leaderboard changes detected, update skipped');
        return; // Skip update if data has not changed
    }

    // Update last known data
    lastLeaderboardData = data;

    // Efficiently update the DOM
    updateLeaderboardDOM(leaderboard, data);
}
function updateLeaderboardDOM(leaderboard, data) {
    // Log data to debug its structure
    console.log("Data received:", data);

    // Convert NodeList to an Array to use the slice method
    const existingRows = Array.from(leaderboard.querySelectorAll('tr')).slice(1); // Skip header row

    // Check if data is an array
    if (Array.isArray(data)) {
        // If data is an array, treat it as multiple players
        data.forEach((player, index) => {
            if (existingRows[index] && isValidPlayerData(player)) {
                // Update existing row if it exists and player data is valid
                updateLeaderboardRow(existingRows[index], player);
            } else {
                // Create a new row for the player and append it to the leaderboard
                const row = createLeaderboardRow(player);
                leaderboard.appendChild(row);
            }
        });

        // Remove any extra rows
        while (leaderboard.children.length > data.length + 1) { // +1 for the header
            leaderboard.removeChild(leaderboard.lastChild);
        }
    } else if (isValidPlayerData(data)) {
        // If data is a single player object and it is valid, update the first row
        if (existingRows[0]) {
            updateLeaderboardRow(existingRows[0], data);
        } else {
            const row = createLeaderboardRow(data);
            leaderboard.appendChild(row);
        }

        // Remove any extra rows
        while (leaderboard.children.length > 2) { // Remove all rows except the header
            leaderboard.removeChild(leaderboard.lastChild);
        }
    } else {
        console.error("Invalid data for leaderboard:", data);
    }
}

function isValidPlayerData(player) {
    // Example validation, adjust according to your data structure
    return player && typeof player === 'object' && 'name' in player && 'wins' in player && 'losses' in player && 'ties' in player;
}

function updateLeaderboardRow(row, player) {
    const cells = row.querySelectorAll('td');
    cells[0].textContent = player.name;  // Name
    cells[1].textContent = player.wins;  // Wins
    cells[2].textContent = player.losses; // Losses
    cells[3].textContent = player.ties;  // Ties
}


