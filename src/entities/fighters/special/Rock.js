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
import { checkProjectileCollision } from "../../../utils/projectileCollisions.js";

// Frame data
const frames = new Map([
    ['special1-1', [[[850, 142, 85, 115], [42, 113]], [-42, -112, 85, 113], [-42, -112, 85, 113]]],
    ['special1-1-nohit', [[[850, 142, 85, 115], [42, 113]], [0, 0, 0, 0], [0, 0, 0, 0]]],
    ['special1-2', [[[850, 258, 85, 115], [42, 113]], [0, 0, 0, 0], [0, 0, 0, 0]]],
    ['special1-3', [[[850, 379, 85, 115], [42, 113]], [0, 0, 0, 0], [0, 0, 0, 0]]],
    ['special1-4', [[[850, 496, 85, 115], [42, 113]], [0, 0, 0, 0], [0, 0, 0, 0]]],
    ['special1-5', [[[850, 616, 85, 115], [42, 113]], [0, 0, 0, 0], [0, 0, 0, 0]]],

    ['crack-1', [[[546, 135, 80, 30], [40, 28]], [-42, -112, 85, 113], [-42, -112, 85, 113]]],
    ['crack-2', [[[640, 129, 128, 43], [64, 28]], [-42, -112, 85, 113], [-42, -112, 85, 113]]],
    ['crack-3', [[[546, 186, 185, 53], [92, 28]], [-42, -112, 85, 113], [-42, -112, 85, 113]]],
    ['crack-4', [[[555, 244, 249, 81], [124, 40]], [-42, -112, 85, 113], [-42, -112, 85, 113]]],

    // Collision frames
    ['special1-collide-1', [[[22, 450, 10, 11], [3, 10]], [0, 0, 0, 0]]],
    ['special1-collide-2', [[[39, 449, 14, 12], [3, 13]], [0, 0, 0, 0]]],
    ['special1-collide-3', [[[62, 449, 14, 13], [3, 14]], [0, 0, 0, 0]]],
    ['special1-collide-4', [[[83, 446, 21, 18], [3, 14]], [0, 0, 0, 0]]],
]);

// Animation sequences
const animations = {
    [FireballState.ACTIVE]: [
        ['special1-1', 20],['special1-1-nohit', 100],['special1-2', 10],
        ['special1-3', 10],['special1-4', 10],
        ['special1-5', 10],['special1-5', 1]
    ],
    [FireballState.COLLIDED]: [['special1-4', 4]],
    [FireballState.CRACK]: [
        ['crack-1', 15],['crack-2', 15],['crack-3', 15],['crack-4', 200],['crack-4', 100],
],
};

export class Rock {
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
            x: baseX + (60 * this.direction),
            y: baseY + 130,
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
        this.position.y -= 600 * this.directionY * time.secondsPassed;

        if (this.position.y <= 220) this.directionY = 0;

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
          // this.direction *= -1;
           // this.directionY = 1;
            return;
        }

        const opponent = this.fighter.opponent;

        

        if (collisionState === FireballCollidedState.OPPONENT && this.canDealDamage) {
            this.canDealDamage = false;
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

    // 🎞️ Update animation frames
    updateCrackAnimation(time) {
        if (time.previous < this.crackAnimationTimer) return;
       
        this.crackAnimationFrame = (this.crackAnimationFrame + 1) % animations[FireballState.CRACK].length;
        this.crackAnimationTimer = time.previous + animations[FireballState.CRACK][this.crackAnimationFrame][1] * FRAME_TIME;
    }

    // 🔍 Draw all debug boxes
    drawDebug(context, camera) {
        const [frameKey] = animations[FireballState.ACTIVE][this.animationFrame];
        const frameData = frames.get(frameKey);
        if (!frameData) return;

        DebugBox.drawForSpecialEntity(context, camera, this, frameData);
    }

    // 🖼️ Draw fireball sprite
    drawCrack(context, camera) {
        if (!this.image || !this.image.complete) return;

        const [frameKey] = animations[FireballState.CRACK][this.crackAnimationFrame];
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
            Math.floor(this.position.y - camera.position.y - originY+10),
            frameWidth,
            frameHeight
        );

        context.restore();
       // this.drawDebug(context, camera);
    }

    draw(context, camera) {
         this.drawCrack(context, camera);
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
         this.updateCrackAnimation(time);
    }
}
