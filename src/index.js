import Player from './Player.js';
import Hangman from './Hangman.js';
import TicTacToe from './TicTacToe.js';
import RockPaperScissors from './RockPaperScissors.js';

document.addEventListener('DOMContentLoaded', function () {
    setupEventHandlers();
    handleScroll();  
    window.addEventListener('scroll', handleScroll);
});

function setupEventHandlers() {
    const registerForm = document.getElementById('registerForm');
    registerForm?.addEventListener('submit', handleRegisterSubmit);

    const playerForm = document.getElementById('loginForm');
    playerForm?.addEventListener('submit', handlePlayerSubmit);
}

document.getElementById('loginForm').addEventListener('submit', handleLoginSubmit);
document.getElementById('registerForm').addEventListener('submit', handleRegisterSubmit);

// Function to handle login form submission
async function handleLoginSubmit(event) {
    event.preventDefault();
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value.trim();


    if (!username || !password) {
        alert("Please enter both a username and a password.");
        return;
    }

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            const playerData = await response.json(); // Assume playerData includes wins, losses, and performance
            const player = new Player(username, playerData); // Create a new Player object with the fetched data

            console.log(`Login successful for ${player.username}`); // Example usage of player object
            sessionStorage.setItem('currentPlayer', JSON.stringify(player)); // Optionally store player data

            alert("Login successful!");
            event.target.reset(); // Reset the form
            populateLeaderboard();
            initGames(player);
            hideLoginForm(); // Hide login form after successful login
            hideRegisterForm(); // Hide register form after successful login
        } else {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Login failed');
        }
    } catch (error) {
        console.error('Error logging in user:', error);
        alert("An error occurred while logging in. Please try again.");
    }
}

// Function to handle registration form submission
async function handleRegisterSubmit(event) {
    event.preventDefault();
    const username = document.getElementById('registerUsername').value.trim();
    const password = document.getElementById('registerPassword').value.trim();

    if (!username || !password) {
        alert("Please enter both a username and a password.");
        return;
    }

    try {
        const response = await fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            // Assume response might include initial user settings or confirmation
            const initialData = await response.json(); // This might be empty or minimal for a registration endpoint
            const player = new Player(username, initialData); // Create a new Player object with initial data

            console.log(`Registration successful for ${player.username}`);
            sessionStorage.setItem('currentPlayer', JSON.stringify(player)); // Optionally store player data

            alert("Registration successful!");
            event.target.reset(); // Reset the form
            populateLeaderboard();
            initGames(player);
            hideLoginForm(); // Hide login form after successful registration
            hideRegisterForm(); // Hide register form after successful registration
        } else {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Registration failed');
        }
    } catch (error) {
        console.error('Error registering user:', error);
        alert("An error occurred while registering. Please try again.");
    }
}

function getCurrentPlayer() {
    const storedPlayer = sessionStorage.getItem('currentPlayer');
    if (storedPlayer) {
        return new Player(JSON.parse(storedPlayer).username, JSON.parse(storedPlayer));
    }
    return null;  // Handle the case where there is no player logged in or session data is missing
}

async function populateLeaderboard() {
    try {
        // Make an asynchronous request to retrieve player data from the leaderboard route
        const response = await fetch('/leaderboard');

        // Handle response status
        if (!response.ok) {
            throw new Error('Failed to load players');
        }

        // Extract player data from the response JSON
        let players = await response.json();

        // Sort players based on performance (assuming performance is a numeric value)
        players.sort((a, b) => b.performance - a.performance);

        // Get the table body element
        const tbody = document.querySelector('#leaderboard tbody');

        // Clear existing table rows
        tbody.innerHTML = '';

        // Iterate over the sorted player data and create table rows
        players.forEach(player => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${player.name}</td>
                <td>${player.performance}</td>
                <td>${player.wins}</td>
                <td>${player.losses}</td>
                <td>${player.ties}</td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading players:', error);
    }
}

function handleScroll() {
    document.querySelectorAll('.fade-in').forEach(element => {
        if (isInViewport(element)) {
            element.classList.add('visible');
        }
    });
}

function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return rect.top >= 0 && rect.left >= 0 && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth);
}

function hideLoginForm() {
    const loginForm = document.getElementById('playerForm');
    loginForm.style.display = 'none';
}

function hideRegisterForm() {
    const registerForm = document.getElementById('registerForm');
    registerForm.style.display = 'none';
}

function initGames(player) {
    // Assuming each game takes the player as an argument to track scores or settings
    const hangmanGame = new Hangman(player);
    hangmanGame.init('easy');

    const ticTacToeGame = new TicTacToe(player);
    ticTacToeGame.init();

    const rockPaperScissorsGame = new RockPaperScissors(player);
    rockPaperScissorsGame.init();
}


