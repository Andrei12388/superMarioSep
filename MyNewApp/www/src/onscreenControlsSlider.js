import { gameState } from './state/gameState.js';

/**
 * Initialize and manage onscreen controls sliders (transparency and size)
 */
export function initOnscreenControlsSliders() {
    const transparencySlider = document.getElementById('button-transparency-slider');
    const sizeSlider = document.getElementById('button-size-slider');
    const transparencyValue = document.getElementById('transparency-value');
    const sizeValue = document.getElementById('size-value');

    // Verify elements exist
    if (!transparencySlider || !sizeSlider) {
        console.warn('Onscreen control sliders not found in DOM');
        return;
    }

    // Load initial values from gameState
    transparencySlider.value = gameState.buttonTransparency * 100;
    sizeSlider.value = gameState.buttonSize * 100;
    updateSliderDisplay();

    // Transparency slider event handler
    transparencySlider.addEventListener('input', (e) => {
        const value = parseInt(e.target.value) / 100;
        gameState.buttonTransparency = value;
        updateOnscreenButtonsOpacity();
        transparencyValue.textContent = Math.round(value * 100) + '%';
    });

    // Size slider event handler
    sizeSlider.addEventListener('input', (e) => {
        const value = parseInt(e.target.value) / 100;
        gameState.buttonSize = value;
        updateOnscreenButtonsSize();
        sizeValue.textContent = Math.round(value * 100) + '%';
    });

    // Initial display update
    updateSliderDisplay();
}

/**
 * Update slider display values
 */
function updateSliderDisplay() {
    const transparencyValue = document.getElementById('transparency-value');
    const sizeValue = document.getElementById('size-value');

    if (transparencyValue) {
        transparencyValue.textContent = Math.round(gameState.buttonTransparency * 100) + '%';
    }
    if (sizeValue) {
        sizeValue.textContent = Math.round(gameState.buttonSize * 100) + '%';
    }
}

/**
 * Update opacity of all onscreen buttons based on transparency setting
 */
export function updateOnscreenButtonsOpacity() {
    // Update move buttons (UP, DOWN, LEFT, RIGHT)
    const moveButtons = document.querySelectorAll('.move, .move1, .move2');
    moveButtons.forEach(button => {
        button.style.opacity = gameState.buttonTransparency;
    });

    // Update joystick
    const joystick = document.getElementById('joystick');
    if (joystick) {
        joystick.style.opacity = gameState.buttonTransparency;
    }

    // Update knob
    const knob = document.getElementById('knob');
    if (knob) {
        knob.style.opacity = gameState.buttonTransparency;
    }
}

/**
 * Update size of all onscreen buttons based on size setting
 */
export function updateOnscreenButtonsSize() {
    const sizeMultiplier = gameState.buttonSize;

    // Update move buttons
    const moveButtons = document.querySelectorAll('.move, .move1, .move2');
    moveButtons.forEach(button => {
        button.style.transform = `scale(${sizeMultiplier})`;
    });

    // Update joystick
    const joystick = document.getElementById('joystick');
    if (joystick) {
        joystick.style.transform = `scale(${sizeMultiplier})`;
    }

    // Update knob
    const knob = document.getElementById('knob');
    if (knob) {
        knob.style.transform = `scale(${sizeMultiplier})`;
    }
}

/**
 * Update both opacity and size
 */
export function updateOnscreenControls() {
   
    updateOnscreenButtonsOpacity();
    updateOnscreenButtonsSize();
}
