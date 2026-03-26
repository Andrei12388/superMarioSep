import { FRAME_TIME } from '../../../constants/game.js';
import { HitSplash } from './HitSplash.js';

export class KnockLiftSplash extends HitSplash {
    constructor(args, time, entityList){
        super(args, time, entityList);
        const [x, y, playerId, maybe4 = 1, maybe5] = args;
       
        this.flipped = maybe4;
        this.frameNumber = 6;
        this.position.x -= 70 * this.direction;
        this.frames = [
            //Player1
            [[102, 282, 88, 57], [44, 55]],
            [[102, 339, 88, 57], [44, 55]],
            [[102, 411, 88, 57], [44, 55]],
            [[102, 481, 88, 57], [44, 55]],
            [[114, 551, 83, 57], [41, 55]],
            [[114, 622, 83, 57], [41, 55]],
            

            //Player2
            [[102, 282, 88, 57], [44, 55]],
            [[102, 339, 88, 57], [44, 55]],
            [[102, 411, 88, 57], [44, 55]],
            [[102, 481, 88, 57], [44, 55]],
            [[114, 551, 83, 57], [41, 55]],
            [[114, 622, 83, 57], [41, 55]],
        ];
    }
   update(time){
           if (time.previous < this.animationTimer + 3 * FRAME_TIME) return;
           this.animationFrame += 1;
           this.animationTimer = time.previous;
   
           if (this.animationFrame >= this.frameNumber) this.entityList.remove.call(this.entityList, this);
       }

    draw(context, camera, maybe4) {
   
    if (this.animationFrame < 0 || this.animationFrame >= this.frames.length) return;

    const [
        [x, y, width, height], 
        [originX, originY]
    ] = this.frames[this.animationFrame];

    const drawX = Math.floor(this.position.x - camera.position.x - originX);
    const drawY = Math.floor(this.position.y - camera.position.y - originY);

    context.save();
    context.filter = "saturate(1000%) hue-rotate(-30deg) brightness(100%)";
    // choose scale Y based on upside-down flag
    const scaleY = this.flipped;

    if (this.direction > 0) {
        // Same structure as HitSplash code
        context.scale(-1, scaleY);
        context.drawImage(
            this.image,
            x, y, width, height,
            -(drawX + width),
            drawY * scaleY,
            width,
            height
        );
    } else {
        context.scale(1, scaleY);
        context.drawImage(
            this.image,
            x, y, width, height,
            drawX,
            drawY * scaleY,
            width,
            height
        );
    }

    context.restore();
}

}