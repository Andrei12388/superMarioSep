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
import { STAGE_FLOOR } from "../../../constants/stage.js";import { DebugBox } from "../../../utils/DebugBox.js";import { gameState } from "../../../state/gameState.js";
import { LightHitSplash } from "../shared/LightHitSplash.js";
import { HeavyHitSplash } from "../shared/HeavyHitSplash.js";
import { SuperHitSplash } from "../shared/SuperHitSplash.js";
import { BlockHitSplash } from "../shared/BlockHitSplash.js";
import { GreenHitSplash } from "../shared/GreenHitSplash.js";
import { checkProjectileCollision } from "../../../utils/projectileCollisions.js";

// Frame data
const frames = new Map([
    ['special1-1', [[[894, 902, 54, 44], [27, 42]], [-15, -40, 34, 34],[-15, -40, 34, 34]]],
    
    // Collision frames
    ['special1-collide-1', [[[22, 450, 10, 11], [3, 10]], [0, 0, 0, 0]]],
    ['special1-collide-2', [[[39, 449, 14, 12], [3, 13]], [0, 0, 0, 0]]],
    ['special1-collide-3', [[[62, 449, 14, 13], [3, 14]], [0, 0, 0, 0]]],
    ['special1-collide-4', [[[83, 446, 21, 18], [3, 14]], [0, 0, 0, 0]]],
]);

// Animation sequences
const animations = {
    [FireballState.ACTIVE]: [
        ['special1-1', 10],['special1-1', 110],
    ],
    [FireballState.COLLIDED]: [['special1-1', 4]],
};

export class HeavyRock {
    image = document.querySelector('img[alt="golem"]');
    animationFrame = 0;
    crackAnimationFrame = 0;
    state = FireballState.ACTIVE;

    constructor(args, time, entityList) {
        const [fighter, strength] = args;

        this.soundGroundCrash = document.querySelector('audio#sound-groundCrash');
        this.soundGroundCrash.volume = 1;
        this.canDealDamage = true;

         this.quake = false;
        this.fighter = fighter;
        this.entityList = entityList;
        this.velocity = strength || 200;
        console.log('Heavy Rock Velocity:', strength, this.velocity);
        this.direction = this.fighter?.direction ?? 1;
        this.directionY = 1;
        this.velocityY = 0; // Initial vertical velocity
        this.gravity = 1000; // Gravity acceleration
        this.bounceCount = 0; // Number of bounces
        this.bounceActive = false; // Prevent multiple bounce triggers

        const baseX = this.fighter?.position?.x ?? 0;
        const baseY = this.fighter?.position?.y ?? 0;

        this.position = {
            x: baseX + (5 * this.direction),
            y: baseY - 60,
        };

        this.animationTimer = time.previous ?? 0;
        this.crackAnimationTimer = time.previous ?? 0;
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
    hasCollided() {
        const [x, y, width, height] = frames.get(
            animations[FireballState.ACTIVE][this.animationFrame][0]
        )[1];
        const hitBox = getActualBoxDimensions(this.position, this.direction, { x, y, width, height });

        return checkProjectileCollision(this, hitBox);
    }

    // 🚀 Update movement and handle collisions
    updateMovement(time, camera) {
       this.position.x += (this.velocity * this.direction) * time.secondsPassed * 1.8;
       
       // Apply gravity to vertical velocity
       this.velocityY += this.gravity * time.secondsPassed;
       this.position.y += this.velocityY * time.secondsPassed;

       // Check if rock hits the ground
       if(this.position.y < STAGE_FLOOR)  this.quake = true;
       if (this.position.y >= STAGE_FLOOR) {
        if(this.quake){
                        this.soundGroundCrash.volume = 0.5;
                         this.soundGroundCrash.play();
                        
                        gameState.cameraShake.enable = true;
                        gameState.cameraShake.duration = 0.4;
                        gameState.cameraShake.intensity = 7;
                        this.quake = false;
                    }
           // Detect a NEW bounce (only when hitting floor from above and not already bouncing)
           if (!this.bounceActive && this.bounceCount < 3 && this.velocityY > 0) {
               this.bounceActive = true;
               this.bounceCount++;

               // Bounce effect
               const bounceFactor = 0.5; // Less bouncy than fighters
               this.velocityY = -Math.max(50, Math.abs(this.velocityY) * bounceFactor);

               // Reduce horizontal velocity on bounce
               this.velocity *= 0.8;

               // Prevent going below ground
               this.position.y = STAGE_FLOOR;
           } else if (this.bounceCount >= 3) {
               // After 3 bounces, remove the rock
               this.entityList.remove(this);
               return;
           }
       } else {
           // Airborne: reset bounce trigger
           this.bounceActive = false;
       }

        const screenX = this.position.x - camera.position.x;
        if (screenX > 384 + 56 || screenX < -56) {
            this.entityList.remove(this);
            return;
        }

        const collided = this.hasCollided();
        if (!collided) return;

       // FireballState.ACTIVE = FireballState.COLLIDED;
        

        this.handleCollisionEffects(time, collided);
    }

    // 💥 Handle collision results
    handleCollisionEffects(time, collisionState) {
        if (collisionState === FireballCollidedState.FIREBALL) {
           this.canDealDamage = false;
            this.direction *= -1;
            console.log('Heavy Rock bounced off another rock');
            return;
        }

        const opponent = this.fighter.opponent;

        
        
        if (collisionState === FireballCollidedState.OPPONENT && this.canDealDamage) {
            console.log('Heavy Rock hit opponent');
            this.canDealDamage = false;
            this.direction *= -1;
            opponent.position.y -= 150 * time.secondsPassed;
           // this.direction *= -1;
           // this.directionY = 1;
            this.entityList.add(GreenHitSplash, time, opponent.position.x, opponent.position.y - 40, 1);

            opponent.handleAttackHit(
                time,
                FighterAttackStrength.SUPER1,
                FighterAttackType.PUNCH,
                undefined,
                FighterHurtBox.BODY
            );
        }
    }

    // 🎞️ Update animation frames
    updateAnimation(time) {
        if (time.previous < this.animationTimer) return;
         if(this.animationFrame === 6)  this.entityList.remove(this);
        this.animationFrame = (this.animationFrame + 1) % animations[FireballState.ACTIVE].length;
        this.animationTimer = time.previous + animations[FireballState.ACTIVE][this.animationFrame][1] * FRAME_TIME;
      
         // this.animationTimer = time.previous + animations[FireballState.ACTIVE][0][1] * FRAME_TIME;
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
        context.scale(this.direction, 1);

        context.drawImage(
            this.image,
            frameX,
            frameY,
            frameWidth,
            frameHeight,
            Math.floor((this.position.x - camera.position.x) * this.direction - originX),
            Math.floor(this.position.y - camera.position.y - originY),
            frameWidth,
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
