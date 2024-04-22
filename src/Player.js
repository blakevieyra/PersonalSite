export default class Player {
    constructor(username, { wins = 0, losses = 0, performance = 0 }) {
        this.username = username;
        this.wins = wins;
        this.losses = losses;
        this.performance = performance;
    }

    updateStats({ wins, losses, performance }) {
        if (wins !== undefined) this.wins = wins;
        if (losses !== undefined) this.losses = losses;
        if (performance !== undefined) this.performance = performance;
    }
}
