import { HitSplash } from './HitSplash.js';

export class GreenHitSplash extends HitSplash {
    constructor(args, time, entityList){
        super(args, time, entityList);
        this.frameNumber = 4;
        this.frames = [
            //Player1
            [[14, 68, 15, 21], [7, 19]],
            [[38, 70, 27, 23], [13, 21]],
            [[73, 70, 27, 23], [13, 21]],
            [[106, 66, 32, 31], [16, 29]],

            //Player2
            [[14, 68, 15, 21], [7, 19]],
            [[38, 70, 27, 23], [13, 21]],
            [[73, 70, 27, 23], [13, 21]],
            [[106, 66, 32, 31], [16, 29]],
        ];
    }
    update(time){
        super.update(time);
    }

    draw(context, camera){
        super.draw(context, camera);
    }
}