import { FRAME_TIME } from '../../../constants/game.js';

export class SkillSplash {
    constructor(args, time, entityList){
        const [x, y, playerId] = args;

        this.image = document.querySelector('img[alt="hitsplash"]');
        this.position = { x, y };
        this.playerId = playerId;
        this.entityList = entityList;

        this.frames = [];
        this.animationFrame = -1;
        this.animationTimer = 0;
    }

    update(time){
        if (time.previous < this.animationTimer + 4 * FRAME_TIME) return;
        this.animationFrame += 1;
        this.animationTimer = time.previous;

        if (this.animationFrame >= this.frameNumber) this.entityList.remove.call(this.entityList, this);
    }

    draw(context, camera){
        const [
            [x, y, width, height], [originX, originY],
        ] = this.frames[this.animationFrame];
        const scale = 3;
        context.drawImage(
            this.image,
            x, y,
            width, height,
            Math.floor(this.position.x - camera.position.x - originX * scale),
            Math.floor(this.position.y - camera.position.y - originY - 80 ),
            width * scale, height * scale,
        );
    }
}