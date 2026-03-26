import { FRAME_TIME } from "../../../constants/game.js";
import {
    FireballCollidedState,
    FireballState,
    fireballVelocity
} from "../../../constants/fireball.js";
import { STAGE_FLOOR } from "../../../constants/stage.js";
import { gameState } from "../../../state/gameState.js";
import { DebugBox } from "../../../utils/DebugBox.js";

// Frame data
const frames = new Map([
   
        //Rock splash on ground
                ['special1-1', [[[3, 1653, 83, 104], [41,102]], [0, 0, 0, 0], [0, 0, 0, 0]]],
                ['special1-2', [[[87, 1609, 80, 149], [40,147]], [0, 0, 0, 0], [0, 0, 0, 0]]],
                ['special1-3', [[[170, 1589, 81, 170], [40,168]], [0, 0, 0, 0], [0, 0, 0, 0]]],
                ['special1-4', [[[256, 1593, 78, 164], [39,162]], [0, 0, 0, 0], [0, 0, 0, 0]]],
                ['special1-5', [[[340, 1585, 79, 173], [39,171]], [0, 0, 0, 0], [0, 0, 0, 0]]],
                ['special1-6', [[[423, 1580, 77, 177], [38,175]], [0, 0, 0, 0], [0, 0, 0, 0]]],
                ['special1-7', [[[513, 1594, 71, 163], [35,161]], [0, 0, 0, 0], [0, 0, 0, 0]]],
                ['special1-8', [[[610, 1599, 52, 159], [26,157]], [0, 0, 0, 0], [0, 0, 0, 0]]],
                ['special1-9', [[[677, 1613, 43, 138], [21,136]], [0, 0, 0, 0], [0, 0, 0, 0]]],
                ['special1-10', [[[728, 1634, 32, 123], [16,121]], [0, 0, 0, 0], [0, 0, 0, 0]]],

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
        ['special1-8', 4], ['special1-9', 4], ['special1-10', 4],
        
    ],
    [FireballState.COLLIDED]: [['special1-4', 4]],
    [FireballState.CRACK]: [
        ['crack-1', 15],['crack-2', 15],['crack-3', 15],['crack-4', 200],['crack-4', 100],
],
};

export class RockSplash {
    image = document.querySelector('img[alt="golem"]');
    animationFrame = 0;
    crackAnimationFrame = 0;
    state = FireballState.ACTIVE;

    constructor(args, time, entityList) {
        const [fighter, strength] = args;
        this.canDealDamage = true;

        this.fighter = fighter;
        this.entityList = entityList;
        this.velocity = fireballVelocity[strength] || 0;
        this.direction = this.fighter?.direction ?? 1;
        this.directionY = 1;

        const baseX = this.fighter?.position?.x ?? 0;
        const baseY = this.fighter?.position?.y ?? 0;

        this.position = {
            x: baseX + 30*(this.direction),
            y: STAGE_FLOOR,
        };

        this.animationTimer = time.previous ?? 0;
        this.crackAnimationTimer = time.previous ?? 0;
    }

    // 🚀 Update movement and handle collisions
    updateMovement(time, camera) {
        // Move horizontally using the configured velocity so direction is respected
        this.position.x += (1 * this.direction) * time.secondsPassed;
       
        const screenX = this.position.x - camera.position.x;
        if (screenX > 384 + 56 || screenX < -56) {
            this.entityList.remove(this);
            return;
        }

       
    }


    // 🎞️ Update animation frames
    updateAnimation(time) {
        if (time.previous < this.animationTimer) return;
         if(this.animationFrame === 10)  this.entityList.remove(this);
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
        // Use the same flipping logic as other rock/fireball classes (scale by direction only)
        // Avoid scaling the X-axis by a magnitude (like 1.2) here — it caused incorrect placement
        // when flipping. If a visual scale is desired, handle by adjusting frame size or
        // drawing destination width/height explicitly.
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
