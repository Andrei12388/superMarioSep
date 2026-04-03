import { drawFrame } from "../utils/context.js";

export class Stage {
    constructor(){
        this.image = document.querySelector('img[alt="payatas-stage"]');
    
        this.frames = new Map([
            ['stage-background', [58, 221, 759, 332]],
            ['trash', [787, 572, 71, 115]],
            ['traffic-light', [842, 233, 78, 318]],


        ]);
    }
    update(){

    }

     drawFrame(context, frameKey, x, y){
       drawFrame(context, this.image, this.frames.get(frameKey), x, y);       
    }

    draw(context, camera){
        this.drawFrame(context, 'stage-background', Math.floor(-20 - (camera.position.x/ 2.157303)), -70 -camera.position.y);
        this.drawFrame(context, 'trash', Math.floor(400 - (camera.position.x/ 1.61445)), 160 -camera.position.y);
        this.drawFrame(context, 'traffic-light', Math.floor(350 - (camera.position.x)), 20 -camera.position.y);
    }
}