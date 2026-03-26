import { FRAME_TIME } from '../../../constants/game.js';
import { gameState } from '../../../state/gameState.js';

export class EffectSplash {
    constructor(args, time, entityListBackground){
        // args is expected to be [x, y, playerId, scale?, direction?]
        // keep backward-compatibility with older call sites by defaulting scale to 1
        // Accept either (scale) as the 4th param or (direction) as the 4th param
        // (and direction as 5th) so callers can pass either order.
        const [x, y, playerId, maybe4 = 1, maybe5] = args;

        this.image = document.querySelector('img[alt="fxSplash"]');
        this.position = { x, y };
        this.playerId = playerId;
        this.entityList = entityListBackground;
        // ensure velocity exists so update() never throws
        this.velocity = this.velocity ?? { x: 0, y: 0 };
        // Figure out explicit direction/scale from parsed maybe4/maybe5
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
        this.frames = [];
        // scale to apply to frame width/height and origin when drawing
        this.scale = Number.isFinite(scale) ? scale : 1;
        this.animationFrame = -1;
        this.animationTimer = 0;
    }

    update(time){
        
        // apply horizontal velocity taking facing direction into account
        this.position.x += (this.direction) * (this.velocity?.x ?? 0) * time.secondsPassed;
        if (time.previous < this.animationTimer + 4 * FRAME_TIME) return;
        this.animationFrame += 1;
        this.animationTimer = time.previous;

        if (this.animationFrame >= this.frameNumber) this.entityList.remove.call(this.entityList, this);
    }

    draw(context, camera) {
        // guard against invalid animationFrame (can be -1 if update hasn't run yet)
        if (this.animationFrame < 0 || this.animationFrame >= this.frames.length) return;

        const [
            [x, y, width, height], [originX, originY],
        ] = this.frames[this.animationFrame];

        // apply scale to origin and sprite size
        const scaledWidth = Math.floor(width * this.scale);
        const scaledHeight = Math.floor(height * this.scale);

        const drawX = Math.floor(this.position.x - camera.position.x - originX * this.scale);
        const drawY = Math.floor(this.position.y - camera.position.y - originY * this.scale);

    context.save();

        // flip horizontally based on the facing direction of the owner
        if (this.direction < 0) {
            // Flip horizontally around the sprite center
            context.scale(-1, 1);
            context.drawImage(
                this.image,
                x, y,
                width, height,
                -(drawX + scaledWidth), // negative X because of the flipped scale
                drawY,
                scaledWidth, scaledHeight,
            );
    } else {
        // Normal drawing
        context.drawImage(
            this.image,
            x, y,
            width, height,
                drawX, drawY,
                scaledWidth, scaledHeight,
        );
    }

    context.restore();
}

}