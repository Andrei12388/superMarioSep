import { CharacterSelectScreen, CharSelBG } from '../entities/CharacterSelectScreen.js'; 
import { BattleScene } from './Battlescene.js';
import { TIME_DELAY, TIME_FLASH_DELAY, TIME_FRAME_KEYS } from "../constants/battle.js";

import * as control from '../inputHandler.js'; 
import { Control, controls } from '../constants/control.js';
import { state as controlHold } from '../index.js';
import { playSound, stopSound } from '../soundHandler.js';
import { gameState } from '../state/gameState.js';
import { createDefaultFighterState } from '../state/fighterState.js';
import { PrePostMatch } from './PrePostMatch.js';



export class CharacterSelect {
    entities = [];

    cols = 5;
    boxSize = 50;
    padding = 1.5;

    characterss = [
        { name: "Unknown1", color: "gray", imageSml: 'unknownSmall', imageBig: 'unknownBig' },
        { name: "Unknown2", color: "gray",  imageSml: 'unknownSmall', imageBig: 'unknownBig' },
        { name: "Unknown3", color: "gray",  imageSml: 'unknownSmall', imageBig: 'unknownBig' },
        { name: "Unknown4", color: "gray",  imageSml: 'unknownSmall', imageBig: 'unknownBig' },
        { name: "Unknown5", color: "gray",  imageSml: 'unknownSmall', imageBig: 'unknownBig' },
        { name: "Unknown6", color: "gray",  imageSml: 'unknownSmall', imageBig: 'unknownBig' },
        { name: "Unknown7", color: "gray",  imageSml: 'unknownSmall', imageBig: 'unknownBig' },
        { name: "Unknown8", color: "gray",  imageSml: 'unknownSmall', imageBig: 'unknownBig' },
        { name: "Unknown9", color: "gray",  imageSml: 'unknownSmall', imageBig: 'unknownBig' },
        { name: "Unknown10", color: "gray",  imageSml: 'unknownSmall', imageBig: 'unknownBig' },
    ];

    characters = [
        { name: "Malupiton", color: "gray", imageSml: 'malupitonSmall', imageBig: 'malupitonBig', namePos: 5, sayings: 'Sabi ko naman sayo burger ka saken',voice: 'voice-malupiton', },
        { name: "Baby Giant", color: "gray",  imageSml: 'babygiantSmall', imageBig: 'babygiantBig', namePos: 5, sayings: 'None',voice: 'voice-babygiant',},
        { name: "Unknown1", color: "gray", imageSml: 'unknownSmall?', imageBig: 'unknownBig', namePos: 5, sayings: 'None',voice: 'voice-dambi', },
        { name: "Otlum", color: "gray", imageSml: 'otlumSmall', imageBig: 'otlumBig', namePos: 20, sayings: 'None',voice: 'voice-otlum', },
        { name: "Golem", color: "gray", imageSml: 'golemSmall', imageBig: 'golemBig', namePos: 20, sayings: 'Dimo ko kaya itaob men',voice: 'voice-golem', },
        { name: "Lamok", color: "gray",  imageSml: 'lamokSmall', imageBig: 'lamokBig', namePos: 20, sayings: 'None',voice: 'voice-lamok', },
        { name: "Pinunong Puds", color: "gray",  imageSml: 'pinunoSmall', imageBig: 'pinunoBig', namePos: 5, sayings: 'None',voice: 'voice-pinunongpuds', },
        { name: "Mama Oni", color: "gray",  imageSml: 'toniSmall', imageBig: 'toniBig', namePos: 20, sayings: 'None',voice: 'voice-mamaoni', },
        { name: "Daddy Tyga", color: "gray",  imageSml: 'tygaSmall', imageBig: 'tygaBig', namePos: 20, sayings: 'None',voice: 'voice-daddytyga', },
        { name: "Nabunturan", color: "gray",  imageSml: 'nabunturanSmall', imageBig: 'nabunturanBig', namePos: 5 , sayings: 'None',voice: 'voice-nabunturan',},
    ];

    stage = [
        { name: 'PASAY', pointerX: 130, pointerY: 25, voice: 'voice-pasay' },
        { name: 'LITEX', pointerX: 150, pointerY: 35, voice: 'voice-litex' },
        { name: 'BOHOL', pointerX: 210, pointerY: 38, voice: 'voice-bohol' },
        { name: 'TONDO', pointerX: 145, pointerY: 57, voice: 'voice-tondo' },
        { name: 'FINAL', pointerX: 310, pointerY: 39, voice: 'voice-final' },
    ];

    cursorIndices = [0, 4]; // P1 and P2 starting positions
    selectedCharacters = [null, null];

    constructor(game) {
        this.image = document.querySelector('img[alt="misc"]');
        this.musicCharSelect = document.querySelector('audio#music-character-select');
        this.soundChoose = document.querySelector('audio#sound-choose');
        this.soundSelect = document.querySelector('audio#sound-select');
        this.soundChooseFighter = document.querySelector('audio#choose-fighter');
        this.voiceCharacterSelected = null;
        this.voiceStageSelected = null;
        this.game = game;
        this.indexImg = 0;
        this.flashAlpha = 0;
        this.screenTimer = 0;
        this.blinkTime = 0;
        this.p1Select = false;
        this.p2Select = false;
        this.blinkSelect = false;
        this.screenTimerMax = 30;
        this.stageAnim = false;
        gameState.characterSelectMode = true;
        this.stageSelect = false;
        this.stageIndexs = 1;
        this.selectStagePrev = true;
        this.selectStageNext = true;
        this.stageDropY = -100;
        this.pointerTimer = 0;
        this.stageSelectEnable = false;

        gameState.gameScene = 'prematch';

        playSound(this.musicCharSelect, 0.7);

        this.screenanim = 
            {
                x: 0, y: -100, trigger: true, speed: 5,
            };
        this.screenanim2 = 
            {
                x: 0, y: 0, trigger: false, speed: 7,
            };
         
        this.imageBigP = [
            this.characters[this.cursorIndices[0]].imageBig,
            this.characters[this.cursorIndices[1]].imageBig
           ];

        this.selectEnable = [
            false,
            false,
           ];
       
         this.frames = new Map([
                    ['kapecom', [359,163,127,35]],
                    ['push-start', [369,8,110,14]],
                    ['insert-coin', [375,207,95,9]],
                    ['player-select', [353,88,126,14]],
                    ['char-screen', [16, 456, 384, 224]],
                    ['p1box', [230, 932, 60, 60]],
                    ['p1boxEmpty', [297, 932, 60, 60]],
                    ['p2box', [432, 932, 60, 60]],
                    ['p2boxEmpty', [367, 932, 60, 60]],
                    ['p1Text', [251, 897, 27, 14]],
                    ['p2Text', [283, 897, 27, 14]],

                    //Char Select Small imgs
                    ['unknownSmall', [220, 684, 50, 50]],
                    ['unknownSmall?', [526, 684, 50, 50]],
                    ['malupitonSmall', [16, 684, 50, 50]],
                    ['babygiantSmall', [67, 684, 50, 50]],
                    ['otlumSmall', [118, 684, 50, 50]],
                    ['golemSmall', [169, 684, 50, 50]],
                    ['lamokSmall', [271, 684, 50, 50]],
                    ['pinunoSmall', [322, 684, 50, 50]],
                    ['toniSmall', [373, 684, 50, 50]],
                    ['tygaSmall', [424, 684, 50, 50]],
                    ['nabunturanSmall', [475, 684, 50, 50]],

                    //Char Select Big imgs
                    ['unknownBig', [16, 739, 100, 100]],
                    ['malupitonBig', [117, 739, 100, 100]],
                    ['babygiantBig', [218, 739, 96, 100]],
                    ['otlumBig', [313, 739, 100, 100]],
                    ['golemBig', [17, 841, 100, 100]],
                    ['lamokBig', [116, 841, 100, 100]],
                    ['pinunoBig', [412, 736, 100, 103]],
                    ['toniBig', [514, 739, 100, 100]],
                    ['tygaBig', [615, 739, 100, 100]],
                    ['nabunturanBig', [516, 856, 100, 100]],

                    //Stage Images
                    ['stage-pointer', [31, 1066, 20, 23]],
                    ['LITEX', [23, 952, 183, 98]],
                    ['PASAY', [65, 1061, 183, 98]],
                    ['BOHOL', [250, 1061, 183, 98]],
                    ['TONDO', [250, 1167, 183, 98]],
                    ['FINAL', [439, 1061, 183, 98]],
                     

                               
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
                    ['score- ', [105,54, 18, 12]], 
        
                    //Character Names
                    ['tag-malupiton', [15,56,83,9]],
                 ]);
        this.characterSelectScreen = new CharacterSelectScreen(this.game, this.characters);
        this.entities = [new CharSelBG(), this.characterSelectScreen];
    }

    updateEntities(time, context) {
        for (const entity of this.entities) {
            entity.update(time, context, this.camera);
        }
    }

    handleFlash(){
        this.screenFlashTrigger = true;
        this.flashScreen = true
        this.flash = true;
    }

    handleInput(playerId) {
        const total = this.characters.length;
        const cols = this.cols;
        let index = this.cursorIndices[playerId];
        

        

        // Movement
        if (control.isControlPressed(playerId, Control.UP) && this.selectEnable[playerId] === true && controlHold.tapped === true && gameState.buttonHold){
            if (index - cols >= 0) index -= cols;
             this.imageBigP[playerId] = this.characters[index].imageBig;
            
             controlHold.tapped = false;
             playSound(this.soundChoose, 0.6);
             gameState.buttonHold = false;
            
        }

        if (control.isControlPressed(playerId, Control.DOWN)&& this.selectEnable[playerId] === true && controlHold.tapped === true && gameState.buttonHold) {
            if (index + cols < total) index += cols;
             this.imageBigP[playerId] = this.characters[index].imageBig;
             
             controlHold.tapped = false;
             playSound(this.soundChoose, 0.6);
             gameState.buttonHold = false;
            
        }

        if (control.isControlPressed(playerId, Control.LEFT) && controlHold.tapped === true && gameState.buttonHold) {
           if(this.selectEnable[playerId] === true){
                if (index % cols !== 0) index -= 1;
             this.imageBigP[playerId] = this.characters[index].imageBig;
             gameState.buttonHold = false;
             controlHold.tapped = false;
             playSound(this.soundChoose, 0.6);
           }
            

             if (this.stageSelect) {
                
             if(this.selectStagePrev){
                this.stageIndexs -= 1;
                this.selectStageNext = true;
             } 
             if(this.stageIndexs === 0) this.selectStagePrev = false;

             playSound(this.soundChoose, 0.6);
            controlHold.tapped = false;
            gameState.buttonHold = false;
            
            
        }
            
        }

        if (control.isControlPressed(playerId, Control.RIGHT) && controlHold.tapped === true && gameState.buttonHold) {
            if(this.selectEnable[playerId] === true){
                if ((index + 1) % cols !== 0 && index + 1 < total) index += 1;
            this.imageBigP[playerId] = this.characters[index].imageBig;
            
             controlHold.tapped = false;
             playSound(this.soundChoose, 1);
             gameState.buttonHold = false;
            }
            

             if (this.stageSelect) {
             if(this.selectStageNext){
                this.stageIndexs += 1;
                this.selectStagePrev = true;
             }
             if(this.stageIndexs === this.stage.length-1) this.selectStageNext = false;
             playSound(this.soundChoose, 0.6);
            controlHold.tapped = false;
            gameState.buttonHold = false;
        }
             
        }

        this.cursorIndices[playerId] = index;

        // Confirm selection
        if (control.isControlPressed(playerId, Control.LIGHT_PUNCH)) {
            if(this.selectEnable[playerId]){
                const selectedChar = this.characters[index];
                this.selectEnable[playerId] = false;
                
             
             playSound(this.soundSelect, 1);
             this.voiceCharacterSelected = document.querySelector(`audio#${selectedChar.voice}`);
                playSound(this.voiceCharacterSelected, 1);
            this.selectCharacter(playerId, selectedChar);
            }
              if (this.stageSelect && this.stageSelectEnable) {
                
                gameState.stage = this.stage[this.stageIndexs].name.toLowerCase();
                this.voiceStageSelected = document.querySelector(`audio#${this.stage[this.stageIndexs].voice}`);
                playSound(this.voiceStageSelected, 1);
                console.log(gameState.stage);
                playSound(this.soundSelect, 1);
                stopSound(this.musicCharSelect);
                this.game.setScene(new PrePostMatch(this.game, this.selectedCharacters));
              }
          
        }
    }

    selectCharacter(playerId, character) {
        if (!this.selectedCharacters[playerId]) {
            this.selectedCharacters[playerId] = character;
            this.characterSelectScreen.selectCharacter?.(playerId, character); // Optional hook
            console.log(`Player ${playerId + 1} selected ${character.name}`);
        }

        if (this.selectedCharacters[0] && this.selectedCharacters[1]) {
            console.log("Both players selected. Transitioning to Select Stage.");
            console.log(this.selectedCharacters);
            gameState.fighters = [createDefaultFighterState(this.selectedCharacters[0].name),createDefaultFighterState(this.selectedCharacters[1].name)];
             this.stageAnim = true;
             this.stageSelect = true;
           // stopSound(this.musicCharSelect);
         //  this.game.setScene(new BattleScene(this.game, this.selectedCharacters));
        }
    }

    updateImports(){
        control.pressedKeys.clear();
    }

    startTimer(time){
   
    if (this.screenFlashTrigger === true ){
        this.flashScreen = true;
        this.screenTimer = Math.min(this.screenTimer + (1 * 60) * time.secondsPassed, this.screenTimerMax);
         if(this.screenTimer >= this.screenTimerMax){
            this.flashAlpha = 1;
            this.flash = false;
            this.screenFlashTrigger = false;
            this.soundChooseFighter.play();
          
           }
    }
    if (this.screenFlashTrigger === false ) {
        this.screenTimer = Math.max(this.screenTimer - (1 * 60) * time.secondsPassed, 0);
        if(this.screenTimer <= 0){
            this.flash = false;
            this.screenFlashTrigger = false;
            this.flashScreen = false;
            this.selectEnable[0] = true;
            this.selectEnable[1] = true;
            this.flashAlpha = 1;
            
          
           }
    }

    }

    screenAnimation(time){
       
       // console.log(this.screenTimer);
     //   console.log(this.flashAlpha);

        if(this.screenanim.trigger === true){
            this.screenanim.y += (this.screenanim.speed * 60) * time.secondsPassed;
         if(this.screenanim.y >= 120){
            this.flashScreen = true;
             this.screenanim.trigger = false;
             this.flash = true;
             this.screenFlashTrigger = true;
             this.screenanim2.trigger = true;
        }
        }
        if(this.stageAnim === true){
            this.screenanim.x = Math.min(this.screenanim.x + (4 * 60) * time.secondsPassed,350);
            this.screenanim2.x = Math.max(this.screenanim2.x - (5 * 60) * time.secondsPassed, -400);
            if(this.stageSelect && this.stageDropY <= 110)this.stageDropY += (3 * 60) * time.secondsPassed;
            this.pointerTimer += (1 * 60) * time.secondsPassed;
            if(this.stageDropY >= 110) this.stageSelectEnable = true;;
            if (this.pointerTimer >= 10) this.pointerTimer = 0;
            
        }
        
        }
      

    update(time, context) {
       // control.pollGamepads();
        this.blinkTime += (1 * 60) * time.secondsPassed;
        this.handleInput(0);
        this.handleInput(1);
        
        this.updateEntities(time, context);
        this.updateImports();
        this.screenAnimation(time);
        if(this.flashScreen)this.startTimer(time);

        
    }

    drawEntities(context, time) {
        for (const entity of this.entities) {
            entity.draw(context, time, this.camera);
        }
    }
    
drawCharacterGrid(context) {
    const gridOffsetX = this.screenanim.x + 60; 
    const gridOffsetY = this.screenanim.y; 

    let p1Pos = null;
    let p2Pos = null;

    this.characters.forEach((char, index) => {
        const col = index % this.cols;
        const row = Math.floor(index / this.cols);
        const x = gridOffsetX + col * (this.boxSize + this.padding);
        const y = gridOffsetY + row * (this.boxSize + this.padding);

        // Background
        context.fillStyle = char.color;
        context.fillRect(x, y, this.boxSize, this.boxSize);

        // Character image
        this.drawFrame(context, char.imageSml, x, y);

        // Overlay if selected
        if (this.selectedCharacters[0]?.name === char.name){
                context.fillStyle = "rgba(0, 0, 0, 0.7)";
                context.fillRect(x, y, this.boxSize, this.boxSize);
                //this.drawFrame(context, 'p1Text', x + 13, y + 30);
                this.p1Select = true;
              
            }  if (this.selectedCharacters[1]?.name === char.name) {
             context.fillStyle = "rgba(0, 0, 0, 0.7)";
                context.fillRect(x, y, this.boxSize, this.boxSize);
               // this.drawFrame(context, 'p2Text', x + 13, y + 30);
                this.p2Select = true;
                
           }


        // Save cursor positions for later
        if (index === this.cursorIndices[0]) {
            p1Pos = { x, y };
        }
        if (index === this.cursorIndices[1]) {
            p2Pos = { x, y };
        }
    });

   
    if (p1Pos) {
    if (this.blinkTime >= 5) {
        this.blinkSelect = !this.blinkSelect; 
        this.blinkTime = 0; 
    }
    if (this.blinkSelect && !this.p1Select) {
       this.drawFrame(context, 'p1boxEmpty', p1Pos.x - 5, p1Pos.y - 10);
    } else {
        
         this.drawFrame(context, 'p1box', p1Pos.x - 5, p1Pos.y - 10);
    }
}

    if (p2Pos) {
    if (this.blinkSelect && !this.p2Select) {
       this.drawFrame(context, 'p2boxEmpty', p2Pos.x - 5, p2Pos.y - 5);
    } else {
        
         this.drawFrame(context, 'p2box', p2Pos.x - 5, p2Pos.y - 5);
    }
}
}



drawBlankCharacterGrid(context) {
    const gridOffsetX = this.screenanim.x + 60; 
    const gridOffsetY = this.screenanim.y; 

    this.characterss.forEach((char, index) => {
        const col = index % this.cols;
        const row = Math.floor(index / this.cols);
        const x = gridOffsetX + col * (this.boxSize + this.padding);
        const y = gridOffsetY + row * (this.boxSize + this.padding);

       
        this.drawFrame(context, char.imageSml, x, y, 1, 1, 0.3);
    });
}

  drawFlash(context){
    if (this.flash === true){
    this.flashAlpha = Math.min(this.flashAlpha + 0.1, 1);
    context.globalAlpha = this.flashAlpha;
     context.fillStyle = "rgb(255, 255, 251)";
     context.fillRect(0, 0, 400, 400);
     console.log('flash enable');
    }
    if (this.flash === false){
        this.screenFlashTrigger = false;
        this.flashAlpha = Math.max(this.flashAlpha - 0.1, 0);
        context.globalAlpha = this.flashAlpha;
        context.fillStyle = "rgb(255, 255, 251)";
        context.fillRect(0, 0, 400, 400);
        console.log('flash out');
    }
    context.globalAlpha = 1;
    
}

drawTextLabel(context, label, x, y, direction, scale){
        for (const index in label) {
            this.drawFrame(context, `score-${label.charAt(index)}`, x + index * 9, y, direction, scale);
        }
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

drawStageSelect(context){
     const y = this.stageDropY;
     const stageIndex = this.stageIndexs;
     const stagePointerX = this.stage[stageIndex].pointerX;
     const stagePointerY = this.stage[stageIndex].pointerY;
     const pointerAnim = this.pointerTimer;

     //pointerX: 130, pointerY: 25

     this.drawFrame(context, `${this.stage[stageIndex].name}`, 100, y);
     this.drawTextLabel(context, `${this.stage[stageIndex].name}`, stagePointerX - 11, stagePointerY + 25, 1, 0.8);
     this.drawFrame(context, 'stage-pointer', stagePointerX, stagePointerY - pointerAnim);
}

drawScreen(context){
    this.drawFrame(context, 'player-select', 130, 5);
}
 drawCredits(context){
        this.drawTextLabel(context, 'CREDITS' + ' ' + `${gameState.credits}`, 270,10, 1, 0.7);
    }

drawImageBig(context){
        const x = this.screenanim2.x + 0;
        const y = this.screenanim2.y + 50;
        this.drawFrame(context,  this.imageBigP[0], x, y, 1);
        this.drawFrame(context,  this.imageBigP[1], x + 384, y, -1);
}

    draw(context, time) {
        this.drawEntities(context, time);
        
       
        this.drawBlankCharacterGrid(context);
        if(this.stageSelect)this.drawStageSelect(context);
        
         if(this.screenanim2.trigger === true){
        this.drawImageBig(context);
        this.drawCharacterGrid(context);
        this.drawScreen(context);
         }
         if(this.flashScreen)this.drawFlash(context);
         
         
        
       
    }
}



