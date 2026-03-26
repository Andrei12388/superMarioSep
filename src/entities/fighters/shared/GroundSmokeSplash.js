import { EffectSplash } from './EffectSplash.js';

export class GroundSmokeSplash extends EffectSplash{
    constructor(args, time, entityListForeground){
        // allow an optional scale in the args: [x, y, playerId, scale]
        const [x, y, playerId, scale = 0.8, direction] = args;
        // pass normalized args to the base so it can initialize scale and other props
        super([x, y, playerId, scale, direction], time, entityListForeground);
        this.frameNumber = 4;
        this.velocity = { x: 200, y: 0 };
        this.frames = [
            //Player1
             [[1203, 2422, 22, 14], [11, 12]],
             [[1234, 2413, 42, 23], [21, 21]],
             [[1280, 2411, 41, 25], [20, 23]],
             [[1327, 2407, 32, 29], [16, 27]],
             [[1365, 2403, 38, 33], [19, 31]],
             [[1409, 2396, 43, 40], [21, 38]],

            //Player2
             [[1203, 2422, 22, 14], [11, 12]],
             [[1234, 2413, 42, 23], [21, 21]],
             [[1280, 2411, 41, 25], [20, 23]],
             [[1327, 2407, 32, 29], [16, 27]],
             [[1365, 2403, 38, 33], [19, 31]],
             [[1409, 2396, 43, 40], [21, 38]],
        ];
    }
    update(time){
        super.update(time);
    }

    draw(context, camera){
        super.draw(context, camera);
    }
}