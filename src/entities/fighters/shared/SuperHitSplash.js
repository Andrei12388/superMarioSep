
import { SkillSplash } from './SkillSplash.js';

export class SuperHitSplash extends SkillSplash {
    constructor(args, time, entityList){
        super(args, time, entityList);
        this.frameNumber = 8;
        this.frames = [
            //Player1
            [[305, 21, 56, 78], [28, 76]],
            [[375, 28, 62, 59], [31, 57]],
            [[455, 49, 42, 27], [21, 25]],
            [[519, 20, 59, 65], [29, 63]],
            [[584, 9, 98, 97], [49, 95]],
            [[688, 17, 94, 90], [47, 88]],
            [[301, 114, 100, 95], [50, 93]],
            [[400, 115, 100, 95], [50, 93]],
           

            //Player2
            [[305, 21, 56, 78], [28, 76]],
            [[375, 28, 62, 59], [31, 57]],
            [[455, 49, 42, 27], [21, 25]],
            [[519, 20, 59, 65], [29, 63]],
            [[584, 9, 98, 97], [49, 95]],
            [[688, 17, 94, 90], [47, 88]],
            [[301, 114, 100, 95], [50, 93]],
            [[400, 115, 100, 95], [50, 93]],
        ];
    }
    update(time){
        super.update(time);
    }

    draw(context, camera){
        super.draw(context, camera);
    }
}