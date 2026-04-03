import { FPS, FRAME_TIME } from "../../constants/game.js";
import { playSound } from "../../soundHandler.js";
import { gameState } from "../../state/gameState.js";
import { drawFrame } from "../../utils/context.js";
import { BackgroundAnimation } from "./shared/BackgroundAnimation.js";

export class boholStage {
    constructor(){
        this.image = document.querySelector('img[alt="bohol-stage"]');
       gameState.stageMusic = 'audio#stage-bohol';
       console.log('Bohol Stage created');
    
        this.frames = new Map([
            ['stage-background', [58, 221, 769, 335]],
            ['grass', [59, 578, 768, 234]],
            ['carabaoShadow', [26, 928, 127, 10]],
            ['carabaoPoo', [176, 915, 44, 22]],
        ]);

        this.carabaoPosition = {x: -30, y: 90};
        this.carabaoDirection = true;
        this.carabaoFlip = 1;
        this.carabaoSound = document.querySelector('audio#stage-entity-carabao');
        this.carabaoMoo = true;
        this.carabao = new BackgroundAnimation(
            this.image,
            [
                ['carabao-1', [13, 827, 136, 76]],
                ['carabao-2', [172, 827, 136, 76]],
                ['carabao-3', [321, 827, 136, 76]],
                ['carabao-4', [476, 827, 136, 76]],
                ['carabao-5', [625, 827, 136, 76]],
                ['carabao-6', [774, 827, 136, 76]],
            ],
            [['carabao-1', 200], ['carabao-2', 200], ['carabao-3', 200], ['carabao-4', 200], ['carabao-5', 200], ['carabao-6', 200]],
        );
         this.pooSmoke = new BackgroundAnimation(
            this.image,
            [
                ['pooSmoke-1', [68, 988, 40, 81]],
                ['pooSmoke-2', [122, 988, 40, 81]],
                ['pooSmoke-3', [178, 980, 40, 81]],
                ['pooSmoke-4', [244, 986, 40, 81]],
                ['pooSmoke-5', [308, 988, 40, 81]],
                ['pooSmoke-6', [385, 989, 40, 81]],
                ['pooSmoke-7', [452, 987, 40, 81]],
                ['pooSmoke-8', [518, 987, 40, 81]],
               
            ],
            [['pooSmoke-1', 200], ['pooSmoke-2', 200], ['pooSmoke-3', 200], ['pooSmoke-4', 200], ['pooSmoke-5', 200], ['pooSmoke-6', 200],['pooSmoke-7', 200],['pooSmoke-8', 200]],
        );
    }

    updateCarabao(time){
        if(this.carabaoDirection){
            this.carabaoPosition.x += 60 * time.secondsPassed;
            this.carabaoFlip = 1;
        } else {
            this.carabaoPosition.x -= 60 * time.secondsPassed;
            this.carabaoFlip = -1;
        };
        
        if (this.carabaoPosition.x > 1200){
            this.carabaoDirection = !this.carabaoDirection;
            this.carabaoMoo = true;
        }
        if (this.carabaoPosition.x < -40){
            this.carabaoDirection = !this.carabaoDirection;
            this.carabaoMoo = true;
        }

        //Carabao Moo Sound Effect
        if (this.carabaoPosition.x < 300 && this.carabaoPosition.x > 200 && this.carabaoMoo){
            this.carabaoSound.play();
            this.carabaoMoo = false;
            console.log('Carabao Moo');
        }
    }
  
    update(time){
        if(gameState.pause) return;
        this.carabao.update(time);
        this.pooSmoke.update(time);
        this.updateCarabao(time);
    }

     drawFrame(context, frameKey, x, y, direction, alpha){
       drawFrame(context, this.image, this.frames.get(frameKey), x, y, direction, alpha);       
    }

 

    drawBackground(context, camera){
        this.drawFrame(context, 'stage-background', Math.floor(-20 - (camera.position.x/ 2.157303)), -70 -camera.position.y);
         this.drawFrame(context, 'carabaoShadow', Math.floor(this.carabaoPosition.x - (camera.position.x/ 2.157303)), 180 -camera.position.y, this.carabaoFlip, 0.5);
        
         this.carabao.draw(context,  Math.floor(this.carabaoPosition.x - (camera.position.x/ 2.157303)), 110 -camera.position.y, this.carabaoFlip);
          this.drawFrame(context, 'carabaoPoo', Math.floor(400 - (camera.position.x/ 2.157303)), 170 -camera.position.y, 1, 1);
          this.pooSmoke.draw(context,  Math.floor(403 - (camera.position.x/ 2.157303)), 89 -camera.position.y, 1);
         
    }

    drawForeground(context, camera){
        this.drawFrame(context, 'grass', Math.floor(15 - (camera.position.x/ 1.61445)), 130 -camera.position.y);
   
    }
}