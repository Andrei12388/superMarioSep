import { EffectSplash } from './EffectSplash.js';

export class GroundShakeSplash extends EffectSplash{
    constructor(args, time, entityListBackground){
        // allow an optional scale in the args: [x, y, playerId, scale]
        const [x, y, playerId, scale = 0.8, direction] = args;
        // pass normalized args (scale and optional direction) to the base so it can initialize
        super([x, y, playerId, scale, direction], time, entityListBackground);
        this.frameNumber = 4;
        this.velocity = { x: 0, y: 0 };
        this.frames = [
            //Player1
             [[1362, 773, 120, 25], [60, 23]],
             [[1344, 819, 151, 25], [75, 23]],
             [[1333, 865, 164, 27], [82, 25]],
             [[1313, 916, 184, 22], [92, 20]],

            //Player2
             [[1362, 773, 120, 25], [60, 23]],
             [[1344, 819, 151, 25], [75, 23]],
             [[1333, 865, 164, 27], [82, 25]],
             [[1313, 916, 184, 22], [92, 20]],
        ];
    }
    update(time){
        super.update(time);
    }

    draw(context, camera){
        super.draw(context, camera);
    }
}