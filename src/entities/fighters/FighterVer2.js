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




export const AnimationFrame = {
    TRANSITION: -3
};

export class Fighter {
    constructor(playerId, onAttackHit){
        this.playerId = playerId;
        this.position = {
             x: STAGE_MID_POINT + STAGE_PADDING + (playerId === 0 ? -FIGHTER_START_DISTANCE : FIGHTER_START_DISTANCE), 
             y: STAGE_FLOOR };
        this.velocity = {x: 0, y: 0};
        this.initialVelocity = {};
        this.direction = playerId === 0 ? FighterDirection.RIGHT : FighterDirection.LEFT;
        this.gravity = 0;

        this.attackStruck = false;

        this.hurtShake = 0;
        this.hurtShakeTimer = 0;
        this.slideVelocity = 0;
        this.slideFriction = 0;
        
        this.frames = new Map();
        this.animationFrame = 0;
        this.animationTimer = 0;
        this.animations = {};
        
        this.image = new Image();
        
        this.opponent;
        this.onAttackHit = onAttackHit;
        this.EntityList = new EntityList();

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
                    FighterState.DODGE_FORWARD, FighterState.DODGE_BACKWARD, FighterState.DEATH, FighterState.KNOCKUP, FighterState.GETUP,
                    FighterState.DIE,
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
                validFrom:[FighterState.IDLE, FighterState.WALK_FORWARD, FighterState.WALK_BACKWARD],
            },
            [FighterState.HEAVY_PUNCH]:{
                attackType: FighterAttackType.PUNCH,
                attackStrength: FighterAttackStrength.HEAVY,
                 init: this.handleAttackInit.bind(this),
                update: this.handleHeavyPunchState.bind(this),
                validFrom:[FighterState.IDLE, FighterState.WALK_FORWARD, FighterState.WALK_BACKWARD, FighterState.SPECIAL_2],
            },
             [FighterState.LIGHT_KICK]:{
                attackType: FighterAttackType.KICK,
                attackStrength: FighterAttackStrength.LIGHT,
                 init: this.handleAttackInit.bind(this),
                update: this.handleLightKickState.bind(this),
                validFrom:[FighterState.IDLE, FighterState.WALK_FORWARD, FighterState.WALK_BACKWARD],
            },
            [FighterState.CROUCH_LIGHTKICK]:{
                attackType: FighterAttackType.KICK,
                attackStrength: FighterAttackStrength.LIGHT,
                 init: this.handleAttackInit.bind(this),
                update: this.handleCrouchLightKickState.bind(this),
                validFrom:[FighterState.CROUCH,FighterState.CROUCH_DOWN,FighterState.CROUCH_TURN,],
            },
            [FighterState.CROUCH_HEAVYKICK]:{
                attackType: FighterAttackType.KICK,
                attackStrength: FighterAttackStrength.HEAVY,
                 init: this.handleAttackInit.bind(this),
                update: this.handleCrouchHeavyKickState.bind(this),
                validFrom:[FighterState.CROUCH,FighterState.CROUCH_DOWN,FighterState.CROUCH_TURN,],
            },
            [FighterState.JUMP_LIGHTKICK]:{
                attackType: FighterAttackType.KICK,
                attackStrength: FighterAttackStrength.LIGHT,
                 init: this.handleJumpAttackInit.bind(this),
                update: this.handleJumpHeavyKickState.bind(this),
                validFrom:[FighterState.JUMP_BACKWARD, FighterState.JUMP_FORWARD,FighterState.JUMP_UP,  FighterState.DODGE_FORWARD, FighterState.DODGE_BACKWARD,],
            },
            [FighterState.JUMP_HEAVYKICK]:{
                attackType: FighterAttackType.KICK,
                attackStrength: FighterAttackStrength.HEAVY,
                 init: this.handleJumpAttackInit.bind(this),
                update: this.handleJumpHeavyKickState.bind(this),
                validFrom:[FighterState.JUMP_BACKWARD, FighterState.JUMP_FORWARD,FighterState.JUMP_UP,  FighterState.DODGE_FORWARD, FighterState.DODGE_BACKWARD,],
            },
            [FighterState.HEAVY_KICK]:{
                attackType: FighterAttackType.KICK,
                attackStrength: FighterAttackStrength.HEAVY,
                 init: this.handleAttackInit.bind(this),
                update: this.handleHeavyKickState.bind(this),
                validFrom:[FighterState.IDLE, FighterState.WALK_FORWARD, FighterState.WALK_BACKWARD],
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
            [FighterState.KNOCKUP]:{
                init: this.handleKnockUpInit.bind(this),
                update: this.handleKnockUpState.bind(this),
                validFrom: knockUpStateValidFrom,
            },
            [FighterState.GETUP]:{
                init: this.handleGetUpInit.bind(this),
                update: this.handleGetUpState.bind(this),
                validFrom: [FighterState.KNOCKUP,FighterState.DIE, FighterState.DEATH],
            },
        }
        this.changeState(FighterState.IDLE);
        
        this.soundAttacks = {
        [FighterAttackStrength.LIGHT]: document.querySelector('audio#sound-fighter-light-attack'),
        [FighterAttackStrength.HEAVY]: document.querySelector('audio#sound-fighter-heavy-attack'),
        [FighterAttackStrength.SUPER1]: document.querySelector('audio#sound-fighter-heavy-attack'),
        [FighterAttackStrength.SUPER2]: document.querySelector('audio#sound-fighter-heavy-attack'),
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
        [FighterAttackStrength.SUPER1]:{
            [FighterAttackType.PUNCH]: document.querySelector('audio#sound-fighter-heavy-punch-hit'),
            [FighterAttackType.KICK]: document.querySelector('audio#sound-fighter-heavy-kick-hit'),
        },
        [FighterAttackStrength.SUPER2]:{
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
    }


    isAnimationCompleted = () => this.animations[this.currentState][this.animationFrame][1] === FrameDelay.TRANSITION;
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
            case FighterAttackStrength.SLASH:
                if(hitLocation === FighterHurtBox.BODY) return FighterState.HURT_HEAD_HEAVY;
                return FighterState.HURT_BODY_HEAVY;
                }
        }
    


    resetVelocities(){
        this.velocity.x = 0;
        this.velocity.y = 0;
    }

    resetSlide(transferToOpponent = false){
        if (transferToOpponent){
            this.opponent.slideVelocity = this.slideVelocity;
            this.opponent.slideFriction = this.slideFriction;
            
        }
        this.slideFriction = 0;
        this.slideVelocity = 0;
        
    }

    changeState(newState, time, args) {
        if(!this.states[newState].validFrom.includes(this.currentState)) return;
    this.currentState = newState;
    this.animationFrame = 0;

    this.states[this.currentState].init(time, args);
    }
    
    //Idle
    handleIdleInit(){
        this.resetVelocities();
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
        } //else if(control.isBackward(this.playerId)){
           // this.changeState(FighterState.CROUCH_BLOCK, time);
       // }
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

   handleJumpLandInit(){
    this.resetVelocities();
    this.soundLand.play();
   }

   handleAttackInit(){
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
        if (this.animationFrame <2) return;
        if (control.isLightPunch(this.playerId)) return;

        if (!this.isAnimationCompleted()) return;
        this.changeState(FighterState.IDLE);
    }

    handleHeavyPunchState(){
        if (!this.isAnimationCompleted()) return;
        this.changeState(FighterState.IDLE);
    }

    handleLightKickState(){
        if (this.animationFrame < 2) return;
        if (control.isLightKick(this.playerId)) return;

        if (!this.isAnimationCompleted()) return;
        this.changeState(FighterState.IDLE);
    }

    handleCrouchLightKickState(){
        if (this.animationFrame < 2) return;
        if (control.isLightKick(this.playerId)) return;

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
    

    handleHeavyKickState(){
        if (!this.isAnimationCompleted()) return;
        this.changeState(FighterState.IDLE);
       
    }

    handleHurtState(){
        if (!this.isAnimationCompleted()) return;
        this.hurtShake = 0;
        this.hurtShakeTimer = 0;
        this.changeState(FighterState.IDLE);
    }

    checkDeathCondition() {
    const fighter = gameState.fighters[this.playerId];
    if (fighter.hitPoints <= 0 && fighter.dead !== "dead") {
        fighter.dead = "dead";
        this.changeState(FighterState.DEATH);
        console.log(`Fighter ${fighter.id || this.playerId} died!`);
        return true;
    }
    return false;
}


    handleAttackHit(time, attackStrength, attackType, hitPosition, hurtLocation) {
    const fighter = gameState.fighters[this.playerId];

    // Ignore hits if explicitly invulnerable — but allow hits to affect
    // already-dead fighters (they should still be pushed by thrusts).
    if (fighter.dead === "invulnerable") {
        console.log("Attack ignored: fighter invulnerable");
        return;
    }

    const newState = this.getHitState(attackStrength, hurtLocation);
    const { velocity, friction } = FighterAttackBaseData[attackStrength].slide;

    this.slideVelocity = velocity;
    this.slideFriction = friction;
    this.attackStruck = true;

    if (this.soundHits?.[attackStrength]?.[attackType]) {
        playSound(this.soundHits[attackStrength][attackType]);
    }

    // Apply hit damage
    fighter.hitPoints -= FighterAttackBaseData[attackStrength].damage;

    // Trigger hit callback
    this.onAttackHit?.(time, this.opponent.playerId, this.playerId, hitPosition, attackStrength);

    // Check for death before knockup — we still continue so dead bodies
    // receive thrust/slide velocities (do not return early).
    this.checkDeathCondition();

    // Knockup logic
    if (FighterAttackBaseData[attackStrength].knockup) {
        this.changeState(FighterState.KNOCKUP);
        // set thrust after state init so it isn't cleared
        this.velocity.x = FighterAttackBaseData[attackStrength].thrust.x;
        this.velocity.y = FighterAttackBaseData[attackStrength].thrust.y;
        return;
    }

    // Regular hurt
    this.changeState(newState);
    // set thrust after state init so it isn't cleared
    this.velocity.x = FighterAttackBaseData[attackStrength].thrust.x;
    this.velocity.y = FighterAttackBaseData[attackStrength].thrust.y;
}


    //Death init and States
   handleDeathInit() {
    // Keep currently-applied velocity so the dead body can be pushed
    // (thrust applied when they were hit). Play the death sound and
    // start the death animation.
    playSound(this.deathSound);
    console.log("Death animation started");
}

handleDeathState() {
    const fighter = gameState.fighters[this.playerId];

    // Wait until the death animation is fully done
    if (!this.isAnimationCompleted()) return;

    console.log("Death animation complete, transitioning to DIE");

    fighter.dead = "die"; // Signal to go to DIE next
    this.changeState(FighterState.DIE); // Move to permanent laydown
}


handleDieInit() {
    // Allow velocity to persist — do not forcibly zero so corpse can move
    console.log("DIE animation started");
    // no sound here, death sound already played
}

handleDieState() {
    const fighter = gameState.fighters[this.playerId];

    if (!this.isAnimationCompleted()) return;

    // Mark permanently dead — no more state changes after this
    fighter.dead = "dead";
    console.log("Fighter permanently dead (DIE state).");

    // Optionally freeze the animation frame or disable inputs
    // keep velocities so body movement from thrust/slide continues
}



    //Knock Up States and Init
    handleKnockUpInit(){
       
         if(this.position.y >= STAGE_FLOOR){
            playSound(this.soundHits.BLOCK);
         }
    }

     handleKnockUpState() {
    const fighter = gameState.fighters[this.playerId];

    // Stop all knockup processing if dead
    if (fighter.hitPoints <= 0 || fighter.dead === "dead") return;

    if (!this.isAnimationCompleted()) return;

    if (this.position.y >= STAGE_FLOOR) {
        playSound(this.soundHits.BLOCK);
        fighter.dead = "invulnerable";
        this.changeState(FighterState.GETUP);
    }
}


    //Get Up States and Init
    handleGetUpInit(){
        this.velocity.x = 0;
        this.velocity.y = 0;
        console.log("GetUp activated!");
    }

     handleGetUpState() {
    const fighter = gameState.fighters[this.playerId];

    // Stop get-up if already dead
    if (fighter.hitPoints <= 0 || fighter.dead === "dead") return;

    if (!this.isAnimationCompleted()) return;

    fighter.dead = "breathing";
    this.changeState(FighterState.IDLE);
}


   handleIdleState(time) {
    const fighter = gameState.fighters[this.playerId];

    // --- 1️⃣ Death condition check (top priority) ---
    if (fighter.hitPoints <= 0 && fighter.dead !== "dead") {
        this.checkDeathCondition();
        return;
    }

    // --- 2️⃣ Automatic state responses based on fighter.dead flag ---
    if (fighter.dead === "dead" && this.state !== FighterState.DIE) {
            console.log("Dead State");
            this.changeState(FighterState.DIE);
            return;
}


    if (fighter.dead === "die") {
        console.log("Die State");
        this.changeState(FighterState.DIE);
        return;
    }

    if (fighter.dead === "alive") {
        console.log("Alive Getup State");
        this.changeState(FighterState.GETUP);
        fighter.dead = "breathing"; // Mark as getting up
        return;
    }

    // --- 3️⃣ If breathing or normal, allow player input ---
    fighter.sprite = 0;

    if (control.isUp(this.playerId)) {
        this.changeState(FighterState.JUMP_START);
        return;
    }

    if (control.isDown(this.playerId)) {
        this.changeState(FighterState.CROUCH_DOWN, time);
        return;
    }

    if (control.isBackward(this.playerId, this.direction)) {
        this.changeState(FighterState.WALK_BACKWARD);
        return;
    }

    if (control.isForward(this.playerId, this.direction)) {
        this.changeState(FighterState.WALK_FORWARD);
        return;
    }

    if (control.isLightPunch(this.playerId)) {
        this.changeState(FighterState.LIGHT_PUNCH);
        return;
    }

    if (control.isHeavyPunch(this.playerId)) {
        this.changeState(FighterState.HEAVY_PUNCH);
        return;
    }

    if (control.isLightKick(this.playerId)) {
        this.changeState(FighterState.LIGHT_KICK);
        return;
    }

    if (control.isHeavyKick(this.playerId)) {
        this.changeState(FighterState.HEAVY_KICK);
        return;
    }

    // --- 4️⃣ Debug/forced knockup trigger (optional) ---
    if (control.isSelect(this.playerId)) {
        this.changeState(FighterState.KNOCKUP);
        return;
    }

    // --- 5️⃣ Handle direction change ---
    const newDirection = this.getDirection();
    if (newDirection !== this.direction) {
        this.direction = newDirection;
        this.changeState(FighterState.IDLE_TURN);
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
     if(this.isAnimationCompleted()){
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
        if (this.position.x > camera.position.x + context.canvas.width - this.boxes.push.width) {
            this.position.x = camera.position.x + context.canvas.width - this.boxes.push.width;
            // Clamp horizontal position to camera edge and reset any horizontal motion
            this.velocity.x = 0;
            this.resetSlide(true);
        }

        if (this.position.x < camera.position.x + this.boxes.push.width){
            this.position.x = camera.position.x + this.boxes.push.width;
             // Clamp horizontal position to camera edge and reset any horizontal motion
             this.velocity.x = 0;
             this.resetSlide(true);
        }

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

        if(time.previous <= this.animationTimer + frameDelay) return;
            this.animationTimer = time.previous*gameState.slowFX;
                
            if(frameDelay <= FrameDelay.FREEZE) return;
            this.animationFrame++;

             if (this.animationFrame >= animation.length) this.animationFrame = 0;
                 
             this.boxes = this.getBoxes(animation[this.animationFrame][0]);

    }

    updateAttackBoxCollided(time) {
       
    const { attackStrength, attackType } = this.states[this.currentState];
    if (!attackType || this.attackStruck) return;
    if (!this.boxes?.hit || !this.opponent?.boxes?.hurt) return;
   

    const actualHitBox = getActualBoxDimensions(this.position, this.direction, this.boxes.hit);
    // Guard: skip collision checks for zero-area hitboxes (frames without real attack hitboxes)
    if (!actualHitBox || actualHitBox.width <= 0 || actualHitBox.height <= 0) return;
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
         // Force idle state if KO to Opponent
    if (gameState.fighters[this.opponent.playerId].hitPoints <= 0 && this.opponent.currentState !== FighterState.IDLE) {
        this.opponent.changeState(FighterState.IDLE);
        this.opponent.resetVelocities();
        // Optionally, you can add more KO logic here
    }  
      // Force idle state if KO to Self
    if (gameState.fighters[this.playerId].hitPoints <= 0 && this.currentState !== FighterState.IDLE) {
        this.changeState(FighterState.IDLE);
        this.resetVelocities();
        // Optionally, you can add more KO logic here
    }
    }

    updateHurtShake(time, delay) {
        if (this.hurtShakeTimer === 0 || time.previous <= this.hurtShakeTimer) return;
        const shakeAmount = (delay - time.previous < (FIGHTER_HURT_DELAY * FRAME_TIME) / 2 ? 1 : 2);

        this.hurtShake = shakeAmount - this.hurtShake;
        this.hurtShakeTimer = time.previous + FRAME_TIME;
    }

    updateSlide(time){
        if (this.slideVelocity >= 0) return;

        this.slideVelocity += this.slideFriction * time.secondsPassed;
        if (this.slideVelocity < 0) return;

        this.resetSlide();
    }

    updatePosition(time){
        this.position.x += ((this.velocity.x + this.slideVelocity) * this.direction) * time.secondsPassed;
        this.position.y += this.velocity.y * time.secondsPassed;
    }

    updateSpecialMoves(time){
        for (const specialMove of this.SpecialMoves){
            const resultArgs = hasSpecialMoveBeenExecuted(specialMove, this.playerId, time);

            if (resultArgs) this.changeState(specialMove.state, time, resultArgs);
        }
    }

   

    update(time, context, camera){
        this.states[this.currentState].update(time, context);
        //this.updateWinCondition();
        this.updateSlide(time);
        this.updatePosition(time);
        this.updateSpecialMoves(time);
        this.updateAnimation(time);
        this.updateStageConstraints(time, context, camera);
        this.updateAttackBoxCollided(time);
        this.velocity.y += this.gravity * time.secondsPassed;

       // console.log('Velocity',this.velocity.y);
        
        if(this.position.y >= STAGE_FLOOR){
            this.position.y = STAGE_FLOOR;
            this.velocity.y = 0;
          //  console.log("Gravity falling");
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


    draw(context, camera) {
        const [frameKey] = this.animations[this.currentState][this.animationFrame];
           
        const [[
            [x, y, width, height], 
            [originX, originY]
        ]] = this.frames.get(frameKey);


    context.scale(this.direction, 1);
    context.drawImage(
        this.image,
        x,
        y,
        width,
        height,
        Math.floor((this.position.x - this.hurtShake - camera.position.x) * this.direction) - originX,
        Math.floor((this.position.y - camera.position.y) - originY),
        width,
        height,
    );
    context.setTransform(1,0,0,1,0,0);

// this.drawDebug(context, camera);
}

}