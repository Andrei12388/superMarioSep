import { Control } from "./control.js";

export const FireballState = {
    ACTIVE: 'active',
    COLLIDED: 'collided',
    CRACK: 'crack',
};

export const FireballCollidedState = {
    NONE: 'none',
    OPPONENT: 'opponent',
    FIREBALL: 'fireball',
};

export const fireballVelocity = {
    [Control.LIGHT_PUNCH]: 300,
    [Control.HEAVY_PUNCH]: 300,
};