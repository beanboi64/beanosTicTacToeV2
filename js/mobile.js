// Mobile-specific functionality
document.addEventListener('DOMContentLoaded', function() {
    initMobileLayout();
    setupOrientationHandler();
    setupTouchEvents();
    forceClassicMode();
});

function forceClassicMode() {
    const variantSelect = document.getElementById('game-variant');
    if (variantSelect) {
        // Force classic mode on mobile by default
        if (variantSelect.value !== 'classic') {
            variantSelect.value = 'classic';
            variantSelect.dispatchEvent(new Event('change'));
        }
    }
    
    const gameBoard = document.getElementById('game-board');
    gameBoard.classList.remove('reverse-variant', 'blind-variant', 'nomiddle-variant');
    gameBoard.classList.add('classic-variant');
    
    document.querySelectorAll('.cell.blocked').forEach(cell => {
        cell.classList.remove('blocked');
        cell.style.pointerEvents = '';
    });
}

// Prevent theme selector from interfering with touch events
document.getElementById('theme').addEventListener('touchstart', (e) => {
    e.stopPropagation();
});

function initMobileLayout() {
    document.body.classList.add('mobile-view');
    const gameBoard = document.getElementById('game-board');
    gameBoard.classList.add('classic-variant');
    updateBoardSizeClasses();
    
    // Lock viewport scaling on mobile
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    if (viewportMeta) {
        viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
    }
}

function updateBoardSizeClasses() {
    const gridSize = document.getElementById('grid-size').value;
    const gameBoard = document.getElementById('game-board');
    
    if (gridSize === '4x4') {
        gameBoard.classList.add('grid-4x4');
        gameBoard.classList.remove('grid-3x3');
    } else {
        gameBoard.classList.add('grid-3x3');
        gameBoard.classList.remove('grid-4x4');
    }
}

function setupOrientationHandler() {
    // Handle screen rotation with debounce
    window.addEventListener('orientationchange', function() {
        setTimeout(function() {
            adjustLayoutForOrientation();
        }, 200);
    });
    
    adjustLayoutForOrientation();
}

function adjustLayoutForOrientation() {
    const isLandscape = window.innerWidth > window.innerHeight;
    document.getElementById('session-stats').style.bottom = isLandscape ? '10px' : '20px';
    document.body.classList.toggle('landscape', isLandscape);
    document.body.classList.toggle('portrait', !isLandscape);
    
    // Scale board differently for landscape/portrait
    const gameBoard = document.getElementById('game-board');
    gameBoard.style.transform = isLandscape ? 'scale(0.9)' : 'scale(1)';
}

function setupTouchEvents() {
    // Prevent zoom on double-tap
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        cell.addEventListener('touchend', function(e) {
            e.preventDefault();
        });
    });
    
    // Visual feedback for touch buttons
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.addEventListener('touchstart', function() {
            this.classList.add('touch-active');
        });
        
        button.addEventListener('touchend', function() {
            this.classList.remove('touch-active');
        });
    });
    
    // Disable scroll during board interactions
    const gameBoard = document.getElementById('game-board');
    gameBoard.addEventListener('touchmove', function(e) {
        e.preventDefault();
    }, { passive: false });
}

// Dynamic grid size adjustment
if (document.getElementById('grid-size')) {
    document.getElementById('grid-size').addEventListener('change', function() {
        updateBoardSizeClasses();
    });
}

// Mobile modal positioning
const modals = document.querySelectorAll('.modal');
modals.forEach(modal => {
    const modalContent = modal.querySelector('.modal-content');
    if (modalContent) {
        modalContent.style.top = '50%';
        modalContent.style.left = '50%';
        modalContent.style.transform = 'translate(-50%, -50%)';
    }
});