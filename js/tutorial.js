// tutorial.js
// Main tutorial class that handles all tutorial functionality
class Tutorial {
    constructor() {
        this.steps = [
            {
                title: "Welcome to Beano's Tic Tac Toe v2.0!",
                content: `Let's learn how to play the ultimate Tic Tac Toe experience!`,
                highlight: null
            },
            {
                title: "Game Modes",
                content: "Choose between Player vs Beano (AI) or challenge a friend in PvP mode. The AI has 3 difficulty levels!",
                highlight: '#mode'
            },
            {
                title: "New Grid Sizes",
                content: "Play classic 3x3 or try the challenging 4x4 grid. More spaces mean more strategy!",
                highlight: '#grid-size'
            },
            {
                title: "Special Variants",
                content: "Try new game variants: Reverse rules, Blind mode, and No Middle restrictions!",
                highlight: '#game-variant'
            },
            {
                title: "Customization",
                content: "Personalize your experience with themes and sound controls. Try the Kitten Whiskers theme!",
                highlight: '#theme'
            },
            {
                title: "Interactive Tutorial",
                content: "You're using it right now! Access this tutorial anytime using the i button."
            }
        ];
        this.currentStep = 0; // Start at first step
        this.init(); // Initialize tutorial
    }

    // Set up tutorial elements and events
    init() {
        this.createModal(); // Create popup window
        this.bindEvents(); // Connect buttons
        this.showStep(0); // Show first step
    }

    // Create tutorial popup window
    createModal() {
        this.modal = document.createElement('div');
        this.modal.className = 'tutorial-modal';
        // HTML for tutorial with close button and navigation
        this.modal.innerHTML = `
            <button class="tutorial-close">&times;</button>
            <div class="tutorial-content"></div>
            <div class="tutorial-progress"></div>
            <div class="tutorial-navigation">
                <button class="tutorial-btn prev-btn" disabled>Previous</button>
                <button class="tutorial-btn next-btn">Next</button>
            </div>
        `;
        document.body.appendChild(this.modal); // Add to page
    }

    // Connect buttons to their functions
    bindEvents() {
        // Close button removes tutorial
        this.modal.querySelector('.tutorial-close').addEventListener('click', () => this.close());
        // Next button shows next step
        this.modal.querySelector('.next-btn').addEventListener('click', () => this.nextStep());
        // Previous button shows last step
        this.modal.querySelector('.prev-btn').addEventListener('click', () => this.prevStep());
    }

    // Display a specific tutorial step
    showStep(stepIndex) {
        this.currentStep = stepIndex;
        const step = this.steps[stepIndex];
        const content = this.modal.querySelector('.tutorial-content');
        
        // Update content with current step information
        content.innerHTML = `
            <div class="tutorial-step active">
                <h3>${step.title}</h3>
                <p>${step.content}</p>
            </div>
        `;
    
        this.updateProgress(); // Update step counter
        this.updateNavigation(); // Update buttons
        this.highlightElement(step.highlight); // Highlight related game element
    }

    // Highlight game element related to current tutorial step
    highlightElement(selector) {
        // Remove existing highlights
        document.querySelectorAll('.tutorial-highlight').forEach(el => {
            el.classList.remove('tutorial-highlight');
        });

        // If this step has something to highlight
        if (selector) {
            const element = document.querySelector(selector);
            if (element) {
                element.classList.add('tutorial-highlight');
                // Scroll to show highlighted element
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }

    // Update step counter (e.g., "Step 1 of 6")
    updateProgress() {
        this.modal.querySelector('.tutorial-progress').textContent = 
            `Step ${this.currentStep + 1} of ${this.steps.length}`;
    }

    // Enable/disable navigation buttons
    updateNavigation() {
        const prevBtn = this.modal.querySelector('.prev-btn');
        const nextBtn = this.modal.querySelector('.next-btn');
        
        // Disable previous button on first step
        prevBtn.disabled = this.currentStep === 0;
        // Change next button to "Finish" on last step
        nextBtn.textContent = this.currentStep === this.steps.length - 1 ? 'Finish' : 'Next';
    }

    // Go to next tutorial step
    nextStep() {
        if (this.currentStep < this.steps.length - 1) {
            this.showStep(this.currentStep + 1);
        } else {
            this.close(); // Close tutorial on last step
        }
    }

    // Go to previous tutorial step
    prevStep() {
        if (this.currentStep > 0) {
            this.showStep(this.currentStep - 1);
        }
    }

    // Remove tutorial from page
    close() {
        this.modal.remove();
        // Remove any remaining highlights
        document.querySelectorAll('.tutorial-highlight').forEach(el => {
            el.classList.remove('tutorial-highlight');
        });
    }
}

// Initialize tutorial when help button is clicked
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('help-button').addEventListener('click', () => {
        new Tutorial(); // Create new tutorial
    });
});