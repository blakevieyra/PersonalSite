export default class TicTacToe {
    constructor(player) {
        this.player = player;
        this.cells = document.querySelectorAll("#ticTacToeBoard button");
        this.chart = null;
        this.chartId = 'ticTacToeChart';
        this.gameOver = false;
        this.currentPlayer = 'X'; // 'X' is typically the user, and 'O' is the computer
        this.gameBoard = Array(9).fill('');
    }

    init() {
        this.setupBoard();
        this.setupChart();
        this.updateScoreboard();
        if (this.currentPlayer === 'O') {
            setTimeout(() => this.computerMove(), 1000);
        }
    }

    resetGame() {
        console.log('Resetting game...');
        this.currentPlayer = 'X';
        this.gameBoard.fill('');
        this.cells.forEach(cell => cell.textContent = '');
        this.gameOver = false;
        document.getElementById('ticTacToeResult').textContent = '';
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
                    setTimeout(() => this.computerMove(), 1000);
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
            [0, 4, 8], [2, 4, 6]             // Diagonals
        ];
        return winningCombos.some(combo => combo.every(index => this.gameBoard[index] === player));
    }

    handleGameEnd(winner) {
        if (winner === 'X') {
            this.player.updateStats({ wins: this.player.wins + 1 });
            document.getElementById('ticTacToeResult').textContent = "You win!";
        } else if (winner === 'O') {
            this.player.updateStats({ losses: this.player.losses + 1 });
            document.getElementById('ticTacToeResult').textContent = "Computer wins!";
        } else {
            this.player.updateStats({ ties: this.player.ties + 1 });
            document.getElementById('ticTacToeResult').textContent = "It's a tie!";
        }
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
                labels: ['Wins', 'Losses', 'Ties'],
                datasets: [{
                    label: 'Tic Tac Toe Statistics',
                    data: [this.player.wins, this.player.losses, this.player.ties],
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
        document.getElementById('playerWins').textContent = this.player.wins;
        document.getElementById('computerWins').textContent = this.player.losses;  // Assuming computer losses are player's wins
        document.getElementById('ties').textContent = this.player.ties;
        this.updateChart();
    }

    updateChart() {
        if (this.chart) {
            this.chart.data.datasets[0].data = [this.player.wins, this.player.losses, this.player.ties];
            this.chart.update();
        }
    }

    setupBoard() {
        const board = document.getElementById('ticTacToeBoard');
        board.removeEventListener('click', this.handleBoardClick);
        this.handleBoardClick = this.handleBoardClick.bind(this);
        board.addEventListener('click', this.handleBoardClick);
    }

    handleBoardClick(event) {
        if (event.target.tagName === 'BUTTON') {
            const index = Array.from(this.cells).indexOf(event.target);
            if (index !== -1) {
                this.playerMove(index);
            }
        }
    }
};
