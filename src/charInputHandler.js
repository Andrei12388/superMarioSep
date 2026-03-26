import { Control, controls } from './constants/control.js'; 
import { FighterDirection } from './constants/fighter.js';
const heldKeys = new Set();

function handleKeyDown(event){
 event.preventDefault();
 heldKeys.add(event.code);
}

function handleKeyUp(event){
    event.preventDefault();
    heldKeys.delete(event.code);

}

export function registerKeyboardEvents(){
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
}

export function registerScreenButtonEvents() {
    controls.forEach((controlSet, playerId) => {
        Object.entries(controlSet.buttons).forEach(([control, elementId]) => {
            const buttonEl = document.getElementById(elementId);
            if (!buttonEl) {
                console.warn(`Missing on-screen button element with id="${elementId}"`);
                return;
            }

            const virtualKeyCode = elementId; 
            // this can be anything unique, here we just use the element id

            const handlePress = (e) => {
                e.preventDefault();
                console.log(`On-screen button "${elementId}" pressed → adding to heldKeys`);
                heldKeys.add(virtualKeyCode);
            };

            const handleRelease = (e) => {
                e.preventDefault();
                console.log(`On-screen button "${elementId}" released → removing from heldKeys`);
                heldKeys.delete(virtualKeyCode);
            };

            // Mouse
            buttonEl.addEventListener('mousedown', handlePress);
            buttonEl.addEventListener('mouseup', handleRelease);
            buttonEl.addEventListener('mouseleave', handleRelease);
            // Touch
            buttonEl.addEventListener('touchstart', handlePress);
            buttonEl.addEventListener('touchend', handleRelease);
            buttonEl.addEventListener('touchcancel', handleRelease);
        });
    });
}


export const isKeyDown = (code) => heldKeys.has(code);
export const isKeyUp = (code) => !heldKeys.has(code);

//export const isLeft = (id) => isKeyDown(controls[id].keyboard[Control.LEFT]);
//export const isRight = (id) => isKeyDown(controls[id].keyboard[Control.RIGHT]);
//export const isUp = (id) => isKeyDown(controls[id].keyboard[Control.UP]);
//export const isDown = (id) => isKeyDown(controls[id].keyboard[Control.DOWN]);

export const isLeft = (id) => isKeyDown(controls[id].buttons[Control.LEFT]) || isKeyDown(controls[id].keyboard[Control.LEFT]);
export const isRight = (id) => isKeyDown(controls[id].buttons[Control.RIGHT])|| isKeyDown(controls[id].keyboard[Control.RIGHT]);
export const isUp = (id) => isKeyDown(controls[id].buttons[Control.UP])|| isKeyDown(controls[id].keyboard[Control.UP]);
export const isDown = (id) => isKeyDown(controls[id].buttons[Control.DOWN])|| isKeyDown(controls[id].keyboard[Control.DOWN]);

export const isForward = (id, direction) => direction === FighterDirection.RIGHT ? isRight(id) : isLeft(id);
export const isBackward = (id, direction) => direction === FighterDirection.LEFT ? isRight(id) : isLeft(id);

export const isLightPunch = (id) => isKeyDown(controls[id].buttons[Control.LIGHT_PUNCH])|| isKeyDown(controls[id].keyboard[Control.LIGHT_PUNCH]);

