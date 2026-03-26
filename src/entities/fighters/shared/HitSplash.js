import { FRAME_TIME } from '../../../constants/game.js';
import { gameState } from '../../../state/gameState.js';

export class HitSplash {
    constructor(args, time, entityList){
         const [x, y, playerId, maybe4 = 1, maybe5] = args;
       
        this.image = document.querySelector('img[alt="hitsplash"]');
        this.position = { x, y };
        this.playerId = playerId;

         let scale = 1;
        let explicitDirection = undefined;

        if (maybe5 !== undefined) {
            // two values provided: treat 4th as scale and 5th as direction
            scale = Number.isFinite(maybe4) ? maybe4 : 1;
            explicitDirection = maybe5;
        } else {
            // only one extra value passed - it might be a direction (-1/1) or a scale
            if (maybe4 === -1 || maybe4 === 1) {
                explicitDirection = maybe4;
                scale = 1;
            } else {
                scale = Number.isFinite(maybe4) ? maybe4 : 1;
            }
        }

        // derive direction from the explicit arg when supplied, otherwise fall back to the
        // current fighter state (by playerId) or a sensible default
        this.direction = explicitDirection ?? (gameState.fighters?.[playerId]?.direction) ?? (playerId === 0 ? 1 : -1);

        this.entityList = entityList;

        this.frames = [];
        this.animationFrame = -1;
        this.animationTimer = 0;
    }

    update(time){
        this.animationTimer += time.secondsPassed;
        if (this.animationTimer < 4 * FRAME_TIME / 1000) return;
        this.animationFrame += 1;
        this.animationTimer -= 4 * FRAME_TIME / 1000;

        if (this.animationFrame >= this.frameNumber) this.entityList.remove.call(this.entityList, this);
    }

    draw(context, camera, maybe4) {
    // guard against invalid animationFrame (can be -1 if update hasn't run yet)
    if (this.animationFrame < 0 || this.animationFrame >= this.frames.length) return;

    const [
        [x, y, width, height], [originX, originY],
    ] = this.frames[this.animationFrame];

    const drawX = Math.floor(this.position.x - camera.position.x - originX);
    const drawY = Math.floor(this.position.y - camera.position.y - originY);

    context.save();

    if (this.direction > 0) {
        // Flip horizontally around the sprite center
        context.scale(-1, 1);
        context.drawImage(
            this.image,
            x, y,
            width, height,
            -(drawX + width), // negative X because of the flipped scale
            drawY,
            width, height,
        );
    } else {
        // Normal drawing
        context.drawImage(
            this.image,
            x, y,
            width, height,
            drawX, drawY,
            width, height,
        );
    }

    context.restore();
}

}