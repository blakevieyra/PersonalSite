document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('playerForm');
    if (form) {
        form.addEventListener('submit', function(event) {
            event.preventDefault();
            const playerNameInput = document.getElementById('playerName');
            const playerName = playerNameInput.value.trim();
            if (!playerName) {
                alert("Please enter a valid name.");
                return;
            }

            const players = loadPlayers() || [];
            const currentPlayer = registerOrUpdatePlayer(players, playerName);
            initGames(currentPlayer);
            populateLeaderboard();
            form.reset(); // Reset form after submission
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

function clearLeaderboard() {
    localStorage.removeItem('players');
    const tbody = document.querySelector('#globalLeaderboard tbody');
    tbody.innerHTML = '';
    populateLeaderboard(); // Re-populate to show empty state or updated data
}
function registerOrUpdatePlayer(players, playerName) {
    let currentPlayer = players.find(p => p.name === playerName);
    if (!currentPlayer) {
        currentPlayer = { name: playerName, wins: 0, losses: 0, ties: 0 };
        players.push(currentPlayer);
        savePlayers(players);
    }
    return currentPlayer;
}

function initGames(currentPlayer) {
    try {
        const rockPaperScissors = new RockPaperScissors(currentPlayer, updateGlobalLeaderboard);
        rockPaperScissors.init();

        const hangman = new Hangman(currentPlayer);
        hangman.init();

        const ticTacToe = new TicTacToe();
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
    // Assuming the leaderboard structure is known and consistent
    const existingRows = leaderboard.querySelectorAll('tr').slice(1); // skip header row
    data.forEach((player, index) => {
        if (existingRows[index] && isValidPlayerData(player)) {
            updateLeaderboardRow(existingRows[index], player);
        } else {
            const row = createLeaderboardRow(player);
            leaderboard.appendChild(row);
        }
    });
    // Remove any extra rows
    while (leaderboard.children.length > data.length + 1) { // +1 for the header
        leaderboard.removeChild(leaderboard.lastChild);
    }
}

function updateLeaderboardRow(row, player) {
    const cells = row.querySelectorAll('td');
    cells[0].textContent = player.name;  // Name
    cells[1].textContent = player.wins;  // Wins
    cells[2].textContent = player.losses; // Losses
    cells[3].textContent = player.ties;  // Ties
}

class RockPaperScissors {
    constructor(player, updateGlobalLeaderboard) {
        this.player = player;
        this.updateGlobalLeaderboard = updateGlobalLeaderboard;
        this.buttons = document.querySelectorAll("#rpsButtons button");
        this.wins = 0;
        this.losses = 0;
        this.ties = 0;
        this.chart = null;
        this.chartId = 'rpsChart';
    }

    init() {
        this.setupEventListeners();
        this.setupChart();
    }

    setupEventListeners() {
        this.buttons.forEach(button => {
            button.addEventListener('click', () => {
                const choice = button.getAttribute('data-choice');
                this.playerChoice(choice);
            });
        });
    }

    playerChoice(choice) {
        const choices = ['rock', 'paper', 'scissors'];
        const computerChoice = choices[Math.floor(Math.random() * choices.length)];
        const result = this.determineWinner(choice, computerChoice);
        this.updateStats(result);
        this.displayResult(result, choice, computerChoice);
    }

    determineWinner(player, computer) {
        if (player === computer) {
            return 'tie';
        } else if ((player === 'rock' && computer === 'scissors') ||
                   (player === 'paper' && computer === 'rock') ||
                   (player === 'scissors' && computer === 'paper')) {
            return 'win';
        } else {
            return 'lose';
        }
    }

   updateStats(result) {
       if (result === 'win') {
           this.wins++;
       } else if (result === 'lose') {
           this.losses++;
       } else {
           this.ties++;
       }
       this.updateScoreboard();
       this.updateChart();
       this.updateGlobalLeaderboard({
           wins: this.wins,
           losses: this.losses,
           ties: this.ties
       });
   }

    updateScoreboard() {
        const stats = this.calculateStats();
        document.getElementById('rpsWins').textContent = this.wins;
        document.getElementById('rpsLosses').textContent = this.losses;
        document.getElementById('rpsTies').textContent = this.ties;
        document.getElementById('rpsMean').textContent = stats.mean.toFixed(2);
        document.getElementById('rpsSD').textContent = stats.standardDeviation.toFixed(2);
    }

    calculateStats() {
        const totalGames = this.wins + this.losses + this.ties;
        const mean = totalGames > 0 ? totalGames / 3 : 0;
        const variance = ((Math.pow(this.wins - mean, 2) + Math.pow(this.losses - mean, 2) + Math.pow(this.ties - mean, 2)) / totalGames);
        return {
            mean: mean,
            standardDeviation: Math.sqrt(variance)
        };
    }

    displayResult(result, playerChoice, computerChoice) {
        const userChoiceImg = document.getElementById('userChoiceImg');
        const computerChoiceImg = document.getElementById('computerChoiceImg');
        userChoiceImg.src = `images/${playerChoice}.png`;
        computerChoiceImg.src = `images/${computerChoice}.png`;
        userChoiceImg.style.display = 'inline-block';
        computerChoiceImg.style.display = 'inline-block';
        document.getElementById('result').innerHTML = `${this.capitalizeFirstLetter(result)}!<br>You chose ${playerChoice}. Computer chose ${computerChoice}.`;
    }

    capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    setupChart() {
        const ctx = document.getElementById(this.chartId).getContext('2d');
        this.chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Wins', 'Losses', 'Ties'],
                datasets: [{
                    label: 'Rock, Paper, Scissors Statistics',
                    data: [this.wins, this.losses, this.ties],
                    backgroundColor: ['rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)', 'rgba(255, 206, 86, 0.2)'],
                    borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)'],
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    updateChart() {
        if (this.chart) {
            this.chart.data.datasets.forEach((dataset) => {
                dataset.data = [this.wins, this.losses, this.ties];
            });
            this.chart.update();
        }
    }
}
class Hangman {
    constructor() {
        this.wins = 0;
        this.losses = 0;
        this.guessesLeft = 6;
        this.lettersGuessed = [];
        this.correctGuesses = [];
        this.words = {
            easy: [
                { word: "cat", hint: "A small domesticated carnivorous mammal with soft fur" },
                { word: "dog", hint: "A domesticated carnivorous mammal with four legs and a tail" },
                { word: "house", hint: "A building for human habitation" },
                { word: "ball", hint: "A round object that can be thrown, kicked, or hit" },
                { word: "book", hint: "A written or printed work consisting of pages glued or sewn together along one side and bound in covers" },
                { word: "sun", hint: "The star around which the earth orbits" },
                { word: "tree", hint: "A woody perennial plant, typically having a single stem or trunk growing to a considerable height and bearing lateral branches at some distance from the ground." },
                { word: "cup", hint: "A small bowl-shaped container for drinking from, typically having a handle" },
                { word: "cake", hint: "An item of soft, sweet food made from a mixture of flour, fat, eggs, sugar, and other ingredients, baked and sometimes iced or decorated" },
                { word: "bird", hint: "A warm-blooded egg-laying vertebrate distinguished by the possession of feathers, wings, and a beak" }
            ],
            medium: [
                { word: "computer", hint: "An electronic device for processing data" },
                { word: "table", hint: "A piece of furniture with a flat top and one or more legs" },
                { word: "guitar", hint: "A stringed musical instrument played by plucking or strumming" },
                { word: "painting", hint: "A picture or design made using paint" },
                { word: "piano", hint: "A large keyboard musical instrument" },
                { word: "garden", hint: "A piece of ground, often near a house, used for growing flowers, fruit, or vegetables" },
                { word: "mountain", hint: "A large natural elevation of the earth's surface rising abruptly from the surrounding level; a large steep hill" },
                { word: "river", hint: "A large natural stream of water flowing in a channel to the sea, a lake, or another such stream" },
                { word: "camera", hint: "An optical instrument for recording or capturing images, which may be stored locally, transmitted to another location, or both" },
                { word: "movie", hint: "A story or event recorded by a camera as a set of moving images and shown in a theater or on television; a motion picture" }
            ],
            hard: [
                { word: "perplexity", hint: "State of being bewildered or puzzled" },
                { word: "paradox", hint: "A seemingly contradictory statement that may nonetheless be true" },
                { word: "labyrinthine", hint: "Complicated and confusing, like a labyrinth" },
                { word: "serendipity", hint: "The occurrence and development of events by chance in a happy or beneficial way" },
                { word: "quixotic", hint: "Exceedingly idealistic; unrealistic and impractical" },
                { word: "antediluvian", hint: "Of or belonging to the time before the biblical Flood" },
                { word: "ephemeral", hint: "Lasting for a very short time" },
                { word: "capricious", hint: "Given to sudden and unaccountable changes of mood or behavior" },
                { word: "ubiquitous", hint: "Present, appearing, or found everywhere" },
                { word: "indefatigable", hint: "Persisting tirelessly" }
            ]
        };
        this.selectedWord = null;
        this.chartId = 'hangmanChart';
        this.chart = null;
        this.letterInput = document.getElementById('letterInput');
        this.guessButton = document.getElementById('guessButton');
        this.previousWords = []; // Initialize here correctly
        this.availableLetters = 'abcdefghijklmnopqrstuvwxyz'.split('');
        this.computerGuessesLeft = 6; // Initialize computer guesses left
        this.computerLettersGuessed = []; // Initialize computer letters guessed
        this.setDifficulty('easy'); // Set default difficulty to easy
        this.init();
    }

   selectRandomWord(difficulty) {
    const wordOptions = this.words[difficulty];
    if (wordOptions && wordOptions.length > 0) {
        return wordOptions[Math.floor(Math.random() * wordOptions.length)];
    } else {
        console.error(`No word options found for difficulty "${difficulty}"`);
        return { word: "", hint: "" }; // Return a default object or handle the situation accordingly
    }
}

    setDifficulty(level) {
        switch (level) {
            case 'easy':
                this.wordsList = this.words.easy;
                this.guessesLeft = 10;
                break;
            case 'medium':
                this.wordsList = this.words.medium;
                this.guessesLeft = 7;
                break;
            case 'hard':
                this.wordsList = this.words.hard;
                this.guessesLeft = 5;
                break;
            default:
                this.wordsList = this.words.medium; // Default to medium difficulty
                this.guessesLeft = 7;
                break;
        }
    }

    generateRandomLetter() {
        // Generate a random letter from available letters not yet guessed to improve efficiency
        const unguessedLetters = this.availableLetters.filter(l => !this.lettersGuessed.includes(l));
        if (unguessedLetters.length > 0) {
            const randomIndex = Math.floor(Math.random() * unguessedLetters.length);
            return unguessedLetters[randomIndex];
        }
        return null; // Return null if no letters are left to guess
    }

    checkIfAllLettersGuessed() {
        return this.selectedWord.word.split('').every(letter => this.lettersGuessed.includes(letter));
    }


    attachEventListeners() {
        this.guessButton.addEventListener('click', () => {
            const letter = this.letterInput.value.toLowerCase();
            this.letterInput.value = ''; // Clear input after guess
            this.guessLetter(letter);
            this.computerGuess(); // Trigger computer's turn after user's guess
        });

        document.getElementById('setDifficultyButton').addEventListener('click', () => {
            const difficulty = document.getElementById('difficulty').value;
            this.init(difficulty);
        });
    }

    resetGame() {
        this.guessesLeft = 6;
        this.lettersGuessed = [];
        this.correctGuesses = [];
        this.computerGuessesLeft = 6; // Reset computer guesses left
        this.computerLettersGuessed = []; // Reset computer letters guessed
        this.setupGame();
        this.updateScoreboard();
    }

    setupGame(difficulty) {
    this.selectedWord = this.selectRandomWord(difficulty);
    this.displayWord();
}

init(difficulty = 'easy') {
    this.setDifficulty(difficulty);
    this.resetGame();
    this.setupChart();
    this.attachEventListeners();
}
     guessLetter(letter) {
        if (!/[a-z]/i.test(letter)) {
            alert("Please enter a valid letter.");
            return;
        }
        if (this.lettersGuessed.includes(letter)) {
            alert("You have already guessed that letter.");
            return;
        }
        this.lettersGuessed.push(letter);
        if (this.selectedWord.word.includes(letter)) {
            this.correctGuesses.push(letter);
        } else {
            this.guessesLeft--;
        }
        this.updateWordDisplay();
        this.checkGameEnd();
    }

    computerGuess() {
        if (this.guessesLeft > 0 && !this.checkIfAllLettersGuessed()) {
            const intervalId = setInterval(() => {
                if (this.computerGuessesLeft > 0 && this.availableLetters.length > 0) {
                    const letter = this.generateRandomLetter();
                    if (letter && !this.lettersGuessed.includes(letter)) {
                        this.lettersGuessed.push(letter);
                        this.computerLettersGuessed.push(letter);
                        this.computerGuessesLeft--;
                        this.updateComputerDisplay();
                        if (!this.selectedWord.word.includes(letter)) {
                            // Check if any letters are left to guess before deciding to end the game
                            if (this.computerGuessesLeft === 0 || this.checkIfAllLettersGuessed()) {
                                clearInterval(intervalId);
                                this.handleGameEnd('Computer');
                            }
                        }
                    }
                } else {
                    clearInterval(intervalId);
                    this.handleGameEnd('Computer');
                }
            }, 1000); // Adjust the interval time as needed
        }
    }

    handleGameEnd(winner) {
        if (winner === 'Computer') {
            alert('Computer has guessed the word!');
            this.losses++;
            this.resetGame();
        } else {
            this.checkGameEnd();
        }
    }

    checkGameEnd() {
        if (this.guessesLeft <= 0) {
            this.losses++;
            this.resetGame();
        } else if (this.selectedWord.word.split('').every(letter => this.correctGuesses.includes(letter))) {
            this.wins++;
            this.resetGame();
        }
        this.updateScoreboard();
    }

    displayWord() {
        let display = this.selectedWord.word.split('').map(letter => this.correctGuesses.includes(letter) ? letter : "_").join(' ');
        document.getElementById("wordDisplay").textContent = display;
        document.getElementById("guessesLeft").textContent = this.guessesLeft;
        document.getElementById("lettersGuessed").textContent = this.lettersGuessed.join(", ");
        document.getElementById("hintText").textContent = this.selectedWord.hint;
    }

    updateWordDisplay() {
        this.displayWord();
    }

    updateScoreboard() {
        document.getElementById("hangmanWins").textContent = this.wins;
        document.getElementById("hangmanLosses").textContent = this.losses;
        // Update the chart after updating the scoreboard
        this.setupChart();
    }

    setupChart() {
        const ctx = document.getElementById(this.chartId).getContext('2d');
        // Check if the chart instance already exists
        if (this.chart) {
            this.chart.destroy(); // Destroy the existing chart
        }
        this.chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Wins', 'Losses'],
                datasets: [{
                    label: 'Hangman Statistics',
                    data: [this.wins, this.losses],
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(54, 162, 235, 0.2)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
}


class TicTacToe {
    constructor() {
        this.cells = document.querySelectorAll("#ticTacToeBoard button");
        this.playerWins = 0;
        this.computerWins = 0;
        this.ties = 0;
        this.currentPlayer = 'X';
        this.gameBoard = Array(9).fill('');
        this.chart = null;
        this.chartId = 'ticTacToeChart';
        this.gameOver = false;
    }

    init() {
    this.setupBoard();
    this.setupChart();
    this.updateScoreboard();
    if (this.currentPlayer === 'O') {
        setTimeout(() => {
            this.computerMove();
        }, 1000);
    }
}

resetGame() {
    this.currentPlayer = 'X';
    this.gameBoard = Array(9).fill('');
    this.cells.forEach(cell => cell.textContent = '');
    this.gameOver = false;
    setTimeout(() => {
        document.getElementById('ticTacToeResult').textContent = '';
        if (this.currentPlayer === 'O') {
            this.computerMove();
        }
    }, 2000);
}

    playerMove(index) {
        if (!this.gameOver && this.gameBoard[index] === '') {
            this.gameBoard[index] = this.currentPlayer;
            this.cells[index].textContent = this.currentPlayer;

            if (this.checkWinner(this.currentPlayer)) {
                this.handleGameEnd(this.currentPlayer);
            } else if (!this.gameBoard.includes('')) {
                this.handleGameEnd('tie');
            } else {
                this.switchPlayer();
                if (this.currentPlayer === 'O') {
                    setTimeout(() => {
                        this.computerMove();
                    }, 1000);
                }
            }
        }
    }

    computerMove() {
        if (!this.gameOver) {
            let availableMoves = this.gameBoard.reduce((acc, cell, index) => {
                if (cell === '') acc.push(index);
                return acc;
            }, []);
            if (availableMoves.length > 0) {
                let randomIndex = Math.floor(Math.random() * availableMoves.length);
                let computerIndex = availableMoves[randomIndex];
                this.gameBoard[computerIndex] = this.currentPlayer;
                this.cells[computerIndex].textContent = this.currentPlayer;
                if (this.checkWinner(this.currentPlayer)) {
                    this.handleGameEnd(this.currentPlayer);
                } else if (!this.gameBoard.includes('')) {
                    this.handleGameEnd('tie');
                } else {
                    this.switchPlayer();
                }
            }
        }
    }

    switchPlayer() {
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
    }

    checkWinner(player) {
        const winningCombos = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6] // Diagonals
        ];
        return winningCombos.some(combo => combo.every(index => this.gameBoard[index] === player));
    }

    handleGameEnd(winner) {
    let resultMessage;
    if (winner === 'X') {
        this.playerWins++;
        resultMessage = "You win!";
    } else if (winner === 'O') {
        this.computerWins++;
        resultMessage = "Computer wins!";
    } else {
        this.ties++;
        resultMessage = "It's a tie!";
    }
    document.getElementById('ticTacToeResult').textContent = resultMessage;
    this.updateScoreboard();
    this.gameOver = true;
}
    setupChart() {
        const ctx = document.getElementById(this.chartId).getContext('2d');
        if (this.chart) {
            this.chart.destroy();
        }
        this.chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Player Wins', 'Computer Wins', 'Ties'],
                datasets: [{
                    label: 'Tic Tac Toe Statistics',
                    data: [this.playerWins, this.computerWins, this.ties],
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 206, 86, 0.2)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    updateScoreboard() {
        document.getElementById('playerWins').textContent = this.playerWins;
        document.getElementById('computerWins').textContent = this.computerWins;
        document.getElementById('ties').textContent = this.ties;
        this.updateChart();
    }

    updateChart() {
        if (this.chart) {
            this.chart.data.datasets[0].data = [this.playerWins, this.computerWins, this.ties];
            this.chart.update();
        }
    }
setupBoard() {
    const board = document.getElementById('ticTacToeBoard'); // Assuming your buttons are within this container
    board.addEventListener('click', (event) => {
        const index = Array.from(this.cells).indexOf(event.target);
        if (index !== -1) {
            this.playerMove(index);
        }
    });
}
}
