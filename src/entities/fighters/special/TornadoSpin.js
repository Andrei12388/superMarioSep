import { FRAME_TIME } from "../../../constants/game.js";
import {
    FireballCollidedState,
    FireballState,
    fireballVelocity
} from "../../../constants/fireball.js";
import {
    boxOverlap,
    getActualBoxDimensions
} from "../../../utils/collisions.js";
import {
    FighterAttackStrength,
    FighterAttackType,
    FighterHurtBox,
    FighterState
} from "../../../constants/fighter.js";
import { gameState } from "../../../state/gameState.js";
import { DebugBox } from "../../../utils/DebugBox.js";
import { LightHitSplash } from "../shared/LightHitSplash.js";
import { HeavyHitSplash } from "../shared/HeavyHitSplash.js";
import { SuperHitSplash } from "../shared/SuperHitSplash.js";
import { BlockHitSplash } from "../shared/BlockHitSplash.js";
import { GreenHitSplash } from "../shared/GreenHitSplash.js";
import { playSound } from "../../../soundHandler.js";
import { STAGE_FLOOR } from "../../../constants/stage.js";
import { checkProjectileCollision } from "../../../utils/projectileCollisions.js";

// Frame data
const frames = new Map([
    ['special1-1', [[[23, 2397, 128, 167], [64, 165]], [-20, -132, 110, 150], [0, 0, 0, 0]]],
    ['special1-2', [[[286, 2397, 125, 177], [62, 175]], [0, 0, 0, 0], [0, 0, 0, 0]]],
   
    ['special1-3', [[[553, 2398, 119, 172], [60, 170]], [0, 0, 0, 0], [0, 0, 0, 0]]],
    ['special1-4', [[[817, 2396, 118, 178], [59, 176]], [0, 0, 0, 0], [0, 0, 0, 0]]],
    ['special1-5', [[[1081, 2397, 118, 173], [59, 171]], [0, 0, 0, 0], [0, 0, 0, 0]]],
    ['special1-6', [[[11, 2586, 138, 177], [69, 175]], [0, 0, 0, 0], [0, 0, 0, 0]]],

    ['special1-7', [[[273, 2587, 127, 166], [64, 164]], [0, 0, 0, 0], [0, 0, 0, 0]]],
    ['special1-8', [[[557, 2587, 115, 165], [57, 163]], [0, 0, 0, 0], [0, 0, 0, 0]]],
    ['special1-9', [[[819, 2588, 121, 162], [60, 160]], [-20, -132, 110, 150], [0, 0, 0, 0]]],
    ['special1-10', [[[1069, 2586, 127, 165], [63, 163]], [0, 0, 0, 0], [0, 0, 0, 0]]],

]);

// Animation sequences
const animations = {
    [FireballState.ACTIVE]: [
        ['special1-1', 4],['special1-2', 4],
        ['special1-3', 4],['special1-4', 4],
        ['special1-5', 4],['special1-6', 4],
        ['special1-7', 4],['special1-8', 4],
        ['special1-9', 4],['special1-10', 4],
    ],
    [FireballState.COLLIDED]: [['special1-4', 4]],
    
};

export class TornadoSpin {
    image = document.querySelector('img[alt="golem"]');
    animationFrame = 0;
    crackAnimationFrame = 0;
    state = FireballState.ACTIVE;

    constructor(args, time, entityList) {
        const [fighter, strength] = args;
        this.canDealDamage = true;
        this.soundTornado = document.getElementById('sound-tornado');
        this.soundTornado.volume = 1;
        this.soundTornado.currentTime = 0;
        playSound(this.soundTornado,1);
        this.alpha = 0;
        this.speed = 0.1;
        this.fighter = fighter;
        this.entityList = entityList;
        this.velocity = fireballVelocity[strength] || 300;
        this.direction = this.fighter?.direction ?? 1;
        this.directionY = 1;
        gameState.fighters[this.fighter.playerId].alpha = 1;

        const baseX = this.fighter?.position?.x ?? 0;
        const baseY = this.fighter?.position?.y ?? 0;

        this.position = {
            x: baseX -30*this.direction ,
            y: STAGE_FLOOR,
        };
        console.log("tornado direction",this.direction, "position", this.position.x);

        this.animationTimer = time.previous ?? 0;
       
    }

   
    hasCollidedWithOpponent(hitBox) {
        for (const [, hurtBox] of Object.entries(this.fighter.opponent.boxes.hurt)) {
            const [x, y, width, height] = hurtBox;
            const actualHurtBox = getActualBoxDimensions(
                this.fighter.opponent.position,
                this.fighter.opponent.direction,
                { x, y, width, height }
            );

            if (boxOverlap(hitBox, actualHurtBox)) {
                return FireballCollidedState.OPPONENT;
            }
        }
        return null;
    }

    getCollisionHitBox() {
        const [frameKey] = animations[this.state][this.animationFrame];
        const frameData = frames.get(frameKey);
        if (!frameData || !frameData[1]) return null;
    
        const [x, y, width, height] = frameData[1];
        return getActualBoxDimensions(this.position, this.direction, {
            x, y, width, height
        });
    }

    // 🧩 Determine collision type
      hasCollided(){
             const [x, y, width, height] = frames.get(animations[this.state][this.animationFrame][0])[1];
            const actualHitBox = getActualBoxDimensions(this.position, this.direction, {x, y, width, height});
           
    
            return checkProjectileCollision(this, actualHitBox);  
        }

    // 🚀 Update movement and handle collisions
    updateMovement(time, camera) {
        this.position.y -= 300 * this.directionY * time.secondsPassed;

        if (this.position.y <= 170) this.directionY = 0;

        const collided = this.hasCollided();
        if (!collided) return;

       // FireballState.ACTIVE = FireballState.COLLIDED;
        

        this.handleCollisionEffects(time, collided);
    }

    // 💥 Handle collision results
    handleCollisionEffects(time, collisionState) {
        if (collisionState === FireballCollidedState.FIREBALL) {
          // this.direction *= -1;
           // this.directionY = 1;
            return;
        }

        const opponent = this.fighter.opponent;

        

        if (collisionState === FireballCollidedState.OPPONENT && this.canDealDamage) {
           // this.canDealDamage = false;
           opponent.direction = opponent.direction*-1;
            opponent.position.y -= 150 * time.secondsPassed;
           // this.direction *= -1;
           // this.directionY = 1;
            this.entityList.add(GreenHitSplash, time, opponent.position.x, opponent.position.y - 40, 1);

            opponent.handleAttackHit(
                time,
                FighterAttackStrength.SUPER3,
                FighterAttackType.PUNCH,
                undefined,
                FighterHurtBox.BODY
            );
        }
    }

    // 🎞️ Update animation frames
    updateAnimation(time) {
        if (time.previous < this.animationTimer) return;
        this.position.x += (200 * this.direction) * time.secondsPassed;
       if(gameState.fighters[this.fighter.playerId].spawnEntity){
        this.alpha += this.speed;
        gameState.fighters[this.fighter.playerId].alpha -= this.speed;
        if (this.alpha >= 1 || gameState.fighters[this.fighter.playerId].alpha <= 0) {
                this.alpha = 1;
                gameState.fighters[this.fighter.playerId].alpha = 0;
            }
        
       } 

        // if(!gameState.fighters[this.fighter.playerId].spawnEntity)  this.entityList.remove(this);
          if(!gameState.fighters[this.fighter.playerId].spawnEntity) {
           this.alpha -= this.speed;
           gameState.fighters[this.fighter.playerId].alpha += this.speed;
           this.canDealDamage = false;
            if (this.alpha <= 0 || gameState.fighters[this.fighter.playerId].alpha >= 1) {
                this.alpha = 0;
                gameState.fighters[this.fighter.playerId].alpha = 1;
                this.entityList.remove(this);
            }
          }
        this.animationFrame = (this.animationFrame + 1) % animations[FireballState.ACTIVE].length;
        this.animationTimer = time.previous + animations[FireballState.ACTIVE][this.animationFrame][1] * FRAME_TIME;
      
        
    }


    // 🔍 Draw all debug boxes
    drawDebug(context, camera) {
        const [frameKey] = animations[FireballState.ACTIVE][this.animationFrame];
        const frameData = frames.get(frameKey);
        if (!frameData) return;

        DebugBox.drawForSpecialEntity(context, camera, this, frameData);
    }

   

    draw(context, camera) {
        
        if (!this.image || !this.image.complete) return;

        const [frameKey] = animations[FireballState.ACTIVE][this.animationFrame];
        const [[[frameX, frameY, frameWidth, frameHeight], [originX, originY]]] = frames.get(frameKey);

        context.save();
        
        //fade effect

         if (this.alpha <= 0) return;
        context.globalAlpha = this.alpha;
     
       
        //end fade effect

        context.scale(this.direction, 1.5);

        context.drawImage(
            this.image,
            frameX,
            frameY,
            frameWidth,
            frameHeight,
            Math.floor((this.position.x - camera.position.x)*this.direction - originX),
            Math.floor(this.position.y - camera.position.y - originY),
            frameWidth+100,
            frameHeight
        );

        context.restore();
       
    }

    // ⏱️ Main update loop
    update(time, _, camera) {
        if(gameState.pauseMenu.pauseGame || gameState.pause) return;
        this.updateMovement(time, camera);
        this.updateAnimation(time);
    }
}
