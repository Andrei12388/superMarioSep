import { SkillSplash } from "./SkillSplash.js";


export class HyperHitSplash extends SkillSplash {
    constructor(args, time, entityList){
        super(args, time, entityList);
        this.frameNumber = 8;
        this.frames = [
            //Player1
            [[305, 224, 56, 78], [28, 76]],
            [[375, 225, 62, 59], [31, 57]],
            [[455, 251, 42, 27], [21, 25]],
            [[519, 225, 59, 65], [29, 63]],
            [[584, 214, 98, 97], [49, 95]],
            [[688, 219, 94, 90], [47, 88]],
            [[301, 320, 100, 95], [50, 93]],
            [[400, 321, 100, 95], [50, 93]],
           

            //Player2
            [[305, 224, 56, 78], [28, 76]],
            [[375, 225, 62, 59], [31, 57]],
            [[455, 251, 42, 27], [21, 25]],
            [[519, 225, 59, 65], [29, 63]],
            [[584, 214, 98, 97], [49, 95]],
            [[688, 219, 94, 90], [47, 88]],
            [[301, 320, 100, 95], [50, 93]],
            [[400, 321, 100, 95], [50, 93]],
        ];
    }
    update(time){
        super.update(time);
    }

    draw(context, camera){
        super.draw(context, camera);
    }
}