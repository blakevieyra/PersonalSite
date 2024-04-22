
export default class RockPaperScissors {
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
        if (!userChoiceImg || !computerChoiceImg) {
            console.error("Critical elements are missing for displaying results.");
            return;
        }
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
