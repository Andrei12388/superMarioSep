import { FRAME_TIME } from '../../../constants/game.js';
import { HitSplash } from './HitSplash.js';

export class DashEffectSplash extends HitSplash {
    constructor(args, time, entityList){
        super(args, time, entityList);
        this.frameNumber = 7;
        this.image = document.querySelector('img[alt="fxSplash"]');
        this.position.x -= 30 * this.direction;
        this.frames = [
            //Player1
            [[38, 682, 36, 70], [22, 68]],
            [[73, 682, 36, 70], [44, 55]],
            [[112, 682, 36, 70], [44, 55]],
            [[152, 682, 36, 70], [44, 55]],
            [[197, 682, 36, 70], [44, 55]],
            [[242, 682, 36, 70], [44, 55]],
            [[284, 682, 36, 70], [44, 55]],
            

             //Player2
            [[38, 682, 36, 70], [22, 68]],
            [[73, 682, 36, 70], [44, 55]],
            [[112, 682, 36, 70], [44, 55]],
            [[152, 682, 36, 70], [44, 55]],
            [[197, 682, 36, 70], [44, 55]],
            [[242, 682, 36, 70], [44, 55]],
            [[284, 682, 36, 70], [44, 55]],
        ];
    }
    update(time){
        this.position.x += 1 * time.secondsPassed;
         if (time.previous < this.animationTimer + 4 * FRAME_TIME) return;
                this.animationFrame += 1;
                this.animationTimer = time.previous;
        
                if (this.animationFrame >= this.frameNumber) this.entityList.remove.call(this.entityList, this);
    }

    draw(context, camera){
        super.draw(context, camera);
    }
}