import { TIME_DELAY, TIME_FLASH_DELAY, TIME_FRAME_KEYS } from "../constants/battle.js";
import { BattleScene } from "../scenes/Battlescene.js";
import { playSound } from "../soundHandler.js";
import { gameState } from "../state/gameState.js";
import { JSGame } from "../game.js";
import { SceneBackgroundAnimation } from "./stage/shared/SceneBackgroundAnimation.js";

const IJIWALK_FRAME_DELAY = 180; 


export class OptionsMenuIntroBG {
    constructor(){
        this.image = document.querySelector('img[alt="intro"]');
    }
    update(){
        
    }
    draw(context){
        context.drawImage(this.image, 0, 0);
    }
}

export class OptionsMenuScreen {
    constructor(game, fighters){
        this.game = game; 
        this.image = document.querySelector('img[alt="misc"]');
        this.soundStart = document.querySelector('audio#game-start2');
        this.musicIntro = document.querySelector('audio#music-intro');
        this.introDone = false;
        this.alphaSet = 0;
        this.blink = -1;
        this.gameStart = false;
        //Scenes
        this.ijiWalkingX = 0;
        this.handLevitateAnim = true;
        this.handLevitateAnimNum = 30;
        this.frameMovieEnable = true;
        this.tankTimer = 0;
             

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
        this.toggleOption = false;

        this.pointer = {
            x: 25,
            y: 33,
            cursor: 0,
        };

        this.frames = new Map([
            ['pointer', [498,7,26,18]],
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
           
            this.timeTimer = time.previous;
            this.stopwatch += 1;
            
            if (this.alphaSet <= 0.1) {
                this.alphaSet = 0

            }else if (this.alphaSet >= 1){
                this.alphaSet = 1;
            };
         
        }

        if(
            this.time < 15 && this.time > -1 
            && time.previous > this.timeFlashTimer + TIME_FLASH_DELAY
        ) {
             
           // this.useFlashFrames = !this.useFlashFrames;
            this.timeFlashTimer = time.previous;
        }
    }

    update(time){
        this.updateTime(time);
    }


    drawTextLabel(context, label, x, y, direction, scale){
        for (const index in label) {
            this.drawFrame(context, `score-${label.charAt(index)}`, x + index * 9, y, direction, scale);
        }
    }

     drawMenu(context){
           
            this.drawTextLabel(context, 'GAME OPTIONS', 150,10, 1, 0.7);
            this.drawTextLabel(context, 'DIFFICULTY', 55,35, 1, 0.7);
            this.drawTextLabel(context, 'SHADOW INVERT', 55,50, 1, 0.7);
            this.drawTextLabel(context, 'SKILL NUMBER', 55,65, 1, 0.7);
            this.drawTextLabel(context, 'SWITCH GAMEPAD TO P2', 55,80, 1, 0.7);
            this.drawTextLabel(context, 'FPS COUNTER', 55,95, 1, 0.7);
            this.drawTextLabel(context, 'EXIT', 55,110, 1, 0.7);
        }

         drawMenuSelections(context){
            //Difficulty 
            this.drawTextLabel(context, gameState.difficulty.toUpperCase(), 255,35, 1, 0.7);
            //Shadow Invert
            if(gameState.shadowInvert)this.drawTextLabel(context, 'ON', 255,50, 1, 0.7);
            else this.drawTextLabel(context, 'OFF', 255,50, 1, 0.7);
            //Skill Number
            const skillNum = String(gameState.skillNumber);
            this.drawTextLabel(context, skillNum, 255,65, 1, 0.7);
            if(gameState.gamepadSwitchPlayer)this.drawTextLabel(context, 'ON', 255,80, 1, 0.7);
            else this.drawTextLabel(context, 'OFF', 255,80, 1, 0.7);
            if(gameState.FpsCounterEnable)this.drawTextLabel(context, 'ON', 255,95, 1, 0.7);
            else this.drawTextLabel(context, 'OFF', 255,95, 1, 0.7);
         
        }

  drawScreenTitle(context){
    this.drawFrame(context, 'title-screen', 0, 0);
  }


  drawPointer(context){
    this.drawFrame(context, 'pointer', this.pointer.x,this.pointer.y);
  }

    draw(context){
       
        this.gameStart = true;
        
        this.drawMenu(context);
        this.drawMenuSelections(context);
        this.drawPointer(context);
    }
       
}