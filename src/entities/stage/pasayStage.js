import { FRAME_TIME } from "../../constants/game.js";
import { playSound } from "../../soundHandler.js";
import { gameState } from "../../state/gameState.js";
import { drawFrame } from "../../utils/context.js";
import { BackgroundAnimation } from "./shared/BackgroundAnimation.js";

export class pasayStage {
    constructor(){
        this.image = document.querySelector('img[alt="moa-stage"]');
       gameState.stageMusic = 'audio#stage-pasay';
       console.log('Cubao Stage created');
    
        this.frames = new Map([
            ['stage-background', [58, 221, 759, 332]],
            ['trash', [787, 572, 71, 115]],
            ['traffic-light', [858, 417, 55, 153]],
            ['boat', [787, 572, 71, 115]],
        ]);


        this.traffic = new BackgroundAnimation(
            this.image,
            [
                ['traffic-1', [829, 274, 55, 292]],
                ['traffic-2', [885, 278, 54, 292]],
                ['traffic-3', [945, 278, 55, 292]],
            ],
            [['traffic-1', 666], ['traffic-2', 766],['traffic-3', 1064]],
        );

        this.boat = {
            animationFrame: 0,
            animationTimer: 0,
            animationDelay: 22,
            animation: [0, -1, -2, -3, -4, -3, -2, -1],
        };
    }


    updateBoat(time){
        if (time.previous > this.boat.animationTimer + this.boat.animationDelay * FRAME_TIME) {
            this.boat.animationTimer = time.previous;
            this.boat.animationFrame += 1;
            this.boat.animationDelay = 22 + (Math.random() * 16 - 8);
        }
        if (this.boat.animationFrame >= this.boat.animation.length) {
            this.boat.animationFrame = 0;
        }
    }
    update(time){
        this.updateBoat(time);
        this.traffic.update(time);
    }

     drawFrame(context, frameKey, x, y){
       drawFrame(context, this.image, this.frames.get(frameKey), x, y);       
    }

    drawBoat(context, camera){
        this.boat.position = {
            x: Math.floor(150 - (camera.position.x / 1.613445)),
            y: Math.floor(-camera.position.y + this.boat.animation[this.boat.animationFrame]),
        };

        //this.drawFrame(context, 'boat', this.boat.position.x, this.boat.position.y);
        
    }

    drawBackground(context, camera){
        this.drawFrame(context, 'stage-background', Math.floor(-20 - (camera.position.x/ 2.157303)), -70 -camera.position.y);
        this.drawBoat(context, camera);
        
        
        //this.drawFrame(context, 'traffic-light', Math.floor(350 - (camera.position.x)), 100 -camera.position.y);
    }

    drawForeground(context, camera){
        //this.drawFrame(context, 'trash', Math.floor(650 - (camera.position.x/ 1.61445)), 160 -camera.position.y);
//this.traffic.draw(context,  Math.floor(220 - (camera.position.x/ 1.61445)), 10 -camera.position.y);
    }
}