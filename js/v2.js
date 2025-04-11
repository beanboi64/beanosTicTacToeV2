// v2.js - Version 2.0 Features
document.addEventListener('DOMContentLoaded', () => {
    // Theme selector with kitten randomization
    const themeSelect = document.getElementById('theme');
    themeSelect.addEventListener('change', (e) => {
        if (e.target.value === 'kitten') {
            const variation = Math.floor(Math.random() * 5) + 1;
            document.body.className = `kitten kitten-${variation}`;
        } else {
            document.body.className = e.target.value;
        }
        localStorage.setItem('gameTheme', e.target.value);
    });

    // Load previously saved theme
    const savedTheme = localStorage.getItem('gameTheme') || 'default';
    if (savedTheme === 'kitten') {
        const variation = Math.floor(Math.random() * 5) + 1;
        document.body.className = `kitten kitten-${variation}`;
    } else {
        document.body.className = savedTheme;
    }
    themeSelect.value = savedTheme;

    // Confetti animation for wins
    window.showConfetti = () => {
        const confettiCount = 50;
        const overlay = document.createElement('div');
        overlay.className = 'confetti-overlay';
    
        // Create multiple confetti pieces with random properties
        for (let i = 0; i < confettiCount; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.backgroundColor = `#${Math.floor(Math.random()*16777215).toString(16)}`;
            confetti.style.animationDuration = `${2 + Math.random() * 3}s`;
            confetti.style.left = `${Math.random() * 100}%`;
            confetti.style.animationDelay = `${Math.random() * 1}s`;
            overlay.appendChild(confetti);
        }
    
        document.body.appendChild(overlay);
        setTimeout(() => overlay.remove(), 5000);
    };

    // Track and display game statistics
    window.updateSessionStats = () => {
        const stats = {
            wins: gameState.score.playerVsBeano.playerWins +
                gameState.score.playerVsPlayer.player1Wins +
                gameState.score.playerVsPlayer.player2Wins,
            losses: gameState.score.playerVsBeano.playerLoss +
                gameState.score.playerVsPlayer.player1Loss +
                gameState.score.playerVsPlayer.player2Loss,
            draws: gameState.score.playerVsBeano.draws +
                gameState.score.playerVsPlayer.draws
        };

        document.getElementById('stats-content').innerHTML = `
        <p>Wins: ${stats.wins}</p>
        <p>Loss: ${stats.losses}</p>
        <p>Draws: ${stats.draws}</p>
        `;
    };
});