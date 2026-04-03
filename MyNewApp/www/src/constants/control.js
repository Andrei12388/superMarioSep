export const Control = {
    LEFT: 'left',
    RIGHT: 'right',
    UP: 'up',
    DOWN: 'down',

    START: 'start',
    SELECT: 'select',

    LIGHT_PUNCH: 'lightPunch',
    LIGHT_KICK: 'lightKick',
    HEAVY_PUNCH: 'heavyPunch',
    HEAVY_KICK: 'heavyKick',
    MEDIUM_PUNCH: 'mediumPunch',
    MEDIUM_KICK: 'mediumKick',
};

export const GamepadThumbstick = {
    DEAD_ZONE: 'deadZone',
    HORIZONTAL_AXE_ID: 'horizontalAxeId',
    VERTICAL_AXE_ID: 'verticalAxeId',
}

export const controls = [
    {
        gamePad:{
            [GamepadThumbstick.DEAD_ZONE]: 0.5,
            [GamepadThumbstick.HORIZONTAL_AXE_ID]: 0,
            [GamepadThumbstick.VERTICAL_AXE_ID]: 1,

            [Control.LEFT]: 14,
            [Control.RIGHT]: 15,
            [Control.UP]: 12,
            [Control.DOWN]: 13,
            [Control.LIGHT_PUNCH]: 3,
            [Control.HEAVY_PUNCH]: 0,
            [Control.LIGHT_KICK]: 2,
            [Control.HEAVY_KICK]: 1,
            [Control.START]: 9,
            [Control.SELECT]: 8,
        },
         keyboard: {
            [Control.LEFT]: 'KeyA',
            [Control.RIGHT]: 'KeyD',
            [Control.UP]: 'KeyW',
            [Control.DOWN]: 'KeyS',
            [Control.LIGHT_PUNCH]: 'KeyT',
            [Control.HEAVY_PUNCH]: 'KeyY',
            [Control.LIGHT_KICK]: 'KeyG',
            [Control.HEAVY_KICK]: 'KeyH',
            [Control.START]: 'KeyP',
            [Control.SELECT]: 'KeyO',
        },
        buttons: {
            [Control.LEFT]: 'mBack',    // your div id for left
            [Control.RIGHT]: 'mFor',  // your div id for right
            [Control.UP]: 'jump',             // your div id for up
            [Control.DOWN]: 'crouchDown',  
            [Control.LIGHT_PUNCH]: 'AP1',    // your div id for down
            [Control.HEAVY_PUNCH]: 'BP1',
            [Control.LIGHT_KICK]: 'CP1',    // your div id for down
            [Control.HEAVY_KICK]: 'DP1',
            [Control.START]: 'start1',
            [Control.SELECT]: 'select1',    // your div id for down
        }
    },
    {
        gamePad:{
            [GamepadThumbstick.DEAD_ZONE]: 0.5,
            [GamepadThumbstick.HORIZONTAL_AXE_ID]: 0,
            [GamepadThumbstick.VERTICAL_AXE_ID]: 1,
            
             [Control.LEFT]: 14,
            [Control.RIGHT]: 15,
            [Control.UP]: 12,
            [Control.DOWN]: 13,
            [Control.LIGHT_PUNCH]: 3,
            [Control.HEAVY_PUNCH]: 0,
            [Control.LIGHT_KICK]: 2,
            [Control.HEAVY_KICK]: 1,
            [Control.START]: 9,
            [Control.SELECT]: 8,
        },
        keyboard: {
            [Control.LEFT]: 'ArrowLeft',
            [Control.RIGHT]: 'ArrowRight',
            [Control.UP]: 'ArrowUp',
            [Control.DOWN]: 'ArrowDown',
            [Control.LIGHT_PUNCH]: 'KeyJ',
            [Control.HEAVY_PUNCH]: 'KeyK',
            [Control.LIGHT_KICK]: 'KeyN',
            [Control.HEAVY_KICK]: 'KeyM',
            [Control.START]: 'Enter',
            [Control.SELECT]: 'ShiftRight',
            
        },
       
        buttons: {
            [Control.LEFT]: 'mBackP2',    // your div id for left
            [Control.RIGHT]: 'mForP2',  // your div id for right
            [Control.UP]: 'jumpP2',             // your div id for up
            [Control.DOWN]: 'crouchDownP2', 
            [Control.LIGHT_PUNCH]: 'AP2',    // your div id for down
            [Control.HEAVY_PUNCH]: 'BP2',
            [Control.LIGHT_KICK]: 'CP2',    // your div id for down
            [Control.HEAVY_KICK]: 'DP2',
            [Control.START]: 'start2',
            [Control.SELECT]: 'select2',    // your div id for down
        }
    },
];
