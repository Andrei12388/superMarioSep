import { HitSplash } from './HitSplash.js';

export class LightHitSplash extends HitSplash {
    constructor(args, time, entityList){
        super(args, time, entityList);
        this.frameNumber = 4;
        this.frames = [
            //Player1
            [[14, 16, 9, 10], [6, 7]],
            [[34, 15, 13, 11], [7, 7]],
            [[55, 15, 13, 11], [7, 7]],
            [[75, 10, 20, 19], [11, 11]],

            //Player2
            [[14, 16, 9, 10], [6, 7]],
            [[34, 15, 13, 11], [7, 7]],
            [[55, 15, 13, 11], [7, 7]],
            [[75, 10, 20, 19], [11, 11]],
        ];
    }
    update(time){
        super.update(time);
    }

    draw(context, camera){
        super.draw(context, camera);
    }
}