//import { isKeyDown, isKeyUp } from '../../inputHandler.js'; 
import * as control from '../../inputHandler.js'
import { FIGHTER_START_DISTANCE, 
    FighterDirection, 
    FighterState, 
    FighterAttackType, 
    FrameDelay, 
    PUSH_FRICION, 
    FighterAttackStrength,
    FighterAttackBaseData,
    FighterHurtBox,
    hurtStateValidFrom,
    FIGHTER_HURT_DELAY,
    knockUpStateValidFrom} from "../../constants/fighter.js";
import { STAGE_FLOOR, STAGE_MID_POINT, STAGE_PADDING } from "../../constants/stage.js";
import { boxOverlap, getActualBoxDimensions, rectsOverlap } from '../../utils/collisions.js';
import { Control } from '../../constants/control.js';
import { gameState } from '../../state/gameState.js';
import { playSound, stopSound } from '../../soundHandler.js';
import { FRAME_TIME } from '../../constants/game.js';
import { hasSpecialMoveBeenExecuted } from '../../controlHistory.js';
import { EntityList } from '../../EntityList.js';
import { SuperHitSplash } from './shared/SuperHitSplash.js';
import { buildPaletteMap, buildSingleColorMap, extractPalette, hueShiftSprite, invertSprite, paletteSwap, paletteSwapAllColors, paletteSwapFinal, paletteSwapSmart } from '../../utils/palleteSwap.js';


export const AnimationFrame = {
    TRANSITION: -3
};

export class Fighter {
    constructor(playerId, onAttackHit, effectSplash){
        this.playerId = playerId;
        this.position = {
             x: STAGE_MID_POINT + STAGE_PADDING + (playerId === 0 ? -FIGHTER_START_DISTANCE : FIGHTER_START_DISTANCE), 
             y: STAGE_FLOOR };
        this.velocity = {x: 0, y: 0};
        this.initialVelocity = {};
        this.direction = playerId === 0 ? FighterDirection.RIGHT : FighterDirection.LEFT;
        this.gravity = 0;
        this.status = 'normal';
        this.attackStruck = false;
        this.knockUpSound = false;
        // guard to ensure we trigger landing logic (sound/invulnerability/bounce) only once
        this._knockLanded = false;
        this.hurtShake = 0;
        this.hurtShakeTimer = 0;
        this.slideVelocity = 0;
        this.slideFriction = 0;
        this.touchedCamera = false;
        
        this.frames = new Map();
        this.animationFrame = 0;
        this.animationTimer = 0;
        this.animations = {};
        
        this.image = new Image();
        
        this.opponent;
        this.onAttackHit = onAttackHit;
        this.effectSplash = effectSplash;
        this.EntityList = new EntityList();
        this.colorSwappedImage;


        this.boxes = {
        push: { x: 0, y: 0, width: 0, height: 0 },
        hit: { x: 0, y: 0, width: 0, height: 0 },
        hurt: {
            [FighterHurtBox.HEAD]: [0,0,0,0],
            [FighterHurtBox.BODY]: [0,0,0,0],
            [FighterHurtBox.FEET]: [0,0,0,0],
        },
        }

        this.states = {
             [FighterState.IDLE]:{
                init: this.handleIdleInit.bind(this),
                update: this.handleIdleState.bind(this),
                validFrom: [
                    undefined,FighterState.IDLE, FighterState.WALK_FORWARD,FighterState.JUMP_BACKWARD,
                    FighterState.JUMP_FORWARD,FighterState.JUMP_UP,
                    FighterState.CROUCH_UP, FighterState.WALK_BACKWARD, FighterState.JUMP_LAND,FighterState.IDLE_TURN,
                    FighterState.LIGHT_PUNCH, FighterState.HEAVY_PUNCH,FighterState.LIGHT_KICK, FighterState.HEAVY_KICK,
                   
                    FighterState.HURT_HEAD_LIGHT, FighterState.HURT_HEAD_HEAVY,
                    FighterState.HURT_BODY_LIGHT, FighterState.HURT_BODY_HEAVY,
                    FighterState.JUMP_HEAVYKICK, FighterState.JUMP_LIGHTKICK,
                    FighterState.SPECIAL_1, FighterState.DODGE, FighterState.SPECIAL_2, FighterState.BLOCK, FighterState.CROUCH_BLOCK,
                    FighterState.DODGE_FORWARD, FighterState.DODGE_BACKWARD, FighterState.DEATH, FighterState.GETUP,
                    FighterState.DIE, FighterState.FALL,
                ],
            },
            [FighterState.WALK_FORWARD]:{
                init: this.handleMoveInit.bind(this),
                update: this.handleWalkForwardState.bind(this),
                validFrom: [
                    FighterState.IDLE, FighterState.WALK_BACKWARD, FighterState.DODGE_FORWARD, FighterState.DODGE_BACKWARD,
                ],
            },
            [FighterState.WALK_BACKWARD]:{
                init: this.handleMoveInit.bind(this),
                update: this.handleWalkBackwardsState.bind(this),
                validFrom: [
                    FighterState.IDLE, FighterState.WALK_FORWARD, FighterState.DODGE_FORWARD, FighterState.DODGE_BACKWARD,
                ],
            },
            [FighterState.JUMP_START]:{
                init: this.handleJumpStartInit.bind(this),
                update: this.handleJumpStartState.bind(this),
                validFrom: [
                    FighterState.IDLE, FighterState.JUMP_LAND,
                    FighterState.WALK_BACKWARD,
                    FighterState.WALK_FORWARD,
                    FighterState.JUMP_HEAVYKICK,
                    FighterState.DODGE_FORWARD, FighterState.DODGE_BACKWARD,
                ],
            },
            [FighterState.JUMP_UP]:{
                init: this.handleJumpInit.bind(this),
                update: this.handleJumpState.bind(this),
                validFrom: [
                    FighterState.JUMP_START,  FighterState.DODGE_FORWARD, FighterState.DODGE_BACKWARD,
                ],
            },

            [FighterState.JUMP_FORWARD]:{
                init: this.handleJumpInit.bind(this),
                update: this.handleJumpState.bind(this),
                validFrom: [
                    FighterState.JUMP_START, FighterState.DODGE_FORWARD, FighterState.DODGE_BACKWARD,],
            },
            [FighterState.JUMP_BACKWARD]:{
                init: this.handleJumpInit.bind(this),
                update: this.handleJumpState.bind(this),
                validFrom: [
                    FighterState.JUMP_START, FighterState.DODGE_FORWARD, FighterState.DODGE_BACKWARD,],
            },
            [FighterState.JUMP_LAND]:{
                init: this.handleJumpLandInit.bind(this),
                update: this.handleJumpLandState.bind(this),
                validFrom: [
                    FighterState.JUMP_UP, FighterState.JUMP_FORWARD,FighterState.JUMP_BACKWARD, FighterState.JUMP_HEAVYKICK, FighterState.DODGE_FORWARD, FighterState.DODGE_BACKWARD,],
            },
            [FighterState.CROUCH]:{
                init:() => {},
               update: this.handleCrouchState.bind(this),
                validFrom:[FighterState.CROUCH_DOWN, FighterState.CROUCH_TURN, FighterState.CROUCH_LIGHTKICK, FighterState.CROUCH_HEAVYKICK, FighterState.CROUCH_BLOCK],
            },
            [FighterState.CROUCH_DOWN]:{
                 init: this.handleCrouchDownInit.bind(this),
                update: this.handleCrouchDownState.bind(this),
                validFrom:[FighterState.IDLE,FighterState.WALK_FORWARD, FighterState.WALK_BACKWARD, FighterState.CROUCH_BLOCK],
            },
            [FighterState.CROUCH_UP]:{
                 init:() => {},
                update: this.handleCrouchUpState.bind(this),
                validFrom:[FighterState.CROUCH],
            },
            [FighterState.IDLE_TURN]:{
                 init:() => {},
                update: this.handleIdleTurnState.bind(this),
                validFrom:[
                FighterState.IDLE, FighterState.JUMP_LAND,
                FighterState.WALK_FORWARD,FighterState.WALK_BACKWARD],
            },
            [FighterState.CROUCH_TURN]:{
                 init:() => {},
                update: this.handleCrouchTurnState.bind(this),
                validFrom:[FighterState.CROUCH, FighterState.CROUCH_LIGHTKICK,FighterState.CROUCH_HEAVYKICK],
            },
             [FighterState.LIGHT_PUNCH]:{
                attackType: FighterAttackType.PUNCH,
                attackStrength: FighterAttackStrength.LIGHT,
                 init: this.handleAttackInit.bind(this),
                update: this.handleLightPunchState.bind(this),
                validFrom:[FighterState.IDLE, FighterState.WALK_FORWARD, FighterState.WALK_BACKWARD, FighterState.LIGHT_KICK, FighterState.CROUCH_LIGHTKICK, FighterState.CROUCH],
            },
            [FighterState.HEAVY_PUNCH]:{
                attackType: FighterAttackType.PUNCH,
                attackStrength: FighterAttackStrength.HEAVY,
                 init: this.handleAttackInit.bind(this),
                update: this.handleHeavyPunchState.bind(this),
                validFrom:[FighterState.IDLE, FighterState.WALK_FORWARD, FighterState.WALK_BACKWARD, FighterState.SPECIAL_2, FighterState.LIGHT_KICK, FighterState.LIGHT_PUNCH, FighterState.CROUCH_LIGHTKICK, FighterState.CROUCH],
            },
             [FighterState.LIGHT_KICK]:{
                attackType: FighterAttackType.KICK,
                attackStrength: FighterAttackStrength.LIGHT,
                 init: this.handleAttackInit.bind(this),
                update: this.handleLightKickState.bind(this),
                validFrom:[FighterState.IDLE, FighterState.WALK_FORWARD, FighterState.WALK_BACKWARD, FighterState.LIGHT_PUNCH],
            },
            [FighterState.CROUCH_LIGHTKICK]:{
                attackType: FighterAttackType.KICK,
                attackStrength: FighterAttackStrength.LIGHT,
                 init: this.handleAttackInit.bind(this),
                update: this.handleCrouchLightKickState.bind(this),
                validFrom:[FighterState.CROUCH,FighterState.CROUCH_DOWN,FighterState.CROUCH_TURN, FighterState.LIGHT_KICK],
            },
            [FighterState.CROUCH_HEAVYKICK]:{
                attackType: FighterAttackType.KICK,
                attackStrength: FighterAttackStrength.HEAVYKICK,
                 init: this.handleAttackInit.bind(this),
                update: this.handleCrouchHeavyKickState.bind(this),
                validFrom:[FighterState.CROUCH,FighterState.CROUCH_DOWN,FighterState.CROUCH_TURN, FighterState.CROUCH_LIGHTKICK],
            },
            [FighterState.JUMP_LIGHTKICK]:{
                attackType: FighterAttackType.KICK,
                attackStrength: FighterAttackStrength.LIGHT,
                 init: this.handleJumpAttackInit.bind(this),
                update: this.handleJumpHeavyKickState.bind(this),
                validFrom:[FighterState.JUMP_BACKWARD, FighterState.JUMP_FORWARD,FighterState.JUMP_UP,],
            },
            [FighterState.JUMP_HEAVYKICK]:{
                attackType: FighterAttackType.KICK,
                attackStrength: FighterAttackStrength.HEAVY,
                 init: this.handleJumpAttackInit.bind(this),
                update: this.handleJumpHeavyKickState.bind(this),
                validFrom:[FighterState.JUMP_BACKWARD, FighterState.JUMP_FORWARD,FighterState.JUMP_UP,],
            },
            [FighterState.HEAVY_KICK]:{
                attackType: FighterAttackType.KICK,
                attackStrength: FighterAttackStrength.HEAVY,
                 init: this.handleAttackInit.bind(this),
                update: this.handleHeavyKickState.bind(this),
                validFrom:[FighterState.IDLE, FighterState.WALK_FORWARD, FighterState.WALK_BACKWARD, FighterState.LIGHT_KICK, FighterState.LIGHT_PUNCH],
            },
            [FighterState.HURT_HEAD_HEAVY]:{
                init: this.handleHurtInit.bind(this),
                update: this.handleHurtState.bind(this),
                validFrom: hurtStateValidFrom,
            },
            [FighterState.HURT_HEAD_LIGHT]:{
                init: this.handleHurtInit.bind(this),
                update: this.handleHurtState.bind(this),
                validFrom: hurtStateValidFrom,
            },
            [FighterState.HURT_BODY_HEAVY]:{
                init: this.handleHurtInit.bind(this),
                update: this.handleHurtState.bind(this),
                validFrom: hurtStateValidFrom,
            },
            [FighterState.HURT_BODY_LIGHT]:{
                init: this.handleHurtInit.bind(this),
                update: this.handleHurtState.bind(this),
                validFrom: hurtStateValidFrom,
            },
           
            [FighterState.BLOCK]:{
                init: this.handleBlockInit.bind(this),
                update: this.handleBlockState.bind(this),
                validFrom: hurtStateValidFrom,
            },
             [FighterState.CROUCH_BLOCK]:{
                init: this.handleCrouchBlockInit.bind(this),
                update: this.handleCrouchBlockState.bind(this),
                
                validFrom:[FighterState.CROUCH,FighterState.CROUCH_DOWN,FighterState.CROUCH_TURN,],
            },
            [FighterState.DEATH]:{
                init: this.handleDeathInit.bind(this),
                update: this.handleDeathState.bind(this),
                validFrom: hurtStateValidFrom,
            },
            [FighterState.DIE]:{
                init: this.handleDieInit.bind(this),
                update: this.handleDieState.bind(this),
                validFrom: hurtStateValidFrom,
            },
            [FighterState.LAYDOWN_GROUND]:{
                init: this.handleKnockUpInit.bind(this),
                update: this.handleKnockUpState.bind(this),
                validFrom: hurtStateValidFrom,
            },
            [FighterState.KNOCKUP]:{
                init: this.handleKnockUpInit.bind(this),
                update: this.handleKnockUpState.bind(this),
                validFrom: knockUpStateValidFrom,
            },
            [FighterState.FALL]:{
                init: this.handleFallInit.bind(this),
                update: this.handleFallState.bind(this),
                validFrom: knockUpStateValidFrom,
            },
            [FighterState.GETUP]:{
                init: this.handleGetUpInit.bind(this),
                update: this.handleGetUpState.bind(this),
                validFrom: [FighterState.KNOCKUP,FighterState.DIE, FighterState.DEATH, FighterState.FALL],
            },
        }
        this.changeState(FighterState.IDLE);
        
        this.soundAttacks = {
        [FighterAttackStrength.LIGHT]: document.querySelector('audio#sound-fighter-light-attack'),
        [FighterAttackStrength.HEAVY]: document.querySelector('audio#sound-fighter-heavy-attack'),
        [FighterAttackStrength.HEAVYKICK]: document.querySelector('audio#sound-fighter-heavy-attack'),
        [FighterAttackStrength.KNOCKLIFT]: document.querySelector('audio#sound-fighter-heavy-attack'),
        [FighterAttackStrength.KNOCKUP]: document.querySelector('audio#sound-fighter-heavy-attack'),
        [FighterAttackStrength.KNOCKLIFTDOWN]: document.querySelector('audio#sound-fighter-heavy-attack'),
        [FighterAttackStrength.SUPER1]: document.querySelector('audio#sound-fighter-heavy-attack'),
        [FighterAttackStrength.SUPER2]: document.querySelector('audio#sound-fighter-heavy-attack'),
        [FighterAttackStrength.SUPER3]: document.querySelector('audio#sound-fighter-heavy-attack'),
        [FighterAttackStrength.SLASH]: document.querySelector('audio#sound-slash'),
    }

    this.soundHits = {
        [FighterAttackStrength.LIGHT]:{
            [FighterAttackType.PUNCH]: document.querySelector('audio#sound-fighter-light-punch-hit'),
            [FighterAttackType.KICK]: document.querySelector('audio#sound-fighter-light-kick-hit'),
        },
        [FighterAttackStrength.HEAVY]:{
            [FighterAttackType.PUNCH]: document.querySelector('audio#sound-fighter-heavy-punch-hit'),
            [FighterAttackType.KICK]: document.querySelector('audio#sound-fighter-heavy-kick-hit'),
        },
        [FighterAttackStrength.HEAVYKICK]:{
            [FighterAttackType.PUNCH]: document.querySelector('audio#sound-fighter-heavy-punch-hit'),
            [FighterAttackType.KICK]: document.querySelector('audio#sound-fighter-heavy-kick-hit'),
        },
        [FighterAttackStrength.KNOCKLIFT]:{
            [FighterAttackType.PUNCH]: document.querySelector('audio#sound-fighter-heavy-punch-hit'),
            [FighterAttackType.KICK]: document.querySelector('audio#sound-fighter-heavy-kick-hit'),
        },
        [FighterAttackStrength.KNOCKUP]:{
            [FighterAttackType.PUNCH]: document.querySelector('audio#sound-fighter-heavy-punch-hit'),
            [FighterAttackType.KICK]: document.querySelector('audio#sound-fighter-heavy-kick-hit'),
        },
        [FighterAttackStrength.KNOCKLIFTDOWN]:{
            [FighterAttackType.PUNCH]: document.querySelector('audio#sound-fighter-heavy-punch-hit'),
            [FighterAttackType.KICK]: document.querySelector('audio#sound-fighter-heavy-kick-hit'),
        },
        [FighterAttackStrength.SUPER1]:{
            [FighterAttackType.PUNCH]: document.querySelector('audio#sound-fighter-heavy-punch-hit'),
            [FighterAttackType.KICK]: document.querySelector('audio#sound-fighter-heavy-kick-hit'),
        },
        [FighterAttackStrength.SUPER2]:{
            [FighterAttackType.PUNCH]: document.querySelector('audio#sound-fighter-heavy-punch-hit'),
            [FighterAttackType.KICK]: document.querySelector('audio#sound-fighter-heavy-kick-hit'),
        },
        [FighterAttackStrength.SUPER3]:{
            [FighterAttackType.PUNCH]: document.querySelector('audio#sound-fighter-heavy-punch-hit'),
            [FighterAttackType.KICK]: document.querySelector('audio#sound-fighter-heavy-kick-hit'),
        },
        [FighterAttackStrength.SLASH]:{
            [FighterAttackType.PUNCH]: document.querySelector('audio#sound-slash-hit'),
            [FighterAttackType.KICK]: document.querySelector('audio#sound-slash-hit'),
        },
        BLOCK: document.querySelector('audio#sound-fighter-light-punch-hit'),
    }
    this.soundTeleport = document.querySelector('audio#sound-teleport');
    this.soundLand = document.querySelector('audio#sound-fighter-land');
    this.soundLandKnockup = document.querySelector('audio#sound-fighter-landKnockup');
    this.soundFlame = document.querySelector('audio#sound-flame');
    this.soundBurn = document.querySelector('audio#sound-burn');
    }


    isAnimationCompleted = () => this.animations[this.currentState][this.animationFrame][1] === FrameDelay.TRANSITION;
    isAnimationKnockUp = () => this.animations[this.currentState][this.animationFrame][1] === 130;
    isHyperSkillEnabled = (frameActivation) => this.animations[this.currentState][this.animationFrame][1] === frameActivation;

    hasCollidedWithOpponent = () => rectsOverlap(
        this.position.x + this.boxes.push.x, this.position.y + this.boxes.push.y,
        this.boxes.push.width, this.boxes.push.height,
        this.opponent.position.x + this.opponent.boxes.push.x,
        this.opponent.position.y + this.opponent.boxes.push.y,
        this.opponent.boxes.push.width, this.opponent.boxes.push.height,
    );

     getDirection() {
        
    if (this.position.x + this.boxes.push.x + this.boxes.push.width 
        <= this.opponent.position.x + this.opponent.boxes.push.x
    ){
             return FighterDirection.RIGHT;
    }else if (
        this.position.x + this.boxes.push.x 
        >= this.opponent.position.x + this.opponent.boxes.push.x + this.opponent.boxes.push.width
    ){
        return FighterDirection.LEFT
    }
     return this.direction;
}

    getBoxes(frameKey) {
    const frame = this.frames.get(frameKey);
    if (!frame) {
        console.warn(`Missing frame data for key: ${frameKey}`);
        return { x: 0, y: 0, width: 0, height: 0 };
    }
    const [, 
        [pushX = 0, pushY = 0, pushWidth = 0, pushHeight = 0] = [],
        [head = [0,0,0,0], body = [0,0,0,0], feet = [0,0,0,0]] = [],
        [hitX = 0, hitY = 0, hitWidth = 0, hitHeight = 0] = [],
    ] = frame;
    return { 
        push: {x: pushX, y: pushY, width: pushWidth, height: pushHeight },
        hit: {x: hitX, y: hitY, width: hitWidth, height: hitHeight },
        hurt: {
            [FighterHurtBox.HEAD]: head,
            [FighterHurtBox.BODY]: body,
            [FighterHurtBox.FEET]: feet,
        },
        };
    }
 // FIxed
    getHitState(attackStrength, hitLocation) {
        switch (attackStrength){
            case FighterAttackStrength.LIGHT:
                if(hitLocation === FighterHurtBox.HEAD) return FighterState.HURT_HEAD_LIGHT;
                return FighterState.HURT_BODY_LIGHT;
            case FighterAttackStrength.HEAVY:
                if(hitLocation === FighterHurtBox.HEAD) return FighterState.HURT_HEAD_HEAVY;
                return FighterState.HURT_BODY_HEAVY;
            case FighterAttackStrength.SUPER1:
                if(hitLocation === FighterHurtBox.HEAD) return FighterState.HURT_HEAD_HEAVY;
                return FighterState.HURT_BODY_HEAVY;
            case FighterAttackStrength.SUPER2:
                if(hitLocation === FighterHurtBox.HEAD) return FighterState.HURT_HEAD_HEAVY;
                return FighterState.HURT_BODY_HEAVY;
             case FighterAttackStrength.SUPER3:
                if(hitLocation === FighterHurtBox.HEAD) return FighterState.HURT_HEAD_HEAVY;
                return FighterState.HURT_BODY_HEAVY;
            case FighterAttackStrength.SLASH:
                if(hitLocation === FighterHurtBox.BODY) return FighterState.HURT_HEAD_HEAVY;
                return FighterState.HURT_BODY_HEAVY;
            case FighterAttackStrength.KNOCKLIFT:
                if(hitLocation === FighterHurtBox.BODY) return FighterState.HURT_HEAD_HEAVY;
                return FighterState.HURT_BODY_HEAVY;
                }
        }
    


    resetVelocities(){
        if(this.position.y >= STAGE_FLOOR){
            this.velocity.x = 0;
        this.velocity.y = 0;
        }
        
    }

    resetSlide(transferToOpponent = false){
        if (transferToOpponent){
            this.opponent.slideVelocity = this.slideVelocity;
            this.opponent.slideFriction = this.slideFriction;
            
        }
        this.slideFriction = 0;
        this.slideVelocity = 0;
        
    }

  changeState(newState, ...args) {
    if (!this.states[newState].validFrom.includes(this.currentState)) return;
    this.attackStruck = false;
    const state = this.states[newState];
    this.currentState = newState;
    this.animationFrame = 0;

    const passedStrength = args[1];
    const passedType = args[2];

    state.init(
        ...(args || []),
        passedStrength ?? state.attackStrength,
        passedType ?? state.attackType,
        this.playerId
    );
}

// Cancel Attack implementation
isInCancelWindow(state, cancelData = null) {
    if (!cancelData) {
        // Use default cancel windows if not specified
        const windows = {
            [FighterState.LIGHT_PUNCH]: { start: 3, end: 5 },
            [FighterState.HEAVY_PUNCH]: { start: 4, end: 7 },
            [FighterState.LIGHT_KICK]: { start: 3, end: 5 },
            [FighterState.HEAVY_KICK]: { start: 4, end: 7 },
            [FighterState.CROUCH_LIGHTKICK]: { start: 3, end: 5 },
        };
        cancelData = windows[state];
    }
    
    if (!cancelData) return false;
    return this.animationFrame >= cancelData.start && 
           this.animationFrame <= cancelData.end;
}

// Helper method to check which attack input is pressed
getNextAttackInput() {
    if (control.isLightPunch(this.playerId)) return FighterState.LIGHT_PUNCH;
    if (control.isHeavyPunch(this.playerId)) return FighterState.HEAVY_PUNCH;
    if (control.isLightKick(this.playerId)) return FighterState.LIGHT_KICK;
    if (control.isHeavyKick(this.playerId)) return FighterState.HEAVY_KICK;
    return null;
}

    
    //Idle
    handleIdleInit(){
        this.resetVelocities();
        this.gravity = 1000;
        this.attackStruck = false;
        
    }

     handleWalkIdleState(){
        this.velocity.x = 0;
        this.velocity.y = 0;
    }

    //Move Forward or Back
    handleMoveInit(distance){
        this.velocity.x = this.initialVelocity.x[this.currentState] ?? 0;
    }

     handleCrouchState(time){
         if (!control.isDown(this.playerId)) this.changeState(FighterState.CROUCH_UP);
       

        if(control.isLightKick(this.playerId)){
            this.changeState(FighterState.CROUCH_LIGHTKICK);
        }else if(control.isHeavyKick(this.playerId)){
            this.changeState(FighterState.CROUCH_HEAVYKICK);
        } if(control.isLightPunch(this.playerId)){
            this.changeState(FighterState.LIGHT_PUNCH);
        }else if(control.isHeavyPunch(this.playerId)){
            this.changeState(FighterState.HEAVY_PUNCH);
        }
         const newDirection = this.getDirection();

        if(newDirection !== this.direction){
            this.direction = newDirection;
            this.changeState(FighterState.CROUCH_TURN);
        }
    }


    handleCrouchDownState(time){

        if(this.isAnimationCompleted()){
            this.changeState(FighterState.CROUCH, time);
        } 

        if(!control.isDown(this.playerId)){
            this.currentState = FighterState.CROUCH_UP;
            this.animationFrame = this.animations[FighterState.CROUCH_UP][this.animationFrame].length
            - this.animationFrame;
        }
    }

    handleCrouchUpState(){
        if(this.isAnimationCompleted()){
            this.changeState(FighterState.IDLE);
        }
    }
 
     //JUMP UP
    handleJumpInit(){
        this.velocity.y = this.initialVelocity.jump;
       
        this.handleMoveInit();
    }

    

    handleBlockInit(time, hitPosition){
       this.onAttackHit?.(time, this.opponent.playerId, this.playerId, hitPosition, FighterAttackStrength.BLOCK);
        
         playSound(this.soundHits.BLOCK);
      //  this.EntityList.add(SuperHitSplash, time, this.opponent.position.x, this.opponent.position.y - 30, this.opponent.playerId);
        this.handleMoveInit();
    }

    handleCrouchBlockInit(time, hitPosition){
       this.onAttackHit?.(time, this.opponent.playerId, this.playerId, hitPosition, FighterAttackStrength.BLOCK);
      
        playSound(this.soundHits.BLOCK);
      
        this.handleMoveInit();
    }

    handleCrouchDownInit(){
        this.resetVelocities();
    }

    handleJumpStartInit(){
    this.resetVelocities();
   }

   handleJumpLandInit(time){
    const hitPosition = {
            x: this.position.x,
            y: 0,
        };
    this.resetVelocities();
    this.effectSplash?.(time, this.opponent.playerId, this.playerId, hitPosition, "groundSmoke", "foreground", this.direction);
    this.soundLand.play();
   }

   handleAttackInit(){
    this.gravity = 1000;
    this.resetVelocities();
    playSound(this.soundAttacks[this.states[this.currentState].attackStrength]);
   }

   handleJumpAttackInit(){
    playSound(this.soundAttacks[this.states[this.currentState].attackStrength]);
   }

   handleHurtInit(){
    this.resetVelocities();
    this.hurtShake = 2;
    this.hurtShakeTimer = performance.now();
   }


    //states
    handleIdleTurnState(){
        this.handleIdleState();

        if(!this.isAnimationCompleted()) return;
            this.changeState(FighterState.IDLE);
    }

    handleCrouchTurnState(){
        this.handleIdleState();

        if(!this.isAnimationCompleted()) return;
            this.changeState(FighterState.CROUCH);
    }

     handleLightAttackReset() {
        this.animationFrame = 0;
        this.handleAttackInit();
        this.attackStruck = false;
    }

    handleLightPunchState(){
    // Startup frames (can't cancel or be interrupted)
    if (this.animationFrame < 2) return;
    if (control.isLightPunch(this.playerId)) return;
    
    // Cancel window: allow chaining to other attacks
    if (this.isInCancelWindow(FighterState.LIGHT_PUNCH)) {
        const nextAttack = this.getNextAttackInput();
        if (nextAttack && nextAttack !== FighterState.LIGHT_PUNCH) {
            if (this.states[nextAttack].validFrom.includes(FighterState.LIGHT_PUNCH)) {
                this.changeState(nextAttack);
                return;
            }
        }
    }

    if (!this.isAnimationCompleted()) return;
    this.changeState(FighterState.IDLE);
}

handleHeavyPunchState(){
    // Startup frames
    if (this.animationFrame < 4) return;
    
    // Cancel window
    if (this.isInCancelWindow(FighterState.HEAVY_PUNCH)) {
        const nextAttack = this.getNextAttackInput();
        if (nextAttack && nextAttack !== FighterState.HEAVY_PUNCH) {
            if (this.states[nextAttack].validFrom.includes(FighterState.HEAVY_PUNCH)) {
                this.changeState(nextAttack);
                return;
            }
        }
    }

    if (!this.isAnimationCompleted()) return;
    this.changeState(FighterState.IDLE);
}

handleLightKickState(){
    if (this.animationFrame < 2) return;
    if (control.isLightKick(this.playerId)) return;
    
    if (this.isInCancelWindow(FighterState.LIGHT_KICK)) {
        const nextAttack = this.getNextAttackInput();
        if (nextAttack && nextAttack !== FighterState.LIGHT_KICK) {
            if (this.states[nextAttack].validFrom.includes(FighterState.LIGHT_KICK)) {
                this.changeState(nextAttack);
                return;
            }
        }
    }

    if (!this.isAnimationCompleted()) return;
    this.changeState(FighterState.IDLE);
}

handleHeavyKickState(){
    if (this.animationFrame < 4) return;
    
    if (this.isInCancelWindow(FighterState.HEAVY_KICK)) {
        const nextAttack = this.getNextAttackInput();
        if (nextAttack && nextAttack !== FighterState.HEAVY_KICK) {
            if (this.states[nextAttack].validFrom.includes(FighterState.HEAVY_KICK)) {
                this.changeState(nextAttack);
                return;
            }
        }
    }

    if (!this.isAnimationCompleted()) return;
    this.changeState(FighterState.IDLE);
}

    handleCrouchLightKickState(){
    if (this.animationFrame < 2) return;
    if (control.isLightKick(this.playerId)) return;
    
    if (this.isInCancelWindow(FighterState.CROUCH_LIGHTKICK)) {
        if (control.isHeavyKick(this.playerId)) {
            this.changeState(FighterState.CROUCH_HEAVYKICK);
            return;
        } else if (control.isLightPunch(this.playerId)) {
            this.changeState(FighterState.LIGHT_PUNCH);
            return;
        }else if (control.isHeavyPunch(this.playerId)) {
            this.changeState(FighterState.HEAVY_PUNCH);
            return;
        }

    }

    if (!this.isAnimationCompleted()) return;
    this.changeState(FighterState.CROUCH);
}
    
    handleCrouchHeavyKickState(){
        if (!this.isAnimationCompleted()) return;
        this.changeState(FighterState.CROUCH);
    }
    handleJumpHeavyKickState(){
        if (!this.isAnimationCompleted()) return;
        if(this.position.y >= STAGE_FLOOR){
            this.changeState(FighterState.IDLE);
            return;
        }
    }

    handleHurtState(){
        if (!this.isAnimationCompleted()) return;
        this.hurtShake = 0;
        this.hurtShakeTimer = 0;
        this.changeState(FighterState.IDLE);
    }

    handleAttackHit(time, attackStrength, attackType, hitPosition, hurtLocation){
        
         //if(this.attackStruck) return
         if(gameState.fighters[this.playerId].hitPoints <= 0 || gameState.fighters[this.playerId].dead === "die" || gameState.fighters[this.playerId].dead === "dead"){
            // Delegate win/death handling to centralized method
            this.velocity.x = FighterAttackBaseData[attackStrength].thrust.x;
            this.velocity.y = FighterAttackBaseData[attackStrength].thrust.y;
            this.updateWinCondition();
            return;
         } 
        
                const newState = this.getHitState(attackStrength, hurtLocation);
                const attackData = FighterAttackBaseData[attackStrength] || {};
                const { velocity: slideVel = 0, friction = 0 } = attackData.slide || {};

                // Always set slide and mark the attack as struck — even if the fighter
                // is already KO'd we still want the corpse to be pushed by the hit.
                this.slideVelocity = slideVel;
                this.slideFriction = friction;
                this.attackStruck = true;

                // honor invulnerability (explicit temporary invulnerable state)
                if (gameState.fighters[this.playerId].dead === "invulnerable") {
                        console.log("cannot be attacked");
                        return;
                }

        if (this.soundHits?.[attackStrength]?.[attackType]) {
            playSound(this.soundHits[attackStrength][attackType]);
        }
        this.onAttackHit?.(time, this.opponent.playerId, this.playerId, hitPosition, attackStrength,this.direction);
       
        // apply any effect specified on the attack data (e.g., burned, stunned)
        try {
            if (attackData && attackData.effect && gameState.fighters[this.playerId]) {
                const effect = attackData.effect;

                if(effect.type === "burn"){
                
                 playSound(this.soundBurn);
                 playSound(this.soundFlame,0.5);
                
                }
                const now = (time && time.previous) || performance.now();
                const expiresAt = now + (effect.duration || 0);
                gameState.fighters[this.playerId].status = effect.type;
                gameState.fighters[this.playerId].statusExpiresAt = expiresAt;
                this.status = effect.type;
            }
        } catch (e) {
            // defensive: don't break game if something unexpected
            console.warn('Failed to apply attack effect', e);
        }
        
        // If the target is already knocked out / dead we still want to apply
        // thrust slide so the body moves. However knockup / airborne logic
        // should only trigger when the target still has positive HP.
        if (attackData.knockup && gameState.fighters[this.playerId].hitPoints > 0) {
            if(attackStrength === FighterAttackStrength.HEAVYKICK){
                this.changeState(FighterState.FALL);
                
                return;
            } 
            console.log("Knock up hit activate");
            this.changeState(FighterState.KNOCKUP);
            // set thrust after the state init so it isn't cleared by resetVelocities
            this.velocity.x = attackData.thrust?.x ?? 0;
            this.velocity.y = attackData.thrust?.y ?? 0;
            return;
        }
        // Even if the fighter is KO'd (dead/die) we still want the hit thrust
        // to affect their body. If they're still alive and breathing change
        // to the appropriate hurt state so animations/sounds show.
        if (gameState.fighters[this.playerId].hitPoints <= 0 ||
            gameState.fighters[this.playerId].dead === "die" ||
            gameState.fighters[this.playerId].dead === "dead") {
            // apply thrust so even dead bodies get moved by the hit
            this.velocity.x = attackData.thrust?.x ?? 0;
            this.velocity.y = attackData.thrust?.y ?? 0;

            // Centralized win/death handling (may change state to DEATH)
            this.updateWinCondition();
            // continue — do not return so we still apply effects / sounds / logging
        }

        if (gameState.fighters[this.playerId].dead === "breathing" && gameState.fighters[this.playerId].hitPoints > 0) {
            this.changeState(newState);
            // set thrust after the state init so it isn't cleared by resetVelocities
            this.velocity.x = attackData.thrust?.x ?? 0;
            this.velocity.y = attackData.thrust?.y ?? 0;
        }
         

        console.log(`${gameState.fighters[this.playerId].id} has hit ${gameState.fighters[this.opponent.playerId].id}'s ${hurtLocation} with a ${attackStrength} attacks`);
    }

    //Death init and States
    handleDeathInit(){
       this.gravity = 1200; // tuned for a strong, but controllable fall
       this.velocity.x = -100;
       this.velocity.y = -300;
        this._bounceCount = 0;
        this._knockLanded = false;
        this.knockUpSound = false;
         console.log("Dead Init !");
         playSound(this.deathSound);
       
    }

     handleDeathState(time){
         const hitPosition = {
            x: this.position.x,
            y: 0,
        };
        if(this.animationFrame >= 1) {
    // HIT FLOOR?
    const isLanding = this.position.y >= STAGE_FLOOR;

    if (isLanding) {

        // Initialize bounce count if undefined
       

        // Detect a NEW bounce (only when hitting floor from above)
        if(!this._bounceActive && this._bounceCount < 1) this.effectSplash?.(time, this.opponent.playerId, this.playerId, hitPosition, "groundSmoke", "foreground", this.direction);
           
            
        if (!this._bounceActive && this._bounceCount < 2) {
            this._bounceActive = true;
            this._bounceCount++;

            // ✔ Play sound on EVERY bounce
            playSound(this.soundLandKnockup, 0.6);
            
             this.effectSplash?.(time, this.opponent.playerId, this.playerId, hitPosition, "groundShake", "background");
            // ✔ fighter becomes invulnerable during knock-up crash
            gameState.fighters[this.playerId].dead = "invulnerable";

            // BOUNCE effect
            const bounceFactor = 0.22;
            if (this.velocity.y > 0) {
                this.velocity.y = -Math.max(120, Math.abs(this.velocity.y) * bounceFactor);
            } else {
                this.velocity.y = -140;
            }
        } 
        else {
            // PAST LANDING: velocity damping
            this.velocity.y *= 0.5;
            if (Math.abs(this.velocity.y) < 12) this.velocity.y = 0;

            this.velocity.x *= 0.8;

            // After 3 bounces, stop bouncing and go to GETUP
            if (this._bounceCount >= 2 && this.isAnimationCompleted()) {
                gameState.fighters[this.playerId].dead = "die";
                 if(gameState.fighters[this.playerId].hitPoints <= 0) return;
                this.changeState(FighterState.GETUP);
            }
        }

        return;
    }

    // --- AIRBORNE ---
    // Reset bounce trigger so a new bounce can happen later
    this._bounceActive = false;

    // airborne: remove invulnerability
    if (gameState.fighters[this.playerId].dead === "invulnerable") {
        gameState.fighters[this.playerId].dead = "die";
    }

    // let animation play while mid-air
    if (!this.isAnimationCompleted()) return;
}
       
        if (!this.isAnimationCompleted()) return;
        gameState.fighters[this.playerId].dead = "die";
        if(gameState.fighters[this.playerId].hitPoints <= 0) return;
        this.changeState(FighterState.GETUP);
    }

    //Die
    handleDieInit(){
       
        console.log("Die Init !");
       
    }

     handleDieState(){
        
       // if (!this.isAnimationCompleted()) return;
        if (gameState.fighters[this.playerId].dead === "die") return;
        if(gameState.fighters[this.playerId].hitPoints <= 0) return;
        this.changeState(FighterState.GETUP);
    }

    //Knock Up States and Init
    handleKnockUpInit(){
         console.log("Knock Up Init !");
        if(gameState.fighters[this.playerId].hitPoints <= 0) {
           playSound(this.deathSound);
          // playSound(this.soundHits.BLOCK);
            gameState.fighters[this.playerId].dead = "die";
        };
        // prepare knock-up physics: enable gravity so the fighter will fall back down
        // and reset the one-shot landing guard and sound flag
        this.gravity = 1200; // tuned for a strong, but controllable fall
        this._bounceCount = 0;
        this._knockLanded = false;
        this.knockUpSound = false;
    }

    //Fall Init
    handleFallInit(){
         console.log("Knock Up Init !");
        if(gameState.fighters[this.playerId].hitPoints <= 0) {
           playSound(this.deathSound);
           //playSound(this.soundHits.BLOCK);
            gameState.fighters[this.playerId].dead = "die";
        };
       
    }

   handleKnockUpState(time) {
   
    
        const hitPosition = {
            x: this.position.x,
            y: 0,
        };

    // if dead then ignore
    if (gameState.fighters[this.playerId].hitPoints <= 0) return;
    if(this.animationFrame >= 1) {
    // HIT FLOOR?
    const isLanding = this.position.y >= STAGE_FLOOR;

    if (isLanding) {

        // Initialize bounce count if undefined
       

        // Detect a NEW bounce (only when hitting floor from above)
        if(!this._bounceActive && this._bounceCount < 1) this.effectSplash?.(time, this.opponent.playerId, this.playerId, hitPosition, "groundSmoke", "foreground", this.direction);
        if (!this._bounceActive && this._bounceCount < 2) {
            this._bounceActive = true;
            this._bounceCount++;

            // ✔ Play sound on EVERY bounce
            playSound(this.soundLandKnockup, 0.6);
            this.effectSplash?.(time, this.opponent.playerId, this.playerId, hitPosition, "groundShake", "background");
            

            // ✔ fighter becomes invulnerable during knock-up crash
            gameState.fighters[this.playerId].dead = "invulnerable";

            // BOUNCE effect
            const bounceFactor = 0.22;
            if (this.velocity.y > 0) {
                this.velocity.y = -Math.max(120, Math.abs(this.velocity.y) * bounceFactor);
            } else {
                this.velocity.y = -140;
            }
        } 
        else {
            // PAST LANDING: velocity damping
            this.velocity.y *= 0.5;
            if (Math.abs(this.velocity.y) < 12) this.velocity.y = 0;

            this.velocity.x *= 0.8;

            // After 3 bounces, stop bouncing and go to GETUP
            if (this._bounceCount >= 2 && this.isAnimationCompleted()) {
                gameState.fighters[this.playerId].dead = "breathing";
                this.changeState(FighterState.GETUP);
            }
        }

        return;
    }

    // --- AIRBORNE ---
    // Reset bounce trigger so a new bounce can happen later
    this._bounceActive = false;

    // airborne: remove invulnerability
    if (gameState.fighters[this.playerId].dead === "invulnerable") {
        gameState.fighters[this.playerId].dead = "breathing";
    }

    // let animation play while mid-air
    if (!this.isAnimationCompleted()) return;
}
}



    handleFallState(){
      
        if(this.isAnimationKnockUp()) gameState.fighters[this.playerId].dead = "invulnerable";
         
        if (!this.isAnimationCompleted()) return;
         if(this.position.y >= STAGE_FLOOR){
            
         
         console.log("Knock Up Init on ground!");
           playSound(this.soundHits.BLOCK);
         if(gameState.fighters[this.playerId].hitPoints <= 0) return;
        this.changeState(FighterState.GETUP);
         }
    }

    //Get Up States and Init
    handleGetUpInit(){
        this.velocity.x = 0;
        this.velocity.y = 0;
        gameState.fighters[this.playerId].dead = "invulnerable";
        this.knockUpSound = false;
        console.log("GetUp Init!");
    }

     handleGetUpState(){
       
        if (!this.isAnimationCompleted()) return;
        gameState.fighters[this.playerId].dead = "breathing";
        if(gameState.fighters[this.playerId].hitPoints <= 0) return;
        this.changeState(FighterState.IDLE);
    }

    handleIdleState(time){
        gameState.fighters[this.playerId].dead = "breathing";
        gameState.fighters[this.playerId].sprite = 0;

        const newDirection = this.getDirection();

        if(newDirection !== this.direction){
            this.direction = newDirection;
            this.changeState(FighterState.IDLE_TURN);
        }
        
        if(!gameState.fighterNotIdle) return;
          this.touchedCamera = false;
 
        if (control.isUp(this.playerId) && this.position.y >= STAGE_FLOOR) {
            this.changeState(FighterState.JUMP_START);
        } else if (control.isDown(this.playerId) && this.position.y >= STAGE_FLOOR) {
            this.changeState(FighterState.CROUCH_DOWN, time);
        } else if (control.isBackward(this.playerId, this.direction) && this.position.y >= STAGE_FLOOR) {
            this.changeState(FighterState.WALK_BACKWARD);
        }else if (control.isForward(this.playerId, this.direction) && this.position.y >= STAGE_FLOOR) {
            this.changeState(FighterState.WALK_FORWARD);
        }else if(control.isLightPunch(this.playerId)){
           this.changeState(FighterState.LIGHT_PUNCH);
        }else if(control.isHeavyPunch(this.playerId)){
            this.changeState(FighterState.HEAVY_PUNCH);
        }else if(control.isLightKick(this.playerId)){
            this.changeState(FighterState.LIGHT_KICK);
        }else if(control.isHeavyKick(this.playerId)){
            this.changeState(FighterState.HEAVY_KICK);
        } else if(control.isSelect(this.playerId)){
            this.changeState(FighterState.KNOCKUP);
        } else if(gameState.fighters[this.playerId].dead === "dead"){
            console.log("Dead State");
             this.changeState(FighterState.DEATH);
        }  else if(gameState.fighters[this.playerId].dead === "die"){
            
             this.changeState(FighterState.DIE);
            console.log("Die State");
        }  else if(gameState.fighters[this.playerId].dead === "alive"){
           console.log("Alive Getup State");
             this.changeState(FighterState.GETUP);
            gameState.fighters[this.playerId].dead = "breathing";
        }

        
        

        
    }

    handleWalkForwardState(){
        if (!control.isForward(this.playerId, this.direction)) this.changeState(FighterState.IDLE);
        
        
        if (control.isUp(this.playerId)) {
            this.changeState(FighterState.JUMP_START);
        }
        if (control.isDown(this.playerId)) this.changeState(FighterState.CROUCH_DOWN);
        
        if(control.isLightPunch(this.playerId)){
            this.changeState(FighterState.LIGHT_PUNCH);
        }else if(control.isHeavyPunch(this.playerId)){
            this.changeState(FighterState.HEAVY_PUNCH);
        }else if(control.isLightKick(this.playerId)){
            this.changeState(FighterState.LIGHT_KICK);
        }else if(control.isHeavyKick(this.playerId)){
            this.changeState(FighterState.HEAVY_KICK);
        }

        

         this.direction = this.getDirection();
    }

    handleWalkBackwardsState(){
        if (!control.isBackward(this.playerId, this.direction)) this.changeState(FighterState.IDLE);
       
        if (control.isUp(this.playerId)) {
            this.changeState(FighterState.JUMP_START);
        }
        if (control.isDown(this.playerId)) this.changeState(FighterState.CROUCH_DOWN);

        if(control.isLightPunch(this.playerId)){
            this.changeState(FighterState.LIGHT_PUNCH);
        }else if(control.isHeavyPunch(this.playerId)){
            this.changeState(FighterState.HEAVY_PUNCH);
        }else if(control.isLightKick(this.playerId)){
            this.changeState(FighterState.LIGHT_KICK);
        }else if(control.isHeavyKick(this.playerId)){
            this.changeState(FighterState.HEAVY_KICK);
        }

        
      this.direction = this.getDirection();
    }

   

     handleBlockState(){
        console.log('Blocking');
        if (!this.isAnimationCompleted()) return;
        this.changeState(FighterState.IDLE);
    }

     handleCrouchBlockState(){
        console.log('Crouch Blocking');
        if (!this.isAnimationCompleted()) return;
        this.changeState(FighterState.CROUCH);
    }


     handleJumpState(time){
        //this.velocity.y += this.gravity * time.secondsPassed;
        if(control.isLightKick(this.playerId)){
            this.changeState(FighterState.JUMP_LIGHTKICK);
        }else if(control.isHeavyKick(this.playerId)){
            this.changeState(FighterState.JUMP_HEAVYKICK);
        }
   
        if(this.position.y >= STAGE_FLOOR){
          //  this.position.y = STAGE_FLOOR;
          //  this.velocity.y = 0;
            this.changeState(FighterState.JUMP_LAND);
        }
    }


    handleJumpStartState(){
     if(this.isAnimationCompleted() && this.position.y >= STAGE_FLOOR){
        if(control.isBackward(this.playerId, this.direction)){
            this.changeState(FighterState.JUMP_BACKWARD);
        }else if (control.isForward(this.playerId, this.direction)){
            this.changeState(FighterState.JUMP_FORWARD);
        }else {
            this.changeState(FighterState.JUMP_UP);
        }
        
     }
    }

    handleJumpLandState(){
        if(this.animationFrame < 1) return;

        let newState = FighterState.IDLE;

        if(!control.isIdle(this.playerId)){
            this.direction = this.getDirection();

            this.handleIdleState();
        } else {
            const newDirection = this.getDirection();

            if(newDirection !== this.direction){
                this.direction = newDirection;
                newState = FighterState.IDLE_TURN;
            } else {
                if (!this.isAnimationCompleted()) return;
            }
        }

        this.changeState(newState);
    }

//Main Functions

    updateStageConstraints(time, context, camera){
       //- this.boxes.push.width
       //+ this.boxes.push.width
       const fighterBox = 25;
        if (this.position.x > camera.position.x-fighterBox + context.canvas.width ) {
            this.position.x = camera.position.x-fighterBox + context.canvas.width ;
           //  this.touchedCamera = true;
            //console.log("out of bounds right", this.playerId, this.touchedCamera);
            
            this.velocity.x = 0;

            this.resetSlide(true);
        }

        if (this.position.x < camera.position.x+fighterBox ){
            this.position.x = camera.position.x+fighterBox ;
          //  this.touchedCamera = true;
           //  console.log("out of bounds left", this.playerId, this.touchedCamera);
            
            this.velocity.x = 0;
             this.resetSlide(true);
        }
     if(gameState.dodging) return;
        if (this.hasCollidedWithOpponent()) {
            if (this.position.x <= this.opponent.position.x){
                this.position.x = Math.max(
                    (this.opponent.position.x + this.opponent.boxes.push.x) - (this.boxes.push.x + this.boxes.push.width),
                    camera.position.x + this.boxes.push.width,
                   
                );

                if([
                    FighterState.IDLE, FighterState.CROUCH, FighterState.JUMP_UP, FighterState.JUMP_FORWARD,FighterState.JUMP_BACKWARD,
                ].includes(this.opponent.currentState)){
                    this.opponent.position.x += PUSH_FRICION * time.secondsPassed;
                }
            }
            if (this.position.x >= this.opponent.position.x){
                this.position.x = Math.min(
                (this.opponent.position.x + this.opponent.boxes.push.x + this.opponent.boxes.push.width)
                + (this.boxes.push.width + this.boxes.push.x),
                camera.position.x + context.canvas.width - this.boxes.push.width,
               
                );
                if([
                    FighterState.IDLE, FighterState.CROUCH, FighterState.JUMP_UP, FighterState.JUMP_FORWARD,FighterState.JUMP_BACKWARD,
                ].includes(this.opponent.currentState)){
                    this.opponent.position.x -= PUSH_FRICION * time.secondsPassed;
                }
            }
        }
    }

    updateAnimation(time){
        const animation = this.animations[this.currentState];
        const[, frameDelay] = animation[this.animationFrame];

        if(time.previous <= this.animationTimer + frameDelay*gameState.slowFX) return;
            this.animationTimer = time.previous;
                
            if(frameDelay <= FrameDelay.FREEZE) return;
            this.animationFrame++;

             if (this.animationFrame >= animation.length) this.animationFrame = 0;
                 
             this.boxes = this.getBoxes(animation[this.animationFrame][0]);

    }

    updateAttackBoxCollided(time) {
       if(gameState.fighters[this.opponent.playerId].dead === "invulnerable"){
            console.log("cannot be attacked");
            return;
        } 
    const { attackStrength, attackType } = this.states[this.currentState];
    if (!attackType || this.attackStruck) return;
    if (!this.boxes?.hit || !this.opponent?.boxes?.hurt) return;
   

    const actualHitBox = getActualBoxDimensions(this.position, this.direction, this.boxes.hit);
    // If the active frame doesn't have a real hitbox (zero area), skip collision checks.
    if (!actualHitBox || actualHitBox.width <= 0 || actualHitBox.height <= 0) {
        // Debug: sometimes an animation frame deliberately has no hitbox, avoid treating
        // the fighter origin as a tiny hit region that can collide with the opponent.
        return;
    }
    for (const [hurtLocation, hurtBox] of Object.entries(this.opponent.boxes.hurt)) {
        const [x, y, width, height] = hurtBox;
        const actualOpponentHurtBox = getActualBoxDimensions(
            this.opponent.position, this.opponent.direction, {x, y, width, height}
        );
        if (!actualOpponentHurtBox || actualOpponentHurtBox.width <= 0 || actualOpponentHurtBox.height <= 0) continue;
        
        

        if (!boxOverlap(actualHitBox, actualOpponentHurtBox)) continue;

        stopSound(this.soundAttacks[attackStrength]);
        

        const attackData = FighterAttackBaseData[attackStrength];
        if (attackData) {
          //  gameState.fighters[this.playerId].score += attackData.score;
          //  gameState.fighters[this.playerId].skillPoints += attackData.skill;
           // gameState.fighters[this.opponent.playerId].hitPoints -= attackData.damage;
        }

        const hitPosition = {
            x: (actualHitBox.x + actualHitBox.width/2 + actualOpponentHurtBox.x + actualOpponentHurtBox.width/2) / 2,
            y: (actualHitBox.y + actualHitBox.height/2 + actualOpponentHurtBox.y + actualOpponentHurtBox.height/2) / 2,
        };
        hitPosition.x += (Math.random() - 0.5) * 8;
        hitPosition.y += (Math.random() - 0.5) * 8;

        
            if(gameState.fighters[this.opponent.playerId].hitPoints <= 0 || gameState.fighters[this.opponent.playerId].dead === "die" || gameState.fighters[this.opponent.playerId].dead === "dead"){
                // Delegate win/death handling to centralized method
                 console.log("reset hp opponent");
                if (gameState.practiceMode.infiniteHealth) gameState.fighters[this.opponent.playerId].hitPoints += 144;
                this.updateWinCondition();
                return;
            } 

         if (this.opponent.currentState === FighterState.WALK_BACKWARD || this.opponent.currentState === FighterState.BLOCK) {
        
        this.opponent.changeState(FighterState.BLOCK, time, hitPosition);
        return
    } 
     //Crouch Block 
     if ( control.isBackward(this.opponent.playerId, this.opponent.direction) && this.opponent.currentState === FighterState.CROUCH || this.opponent.currentState === FighterState.CROUCH_BLOCK) {
        this.opponent.changeState(FighterState.CROUCH_BLOCK, time, hitPosition);
        return
     }
        this.opponent.handleAttackHit(time, attackStrength, attackType, hitPosition, hurtLocation);
        break;
    }
}


    updateWinCondition(){
         if (gameState.practiceMode.infiniteHealth) return;
      //  if(gameState.fighters[this.playerId].skillNumber <= 0) gameState.fighters[this.playerId].skillConsumed = true;
       // if(gameState.fighters[this.opponent.playerId].skillNumber <= 0) gameState.fighters[this.opponent.playerId].skillConsumed = true;
        // Centralized win/death handling: switch to DEATH state (don't return to IDLE)
        // Opponent KO
        if (this.opponent && gameState.fighters[this.opponent.playerId].hitPoints <= 0 && this.opponent.currentState !== FighterState.DEATH) {
            // mark invulnerable to avoid double triggers
            gameState.fighters[this.opponent.playerId].dead = "invulnerable";
            // play opponent's death sound if available, otherwise fallback to this.deathSound
            try { playSound(this.opponent.deathSound ?? this.deathSound); } catch (e) {}
            
            this.opponent.changeState(FighterState.DEATH);
        }

        // Self KO
        if (gameState.fighters[this.playerId].hitPoints <= 0 && this.currentState !== FighterState.DEATH) {
            gameState.fighters[this.playerId].dead = "invulnerable";
            try { playSound(this.deathSound); } catch (e) {}
            
            this.changeState(FighterState.DEATH);
        }
    }

    updateHurtShake(time, delay) {
        if (this.hurtShakeTimer === 0 || time.previous <= this.hurtShakeTimer) return;
        const shakeAmount = (delay - time.previous < (FIGHTER_HURT_DELAY * FRAME_TIME) / 2 ? 1 : 2);

        this.hurtShake = shakeAmount - this.hurtShake;
        this.hurtShakeTimer = time.previous + FRAME_TIME;
    }

    updateStatus(time) {
        const stateEntry = gameState.fighters[this.playerId];
        if (!stateEntry) return;
        if (!stateEntry.status || stateEntry.status === 'normal') return;
        if (!stateEntry.statusExpiresAt) return;
        if ((time && time.previous) >= stateEntry.statusExpiresAt) {
            stateEntry.status = 'normal';
            stateEntry.statusExpiresAt = 0;
            this.status = 'normal';
        }
    }

    updateSlide(time){
        if (this.slideVelocity >= 0) return;

        this.slideVelocity += this.slideFriction * time.secondsPassed;
        if (this.slideVelocity < 0) return;

        this.resetSlide();
    }

    updatePosition(time){
        if(!this.touchedCamera) this.position.x += ((this.velocity.x + this.slideVelocity) * this.direction) * time.secondsPassed;
        else {
            this.velocity.x = 0;
            this.position.x += (this.velocity.x * this.direction) * time.secondsPassed;
        }
        this.position.y += this.velocity.y * time.secondsPassed;
    }

    updateSpecialMoves(time){
        for (const specialMove of this.SpecialMoves){
            const resultArgs = hasSpecialMoveBeenExecuted(specialMove, this.playerId, time);
            
            if (resultArgs) this.changeState(specialMove.state, time, resultArgs);
        }
    }

   

    update(time, context, camera){
        this.updateStatus(time);
        this.states[this.currentState].update(time, context, camera);
        // Check win/death conditions after state updates and collisions
        // centralized handler ensures dying fighters go to DEATH state (not IDLE)
        this.updateSlide(time);
        this.updatePosition(time);
        this.updateSpecialMoves(time);
        this.updateAnimation(time);
        this.updateStageConstraints(time, context, camera);
        this.updateAttackBoxCollided(time);
        this.updateWinCondition();
        this.velocity.y += this.gravity * time.secondsPassed;

       // console.log('Velocity',this.velocity.y);
        
        if(this.position.y >= STAGE_FLOOR){
            this.position.y = STAGE_FLOOR;
           // this.velocity.y = 0;
          //  console.log("Gravity falling");
        }

        // Prevent going too high to avoid spamming
        if(this.position.y <= -80){
            this.position.y = -80;
            this.gravity = 2000;
        }
    }

    drawDebugBox(context, camera, dimensions, baseColor){
        if (!Array.isArray(dimensions)) return;

        const [x=0, y=0, width=0, height=0] = dimensions;

         // Push Box
        context.beginPath();
        context.strokeStyle = baseColor + 'AA';
        context.fillStyle = baseColor + '33';
        context.fillRect(
            Math.floor(this.position.x + (x * this.direction) - camera.position.x) + 0.5,
            Math.floor(this.position.y + y - camera.position.y) + 0.5,
            width * this.direction,
            height,
        );
        context.rect(
            Math.floor(this.position.x + (x * this.direction) - camera.position.x) + 0.5,
            Math.floor(this.position.y + y - camera.position.y) + 0.5,
            width * this.direction,
            height,
        );
        context.stroke();
    }


    drawDebug(context, camera){
        const [frameKey] = this.animations[this.currentState][this.animationFrame];
        const boxes = this.getBoxes(frameKey);

        context.lineWidth = 1;
        //Push Box
        this.drawDebugBox(context, camera, Object.values(boxes.push), '#55FF55');

        //Hurt Boxes
        for (const hurtBox of Object.values(boxes.hurt)) {
            this.drawDebugBox(context, camera, hurtBox, '#7777FF');
        }
        //Hit Box
        this.drawDebugBox(context, camera, Object.values(boxes.hit), '#FF0000');


        // Origin
        context.beginPath();
        context.strokeStyle = 'red';
        context.moveTo(Math.floor(this.position.x - camera.position.x) - 4, Math.floor(this.position.y - camera.position.y) - 0.5);
        context.lineTo(Math.floor(this.position.x - camera.position.x) + 5, Math.floor(this.position.y - camera.position.y) - 0.5);
        context.moveTo(Math.floor(this.position.x - camera.position.x) + 0.5, Math.floor(this.position.y - camera.position.y) - 5);
        context.lineTo(Math.floor(this.position.x - camera.position.x) + 0.5, Math.floor(this.position.y - camera.position.y) + 4);
        context.stroke();
    }

     drawShadow(context, camera) {
        const [frameKey] = this.animations[this.currentState][this.animationFrame];

        const [[
            [x, y, width, height], 
            [originX, originY]
        ]] = this.frames.get(frameKey);

        context.save();

         context.filter =
            `contrast(10%) grayscale(0%) brightness(0%) opacity(50%)`;

        context.scale(this.direction, 0.5);
        context.drawImage(
            this.image,
            x,
            y,
            width,
            height,
            Math.floor((this.position.x - this.hurtShake - camera.position.x) * this.direction) - originX,
            Math.floor((STAGE_FLOOR - camera.position.y) - originY)+125+this.position.y*0.3,
            width,
            height-this.position.y*0.05,
        );

        context.restore();

    }

   drawShadowInverted(context, camera) {
    const [frameKey] = this.animations[this.currentState][this.animationFrame];

    const [[
        [x, y, width, height], 
        [originX, originY]
    ]] = this.frames.get(frameKey);

    context.save();

    context.filter = `contrast(10%) grayscale(0%) brightness(0%) opacity(50%)`;
    context.scale(this.direction, -0.5);

    const drawX =
        Math.floor((this.position.x - this.hurtShake - camera.position.x) * this.direction) - originX;

    const drawY =
        -(Math.floor((STAGE_FLOOR - camera.position.y) + originY) + STAGE_FLOOR+90 - this.position.y * 0.5);

    context.drawImage(
        this.image,
        x, y, width, height,
        drawX,
        drawY,
        width,
        height + this.position.y * 0.05
    );

    context.restore();
}

applyPalette(color) {
    
    if (!this.image || this.image.width === 0) return; // safety check
    console.log("pallete swapped for p2!");

    const PALettes = {
        blue:    [[1,1,1], [30,20,70], [120,120,120]],
        red:     [[255,60,60], [200,30,30], [150,10,10]],
        green:   [[80,255,80], [40,180,40], [20,120,20]],
        purple:  [[200,80,255], [140,50,200], [80,20,120]]
    };

    const palette = [
    [255, 205, 180], // new light tone
    [120, 90, 255],  // new mid tone
    [30, 20, 80]     // new dark tone
];

const newPalette = [
    [255, 215, 200], // skin light
    [230, 150, 120], // skin mid
    [180, 90, 60],   // skin shadow
    [100, 140, 255], // clothes light
    [60, 90, 220],   // clothes mid
    [30, 50, 150],   // clothes shadow
    [20, 20, 40]     // dark outlines
];


    if (!this.basePalette) {
        this.basePalette = extractPalette(this.image);
    }

   // const colorMap = buildPaletteMap(this.basePalette, PALettes[color]);
  //  this.colorSwappedImage = paletteSwap(this.image, colorMap);
 // const newColor = [50, 120, 255];
//this.colorSwappedImage = paletteSwapFinal(this.image, newPalette);



//const colorMap = buildSingleColorMap(sourceColor, newColor);

//const newImage = paletteSwap(this.image, colorMap);
//this.colorSwappedImage = newImage;

if(color === "invert")this.colorSwappedImage = invertSprite(this.image);
else this.colorSwappedImage = hueShiftSprite(this.image, 340, 2, 1);



}






    draw(context, camera) {
        

        if(!gameState.shadowInvert) this.drawShadow(context, camera);
        else this.drawShadowInverted(context, camera);
        const [frameKey] = this.animations[this.currentState][this.animationFrame];

        const [[
            [x, y, width, height], 
            [originX, originY]
        ]] = this.frames.get(frameKey);

        const status = this.status ?? (gameState.fighters[this.playerId] && gameState.fighters[this.playerId].status);
        
        context.save();

         //fade effect

         if (gameState.fighters[this.playerId].alpha >= 1) gameState.fighters[this.playerId].alpha = 1;
         if (gameState.fighters[this.playerId].alpha <= 0) gameState.fighters[this.playerId].alpha = 0;
        context.globalAlpha = gameState.fighters[this.playerId].alpha;
     
        //end fade effect

       if (status) {

    const flicker = Math.random() > 0.5 
        ? 'brightness(1.4)' 
        : 'brightness(1.1)';

        const glow = `
        drop-shadow(0 0 8px rgba(0,150,255,0.9))
        drop-shadow(0 0 16px rgba(200,220,255,0.7))
    `;

    

    const burnGlow = `
    drop-shadow(0 0 6px rgba(255,140,0,0.9))
    drop-shadow(0 0 14px rgba(255,90,0,0.75))
    drop-shadow(0 0 24px rgba(255,50,0,0.55))
`;

    switch (status) {

    case 'burn': {
       
        const t = performance.now() * 0.01;
       
        const flick = 1.4 + Math.sin(t * 6) * 0.5;
        
        const sep = 90 + Math.sin(t * 4) * 8;
        context.filter = `brightness(${flick}) sepia(${sep}%) saturate(1200%) hue-rotate(-10deg)`;
        
        context.shadowColor = 'rgba(255, 89, 0, 0.92)';
        context.shadowBlur = 12 + Math.abs(Math.sin(t * 6)) * 10;
        
        break;
    }

  case 'frozen': {
    const t = performance.now() * 0.02;

    
    const flicker = 0.85 + Math.sin(t * 4) * 0.15; 

    
    const pulse = 0.95 + Math.sin(t * 6) * 0.05;

    
    context.filter =
        `grayscale(30%) contrast(1.1) brightness(${flicker}) hue-rotate(200deg) saturate(180%)`;

   
    context.globalAlpha = pulse; 

    break;
}



    case 'shock':
    case 'stun': {
        const t = performance.now() * 0.02;
        const flicker = 0.8 + Math.sin(t * 5) * 0.4; 
        context.filter =
            `invert(60%) sepia(60%) hue-rotate(200deg) brightness(${flicker})`;
        break;
    }

    case 'poison': {
        const t = performance.now() * 0.01;
        const flicker = 1.0 + Math.sin(t * 3) * 0.3;
        context.filter =
            `brightness(${flicker}) saturate(300%) hue-rotate(230deg)`;
        break;
    }

    case 'poisonGreen': {
        const t = performance.now() * 0.01;
        const flicker = 0.95 + Math.sin(t * 2) * 0.2;
        context.filter =
            `brightness(${flicker}) hue-rotate(100deg) saturate(200%)`;
        break;
    }

    case 'rage': {
        const t = performance.now() * 0.01;
        const flicker = 1.2 + Math.sin(t * 4) * 0.25;
        context.filter =
            `saturate(250%) hue-rotate(-30deg) brightness(${flicker})`;
        break;
    }

    case 'shadow': {
        const t = performance.now() * 0.01;
        const flicker = 0.7 + Math.sin(t * 3) * 0.15;
        context.filter =
            `contrast(150%) grayscale(80%) brightness(${flicker})`;
        break;
    }

    case 'bleed': {
        const t = performance.now() * 0.01;
        const flicker = 0.85 + Math.sin(t * 2) * 0.15;
        context.filter =
            `hue-rotate(-10deg) saturate(160%) brightness(${flicker})`;
        break;
    }

    default:
        //none
}
    const spriteToDraw = this.colorSwappedImage || this.image;

if (!spriteToDraw) return; // avoid crashes
   
        context.scale(this.direction, 1);
        context.drawImage(
            spriteToDraw,
            x,
            y,
            width,
            height,
            Math.floor((this.position.x - this.hurtShake - camera.position.x) * this.direction) - originX,
            Math.floor((this.position.y - camera.position.y) - originY),
            width,
            height,
        );

        context.restore();
       
    if(gameState.debug.fighters)this.drawDebug(context, camera);
    }
    }
}