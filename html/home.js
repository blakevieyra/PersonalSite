
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

function clearLeaderboard() {
    localStorage.removeItem('players');
    const tbody = document.querySelector('#leaderboard tbody');
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
    // Assuming each game class can accept the currentPlayer object
    const rockPaperScissors = new RockPaperScissors(currentPlayer);
    rockPaperScissors.init();

    const hangman = new Hangman(currentPlayer);
    hangman.init();

    const ticTacToe = new TicTacToe(currentPlayer);
    ticTacToe.init();
}

function populateLeaderboard() {
    const players = loadPlayers() || [];
    const tbody = document.getElementById('leaderboard').getElementsByTagName('tbody')[0];
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

class RockPaperScissors {
    constructor() {
         this.player = player;
        this.buttons = document.querySelectorAll("#rpsButtons button");
          this.wins = 0;
        this.losses = 0;
        this.ties = 0;
        this.chart = null;
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
        this.player.wins++;
    } else if (result === 'lose') {
        this.player.losses++;
    } else {
        this.player.ties++;
    }
    this.updateScoreboard();
    this.updateChart();
    this.updateGlobalLeaderboard();
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
        const ctx = document.getElementById('rpsChart').getContext('2d');
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
        this.words = [
            { word: "elephant", hint: "A large mammal with a long trunk" },
            { word: "computer", hint: "A device for processing data" },
            { word: "airplane", hint: "Flies in the sky" },
            { word: "javascript", hint: "Programming language" },
            { word: "banana", hint: "Yellow fruit with a peel" },
            { word: "mountain", hint: "Large landform that rises above the surrounding land" }
        ];
        this.selectedWord = null;
        this.chart = null;
   this.letterInput = document.getElementById('letterInput');
        this.guessButton = document.getElementById('guessButton'); // Ensure this ID is in your HTML
    }
    init() {
        this.resetGame();
        this.setupChart();
        this.attachEventListeners();
    }
    attachEventListeners() {
        this.guessButton.addEventListener('click', () => {
            const letter = this.letterInput.value.toLowerCase();
            this.letterInput.value = ''; // Clear input after guess
            this.guessLetter(letter);
        });
    }

    setupGame() {
        this.selectedWord = this.words[Math.floor(Math.random() * this.words.length)];
        this.displayWord();
    }

    resetGame() {
        this.guessesLeft = 6;
        this.lettersGuessed = [];
        this.correctGuesses = [];
        this.setupGame();
        this.updateScoreboard();
    }

    guessLetter(letter) {
    if (letter.length === 1 && /[a-z]/i.test(letter) && !this.lettersGuessed.includes(letter)) {
        this.lettersGuessed.push(letter);
        if (this.selectedWord.word.includes(letter)) {
            this.correctGuesses.push(letter);
            this.updateWordDisplay();
        } else {
            this.guessesLeft--;
        }
        this.checkGameEnd();
    } else {
        alert("Please enter a valid letter that you haven't guessed yet.");
    }
    this.letterInput.value = ''; // Clear input after processing
    this.letterInput.focus(); // Refocus input for next guess
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
    }

    setupChart() {
        const ctx = document.getElementById('hangmanChart').getContext('2d');
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

    updateChart() {
        if (this.chart) {
            this.chart.data.datasets.forEach((dataset) => {
                dataset.data = [this.wins, this.losses];
            });
            this.chart.update();
        }
    }
}
// Check if an element is in the viewport
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// Function to handle scrolling event
function handleScroll() {
    const fadeIns = document.querySelectorAll('.fade-in');
    fadeIns.forEach(element => {
        if (isInViewport(element)) {
            element.classList.add('visible');
        }
    });
}

window.addEventListener('scroll', handleScroll);

// Initial check on page load
handleScroll();

class TicTacToe {
    constructor() {
        this.cells = document.querySelectorAll("#ticTacToeBoard button");
        this.playerWins = 0;
        this.computerWins = 0;
        this.ties = 0;
        this.currentPlayer = 'X';
        this.gameBoard = Array(9).fill('');
        this.chart = null;
    }

    init() {
        this.setupBoard();
        this.setupChart();
        this.updateScoreboard(); // Ensure the scoreboard is initialized correctly
    }

    setupBoard() {
          this.cells.forEach((cell) => {
            cell.addEventListener('click', () => this.playerMove(cell.dataset.index));
        });
    }
   playerMove(index) {
        if (this.gameBoard[index] === '') {
            this.gameBoard[index] = this.currentPlayer;
            this.cells[index].textContent = this.currentPlayer;

            if (this.checkWinner(this.currentPlayer)) {
                const resultText = `${this.currentPlayer} wins!`;
                document.getElementById('ticTacToeResult').textContent = resultText;
                document.getElementById('ticTacToeResult').className = 'win';
                this.updateScoreboard();
                this.resetGame();
            } else if (!this.gameBoard.includes('')) {
                document.getElementById('ticTacToeResult').textContent = "It's a tie!";
                document.getElementById('ticTacToeResult').className = 'tie';
                this.ties++;
                this.updateScoreboard();
                this.resetGame();
            } else {
                this.switchPlayer();
            }
        }
    }

    switchPlayer() {
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
    }

    computerMove() {
        let availableMoves = this.gameBoard.reduce((acc, cell, index) => {
            if (cell === '') acc.push(index);
            return acc;
        }, []);
        if (availableMoves.length > 0) {
            let randomIndex = Math.floor(Math.random() * availableMoves.length);
            let computerIndex = availableMoves[randomIndex];
            this.gameBoard[computerIndex] = this.currentPlayer;
            document.getElementById('ticTacToeBoard').getElementsByTagName('td')[computerIndex].textContent = this.currentPlayer;
            if (this.checkWinner(this.currentPlayer)) {
                document.getElementById('ticTacToeResult').textContent = `${this.currentPlayer} wins!`;
                this.updateScoreboard();
                this.resetGame();
                return;
            }
            if (!this.gameBoard.includes('')) {
                document.getElementById('ticTacToeResult').textContent = "It's a tie!";
                this.ties++;
                this.updateScoreboard();
                this.resetGame();
                return;
            }
            this.switchPlayer();
        }
    }

    checkWinner(player) {
        const winningCombos = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6] // Diagonals
        ];
        return winningCombos.some(combo => combo.every(index => this.gameBoard[index] === player));
    }

    updateScoreboard() {
        document.getElementById('playerWins').textContent = this.playerWins;
        document.getElementById('computerWins').textContent = this.computerWins;
        document.getElementById('ties').textContent = this.ties;
    }

    resetGame() {
        this.currentPlayer = 'X';
        this.gameBoard = Array(9).fill('');
        document.querySelectorAll('#ticTacToeBoard td').forEach(cell => cell.textContent = '');
        setTimeout(() => {
            document.getElementById('ticTacToeResult').textContent = '';
        }, 2000);
    }

    setupChart() {
        const ctx = document.getElementById('ticTacToeChart').getContext('2d');
        this.chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Player Wins', 'Computer Wins', 'Ties'],
                datasets: [{
                    label: 'Tic Tac Toe Game Results',
                    data: [this.playerWins, this.computerWins, this.ties],
                    backgroundColor: [
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(255, 205, 86, 0.2)'
                    ],
                    borderColor: [
                        'rgba(75, 192, 192, 1)',
                        'rgba(255, 99, 132, 1)',
                        'rgba(255, 205, 86, 1)'
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

    updateChart() {
        if (this.chart) {
            this.chart.data.datasets.forEach((dataset) => {
                dataset.data = [this.playerWins, this.computerWins, this.ties];
            });
            this.chart.update();
        }
    }
}

