import { TIME_DELAY, TIME_FLASH_DELAY, TIME_FRAME_KEYS } from "../constants/battle.js";
import { BattleScene } from "../scenes/Battlescene.js";
import { playSound } from "../soundHandler.js";
import { gameState } from "../state/gameState.js";
import { JSGame } from "../game.js";
import { SceneBackgroundAnimation } from "./stage/shared/SceneBackgroundAnimation.js";

const IJIWALK_FRAME_DELAY = 180; 


export class IntroBG {
    constructor(){
        this.image = document.querySelector('img[alt="intro"]');
    }
    update(){
        
    }
    draw(context){
        context.drawImage(this.image, 0, 0);
    }
}

export class IntroScreen {
    constructor(game, fighters){
        this.game = game; 
        this.image = document.querySelector('img[alt="misc"]');
        this.soundStart = document.querySelector('audio#game-start2');
        this.musicIntro = document.querySelector('audio#music-intro');
        this.introDone = false;
        this.alphaSet = 0;
        this.blink = -1;

        //Scenes
        this.ijiWalkingX = 0;
        this.handLevitateAnim = true;
        this.handLevitateAnimNum = 30;
        this.frameMovieEnable = true;
        this.tankTimer = 0;
             this.devilHand = new SceneBackgroundAnimation(
                    this.image,
                            [
                                ['hand1', [1236, 1379, 232, 121]],
                                ['hand2', [1243, 1532, 225, 133]],
                                ['hand3', [1242, 1682, 225, 141]],
                                ['hand4', [1242, 1832, 203, 152]],
                                ['hand5', [1245, 1989, 174, 181]],
                    
                            ],
                            [['hand1', 1300], ['hand2', 100],  ['hand3', 120],['hand4', 100],['hand5', 9000]],
                        );
         this.tankContainer = new SceneBackgroundAnimation(
                    this.image,
                            [
                                ['tank', [1217, 696, 186, 203]],
                    
                            ],
                            [['tank', 200]],
                        );
                        this.frameMovie = new SceneBackgroundAnimation(
                    this.image,
                            [
                                ['movie', [1113, 232, 385, 239]],
                    
                            ],
                            [['movie', 200]],
                        );
         this.oxygenBubble = new SceneBackgroundAnimation(
                    this.image,
                            [
                                ['oxygen', [1221, 1166, 192, 182]],
                    
                            ],
                            [['oxygen', 200]],
                        );
                this.greenWater = new SceneBackgroundAnimation(
                    this.image,
                            [
                                ['greenwater', [765, 1150, 384, 224]],
                    
                            ],
                            [['greenwater', 200]],
                        );
                this.brickWall = new SceneBackgroundAnimation(
                    this.image,
                            [
                                ['brickwall', [470, 477, 384, 167]],
                    
                            ],
                            [['brickwall', 200]],
                        );

                        this.brickWall2 = new SceneBackgroundAnimation(
                    this.image,
                            [
                                ['brickwall2', [854, 477, 384, 167]],
                    
                            ],
                            [['brickwall2', 200]],
                        );
        
                this.ijiWalking = new SceneBackgroundAnimation(
                            this.image,
                            [
                                ['ijiwalking-2', [722, 46, 75, 180]],
                    ['ijiwalking-3', [843, 48, 75, 167]],
                    ['ijiwalking-4', [961, 48, 78, 168]],
                    ['ijiwalking-5', [1083, 49, 78, 168]],
                    ['ijiwalking-6', [1224, 49, 78, 168]],
                     ['ijiwalking-9', [843, 48, 75, 167]],
                    ['ijiwalking-8', [961, 48, 78, 168]],
                 
                    ['ijiwalking-7', [598, 280, 78, 168]],
                            ],
                            [['ijiwalking-2', 200], ['ijiwalking-3', 200],['ijiwalking-4', 200],['ijiwalking-5', 200], ['ijiwalking-6', 200], ['ijiwalking-7', 200], ['ijiwalking-8', 200], ['ijiwalking-9', 200]],
                        );
        
                    //End scenes

        this.blinkTimer = 0;
        this.sceneTimer = 0;
        this.stopwatch = 0;
        this.startSound = true;
        this.time = 60;
        this.timeDraw = false;
        this.insertCoin = false;
        this.timeTimer = 0;
        this.fighters = fighters;
        this.timeFlashTimer = 0;
        this.useFlashFrames = false;

        this.frames = new Map([
            ['kapecom', [359,163,127,35]],
            ['push-start', [369,8,110,14]],
            ['insert-coin', [375,207,95,9]],
            ['title-screen', [16, 231, 384, 224]],
                       
            [`${TIME_FRAME_KEYS[0]}-0`, [16,32,14,16]],
            [`${TIME_FRAME_KEYS[0]}-1`, [32,32,14,16]],
            [`${TIME_FRAME_KEYS[0]}-2`, [48,32,14,16]],
            [`${TIME_FRAME_KEYS[0]}-3`, [64,32,14,16]],
            [`${TIME_FRAME_KEYS[0]}-4`, [80,32,14,16]],
            [`${TIME_FRAME_KEYS[0]}-5`, [96,32,14,16]],
            [`${TIME_FRAME_KEYS[0]}-6`, [112,32,14,16]],
            [`${TIME_FRAME_KEYS[0]}-7`, [128,32,14,16]],
            [`${TIME_FRAME_KEYS[0]}-8`, [144,32,14,16]],
            [`${TIME_FRAME_KEYS[0]}-9`, [160,32,14,16]],


            [`${TIME_FRAME_KEYS[0]}-0`, [16,192,10,12]],
            [`${TIME_FRAME_KEYS[0]}-1`, [32,192,10,12]],
            [`${TIME_FRAME_KEYS[0]}-2`, [48,192,10,12]],
            [`${TIME_FRAME_KEYS[0]}-3`, [64,192,10,12]],
            [`${TIME_FRAME_KEYS[0]}-4`, [80,192,10,12]],
            [`${TIME_FRAME_KEYS[0]}-5`, [96,192,10,12]],
            [`${TIME_FRAME_KEYS[0]}-6`, [112,192,10,12]],
            [`${TIME_FRAME_KEYS[0]}-7`, [128,192,10,12]],
            [`${TIME_FRAME_KEYS[0]}-8`, [144,192,10,12]],
            [`${TIME_FRAME_KEYS[0]}-9`, [160,192,10,12]],

            //Numerics
            ['score-0', [17,101, 10, 10]],
            ['score-3', [53,101, 10, 10]],
            ['score-4', [65,101, 10, 10]],
            ['score-5', [77,101, 10, 10]],
            ['score-6', [89,101, 10, 10]],
            ['score-7', [101,101, 10, 10]],
            ['score-8', [113,101, 10, 10]],
            ['score-9', [125,101, 10, 10]],

            //Score
            ['score-1', [29,101, 10, 10]],
            ['score-2', [41,101, 10, 10]],

            //Alphabet
            ['score-A', [29,113, 10, 10]],
            ['score-B', [41,113, 10, 10]],
            ['score-C', [53,113, 10, 10]],
            ['score-D', [65,113, 10, 10]],
            ['score-E', [77,113, 10, 10]],
            ['score-F', [89,113, 10, 10]],
            ['score-G', [101,113, 10, 10]],
            ['score-H', [113,113, 10, 10]],
            ['score-I', [125,113, 9, 10]],
            ['score-J', [136,113, 10, 10]],
            ['score-K', [149,113, 10, 10]],
            ['score-L', [161,113, 10, 10]],
            ['score-M', [173,113, 10, 10]],
            ['score-N', [185,113, 10, 10]],
            ['score-O', [197,113, 10, 10]],
            ['score-P', [17,125, 10, 10]],
            ['score-Q', [29,125, 10, 10]],
            ['score-R', [41,125, 10, 10]],
            ['score-S', [53,125, 10, 10]],
            ['score-T', [65,125, 10, 10]],
            ['score-U', [77,125, 10, 10]],
            ['score-V', [89,125, 10, 10]],
            ['score-W', [101,125, 10, 10]],
            ['score-X', [113,125, 10, 10]],
            ['score-Y', [125,125, 10, 10]],
            ['score-Z', [136,125, 10, 10]],
            ['score-@', [17,113, 10, 10]], 
            ['score-.', [172,87, 10, 10]], 
            ['score- ', [105,54, 18, 12]], 

            //Intro Scenes
          
            ['ijiwalking-2', [722, 46, 75, 180]],
            ['ijiwalking-3', [843, 48, 75, 167]],
            ['ijiwalking-4', [961, 48, 78, 168]],
            ['ijiwalking-5', [1083, 49, 78, 168]],
            ['ijiwalking-6', [1224, 49, 78, 168]],
             ['ijiwalking-9', [843, 48, 75, 167]],
            ['ijiwalking-8', [961, 48, 78, 168]],
         
            ['ijiwalking-7', [598, 280, 78, 168]],

            ['brickwall', [470, 477, 384, 167]],
           


            //Character Names
            ['tag-malupiton', [15,56,83,9]],
            ['tag-ryu', [16,56,28,9]],
        ]);
        
    }

    drawFrame(context, frameKey, x, y, direction = 1, scale = 1, alpha = 1) {
    const [sourceX, sourceY, sourceWidth, sourceHeight] = this.frames.get(frameKey);

    context.save();
    context.globalAlpha = alpha;

    // Translate to drawing position, then scale
    context.translate(x, y);
    context.scale(direction * scale, scale); // scale x and y

    // Since we already translated, draw at (0, 0) relative to transform
    context.drawImage(
        this.image,
        sourceX, sourceY, sourceWidth, sourceHeight,
        0, 0, sourceWidth, sourceHeight
    );

    context.restore();
}


    updateTime(time){
         this.blinkTimer += (1 * 60) * time.secondsPassed;
         
        if(time.previous > this.timeTimer + TIME_DELAY){
            this.time -=1;
            this.timeTimer = time.previous;
            this.stopwatch += 1;
            
            if (this.alphaSet <= 0.1) {
                this.alphaSet = 0

            }else if (this.alphaSet >= 1){
                this.alphaSet = 1;
            };
           // console.log(this.alphaSet);
            //console.log(this.stopwatch);
        }

        if(
            this.time < 15 && this.time > -1 
            && time.previous > this.timeFlashTimer + TIME_FLASH_DELAY
        ) {
             
           // this.useFlashFrames = !this.useFlashFrames;
            this.timeFlashTimer = time.previous;
        }
    }

    updateScreenScene(){
        //Present Title intro
         if (this.stopwatch === 3){
            this.alphaSet += .05;
            this.kapecomPresent = true;
        }
        if (this.stopwatch === 3 && this.startSound){
               playSound(this.soundStart, 1);
                this.startSound = false;
            }
            if(this.stopwatch === 6)this.startSound = true;
            if (this.stopwatch === 7 && this.startSound){
               playSound(this.musicIntro, 0.6);
                this.startSound = false;
            }
        if (this.stopwatch === 7){
            this.alphaSet -= .05;
            if (this.alphaSet <= 0.10){
                this.kapecomPresent = false;
                
            }
        }
        //Present GameStart and remove kapecom title
         if (this.stopwatch === 8){
            this.kapecomPresent = false;
            this.insertCoin = true;
            
            
        }
        if (this.stopwatch === 35){
            this.gameStart = true;
             this.kapecomPresent = false;
            this.insertCoin = true;
        }

        if(this.blinkTimer >= 15){
            this.blink *= -1;
            this.blinkTimer = 0;
        }
        if(this.stopwatch === 38){
            this.timeDraw = true;
        }

    }
updateScenes(time){
    if (this.insertCoin === true){
        
        this.ijiWalking.update(time);
        this.sceneTimer += (1 * 60) * time.secondsPassed;
        if(this.sceneTimer >= 690) this.ijiWalkingX -= (3 * 60) * time.secondsPassed;
        if(this.sceneTimer >= 850)this.devilHand.update(time);
    }
}
    update(time){
        this.updateTime(time);
        this.updateScreenScene();
        this.updateScenes(time);
    }


    drawTextLabel(context, label, x, y, direction, scale){
        for (const index in label) {
            this.drawFrame(context, `score-${label.charAt(index)}`, x + index * 9, y, direction, scale);
        }
    }

     drawTexts(context){
           // this.drawTextLabel(context, '@KAPECOM..LTD2025', 90,190, 1, 0.7);
            this.drawTextLabel(context, '@ISTRITPAYTER..BY..IJI', 90,190, 1, 0.7);
            this.drawTextLabel(context, '@ANDREIBARDOQUILLO..LTD2025', 70,210, 1, 0.7);
            
        }

  drawScreenTitle(context){
    this.drawFrame(context, 'title-screen', 0, 0);
     
  }

   drawKapeComTitle(context){
     const alpha = this.alphaSet;
    this.drawFrame(context, 'kapecom', 133, 102, 1, 1, alpha);

  }

  drawInsertCoin(context){
        // this.drawFrame(context, 'insert-coin', 147, 145);
         this.drawFrame(context, 'push-start', 150, 165, 0.9,0.9);
  }
    
    drawTime(context){
 const timeString = String(Math.max(this.time, 0)).padStart(2,'00');
 const flashFrame = TIME_FRAME_KEYS[Number(this.useFlashFrames)];


        this.drawFrame(context, `${flashFrame}-${timeString.charAt(0)}`, 178, 123);
        this.drawFrame(context, `${flashFrame}-${timeString.charAt(1)}`, 194, 123);
    }

    drawCredits(context){
        this.drawTextLabel(context, 'CREDITS' + ' ' + `${gameState.credits}`, 270,10, 1, 0.7);
    }

     drawScenes(context, time){
        this.brickWall.draw(context, this.sceneTimer*2, 30);
        this.brickWall2.draw(context, this.sceneTimer*2-384, 30);
        this.brickWall.draw(context, this.sceneTimer*2-762, 30);
        this.brickWall2.draw(context, this.sceneTimer*2-1024, 30);
        this.ijiWalking.draw(context,  270 + this.ijiWalkingX, 30);
        if(this.handLevitateAnim) this.handLevitateAnimNum += (0.3 * 60) * time.secondsPassed;
        if(!this.handLevitateAnim) this.handLevitateAnimNum -= (0.3 * 60) * time.secondsPassed;
        if(this.handLevitateAnimNum >= 50 || this.handLevitateAnimNum <= 30) this.handLevitateAnim = !this.handLevitateAnim;
        
        
        if(this.sceneTimer >=200 && this.sceneTimer <= 340+100){
            if(this.sceneTimer >=200 && this.sceneTimer <= 250+100)this.tankTimer += (1 * 60) * time.secondsPassed;
            if (this.sceneTimer>=300+100 && this.sceneTimer <= 305+100)this.tankTimer = 40;
            if(this.sceneTimer >=310+100 && this.sceneTimer <= 330+100)this.tankTimer -= (1 * 60) * time.secondsPassed;

             this.greenWater.draw(context, 0, 0, 1, 1, Math.min(this.tankTimer*0.020, 1));
             if(this.sceneTimer >=230) {
              //  this.tankContainer.draw(context, 100, 10,1,1, Math.min(this.tankTimer*0.0025, 0.5));
              this.devilHand.draw(context,  100, this.handLevitateAnimNum, 1, 1, Math.min(this.tankTimer*0.004, 1));
             }
             
        this.oxygenBubble.draw(context, 100, 570 - this.sceneTimer*3,1,1,Math.min(this.tankTimer*0.020, 1));
         this.oxygenBubble.draw(context, 100, 470 - this.sceneTimer*2,1,1,Math.min(this.tankTimer*0.020, 1));
         this.oxygenBubble.draw(context, 100, 1020 - this.sceneTimer*3,1,1,Math.min(this.tankTimer*0.020, 1));
        }
       
       if(this.frameMovieEnable) this.frameMovie.draw(context, 0,-10);
       if(this.sceneTimer >= 810 && this.sceneTimer <= 895) {
        this.frameMovieEnable = false;
        this.devilHand.draw(context,  100, 30, 1, 1,1);
       } 
        
    }

    draw(context, time){
        
         if (this.gameStart === true){
                 this.drawScreenTitle(context);
                 this.drawTexts(context);
                 
                
                 
            }
            if (this.timeDraw === true){
              //   this.drawTime(context);
            }
            
            if(this.insertCoin === true){
                gameState.kapeCom = true;
                 this.drawScenes(context, time);
                if(this.blink === 1){
                    this.drawInsertCoin(context);
                    
                }
            }
           // this.drawCredits(context);
            if(this.kapecomPresent === true){
                this.drawKapeComTitle(context);
            }
          
        }
}