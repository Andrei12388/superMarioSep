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

// Frame data
const frames = new Map([
   
    ['special1-1', [[[156, 691, 9, 66], [4,64]], [0, 0, 0, 0], [0, 0, 0, 0]]],
    ['special1-2', [[[181, 691, 11, 77], [5,64]], [0, 0, 0, 0], [0, 0, 0, 0]]],
    ['special1-3', [[[204, 691, 20, 78], [10,64]], [0, 0, 0, 0], [0, 0, 0, 0]]],
    ['special1-4', [[[233, 693, 38, 86], [19,64]], [0, 0, 0, 0], [0, 0, 0, 0]]],
    ['special1-5', [[[272, 693, 74, 92], [37,64]], [0, 0, 0, 0], [0, 0, 0, 0]]],
    ['special1-6', [[[126, 817, 82, 89], [41,64]], [0, 0, 0, 0], [0, 0, 0, 0]]],
    ['special1-7', [[[228, 806, 87, 116], [43,64]], [0, 0, 0, 0], [0, 0, 0, 0]]],
    ['special1-8', [[[326, 817, 82, 89], [41,64]], [0, 0, 0, 0], [0, 0, 0, 0]]],


    // Collision frames
    ['special1-collide-1', [[[22, 450, 10, 11], [3, 10]], [0, 0, 0, 0]]],
    ['special1-collide-2', [[[39, 449, 14, 12], [3, 13]], [0, 0, 0, 0]]],
    ['special1-collide-3', [[[62, 449, 14, 13], [3, 14]], [0, 0, 0, 0]]],
    ['special1-collide-4', [[[83, 446, 21, 18], [3, 14]], [0, 0, 0, 0]]],
]);

// Animation sequences
const animations = {
    [FireballState.ACTIVE]: [
        ['special1-1', 4], ['special1-1', 4],['special1-2', 4],['special1-3', 4],
        ['special1-4', 4], ['special1-5', 4],['special1-6', 4],['special1-7', 4],
        ['special1-8', 4],
        
    ],
    [FireballState.COLLIDED]: [['special1-4', 4]],
    [FireballState.CRACK]: [
        ['crack-1', 15],['crack-2', 15],['crack-3', 15],['crack-4', 200],['crack-4', 100],
],
};

export class BlockRock {
    image = document.querySelector('img[alt="golem"]');
    animationFrame = 0;
    crackAnimationFrame = 0;
    state = FireballState.ACTIVE;

    constructor(args, time, entityList) {
        const [fighter, strength] = args;
        this.canDealDamage = true;

        this.fighter = fighter;
        this.entityList = entityList;
        this.velocity = fireballVelocity[strength] || 300;
        this.direction = this.fighter?.direction ?? 1;
        this.directionY = 1;

        const baseX = this.fighter?.position?.x ?? 0;
        const baseY = this.fighter?.position?.y ?? 0;

        this.position = {
            x: baseX + 25*(this.direction),
            y: baseY - 30,
        };

        this.animationTimer = time.previous ?? 0;
        this.crackAnimationTimer = time.previous ?? 0;
    }

    // 🚀 Update movement and handle collisions
    updateMovement(time, camera) {
       this.position.x += (this.direction) * time.secondsPassed;
       if(this.animationFrame >= 4)  this.position.y += 1.8 * time.secondsPassed;
       
        const screenX = this.position.x - camera.position.x;
        if (screenX > 384 + 56 || screenX < -56) {
            this.entityList.remove(this);
            return;
        }

       
    }


    // 🎞️ Update animation frames
    updateAnimation(time) {
        if (time.previous < this.animationTimer) return;
         if(this.animationFrame === 8)  this.entityList.remove(this);
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
