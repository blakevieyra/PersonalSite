export default class Hangman {
    constructor(player) {
        this.player = player;
        this.guessesLeft = 6;
        this.lettersGuessed = [];
        this.correctGuesses = [];
        this.words = {
            easy: [
                { word: "cat", hint: "A small domesticated carnivorous mammal with soft fur" },
                { word: "dog", hint: "A domesticated carnivorous mammal with four legs and a tail" },
                { word: "house", hint: "A building for human habitation" },
                // ... other words
            ],
            medium: [
                { word: "computer", hint: "An electronic device for processing data" },
                // ... other words
            ],
            hard: [
                { word: "perplexity", hint: "State of being bewildered or puzzled" },
                // ... other words
            ]
        };
        this.selectedWord = null;
        this.chartId = 'hangmanChart';
        this.chart = null;
        this.difficulty = 'easy';
        this.init(this.difficulty);
    }

    init(difficulty) {
        this.setDifficulty(difficulty);
        this.resetGame();
        this.setupChart();
        this.attachEventListeners();
    }

    setDifficulty(level) {
        const settings = {
            easy: { guessesLeft: 10 },
            medium: { guessesLeft: 7 },
            hard: { guessesLeft: 5 }
        };
        this.difficulty = level;
        this.guessesLeft = settings[level].guessesLeft;
    }

    selectRandomWord() {
        const wordOptions = this.words[this.difficulty];
        const randomIndex = Math.floor(Math.random() * wordOptions.length);
        return wordOptions[randomIndex];
    }

    resetGame() {
        this.selectedWord = this.selectRandomWord();
        this.lettersGuessed = [];
        this.correctGuesses = [];
        this.updateWordDisplay();
        this.updateScoreboard();
    }

    guessLetter(letter) {
        if (!/[a-z]/i.test(letter) || this.lettersGuessed.includes(letter)) {
            alert("Invalid guess or already guessed that letter.");
            return;
        }

        this.lettersGuessed.push(letter);

        if (this.selectedWord.word.includes(letter)) {
            this.correctGuesses.push(letter);
            if (this.isWordComplete()) {
                this.player.updateStats({ wins: this.player.wins + 1 });
                alert("Congratulations! You guessed the word: " + this.selectedWord.word);
                this.resetGame();
            }
        } else {
            this.guessesLeft--;
            if (this.guessesLeft === 0) {
                this.player.updateStats({ losses: this.player.losses + 1 });
                alert("Game Over! The word was: " + this.selectedWord.word);
                this.resetGame();
            }
        }

        this.updateWordDisplay();
        this.updateScoreboard();
    }

    isWordComplete() {
        return this.selectedWord.word.split('').every(letter => this.correctGuesses.includes(letter));
    }

    updateWordDisplay() {
        let display = this.selectedWord.word.split('').map(letter => this.correctGuesses.includes(letter) ? letter : "_").join(' ');
        document.getElementById("wordDisplay").textContent = display;
        document.getElementById("guessesLeft").textContent = this.guessesLeft;
        document.getElementById("lettersGuessed").textContent = this.lettersGuessed.join(", ");
        document.getElementById("hintText").textContent = this.selectedWord.hint;
    }

    updateScoreboard() {
        document.getElementById("hangmanWins").textContent = this.player.wins;
        document.getElementById("hangmanLosses").textContent = this.player.losses;
        this.updateChart();
    }

    setupChart() {
        const ctx = document.getElementById(this.chartId).getContext('2d');
        if (this.chart) {
            this.chart.destroy();
        }
        this.chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Wins', 'Losses'],
                datasets: [{
                    label: 'Hangman Statistics',
                    data: [this.player.wins, this.player.losses],
                    backgroundColor: ['rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)'],
                    borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)'],
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

    attachEventListeners() {
        this.guessButton = document.getElementById('guessButton');
        this.guessButton.addEventListener('click', () => {
            const letter = document.getElementById('letterInput').value.toLowerCase();
            document.getElementById('letterInput').value = '';
            this.guessLetter(letter);
        });
    }
};
