export default class Player {
    constructor(username, { wins = 0, losses = 0, ties = 0, performance = 0 }) {
        this.username = username;
        this.wins = wins;
        this.losses = losses;
        this.ties = ties;
        this.performance = performance;  // This can be computed or updated based on specific logic.
    }

    incrementWins() {
        this.wins++;
    }

    incrementLosses() {
        this.losses++;
    }

    incrementTies() {
        this.ties++;
    }
}
