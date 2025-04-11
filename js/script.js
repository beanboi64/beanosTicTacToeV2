// script.js

// This script handles the main game setup, including initializing the board, checking for winners, updating the UI, and ending the game.

(function() {
    const boardElement = document.getElementById('game-board'); // Get the game board element from the HTML page.

    // Game state object – stores all the important information about the game.
    let gameState = {
        gridSize: 3,             // The size of the grid (default is 3x3).
        winCondition: 3,         // The number of symbols needed in a row to win (default is 3).
        board: [],               // An array that represents the current state of the game board.
        currentTurn: 'X',        // The symbol ('X' or 'O') of the player whose turn it is.
        mode: 'ai',              // The game mode: 'ai' for Player vs AI, or 'player' for Player vs Player.
        difficulty: 'medium',     // The difficulty level for the AI (easy, medium, hard).
        playerSymbol: 'X',       // The symbol used by the player in AI mode.
        beanoSymbol: 'O',        // The symbol used by the AI in AI mode.
        gameActive: true,        // A flag to indicate if the game is currently active.
        moveCount: 0,            // Keeps track of how many moves have been made so far.
        waiting: false,          // Prevents players from making multiple moves while the AI is thinking.
        score: {                 // Tracks the scores for both game modes.
            playerVsBeano: {
                playerWins: 0,   // Wins by the player in AI mode.
                playerLoss: 0,   // Losses by the player in AI mode.
                beanoWins: 0,    // Wins by the AI in AI mode.
                beanoLoss: 0,    // Losses by the AI in AI mode.
                draws: 0         // Draws in AI mode.
            },
            playerVsPlayer: {
                player1Wins: 0,  // Wins by Player 1 in PvP mode.
                player1Loss: 0,  // Losses by Player 1 in PvP mode.
                player2Wins: 0,  // Wins by Player 2 in PvP mode.
                player2Loss: 0,  // Losses by Player 2 in PvP mode.
                draws: 0         // Draws in PvP mode.
            }
        },
        symbolColors: {          // Default colors for the symbols.
            'X': "#1e88e5",      // Blue color for 'X'.
            'O': "#e53935"       // Red color for 'O'.
        }
    };

    // Load the saved score from local storage if it exists.
    function loadScore() {
        let savedScore = localStorage.getItem('beanoTicTacToeScore'); // Retrieve the saved score from the browser's storage.
        if (savedScore) {
            let parsedScore = JSON.parse(savedScore); // Convert the saved score from a string back into an object.
            if (!parsedScore.playerVsBeano) {
                // If the saved score is in an older format, convert it to the new structure.
                parsedScore = {
                    playerVsBeano: {
                        playerWins: parsedScore.playerWins || 0,
                        playerLoss: parsedScore.playerLoss || 0,
                        beanoWins: parsedScore.beanoWins || 0,
                        beanoLoss: parsedScore.beanoLoss || 0,
                        draws: parsedScore.draws || 0
                    },
                    playerVsPlayer: {
                        player1Wins: 0,
                        player1Loss: 0,
                        player2Wins: 0,
                        player2Loss: 0,
                        draws: 0
                    }
                };
            }
            gameState.score = parsedScore; // Update the game state with the loaded score.
        }
    }

    // Save the current score to local storage.
    function saveScore() {
        localStorage.setItem('beanoTicTacToeScore', JSON.stringify(gameState.score)); // Store the score as a JSON string in the browser's storage.
    }

    // Initialize and render the game board.
    function initBoard() {
        gameState.board = new Array(gameState.gridSize * gameState.gridSize).fill(''); // Reset the board array to empty cells.
        gameState.currentTurn = (gameState.mode === 'player') ? 'X' : gameState.playerSymbol; // Set the starting player based on the game mode.
        gameState.gameActive = true; // Enable the game.
        gameState.moveCount = 0;     // Reset the move counter.
        gameState.waiting = false;   // Allow player moves immediately.
        boardElement.innerHTML = ''; // Clear the board's HTML content.

        // Configure the grid layout dynamically based on the selected grid size.
        boardElement.style.gridTemplateColumns = `repeat(${gameState.gridSize}, 1fr)`; // Set the number of columns.
        boardElement.style.gridTemplateRows = `repeat(${gameState.gridSize}, 1fr)`; // Set the number of rows.

        // Create and add cells to the board.
        for (let i = 0; i < gameState.board.length; i++) {
            let cell = document.createElement('div'); // Create a new cell element.
            cell.classList.add('cell');               // Add the 'cell' class for styling.
            cell.setAttribute('data-index', i);       // Assign a unique index to the cell.
            cell.addEventListener('click', handleCellClick); // Attach a click event listener to each cell.
            boardElement.appendChild(cell);           // Add the cell to the board.
        }
    }

    // Handle cell clicks by delegating to the logic module's player move handler.
    function handleCellClick(event) {
        const index = event.target.getAttribute('data-index'); // Get the index of the clicked cell.
        if (typeof handlePlayerMove === 'function') {
            handlePlayerMove(parseInt(index)); // Call the move handler with the index.
        }
    }

    // Check for a winner by examining rows, columns, and diagonals.
    function checkWinner() {
        const board = gameState.board; // Reference the current board state.
        const size = gameState.gridSize; // Get the grid size.
        const winCondition = gameState.winCondition; // Get the number of aligned symbols required to win.

        // Check rows for a winning line.
        for (let row = 0; row < size; row++) {
            for (let col = 0; col <= size - winCondition; col++) {
                let line = [];
                for (let i = 0; i < winCondition; i++) {
                    line.push(board[row * size + col + i]); // Collect symbols in the current row.
                }
                if (line.every(cell => cell === line[0] && cell !== '')) {
                    return line[0]; // Return the winning symbol if all symbols in the line match.
                }
            }
        }

        // Check columns for a winning line.
        for (let col = 0; col < size; col++) {
            for (let row = 0; row <= size - winCondition; row++) {
                let line = [];
                for (let i = 0; i < winCondition; i++) {
                    line.push(board[(row + i) * size + col]); // Collect symbols in the current column.
                }
                if (line.every(cell => cell === line[0] && cell !== '')) {
                    return line[0]; // Return the winning symbol if all symbols in the line match.
                }
            }
        }

        // Check diagonals (top-left to bottom-right) for a winning line.
        for (let row = 0; row <= size - winCondition; row++) {
            for (let col = 0; col <= size - winCondition; col++) {
                let line = [];
                for (let i = 0; i < winCondition; i++) {
                    line.push(board[(row + i) * size + col + i]); // Collect symbols in the diagonal.
                }
                if (line.every(cell => cell === line[0] && cell !== '')) {
                    return line[0]; // Return the winning symbol if all symbols in the line match.
                }
            }
        }

        // Check diagonals (top-right to bottom-left) for a winning line.
        for (let row = 0; row <= size - winCondition; row++) {
            for (let col = winCondition - 1; col < size; col++) {
                let line = [];
                for (let i = 0; i < winCondition; i++) {
                    line.push(board[(row + i) * size + col - i]); // Collect symbols in the diagonal.
                }
                if (line.every(cell => cell === line[0] && cell !== '')) {
                    return line[0]; // Return the winning symbol if all symbols in the line match.
                }
            }
        }

        return null; // Return null if no winner is found.
    }

    // End the game, update scores, play sounds, and display the result.
    function endGame(result, silent = false) {
        const game = window.gameState;
        game.gameActive = false;
    
        // Update scores
        if (game.mode === 'ai') {
            if (result === 'draw') {
                game.score.playerVsBeano.draws++;
            } else if (result === game.playerSymbol) {
                game.score.playerVsBeano.playerWins++;
                game.score.playerVsBeano.beanoLoss++;
            } else {
                game.score.playerVsBeano.beanoWins++;
                game.score.playerVsBeano.playerLoss++;
            }
        } else if (game.mode === 'player') {
            if (result === 'draw') {
                game.score.playerVsPlayer.draws++;
            } else if (result === 'X') {
                game.score.playerVsPlayer.player1Wins++;
                game.score.playerVsPlayer.player2Loss++;
            } else if (result === 'O') {
                game.score.playerVsPlayer.player2Wins++;
                game.score.playerVsPlayer.player1Loss++;
            }
        }
    
        // Handle effects
        const modal = document.getElementById('play-again-modal');
        const resultText = document.getElementById('game-result-text');
        const messageContainer = document.getElementById('result-message-container');
        const messageElement = document.getElementById('result-message');
        const botIcon = document.getElementById('result-bot-icon');

        messageElement.textContent = '';
        botIcon.style.color = '#00a67c';

        // Always reset message container visibility based on mode
        messageContainer.style.display = game.mode === 'player' ? 'none' : 'flex';

        if (game.mode === 'ai') {
            // AI mode messages and effects
            if (result !== 'draw') {
                if (typeof showConfetti === 'function') showConfetti();
                const soundID = result === game.playerSymbol ? 'win-player-sound' : 'win-ai-sound';
                const soundElement = document.getElementById(soundID);
                if (soundElement) soundElement.play();
                
                const isPlayerWinner = result === game.playerSymbol;
                showResultMessage(isPlayerWinner ? 'player' : 'beano');
            } else {
                const drawSound = document.getElementById('draw-sound');
                if (drawSound) drawSound.play();
                showResultMessage('draw');
            }
            resultText.textContent = result === 'draw' ? "It's a Draw!" : `${result} wins!`;
        } else {
            // PvP mode handling
            if (result !== 'draw') {
                if (typeof showConfetti === 'function') showConfetti();
                const soundElement = document.getElementById('pvp_winner');
                if (soundElement) soundElement.play();
            } else {
                const drawSound = document.getElementById('draw-sound');
                if (drawSound) drawSound.play();
            }
            resultText.textContent = result === 'draw' ? "Game Over - Draw!" : `Player ${result} Wins!`;
        }

        modal.style.display = 'block';
        updateSessionStats();
        saveScore();
    }

    function updateSessionStats() {
        const totalWins = gameState.score.playerVsBeano.playerWins +
            gameState.score.playerVsPlayer.player1Wins +
            gameState.score.playerVsPlayer.player2Wins;

        const totalLosses = gameState.score.playerVsBeano.playerLoss +
            gameState.score.playerVsPlayer.player1Loss +
            gameState.score.playerVsPlayer.player2Loss;

        const totalDraws = gameState.score.playerVsBeano.draws +
            gameState.score.playerVsPlayer.draws;

        const totalGames = totalWins + totalLosses + totalDraws;

        const calculatePercentage = (value) => {
            return totalGames === 0 ? '0%' : ((value / totalGames) * 100).toFixed(1) + '%';
        };

        const statsHTML = `
            <p>Wins: ${calculatePercentage(totalWins)}</p>
            <p>Loss: ${calculatePercentage(totalLosses)}</p>
            <p>Draws: ${calculatePercentage(totalDraws)}</p>
        `;

        document.getElementById('stats-content').innerHTML = statsHTML;
    }

    // Update the board's UI to reflect the current game state and apply symbol colors.
    function updateBoardUI() {
        const cells = boardElement.getElementsByClassName('cell'); // Get all the cell elements.
        for (let i = 0; i < cells.length; i++) {
            cells[i].textContent = gameState.board[i]; // Update the cell's content.
            if (gameState.board[i] !== '' && gameState.symbolColors) {
                cells[i].style.color = gameState.symbolColors[gameState.board[i]]; // Apply the symbol's color.
            } else {
                cells[i].style.color = ''; // Reset the color if the cell is empty.
            }
        }
    }

    document.getElementById('play-again-btn').addEventListener('click', () => {
        const modal = document.getElementById('play-again-modal');
        modal.style.display = 'none';
        
        // Reset animation states
        clearInterval(colorInterval);
        document.getElementById('result-bot-icon').style.color = '#00a67c';
        
        if (typeof initBoard === 'function') initBoard();
        startTime = Date.now();
    });

    // Expose functions and the game state to other scripts for interaction.
    window.gameState = gameState;
    window.initBoard = initBoard;
    window.checkWinner = checkWinner;
    window.updateBoardUI = updateBoardUI;
    window.endGame = endGame;
    window.loadScore = loadScore;
    window.saveScore = saveScore;

    // Initialize the game when the script loads.
    loadScore(); // Load the saved score from local storage.
    initBoard(); // Initialize the game board.
    
})();