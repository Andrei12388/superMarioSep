import { HitSplash } from './HitSplash.js';

export class SlashHitSplash extends HitSplash {
    constructor(args, time, entityList){
        super(args, time, entityList);
        this.frameNumber = 6;
        this.position.x -= 30 * this.direction;
        this.frames = [
            //Player1
            [[6, 282, 88, 57], [44, 55]],
            [[6, 339, 88, 57], [44, 55]],
            [[6, 411, 88, 57], [44, 55]],
            [[6, 481, 88, 57], [44, 55]],
            [[18, 551, 83, 57], [41, 55]],
            [[18, 622, 83, 57], [41, 55]],
            

            //Player2
            [[6, 282, 88, 57], [44, 55]],
            [[6, 339, 88, 57], [44, 55]],
            [[6, 411, 88, 57], [44, 55]],
            [[6, 481, 88, 57], [44, 55]],
            [[6, 551, 83, 57], [44, 55]],
            [[6, 622, 83, 57], [44, 55]],
        ];
    }
    update(time){
        super.update(time);
    }

    draw(context, camera){
        super.draw(context, camera);
    }
}