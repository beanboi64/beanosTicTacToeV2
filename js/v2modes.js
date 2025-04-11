(function() {
    document.addEventListener('DOMContentLoaded', function() {
        // Find mode selection group and add variant selector
        const modeGroup = document.querySelector('#mode').closest('.control-group');
        const variantHTML = `
            <div class="control-group">
                <label for="game-variant">Game Variant:</label>
                <select id="game-variant">
                    <option value="classic">Classic</option>
                    <option value="reverse">Reverse Rules</option>
                    <option value="blind">Blind Fight</option>
                    <option value="nomiddle">No Middle</option>
                </select>
            </div>
        `;
        modeGroup.insertAdjacentHTML('afterend', variantHTML);

        // Get important elements
        const variantSelect = document.getElementById('game-variant');
        const gameBoard = document.getElementById('game-board');
        const modeSelect = document.getElementById('mode');
        const resultContainer = document.getElementById('result-message-container');

        // Set starting game variant and mode
        window.gameState.variant = 'classic';
        initializeClassicMode();

        // Handle symbol assignment for AI mode
        const originalAssignSymbols = window.assignSymbols;
        window.assignSymbols = function() {
            const symbols = ['X', 'O'];
            [window.gameState.playerSymbol, window.gameState.beanoSymbol] = 
                Math.random() < 0.5 ? symbols : symbols.reverse();
            originalAssignSymbols.call(this);
            persistSymbols();
        };

        // Handle game mode changes
        modeSelect.addEventListener('change', function() {
            const previousMode = window.gameState.mode;
            window.gameState.mode = this.value;
            resultContainer.style.display = this.value === 'player' ? 'none' : 'flex';
            
            // Start new game when changing modes
            if (window.gameState.gameActive || previousMode !== this.value) {
                resetGameState();
                startNewGame();
            }
        });

        // Handle variant changes
        variantSelect.addEventListener('change', function() {
            window.gameState.variant = this.value;
            gameBoard.className = gameBoard.className.replace(/\b\S+-variant/g, '');
            
            // Add variant class if not classic
            if (this.value !== 'classic') {
                gameBoard.classList.add(`${this.value}-variant`);
            }
            
            // Update game for special variants
            if (this.value === 'nomiddle') updateBlockedCells();
            if (typeof initBoard === 'function') initBoard();
            persistSymbols();
        });

        // Modify winner check for reverse variant
        const originalCheckWinner = window.checkWinner;
        window.checkWinner = function() {
            const result = originalCheckWinner();
            return window.gameState.variant === 'reverse' ? invertResult(result) : result;
        };

        // Prepare game board after short delay
        setTimeout(() => {
            if (typeof initBoard === 'function') initBoard();
            setupBlindModeHandlers();
        }, 100);

        // Reset game data and UI
        function resetGameState() {
            const game = window.gameState;
            game.board = Array(game.gridSize * game.gridSize).fill('');
            game.moveCount = 0;
            game.currentTurn = 'X';
            game.waiting = false;
            game.gameActive = false;
            
            // Clean game board cells
            document.querySelectorAll('.cell').forEach(cell => {
                cell.textContent = '';
                cell.classList.remove('x-symbol', 'o-symbol', 'blocked', 'played', 'winning-cell');
                cell.style.pointerEvents = '';
            });
            
            // Set new symbols for AI mode
            if (game.mode === 'ai') {
                window.assignSymbols();
            }
        }

        // Start fresh game
        function startNewGame() {
            window.gameState.gameActive = true;
            if (typeof initBoard === 'function') initBoard();
            if (window.gameState.variant === 'nomiddle') updateBlockedCells();
            window.updateBoardUI();
            
            // Let AI make first move if needed
            if (window.gameState.mode === 'ai' && 
                window.gameState.beanoSymbol === 'X' &&
                !window.gameState.waiting) {
                window.gameState.waiting = true;
                setTimeout(handleAIMove, 500);
            }
        }
    });

    // Handle player moves
    window.handlePlayerMove = function(index) {
        const game = window.gameState;
        if (!game.gameActive || game.board[index] !== '' || game.waiting) return;

        // Decide which symbol to place
        const symbolToPlace = game.mode === 'ai' ? game.playerSymbol : game.currentTurn;
        const cell = document.querySelector(`.cell[data-index="${index}"]`);
        
        // Update game state and UI
        game.board[index] = symbolToPlace;
        game.moveCount++;
        cell.textContent = symbolToPlace;
        cell.classList.add(symbolToPlace === 'X' ? 'x-symbol' : 'o-symbol');

        // Handle blind mode effects
        if (game.variant === 'blind') {
            cell.classList.add('played');
            setTimeout(() => {
                cell.classList.remove('played');
                cell.textContent = '';
            }, 2000);
        }

        // Play move sound and update board
        const moveSound = document.getElementById('move-sound');
        if (moveSound) moveSound.play();
        window.updateBoardUI();

        // Check game result
        const winner = window.checkWinner();
        if (winner) {
            window.endGame(winner, game.mode === 'player');
            return;
        } else if (game.moveCount === game.board.length) {
            window.endGame('draw', game.mode === 'player');
            return;
        }

        // Switch turns or activate AI
        if (game.mode === 'ai') {
            game.waiting = true;
            setTimeout(handleAIMove, 500);
        } else {
            game.currentTurn = game.currentTurn === 'X' ? 'O' : 'X';
        }
    };

    // Set up blind mode interactions
    function setupBlindModeHandlers() {
        document.querySelectorAll('.cell').forEach(cell => {
            cell.addEventListener('mouseenter', handleHover);
            cell.addEventListener('mouseleave', handleHoverEnd);
            cell.addEventListener('touchstart', handleTouch);
            cell.addEventListener('touchend', handleTouchEnd);
        });
    }

    // Handle hover effects for blind mode
    function handleHover(e) {
        const cell = e.target.closest('.cell');
        if (!cell || window.gameState.variant !== 'blind') return;
        if (cell.textContent) {
            cell.style.opacity = '0.7';
        }
    }

    function handleHoverEnd(e) {
        const cell = e.target.closest('.cell');
        if (!cell || window.gameState.variant !== 'blind') return;
        cell.style.opacity = '1';
    }

    // Handle touch controls for blind mode
    function handleTouch(e) {
        handleHover(e);
        e.preventDefault();
    }

    function handleTouchEnd(e) {
        handleHoverEnd(e);
    }

    // Process AI moves
    function handleAIMove() {
        const game = window.gameState;
        if (!game.gameActive) {
            game.waiting = false;
            return;
        }

        // Choose move based on difficulty
        let index;
        switch (game.difficulty) {
            case 'easy': index = getRandomMove(); break;
            case 'medium': index = getMediumMove(); break;
            case 'hard': index = getHardMove(); break;
            default: index = getRandomMove();
        }

        if (index === -1) {
            game.waiting = false;
            return;
        }

        // Update cell and game state
        const cell = document.querySelector(`.cell[data-index="${index}"]`);
        cell.textContent = game.beanoSymbol;
        cell.classList.add(game.beanoSymbol === 'X' ? 'x-symbol' : 'o-symbol');
        
        // Handle blind mode effects
        if (game.variant === 'blind') {
            cell.classList.add('played');
            setTimeout(() => {
                cell.classList.remove('played');
                cell.textContent = '';
            }, 2000);
        }

        game.board[index] = game.beanoSymbol;
        game.moveCount++;
        
        // Play sound and update UI
        const moveSound = document.getElementById('move-sound');
        if (moveSound) moveSound.play();
        window.updateBoardUI();

        // Check game result
        const winner = window.checkWinner();
        if (winner) {
            window.endGame(winner);
            game.waiting = false;
            return;
        } else if (game.moveCount === game.board.length) {
            window.endGame('draw');
            game.waiting = false;
            return;
        }

        game.waiting = false;
    }

    // Helper functions

    // Reset to classic mode
    function initializeClassicMode() {
        const gameBoard = document.getElementById('game-board');
        gameBoard.classList.remove('reverse-variant', 'blind-variant', 'nomiddle-variant');
        document.querySelectorAll('.cell.blocked').forEach(cell => {
            cell.classList.remove('blocked');
            cell.style.pointerEvents = '';
        });
    }

    // Save symbol choices
    function persistSymbols() {
        if (!window.gameState.playerSymbol) {
            const symbols = ['X', 'O'];
            [window.gameState.playerSymbol, window.gameState.beanoSymbol] = 
                Math.random() < 0.5 ? symbols : symbols.reverse();
        }
    }

    // Update blocked cells for no-middle mode
    function updateBlockedCells() {
        const cells = document.querySelectorAll('.cell');
        const blockedIndices = getBlockedIndices();
        
        cells.forEach((cell, index) => {
            cell.classList.toggle('blocked', blockedIndices.includes(index));
        });
    }

    // Get blocked cell positions
    function getBlockedIndices() {
        const size = window.gameState.gridSize;
        if (size === 3) return [4];
        if (size === 4) return [5, 6, 9, 10];
        return [];
    }

    // Check if move is blocked
    function isMoveBlocked(index) {
        return window.gameState.variant === 'nomiddle' && 
               getBlockedIndices().includes(parseInt(index));
    }

    // Flip result for reverse mode
    function invertResult(result) {
        return result === 'X' ? 'O' : result === 'O' ? 'X' : null;
    }

    // Temporary show cell in blind mode
    function revealCell(e) {
        const cell = e.target.closest('.cell');
        if (cell && window.gameState.variant === 'blind') {
            const symbol = cell.textContent;
            cell.classList.add('played', symbol === 'X' ? 'x-symbol' : 'o-symbol');
            setTimeout(() => cell.classList.remove('played'), 2000);
        }
    }
})();