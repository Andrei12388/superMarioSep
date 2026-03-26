import { CharacterSelectScreen, CharSelBG } from '../entities/CharacterSelectScreen.js'; 
import { BattleScene } from './Battlescene.js';
import { TIME_DELAY, TIME_FLASH_DELAY, TIME_FRAME_KEYS } from "../constants/battle.js";

import * as control from '../inputHandler.js'; 
import { unregisterKeyboardEvents, unregisterScreenButtonEvents } from '../inputHandler.js';
import { Control, controls } from '../constants/control.js';
import { state as controlHold } from '../index.js';
import { playSound, stopSound } from '../soundHandler.js';
import { gameState } from '../state/gameState.js';
import { createDefaultFighterState } from '../state/fighterState.js';
import { CharacterSelect } from './CharacterSelect.js';
import { FadeEffect } from './utils/FadeEffect.js';
import { PracticeBattleScene } from './PracticeBattlescene.js';



export class PrePostMatch {
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
        { name: "Malupiton", color: "gray", imageSml: 'malupitonSmall', imageBig: 'malupitonBig' },
        { name: "Babygiant", color: "gray",  imageSml: 'babygiantSmall', imageBig: 'babygiantBig'},
        { name: "Unknown1", color: "gray", imageSml: 'unknownSmall', imageBig: 'unknownBig' },
        { name: "Otlum", color: "gray", imageSml: 'otlumSmall', imageBig: 'otlumBig' },
        { name: "Golem", color: "gray", imageSml: 'golemSmall', imageBig: 'golemBig' },
        { name: "Lamok", color: "gray",  imageSml: 'lamokSmall', imageBig: 'lamokBig' },
        { name: "Pinuno", color: "gray",  imageSml: 'pinunoSmall', imageBig: 'pinunoBig' },
        { name: "Toni", color: "gray",  imageSml: 'toniSmall', imageBig: 'toniBig' },
        { name: "Tyga", color: "gray",  imageSml: 'tygaSmall', imageBig: 'tygaBig' },
        { name: "Unknown6", color: "gray",  imageSml: 'unknownSmall', imageBig: 'unknownBig' },
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

    constructor(game, selectedCharacters) {
        this.musicVS = document.querySelector('audio#music-vs');
        this.musicWin = document.querySelector('audio#music-win');

        this.soundChoose = document.querySelector('audio#sound-choose');
        this.soundSelect = document.querySelector('audio#sound-select');
        this.soundChooseFighter = document.querySelector('audio#choose-fighter');
        this.game = game;
        this.fade = new FadeEffect({ color: 'black', speed: 0.05 });
        
        

        this.selectedCharacters = selectedCharacters;
        this.selectedCharacterP1 = selectedCharacters[0].name;
        this.selectedCharacterP2 = selectedCharacters[1].name;
        this.selectedCharacterP1NamePos = selectedCharacters[0].namePos;
        this.selectedCharacterP2NamePos = selectedCharacters[1].namePos;
        this.selectedCharacterP1Saying = selectedCharacters[0].sayings;
        this.selectedCharacterP2Saying = selectedCharacters[1].sayings;

        console.log(this.selectedCharacterP1, this.selectedCharacterP2);
        console.log(this.selectedCharacterP1NamePos, this.selectedCharacterP2NamePos);
        if(gameState.gameScene === 'prematch') {
            gameState.fighters = [createDefaultFighterState(this.selectedCharacterP1),createDefaultFighterState(this.selectedCharacterP2)];
        }

        this.time = 0;
        this.timeTimer = 0;
        this.blackNwhiteP1 = false;
        this.blackNwhiteP2 = false;

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
        if(gameState.gameScene === 'prematch') playSound(this.musicVS, 1);
        else if(gameState.gameScene === 'postmatch') playSound(this.musicWin, 1);
        

        this.screenanim = 
            {
                x: 0, y: -100, trigger: true, speed: 5,
            };
        this.screenanim2 = 
            {
                x: 0, y: 0, trigger: false, speed: 7,
            };
         
        this.imageBigP = [
            this.selectedCharacters[0].imageBig,
            this.selectedCharacters[1].imageBig,
           ];

        this.selectEnable = [
            false,
            false,
           ];
        
        this.image = document.querySelector('img[alt="misc"]');
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
                    ['CUBAO', [65, 1061, 183, 98]],
                    ['BOHOL', [250, 1061, 183, 98]],

                    //Vs Screen
                    ['vs-screen', [799, 2530, 384, 224]],
                    ['post-screen', [799, 2756, 384, 224]],
                     

                               
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

                    //Name tags Alphabet
                    ['name-A', [14,218, 15, 9]],
                    ['name-B', [28,218, 11, 9]],
                    ['name-C', [43,218, 9, 9]],
                    ['name-D', [55,218, 11, 9]],
                    ['name-E', [70,218, 9, 9]],
                    ['name-F', [82,218, 8, 9]],
                    ['name-G', [94,218, 11, 9]],
                    ['name-H', [107,218, 12, 9]],
                    ['name-I', [119,218, 10, 9]],
                    ['name-J', [128,218, 7, 11]],
                    ['name-K', [138,218, 11, 9]],
                    ['name-L', [150,218, 10, 10]],
                    ['name-M', [161,218, 13, 9]],
                    ['name-N', [176,218, 14, 9]],
                    ['name-O', [193,218, 10, 9]],
                    ['name-P', [207,218, 9, 9]],
                    ['name-Q', [220,218, 10, 12]],
                    ['name-R', [234,218, 11, 9]],
                    ['name-S', [247,218, 8, 9]],
                    ['name-T', [258,218, 11, 10]],
                    ['name-U', [271,218, 11, 9]],
                    ['name-V', [285,218, 11, 9]],
                    ['name-W', [298,218, 16, 9]],
                    ['name-X', [317,218, 10, 9]],
                    ['name-Y', [330,218, 9, 9]],
                    ['name-Z', [341,218, 10, 10]],
                    ['name- ', [353,218, 9, 9]],
                   
        
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

    handleFlash() {
        this.fade.fadeIn(); 
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
      
        updateTime(time){
            if(this.time === 8)this.handleFlash();
         if(this.time === 10 && gameState.gameScene === 'prematch') {
           
            if(gameState.practiceMode.enabled)this.game.setScene(new PracticeBattleScene(this.game, this.selectedCharacters));
            else this.game.setScene(new BattleScene(this.game, this.selectedCharacters));
         }else if(this.time === 10 && gameState.gameScene === 'postmatch'){
           
            this.game.setScene(new CharacterSelect(this.game));
         }

        this.timeTimer += time.secondsPassed;
        if(this.timeTimer >= TIME_DELAY / 1000){
            this.time +=1;
            console.log('time', this.time);
            this.timeTimer -= TIME_DELAY / 1000;
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

    update(time, context) {
        this.blinkTime += (1 * 60) * time.secondsPassed;
        this.updateTime(time);
        this.updateEntities(time, context);
        this.updateImports();
        this.fade.update(time);
        this.screenAnimation(time);
        if(this.flashScreen)this.startTimer(time);

        
    }

    drawEntities(context, time) {
        for (const entity of this.entities) {
            entity.draw(context, time, this.camera);
        }
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

drawFrameCharacter(context, frameKey, x, y, direction = 1, scale = 1, blackWhite = false) {
    const frame = this.frames.get(frameKey);
    if (!frame) {
        console.error(`Frame key "${frameKey}" not found in frames map.`);
        return;
    }
    if (!this.image) {
        console.error('Image not loaded.');
        return;
    }
    const [sourceX, sourceY, sourceWidth, sourceHeight] = frame;

    context.save();
    if (blackWhite) {
        context.filter = 'grayscale(100%)';
    }

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

//draw sayings
drawSayings(context){
     const player1Saying = this.selectedCharacterP1Saying;
     const player2Saying = this.selectedCharacterP2Saying;

        if(gameState.gamePlayerWinned === 'P1'){
             this.drawPlayerSaying(context, player1Saying, 40);
             this.blackNwhiteP2 = true;
        }
        else if(gameState.gamePlayerWinned === 'P2'){
            this.drawPlayerSaying(context, player2Saying, 40);
            this.blackNwhiteP1 = true;
        } 
}

drawPlayerSaying(context, sayings, x){
        const saying = sayings.toUpperCase();
        const strValue = String(saying);
        
        for(let i = 0; i < strValue.length; i++){
            this.drawFrame(context, `score-${strValue[i]}`, x + i * 9, 178);
        }
}

//Name Tags Draw
drawNameTags(context){
        const nameP1 = gameState.fighters[0].id;
        const nameP2 = gameState.fighters[1].id;

         this.drawP1NameTag(context, nameP1, 8);
         this.drawP2NameTag(context,nameP2, 384);
    }

     drawP1NameTag(context, nameP2, x){
        const name = nameP2.toUpperCase();
        const strValue = String(name);
        const buffer = this.selectedCharacterP1NamePos;

        for(let i = 0; i < strValue.length; i++){
            this.drawFrame(context, `name-${strValue[i]}`, x + buffer + i * 9, 158);
        }
    }

    drawP2NameTag(context, nameP2, x) {
    const name = nameP2.toUpperCase();
    const strValue = String(name);
    const buffer = this.selectedCharacterP2NamePos + 15;

    for (let i = strValue.length - 1; i >= 0; i--) {
        this.drawFrame(context, `name-${strValue[i]}`, x - buffer - (strValue.length - 1 - i) * 9, 158);
    }
}


 drawCredits(context){
        this.drawTextLabel(context, 'CREDITS' + ' ' + `${gameState.credits}`, 270,10, 1, 0.7);
    }

drawImageBig(context){
        const x = this.screenanim2.x + 0;
        const y = this.screenanim2.y + 50;
        this.drawFrameCharacter(context,  this.imageBigP[0], x, y, 1, 1, this.blackNwhiteP1);
        this.drawFrameCharacter(context,  this.imageBigP[1], x + 384, y, -1, 1, this.blackNwhiteP2);
}

drawVsScreen(context){
    if(gameState.gameScene === 'prematch')this.drawFrame(context, 'vs-screen', 0, 0);
    else if(gameState.gameScene === 'postmatch')this.drawFrame(context, 'post-screen', 0, 0);
}

    draw(context, time) {
        
        this.drawVsScreen(context);
        
         if(this.screenanim2.trigger === true){
        this.drawImageBig(context);
        if(gameState.gameScene === 'prematch') this.drawNameTags(context);
        if(gameState.gameScene === 'postmatch') this.drawSayings(context);
       
        this.fade.draw(context, 400, 400);
        
         }
         if(this.flashScreen)this.drawFlash(context);
        
    }
}

