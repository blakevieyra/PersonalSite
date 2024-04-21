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
        if (!this.letterInput || !this.guessButton) {
            console.error("Essential HTML elements are missing!");
            return;  // Exit constructor to prevent further execution
        }
        this.previousWords = []; // Initialize here correctly
        this.availableLetters = 'abcdefghijklmnopqrstuvwxyz'.split('');
        this.unusedLetters = [...this.availableLetters]; // Copy for manipulation
        this.computerGuessesLeft = 6; // Initialize computer guesses left
        this.computerLettersGuessed = []; // Initialize computer letters guessed
        this.difficulty = 'easy'; // Add this line
        this.init(this.difficulty); // Use this.difficulty
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
        const settings = {
            easy: { guessesLeft: 10, words: this.words.easy },
            medium: { guessesLeft: 7, words: this.words.medium },
            hard: { guessesLeft: 5, words: this.words.hard },
        };
        const setting = settings[level] || settings.easy; // Fallback to easy if level is undefined
        this.wordsList = setting.words;
        this.guessesLeft = setting.guessesLeft;
    }

    getDifficultySettings(level) {
        const settings = {
            easy: { guessesLeft: 10, words: this.words.easy },
            medium: { guessesLeft: 7, words: this.words.medium },
            hard: { guessesLeft: 5, words: this.words.hard },
        };
        return settings[level] || settings.medium; // default to medium if undefined
    }

    generateRandomLetter() {
        if (this.unusedLetters.length > 0) {
            const randomIndex = Math.floor(Math.random() * this.unusedLetters.length);
            return this.unusedLetters.splice(randomIndex, 1)[0];  // Remove the letter from the array
        }
        return null; // Return null if no letters are left to guess
    }
    checkIfAllLettersGuessed() {
        return this.selectedWord.word.split('').every(letter => this.lettersGuessed.includes(letter));
    }

    detachEventListeners() {
        this.guessButton.removeEventListener('click', this.handleGuessClick);
        const setDifficultyBtn = document.getElementById('setDifficultyButton');
        setDifficultyBtn.removeEventListener('click', this.handleDifficultyChange);
    }

    attachEventListeners() {
        this.detachEventListeners(); // Clean up first
        this.handleGuessClick = this.handleGuess.bind(this);
        this.guessButton.addEventListener('click', this.handleGuessClick);

        const setDifficultyBtn = document.getElementById('setDifficultyButton');
        this.handleDifficultyChange = this.changeDifficulty.bind(this);
        setDifficultyBtn.addEventListener('click', this.handleDifficultyChange);
    }

    handleGuess() {
        const letter = this.letterInput.value.toLowerCase();
        this.letterInput.value = ''; // Clear input after guess
        this.guessLetter(letter);
        this.computerGuess(); // Trigger computer's turn after user's guess
    }
    changeDifficulty() {
        const difficulty = document.getElementById('difficulty').value;
        this.init(difficulty);
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

    init(difficulty) {
        // Ensure there's always a fallback for difficulty
        this.attachEventListeners();
        this.setDifficulty(difficulty || this.difficulty);
        this.resetGame();
        this.setupChart();
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
            const makeGuess = () => {
                if (this.computerGuessesLeft > 0 && this.availableLetters.length > 0) {
                    const letter = this.generateRandomLetter();
                    if (letter && !this.lettersGuessed.includes(letter)) {
                        this.lettersGuessed.push(letter);
                        this.computerLettersGuessed.push(letter);
                        this.computerGuessesLeft--;
                        this.updateComputerDisplay();
                        if (!this.selectedWord.word.includes(letter)) {
                            if (this.computerGuessesLeft === 0 || this.checkIfAllLettersGuessed()) {
                                this.handleGameEnd('Computer');
                            } else {
                                setTimeout(makeGuess, 1000);
                            }
                        }
                    }
                } else {
                    this.handleGameEnd('Computer');
                }
            };
            setTimeout(makeGuess, 1000);
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
            alert('Game Over! You lost. The word was ' + this.selectedWord.word);
            this.losses++;
            this.resetGame();
        } else if (this.checkIfAllLettersGuessed()) {
            alert('Congratulations! You guessed the word: ' + this.selectedWord.word);
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
module.exports = Hangman;
