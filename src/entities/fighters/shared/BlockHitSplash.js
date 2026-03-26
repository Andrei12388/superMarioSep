import { HitSplash } from './HitSplash.js';

export class BlockHitSplash extends HitSplash {
    constructor(args, time, entityList){
        super(args, time, entityList);
        this.frameNumber = 5;
        this.frames = [
            //Player1
            [[11, 149, 23, 19], [12, 17]],
            [[41, 149, 24, 20], [12, 18]],
            [[72, 148, 26, 22], [13, 20]],
            [[106, 147, 28, 24], [14, 22]],
            [[144, 146, 31, 26], [15, 24]],

            //Player2
            [[11, 149, 23, 19], [12, 17]],
            [[41, 149, 24, 20], [12, 18]],
            [[72, 148, 26, 22], [13, 20]],
            [[106, 147, 28, 24], [14, 22]],
            [[144, 146, 31, 26], [15, 24]],
        ];
    }
    update(time){
        super.update(time);
    }

    draw(context, camera){
        super.draw(context, camera);
    }
}