export default class TicTacToe {
    constructor(player) {
        this.player = player;
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
        console.log('Resetting game...');
        this.currentPlayer = 'X'; // Reset the current player to X
        this.gameBoard = Array(9).fill(''); // Clear the game board
        this.cells.forEach(cell => cell.textContent = ''); // Clear the text content of each cell
        this.gameOver = false; // Set game over to false to allow new game to start
        document.getElementById('ticTacToeResult').textContent = ''; // Clear the result text immediately
        if (this.currentPlayer === 'O') {
            setTimeout(() => {
                this.computerMove(); // If the computer should start, trigger its move
            }, 1000);
        }

        // Add the event listener back after resetting the game
        this.setupBoard();
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
    calculateStats() {
        const totalGames = this.wins + this.losses + this.ties;
        const mean = totalGames > 0 ? totalGames / 3 : 0;
        const variance = ((Math.pow(this.wins - mean, 2) + Math.pow(this.losses - mean, 2) + Math.pow(this.ties - mean, 2)) / totalGames);
        return {
            mean: mean,
            standardDeviation: Math.sqrt(variance)
        };
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
        const board = document.getElementById('ticTacToeBoard');

        // Remove any existing event listeners to avoid duplicates
        board.removeEventListener('click', this.handleBoardClick);

        // Bind the current class context to the event handler
        this.handleBoardClick = this.handleBoardClick.bind(this);

        // Add the event listener
        board.addEventListener('click', this.handleBoardClick);
    }
    handleBoardClick(event) {
        // Ensure the clicked element is a button
        if (event.target.tagName === 'BUTTON') {
            const index = Array.from(this.cells).indexOf(event.target);
            if (index !== -1) {
                this.playerMove(index);
            }
        }
    }
}
