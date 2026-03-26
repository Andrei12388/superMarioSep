import { FRAME_TIME } from "../../../constants/game.js";
import { FireballCollidedState, FireballState, fireballVelocity} from "../../../constants/fireball.js";
import { boxOverlap, getActualBoxDimensions } from "../../../utils/collisions.js";
import { FighterAttackStrength, FighterAttackType, FighterHurtBox } from "../../../constants/fighter.js";

const frames = new Map([
    ['special1-1', [[[4, 365, 73, 30],[24,18]], [-15, -13, 30, 24],[-28, 20, 56, 38]]],
    ['special1-2', [[[83, 363, 70, 36],[24,18]], [-15, -13, 30, 24],[-28, 20, 56, 38]]],
    ['special1-3', [[[182, 348, 44, 66],[24,18]], [-15, -13, 30, 24],[-28, 20, 56, 38]]],
    ['special1-4', [[[246, 350, 53, 60],[24,18]], [-15, -13, 30, 24],[-28, 20, 56, 38]]],
    ['special1-5', [[[312, 363, 73, 31],[24,18]], [-15, -13, 30, 24],[-28, 20, 56, 38]]],
    ['special1-6', [[[399, 356, 61, 51],[24,18]], [-15, -13, 30, 24],[-28, 20, 56, 38]]],
    ['special1-7', [[[486, 357, 48, 64],[24,18]], [-15, -13, 30, 24],[-28, 20, 56, 38]]],
    ['special1-8', [[[546, 364, 73, 29],[24,18]], [-15, -13, 30, 24],[-28, 20, 56, 38]]],

    //Collision Frames
    ['special1-collide-1', [[[22, 450, 10, 11],[3,10]], [0, 0, 0, 0]]],
    ['special1-collide-2', [[[39, 449, 14, 12],[3,13]], [0, 0, 0, 0]]],
    ['special1-collide-3', [[[62, 449, 14, 13],[3,14]], [0, 0, 0, 0]]],
    ['special1-collide-4', [[[83, 446, 21, 18],[3,14]], [0, 0, 0, 0]]],
]);

const animations = {
                 [FireballState.ACTIVE]:[
                    ['special1-1', 4],['special1-2', 4],['special1-3', 4],['special1-4', 4],
                    ['special1-5', 4],['special1-6', 4],['special1-7', 4],['special1-8', 4],
                ],
                [FireballState.COLLIDED]:[
                     ['special1-1', 4],['special1-2', 4],['special1-3', 4],['special1-4', 4],
                    ['special1-5', 4],['special1-6', 4],['special1-7', 4],['special1-8', 4],
                //    ['special1-collide-1', 9],['special1-collide-2', 5],['special1-collide-3', 5],['special1-collide-4', 9],
                ],
};

export class Fireball {
    image = document.querySelector('img[alt="malupiton"]');

    animationFrame = 0;
    state = FireballState.ACTIVE;

    constructor(args, time, entityList) {
        const [fighter, strength] = args;

        this.fighter = fighter;
        this.entityList = entityList;
        this.velocity = fireballVelocity[strength];
        this.direction = this.fighter.direction;
        this.position = {
            x: this.fighter.position.x + (76 * this.direction),
            y: this.fighter.position.y - 57,
        };
        this.animationTimer = time.previous;
    }

    hasCollidedWithOpponent(hitBox){
            for (const [, hurtBox] of Object.entries(this.fighter.opponent.boxes.hurt)) {
                const [x, y, width, height] = hurtBox;
                const actualOpponentHurtBox = getActualBoxDimensions(
                    this.fighter.opponent.position, 
                    this.fighter.opponent.direction, 
                    {x, y, width, height}
                );
        
                if (boxOverlap(hitBox, actualOpponentHurtBox)) return FireballCollidedState.OPPONENT;
            }
    }

    hasCollidedWithOtherEntity(hitbox){
        const others = this.entityList.entities.filter(
            (entity) => entity !== this && entity.position && (entity.boxes?.hit || entity.frames)
        );

        for (const other of others) {
            let otherHitBox = null;

            // Check if it's a fighter with boxes.hit
            if (other.boxes?.hit) {
                otherHitBox = getActualBoxDimensions(other.position, other.direction, other.boxes.hit);
            }
            // Check if it's a special entity with frame data
            else if (other.frames && other.animations && other.animationFrame !== undefined) {
                try {
                    // Try to get hit box from frame data
                    const currentAnim = other.animations[other.state] || other.animations[Object.keys(other.animations)[0]];
                    if (currentAnim && currentAnim[other.animationFrame]) {
                        const [frameKey] = currentAnim[other.animationFrame];
                        const frameData = other.frames.get(frameKey);
                        if (frameData && frameData[1]) {
                            const [x, y, width, height] = frameData[1];
                            otherHitBox = getActualBoxDimensions(other.position, other.direction, { x, y, width, height });
                        }
                    }
                } catch (error) {
                    // If we can't get frame data, skip this entity
                    continue;
                }
            }

            if (otherHitBox && boxOverlap(hitbox, otherHitBox)) {
                return FireballCollidedState.FIREBALL;
            }
        }
        return null;
    }

    hasCollided(){
         const [x, y, width, height] = frames.get(animations[this.state][this.animationFrame][0])[1];
        const actualHitBox = getActualBoxDimensions(this.position, this.direction, {x, y, width, height});

        return this.hasCollidedWithOpponent(actualHitBox) ?? this.hasCollidedWithOtherEntity(actualHitBox);
        
    }

    updateMovement(time,camera){
       // if (this.state !== FireballState.ACTIVE) return;

        this.position.x += (this.velocity * this.direction) * time.secondsPassed;
        const screenX = this.position.x - camera.position.x;
        if (screenX > 384 + 56 || screenX < -56) {
        this.entityList.remove(this);
        console.log('end Projectile');
        }

         console.log('Updating Projectile');

         const hasCollided = this.hasCollided();
         if (!hasCollided) return;

         this.state = FireballState.COLLIDED;
         this.animationFrame = 0;
         this.animationTimer = time.previous + animations[this.state][this.animationFrame][1]*FRAME_TIME;
        
         if (hasCollided != FireballCollidedState.OPPONENT) return;
         this.fighter.opponent.handleAttackHit(time, FighterAttackStrength.HEAVY, FighterAttackType.PUNCH, undefined, FighterHurtBox.HEAD);
        
    }

    updateAnimation(time){
        if (time.previous < this.animationTimer) return;

        this.animationFrame += 1;
        if (this.animationFrame >= animations[this.state].length){
            this.animationFrame = 0;
          //  if (this.state === FireballState.COLLIDED)  this.entityList.remove(this);
           this.direction = this.direction*-1;
            console.log('COllide Shot');
        }
        this.animationTimer = time.previous + animations[this.state][this.animationFrame][1] * FRAME_TIME;
    }

    draw(context, camera) {
        
    if (!this.image || !this.image.complete) {
        console.warn("Fireball image is not loaded");
        return;
    }

    const [frameKey] = animations[this.state][this.animationFrame];
    const [[
        [frameX, frameY, frameWidth, frameHeight], 
        [originX, originY]
    ]] = frames.get(frameKey);

    context.save();  // Save current transform
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
        frameHeight,
    );

    context.restore();  // Reset transform
   
}


    update(time, _, camera){
        this.updateMovement(time, camera);
        this.updateAnimation(time);
       


    }

}