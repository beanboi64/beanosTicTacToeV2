// controls.js
(function() {
    document.addEventListener('DOMContentLoaded', function() {
        // Get references to all the important buttons and elements on the page.
        const aiToggleBtn = document.getElementById('ai-toggle'); // Button to switch between AI mode and PvP mode.
        const difficultySelect = document.getElementById('difficulty'); // Dropdown menu to choose how smart the AI is (Easy, Medium, Hard).
        const modeSelect = document.getElementById('mode'); // Dropdown menu to choose between playing against the AI or another player.
        const gridSizeSelect = document.getElementById('grid-size'); // Dropdown menu to pick the size of the game board (3x3 or 4x4).
        const backgroundSoundToggleBtn = document.getElementById('background-sound-toggle'); // Button to turn background music on or off.
        const volumeControl = document.getElementById('volume-control'); // Slider to adjust the volume of the background music.
        const closeSettingsBtn = document.getElementById('close-settings'); // Button to close the settings menu.
        const settingsToggleBtn = document.getElementById('settings-toggle'); // Button to open the settings menu.
        const gameControls = document.getElementById('game-controls'); // The settings menu itself.
        const timerElement = document.getElementById('timer'); // Displays how long the game has been running.
        const backgroundSound = document.getElementById('background-sound'); // The audio element that plays the background music.
        
        // NEW: Help button and tutorial modal
        const helpButton = document.getElementById('help-button'); // Button with an "i" icon to show instructions.

        // Timer variables
        let startTime = Date.now(); // Records when the game starts so we can calculate how long it's been running.

        // Function to update the timer every second.
        function updateTimer() {
            let diff = Date.now() - startTime; // Calculate how much time has passed since the game started.
            let hours = Math.floor(diff / 3600000); // Convert milliseconds into hours.
            let minutes = Math.floor((diff % 3600000) / 60000); // Convert remaining milliseconds into minutes.
            let seconds = Math.floor((diff % 60000) / 1000); // Convert remaining milliseconds into seconds.
            timerElement.textContent = `Time: ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`; // Display the time in HH:MM:SS format.
        }

        // Helper function to add a leading zero to numbers less than 10 (e.g., "9" becomes "09").
        function pad(num) {
            return num < 10 ? "0" + num : num;
        }

        // Set an interval to call the updateTimer function every second.
        setInterval(updateTimer, 1000);

        // Event listener for the Help button.
        helpButton.addEventListener('click', function() {
            // Handled by tutorial.js
        });

        // Event listener to toggle between AI mode and PvP mode.
        aiToggleBtn.addEventListener('click', function() {
            let game = window.gameState; // Access the global game state object.
            if (game.mode === 'ai') {
                game.mode = 'player'; // Switch to Player vs Player mode.
                aiToggleBtn.textContent = "Beano: Off"; // Update the button text to show that AI is off.
                modeSelect.value = 'player'; // Update the dropdown menu to reflect the change.
            } else {
                game.mode = 'ai'; // Switch to Player vs AI mode.
                aiToggleBtn.textContent = "Beano: On"; // Update the button text to show that AI is on.
                modeSelect.value = 'ai'; // Update the dropdown menu to reflect the change.
            }
        });

        // Event listener to update the AI difficulty level.
        difficultySelect.addEventListener('change', function() {
            let game = window.gameState; // Access the global game state object.
            game.difficulty = difficultySelect.value; // Update the difficulty level based on the user's selection.
        });

        // Event listener to update the game mode based on the dropdown selection.
        modeSelect.addEventListener('change', function() {
            let game = window.gameState; // Access the global game state object.
            game.mode = modeSelect.value; // Update the game mode based on the user's selection.
            aiToggleBtn.textContent = (game.mode === 'ai') ? "Beano: On" : "Beano: Off"; // Update the toggle button text to match the mode.
        });

        // Event listener to update the grid size and win condition.
        gridSizeSelect.addEventListener('change', function() {
            let game = window.gameState; // Access the global game state object.
            let value = gridSizeSelect.value; // Get the selected grid size from the dropdown menu.
            if (value === '3x3') {
                game.gridSize = 3; // Set the grid size to 3x3.
                game.winCondition = 3; // Set the win condition to 3 aligned symbols.
            } else if (value === '4x4') {
                game.gridSize = 4; // Set the grid size to 4x4.
                game.winCondition = 4; // Set the win condition to 4 aligned symbols.
            }
            if (typeof initBoard === 'function') {
                initBoard(); // Reinitialize the game board with the new settings.
            }
        });

        // Event listener to toggle the background music.
        backgroundSoundToggleBtn.addEventListener('click', function() {
            if (backgroundSound.paused) {
                backgroundSound.play(); // Start playing the music if it's paused.
                backgroundSoundToggleBtn.innerHTML = "<span class=\"material-symbols-outlined note-off\">music_off</span>"; // Change the button icon to indicate music is on.
            } else {
                backgroundSound.pause(); // Pause the music if it's playing.
                backgroundSoundToggleBtn.innerHTML = "<span class=\"material-symbols-outlined note\">music_note</span>"; // Change the button icon to indicate music is off.
            }
        });

        // Event listener to adjust the volume of the background music.
        volumeControl.addEventListener('input', function() {
            let volume = parseFloat(volumeControl.value); // Get the volume level from the slider.
            if (backgroundSound) {
                backgroundSound.volume = volume; // Adjust the volume of the background music.
            }
        });

        // Event listener to open the settings modal.
        settingsToggleBtn.addEventListener('click', function() {
            gameControls.style.display = 'block'; // Show the settings menu when the button is clicked.
        });

        // Event listener to close the settings modal.
        closeSettingsBtn.addEventListener('click', function() {
            gameControls.style.display = 'none'; // Hide the settings menu when the close button is clicked.
        });

        // On page load, initialize the score and the game board
        if (typeof loadScore === 'function') {
            loadScore();
        }
        if (typeof initBoard === 'function') {
            initBoard();
        }
    });

    window.trackMove = (index) => {
        if (!window.gameState.moveHistory) window.gameState.moveHistory = [];
        window.gameState.moveHistory.push(index);
        if (window.gameState.moveHistory.length > 3) window.gameState.moveHistory.shift();
    };
})();