import { TIME_DELAY, TIME_FLASH_DELAY, TIME_FRAME_KEYS } from "../constants/battle.js";
import { enableScreenButtons, registerKeyboardEvents, registerScreenButtonEvents } from "../inputHandler.js";

export class CharSelBG {
    constructor(){
        this.image = document.querySelector('img[alt="intro"]');
    }
    update(){
        
    }
    draw(context){
        context.drawImage(this.image, 0, 0);
    }
}

export class CharacterSelectScreen {
    constructor(game, fighters){
        this.game = game; 
        this.image = document.querySelector('img[alt="misc"]');
        this.stopwatch = 0;
        this.time = 10;
        this.timeTimer = 0;
        this.fighters = fighters;
        this.timeFlashTimer = 0;
        this.useFlashFrames = false;

        this.frames = new Map([
            ['kapecom', [359,163,127,35]],
            ['push-start', [369,8,110,14]],
            ['insert-coin', [375,207,95,9]],
            ['char-screen', [16, 456, 384, 224]],
           
                       
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


            [`${TIME_FRAME_KEYS[0]}-0`, [16,192,14,16]],
            [`${TIME_FRAME_KEYS[0]}-1`, [32,192,14,16]],
            [`${TIME_FRAME_KEYS[0]}-2`, [48,192,14,16]],
            [`${TIME_FRAME_KEYS[0]}-3`, [64,192,14,16]],
            [`${TIME_FRAME_KEYS[0]}-4`, [80,192,14,16]],
            [`${TIME_FRAME_KEYS[0]}-5`, [96,192,14,16]],
            [`${TIME_FRAME_KEYS[0]}-6`, [112,192,14,16]],
            [`${TIME_FRAME_KEYS[0]}-7`, [128,192,14,16]],
            [`${TIME_FRAME_KEYS[0]}-8`, [144,192,14,16]],
            [`${TIME_FRAME_KEYS[0]}-9`, [160,192,14,16]],

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
         
        }

        if(
            this.time < 15 && this.time > -1 
            && time.previous > this.timeFlashTimer + TIME_FLASH_DELAY
        ) {
            

            this.timeFlashTimer = time.previous;
        }
        

    }


    update(time){
      //   registerKeyboardEvents();
      //  registerScreenButtonEvents();
      //  enableScreenButtons();
        this.updateTime(time);
    }

  drawScreenTitle(context){
    this.drawFrame(context, 'char-screen', 0, 0);
  }

    
    drawTime(context){
 const timeString = String(Math.max(this.time, 0)).padStart(2,'00');
 const flashFrame = TIME_FRAME_KEYS[Number(this.useFlashFrames)];


        this.drawFrame(context, `${flashFrame}-${timeString.charAt(0)}`, 178, 90);
        this.drawFrame(context, `${flashFrame}-${timeString.charAt(1)}`, 194, 90);
   
    }
    draw(context, time){
        this.drawScreenTitle(context);
       // this.drawTime(context);
}
}