import { Control } from './constants/control.js';
import { SpecialMoveButton, SpecialMoveDirection } from './constants/fighter.js';
import * as control from './inputHandler.js'

const HISTORY_CAP = 10;
const MOVE_DELAY = 150;

export const controlHistory = [
    [{
        time: 0,
        move: undefined,
        buttons: [false, false, false, false, false, false],
    }],
     [{
        time: 0,
        move: undefined,
        buttons: [false, false, false, false, false, false],
    }],
];

export const buttonOrder = [
    Control.LIGHT_PUNCH, Control.HEAVY_PUNCH,
    Control.LIGHT_KICK, Control.HEAVY_KICK,
];

function getMoveDirection(controls){
    if (controls.forward){
        if (controls.down) return SpecialMoveDirection.FORWARD_DOWN;
        if (controls.up) return SpecialMoveDirection.FORWARD_UP;
        return SpecialMoveDirection.FORWARD;
    } else if (controls.backward){
        
        if (controls.down) return SpecialMoveDirection.BACKWARD_DOWN;
        if (controls.up) return SpecialMoveDirection.BACKWARD_UP;
        return SpecialMoveDirection.BACKWARD;
    } else if (controls.down){
        return SpecialMoveDirection.DOWN;
    } else if (controls.up){
        return SpecialMoveDirection.UP;
    }
    return SpecialMoveDirection.NONE;
}

function getCurrentControlSnapshot(time, id, direction){
 const polledControls = {
    forward: control.isForward(id, direction),
    backward: control.isBackward(id, direction),
    down: control.isDown(id),
    up: control.isUp(id),
 };
 

 return {
    time: time.previous,
    move: getMoveDirection(polledControls),
    buttons: buttonOrder.map((button) => control.isControlDown(id, button)),
 };
}

function isLastSnapShotDifferent(snapshot, id){
    if (controlHistory[id][0].move != snapshot.move 
        || controlHistory[id][0].buttons.some((button, index) => snapshot.buttons[index] != button)
    ) return true;
    return false;
}

function hasControlMatched(control, id){
    switch(control){
        case SpecialMoveButton.ANY_PUNCH:
            for (let buttonIndex = 0; buttonIndex < 2; buttonIndex++){
                if (controlHistory[id][0].buttons[buttonIndex]) return buttonOrder[buttonIndex];
            }
            break;
            case SpecialMoveButton.ANY_KICK:
            for (let buttonIndex = 2; buttonIndex < 4; buttonIndex++){
                if (controlHistory[id][0].buttons[buttonIndex]) return buttonOrder[buttonIndex];
            }
            break;
            case SpecialMoveButton.LIGHT_PUNCH:
            
                if (controlHistory[id][0].buttons[0]) return buttonOrder[0];
            
            break;
            case SpecialMoveButton.HEAVY_PUNCH:
            
                if (controlHistory[id][0].buttons[1]) return buttonOrder[1];
            
            break;
            case SpecialMoveButton.LIGHT_KICK:
            
                if (controlHistory[id][0].buttons[2]) return buttonOrder[2];
            
            break;
            case SpecialMoveButton.HEAVY_KICK:
            
                if (controlHistory[id][0].buttons[3]) return buttonOrder[3];
            
            break;
            case SpecialMoveButton.AB:
                if (controlHistory[id][0].buttons[0] && controlHistory[id][0].buttons[1]) return buttonOrder[0] && buttonOrder[1];
            break;
            case SpecialMoveButton.AC:
                if (controlHistory[id][0].buttons[0] && controlHistory[id][0].buttons[2]) return buttonOrder[0] && buttonOrder[2];
            break;
            case SpecialMoveButton.AD:
                if (controlHistory[id][0].buttons[0] && controlHistory[id][0].buttons[3]) return buttonOrder[0] && buttonOrder[3];
            break;
            case SpecialMoveButton.BC:
                if (controlHistory[id][0].buttons[1] && controlHistory[id][0].buttons[2]) return buttonOrder[1] && buttonOrder[2];
            break;
            case SpecialMoveButton.BD:
                if (controlHistory[id][0].buttons[1] && controlHistory[id][0].buttons[3]) return buttonOrder[1] && buttonOrder[3];
            break;
            case SpecialMoveButton.CD:
                if (controlHistory[id][0].buttons[2] && controlHistory[id][0].buttons[3]) return buttonOrder[2] && buttonOrder[3];
            break;
        default:
            if (control === controlHistory[id][0].move) return true;
    }
    return false;
}

export function pollControl(time, id, direction){
    const currentControlSnapshot = getCurrentControlSnapshot(time,id,direction);

    if (!isLastSnapShotDifferent(currentControlSnapshot, id)) return;

    //if (id === 0) console.log(currentControlSnapshot);

    controlHistory[id].unshift(currentControlSnapshot);
if (controlHistory[id].length >= HISTORY_CAP) controlHistory[id].pop();
}

export function hasSpecialMoveBeenExecuted(specialMove, id, time){
    const controlMatched = hasControlMatched(specialMove.sequence[specialMove.cursor], id);
    if (!controlMatched){
        if (controlHistory[id][0].time + MOVE_DELAY < time.previous && specialMove.cursor>1) specialMove.cursor = 0;
            return false;
    }

    if (specialMove.cursor === specialMove.sequence.length - 1){
        specialMove.cursor = 0;
        return controlMatched;
    }

    specialMove.cursor += 1;
    return false;
}