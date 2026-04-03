import { FPS, FRAME_TIME } from "../../constants/game.js";
import { playSound } from "../../soundHandler.js";
import { gameState } from "../../state/gameState.js";
import { drawFrame } from "../../utils/context.js";
import { BackgroundAnimation } from "./shared/BackgroundAnimation.js";

export class tondoStage {
    constructor(){
        this.image = document.querySelector('img[alt="tondo-stage"]');
       gameState.stageMusic = 'audio#stage-tondo';
       console.log('Tondo Stage created');
    
        this.frames = new Map([
            ['stage-background', [58, 211, 769, 335]],
            ['stage-background1', [58, 211, 769, 335]],
            ['stage-background2', [23, 1759, 596, 344]],
            ['stage-background3', [642, 1759, 596, 344]],
            ['stage-background4', [642, 1405, 596, 344]],
            ['stage-background5', [642, 1051, 596, 344]],
            ['stage-background6', [642, 697, 596, 344]],
            ['stage-background7', [23, 1403, 596, 344]],
            ['stage-background8', [23, 1051, 596, 344]],
            ['stage-background9', [23, 697, 596, 344]],
        ]);

        this.stage = new BackgroundAnimation(
                    this.image,
                    [
                         ['stage-background', [58, 211, 769, 335]],
                        ['stage-background1', [153, 231, 596, 344]],
                        ['stage-background2', [23, 1759, 596, 344]],
                        ['stage-background3', [642, 1759, 596, 344]],
                        ['stage-background4', [642, 1405, 596, 344]],
                        ['stage-background5', [642, 1051, 596, 344]],
                        ['stage-background6', [642, 697, 596, 344]],
                        ['stage-background7', [23, 1403, 596, 344]],
                        ['stage-background8', [23, 1051, 596, 344]],
                        ['stage-background9', [23, 697, 596, 344]],
                    ],
                    [
                    ['stage-background4', 100], ['stage-background5', 100], ['stage-background6', 100], 
                    ],
                );

        this.person1 = new BackgroundAnimation(
                this.image,
                [
                    ['person1-1', [[31, 608, 30, 59], [15, 57]]],
                    ['person1-2', [[73, 606, 33, 60], [16, 58]]],
                    ['person1-3', [[123, 604, 33, 64], [16, 62]]],
                    ['person1-4', [[174, 599, 33, 71], [16, 69]]],
                    ['person1-5', [[237, 595, 35, 75], [17, 73]]],
                    ['person1-6', [[295, 591, 44, 78], [17, 76]]],
                    ['person1-7', [[352, 591, 45, 80], [17, 78]]],
                    ['person1-8', [[416, 592, 39, 79], [14, 77]]],
                    ['person1-9', [[481, 592, 34, 79], [12, 77]]],
                    ['person1-10', [[535, 593, 31, 78], [10, 76]]],
                ],
                [
                    ['person1-1', 100], ['person1-2', 1000], ['person1-3', 100],
                    ['person1-4', 100], ['person1-5', 100], ['person1-6', 100],
                    ['person1-7', 100], ['person1-8', 100], ['person1-9', 100],
                    ['person1-10', 100],
                ],
            );

             this.waterSpill = new BackgroundAnimation(
                this.image,
                [
                    ['water-spill-0', [[939, 171, 76, 80], [38, 78]]],
                   ['water-spill-1', [[43, 47, 72, 21], [36, 19]]],
                    ['water-spill-2', [[149, 40, 84, 24], [42, 22]]],
                    ['water-spill-3', [[258, 38, 87, 26], [43.5, 24]]],
                    ['water-spill-4', [[380, 38, 96, 30], [48, 28]]],
                    ['water-spill-5', [[503, 31, 102, 27], [51, 25]]],
                    ['water-spill-6', [[636, 30, 101, 28], [50.5, 26]]],
                    ['water-spill-7', [[772, 27, 66, 21], [33, 19]]],
                    ['water-spill-8', [[877, 21, 75, 25], [37.5, 23]]],
                    ['water-spill-9', [[43, 99, 69, 27], [34.5, 25]]],
                    ['water-spill-10', [[157, 97, 76, 29], [38, 27]]],
                    ['water-spill-11', [[277, 99, 68, 29], [34, 27]]],
                ],
                [
                    ['water-spill-0', 100],['water-spill-0', 1400],['water-spill-1', 50], ['water-spill-2', 50], ['water-spill-3', 50],
                    ['water-spill-4', 50], ['water-spill-5', 50], ['water-spill-6', 50],
                    ['water-spill-7', 50], ['water-spill-8', 50], 
                    
                ],
            );

            this.waterSplash = new BackgroundAnimation(
                this.image,
                [
                    ['water-splash-0', [[939, 171, 76, 80], [38, 78]]],
                   ['water-splash-1', [[414, 124, 20, 29], [10, 27]]],
                    ['water-splash-2', [[487, 105, 29, 46], [14.5, 44]]],
                    ['water-splash-3', [[561, 95, 39, 50], [19.5, 48]]],
                    ['water-splash-4', [[631, 91, 43, 51], [21.5, 49]]],
                    ['water-splash-5', [[706, 89, 53, 53], [26.5, 51]]],
                    ['water-splash-6', [[794, 83, 60, 54], [30, 52]]],
                    ['water-splash-7', [[879, 83, 70, 55], [35, 53]]],
                    ['water-splash-8', [[830, 153, 76, 62], [38, 60]]],
                    
                ],
                [
                    ['water-splash-0', 900],['water-splash-1', 125], ['water-splash-2', 125], ['water-splash-3', 125],
                    ['water-splash-4', 125], ['water-splash-5', 125], ['water-splash-6', 125],
                    ['water-splash-7', 125], ['water-splash-8', 125],
                ],
            );

        
    }

    
  
    update(time){
        if(gameState.pause) return;
         this.stage.update(time);
         this.person1.update(time);
         this.waterSpill.update(time);
         this.waterSplash.update(time);
    
    }

     drawFrame(context, frameKey, x, y, direction, alpha){
       drawFrame(context, this.image, this.frames.get(frameKey), x, y, direction, alpha);       
    }

 

    drawBackground(context, camera){
       // this.drawFrame(context, 'stage-background', Math.floor(-20 - (camera.position.x/ 2.157303)), -70 -camera.position.y);
        
        this.stage.draw(context, Math.floor(80 - (camera.position.x/ 2.157303)), -70 -camera.position.y);
         this.waterSpill.drawWithOrigin(context, Math.floor(395 - (camera.position.x/ 2.157303)), 140 -camera.position.y, -1, 0.8);
        this.person1.drawWithOrigin(context, Math.floor(290 - (camera.position.x/ 2.157303)), 120 -camera.position.y, 1, 0.8);
         this.person1.drawWithOrigin(context, Math.floor(450 - (camera.position.x/ 2.157303)), 180 -camera.position.y, -1, 0.8);
        
         this.waterSplash.drawWithOrigin(context, Math.floor(340 - (camera.position.x/ 2.157303)), 100 -camera.position.y, 1, 0.8);
    }

    drawForeground(context, camera){
   
    }
}