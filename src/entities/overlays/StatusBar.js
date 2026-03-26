import { HEALTH_CRITICAL_HIT_POINTS, HEALTH_DAMAGE_COLOR, HEALTH_MAX_HIT_POINTS, KO_ANIMATION, KO_FLASH_DELAY, SKILL_EMPTY_POINTS, SKILL_MAX_NUMBER, SKILL_MAX_POINTS, SKILL_POINTS, SKILL_POINTS1_COLOR, SKILL_POINTS2_COLOR, SKILL_POINTS3_COLOR, SKILL_POINTS4_COLOR, SKILL_POINTS5_COLOR, SKILL_POINTSMAX_COLOR, TIME_DELAY, TIME_FLASH_DELAY, TIME_FRAME_KEYS } from "../../constants/battle.js";
import { FPS } from "../../constants/game.js";
import { BattleScene } from "../../scenes/Battlescene.js";
import { CharacterSelect } from "../../scenes/CharacterSelect.js";
import { Intro } from "../../scenes/Intro.js";
import { playSound, stopSound } from "../../soundHandler.js";
import { gameState } from "../../state/gameState.js";
import { drawFrame } from "../../utils/context.js";
import { FadeEffect } from "../../scenes/utils/FadeEffect.js";
import { GOLEM, MALUPITON } from "../../constants/movelist.js";
import * as control from '../../inputHandler.js'; 
import { Control } from "../../constants/control.js";



export class StatusBar {
    constructor(game){
        this.game = game; 
        this.music = document.querySelector(gameState.stageMusic);
        this.soundFight = document.querySelector('audio#sound-fight');
        this.soundRound1 = document.querySelector('audio#sound-round1');
        this.soundRound2 = document.querySelector('audio#sound-round2');
        this.soundRound3 = document.querySelector('audio#sound-round3');
        this.soundRound4 = document.querySelector('audio#sound-round4');
        this.soundRound5 = document.querySelector('audio#sound-round5');
        this.soundRound6 = document.querySelector('audio#sound-round6');
        this.soundRound7 = document.querySelector('audio#sound-round7');
        this.soundRound8 = document.querySelector('audio#sound-round8');
        this.soundRound9 = document.querySelector('audio#sound-round9');
        this.soundRound10 = document.querySelector('audio#sound-round10');
        this.soundSkillAdd = document.querySelector('audio#super-skill-add');
        this.soundSkillMax = document.querySelector('audio#super-skill-max');

        gameState.inputEnable = false;

        gameState.fighters[0].wins = 0;
        gameState.fighters[1].wins = 0;
        gameState.fighters[0].perfectHP = false;
        gameState.fighters[1].perfectHP = false;
        gameState.rounds = 0;
        gameState.fighterNotIdle = false;
        this.music.currentTime = 0;

        this.soundWin = document.querySelector('audio#sound-win');
        this.soundLose = document.querySelector('audio#sound-lose');
        this.soundPerfect = document.querySelector('audio#sound-perfect');
       
        this.image = document.querySelector('img[alt="misc"]');

        this.time = 90;
        this.gameIn = true;
        this.timeCount = 90;
        this.timeTimer = 0;
        this.soundEnable = true;
        this.soundPerfectEnable = true;
        this.blinkMax = false;
        this.updateSkill = false;
        this.enemyStart = false;
        this.skillReady = [{
            player1: {
                skillNum: gameState.skillNum,
                skillColor: SKILL_POINTS1_COLOR,
            },
            player2: {
                skillNum: gameState.skillNum,
                skillColor: SKILL_POINTS1_COLOR,
            },
        }];
        
        this.fightOver = false;
        this.fightOverEnable = false;
        this.fightOverTimer = 0;
        this.flashScreen = false;
        this.flashAlpha = 0;

        this.screenTimer = 0;
        this.screenTimerMax = 50;

        this.hyperskillframe = 1;

        this.timerDelay = 0;

        this.winSituation = '';
        
        this.timeFlashTimer = 0;
        this.useFlashFrames = false;
        this.music.loop = true;
        this.music.volume = 0.6;
        this.fade = new FadeEffect({ color: 'black', speed: 0.1, maxAlpha: 1 });
        this.hyperskillframeAccumulator = 0;
        this.healthBars = [{
            timer: 0,
            hitPoints: HEALTH_MAX_HIT_POINTS,
        }, {
            timer: 0,
            hitPoints: HEALTH_MAX_HIT_POINTS,
        }];

        this.SkillBars = [{
            number: 0,
            skillPoints: gameState.fighters[0].skillPoints,
        }, {
            number: 0,
            skillPoints: gameState.fighters[0].skillPoints,
        }];

        this.koFrame = 0;
        this.koAnimationTimer = 0;
        
        this.movelistPageIndex = 0;
        this.movelistPageSize = 5;
        
        this.frames = new Map([
            ['pointer', [498,7,26,18]],
            ['maximum', [494,215,60,15]],
            ['maximum-white', [494,232,60,15]],

            ['health-bar', [16,18, 145, 11]],
            ['skill-bar', [222,157, 72, 9]],
            ['skill-0', [208,194, 10, 10]],
            ['skill-1', [222,194, 6, 10]],
            ['skill-2', [232,194, 10, 10]],
            ['skill-3', [244,194, 10, 10]],
            ['skill-4', [256,194, 11, 10]],
            ['skill-5', [268,194, 10, 10]],
            ['skill-6', [280,194, 10, 10]],
            ['skill-7', [292,194, 10, 10]],
            ['skill-8', [304,194, 10, 10]],
            ['skill-9', [316,194, 10, 10]],
            
            ['game-over', [369,73, 110, 14]],
            ['time-over', [352,112, 64, 30]],
            ['draw-game', [427,114, 59, 26]],

            ['round', [272,168, 61, 21]],
            ['round-0', [88,168, 13, 19]],
            ['round-1', [106,168, 9, 19]],
            ['round-2', [120,168, 14, 19]],
            ['round-3', [136,168, 13, 19]],
            ['round-4', [152,168, 13, 19]],
            ['round-5', [168,168, 13, 19]],
            ['round-6', [184,168, 13, 19]],
            ['round-7', [200,168, 13, 19]],
            ['round-8', [216,168, 13, 19]],
            ['round-9', [232,168, 13, 19]],

            //Char Select Big imgs
             ['unknownBig', [16, 739, 100, 100]],
             ['malupitonBig', [117, 739, 100, 100]],
             ['babygiantBig', [218, 739, 96, 100]],
             ['otlumBig', [313, 739, 100, 100]],
             ['golemBig', [17, 841, 100, 100]],

             //HyperSkill BG
             ['hyper1', [11, 1378, 384, 223]],
             ['hyper2', [10, 1609, 384, 223]],
             ['hyper3', [10, 1838, 384, 223]],
             ['hyper4', [11, 2071, 384, 223]],
             ['hyper5', [10, 2299, 384, 223]],
             ['hyper6', [10, 2526, 384, 223]],
             ['hyper7', [10, 2752, 384, 223]],
             ['hyper8', [402, 1378, 384, 223]],
             ['hyper9', [402, 1608, 384, 223]],
             ['hyper10', [402, 1838, 384, 223]],
             ['hyper11', [402, 2069, 384, 223]],
             ['hyper12', [402, 2299, 384, 223]],
             ['hyper13', [402, 2528, 384, 223]],
             ['hyper14', [402, 2753, 384, 223]],
             ['hyper15', [797, 1378, 384, 223]],
             ['hyper16', [797, 1610, 384, 223]],
             ['hyper17', [797, 1841, 384, 223]],
             ['hyper18', [797, 2070, 384, 223]],
             ['hyper19', [797, 2301, 384, 223]],



            ['fight', [16,168, 63, 18]],
            ['win', [344,16, 16, 16]],

            ['ko-white', [161, 16,32,14]],
            ['ko-red', [161, 1,32,14]],

            
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


            [`${TIME_FRAME_KEYS[1]}-0`, [16,192,10,12]],
            [`${TIME_FRAME_KEYS[1]}-1`, [32,192,10,12]],
            [`${TIME_FRAME_KEYS[1]}-2`, [48,192,10,12]],
            [`${TIME_FRAME_KEYS[1]}-3`, [64,192,10,12]],
            [`${TIME_FRAME_KEYS[1]}-4`, [80,192,10,12]],
            [`${TIME_FRAME_KEYS[1]}-5`, [96,192,10,12]],
            [`${TIME_FRAME_KEYS[1]}-6`, [112,192,10,12]],
            [`${TIME_FRAME_KEYS[1]}-7`, [128,192,10,12]],
            [`${TIME_FRAME_KEYS[1]}-8`, [144,192,10,12]],
            [`${TIME_FRAME_KEYS[1]}-9`, [160,192,10,12]],

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
            ['score-#', [41,89, 10, 10]], 
            ['score-!', [17,89, 10, 10]],
            ['score-?', [197,101, 10, 10]],
            ['score-(', [101,89, 10, 10]],
            ['score-)', [111,89, 10, 10]],
            ['score-.', [172,87, 10, 10]], 
            ['score-:', [136,100, 10, 10]], 
            ['score-,', [149,89, 10, 10]], 
            ['score--', [161,89, 10, 10]], 
            ['score-/', [185,89, 10, 10]], 
            ['score- ', [105,54, 18, 12]], 

            //Name tags Alphabet
             ['name-A', [27,56, 8, 9]],
             ['name-E', [44,206, 8, 9]],
             ['name-G', [17,206, 9, 9]],
             ['name-I', [64,56, 5, 9]],
             ['name-L', [35,206, 8, 9]],
             ['name-M', [53,206, 11, 9]],
             ['name-N', [89,56, 9, 9]],
             ['name-O', [26,206, 8, 9]],
             ['name-P', [54,56, 9, 9]],
             ['name-T', [70,56, 9, 9]],
             ['name-U', [44,56, 9, 9]],
             

            //Character Names
            ['tag-malupiton', [15,56,83,9]],
            ['tag-golem', [17,206,47,9]],

            //movelist icons
            ['arrow-up', [534,70,16,19]],
            ['arrow-down', [501,124,16,19]],
            ['arrow-left', [530,126,21,15]],
            ['arrow-right', [501,72,20,15]],

            ['arrow-upRight', [501,44,17,16]],
            ['arrow-upLeft', [532,98,18,16]],
            ['arrow-downRight', [502,99,18,16]],
            ['arrow-downLeft', [532,45,18,16]],

            ['button-a', [498,151,23,21]],
            ['button-b', [531,151,23,21]],
            ['button-c', [498,179,23,21]],
            ['button-d', [532,179,23,21]],

        ]);

        this.names = gameState.fighters.map(({ id }) => `tag-${id.toLowerCase()}`);
    }

    resetBattle(){
     //    gameState.fighters[0].hitPoints = HEALTH_MAX_HIT_POINTS;
       //  gameState.fighters[1].hitPoints = HEALTH_MAX_HIT_POINTS;
        this.time = 90;
        this.gameIn = true;
        this.timeCount = 90;
        this.timeTimer = 0;
        this.soundEnable = true;
        this.soundPerfectEnable = true;
        this.blinkMax = false;
        this.updateSkill = false;
        this.inputRegistered = false;
        this.enemyStart = false;
        this.healthBars = [{
            timer: 0,
            hitPoints: HEALTH_MAX_HIT_POINTS,
        }, {
            timer: 0,
            hitPoints: HEALTH_MAX_HIT_POINTS,
        }];
        this.skillReady = [{
            player1: {
                skillNum: gameState.skillNum,
                skillColor: SKILL_POINTS1_COLOR,
            },
            player2: {
                skillNum: gameState.skillNum,
                skillColor: SKILL_POINTS1_COLOR,
            },
        }];

        gameState.fighters[0].perfectHP = false;
        gameState.fighters[1].perfectHP = false;
        
        this.fightOver = false;
        this.fightOverEnable = false;
        this.fightOverTimer = 0;
        this.flashScreen = false;
        this.flashAlpha = 0;
        this.fade = new FadeEffect({ color: 'black', speed: 0.1, maxAlpha: 1 });

        this.screenTimer = 0;
        this.screenTimerMax = 50;

        this.hyperskillframe = 1;

        this.winSituation = '';
        
        this.timeFlashTimer = 0;
        this.useFlashFrames = false;
        this.music.loop = true;
        this.music.volume = 0.6;
        console.log('Statsbar reset');
        this.hyperskillframeAccumulator = 0;
        this.movelistPageIndex = 0;
    }

    updateTime(time,context){
       
        //Move Big Image
        gameState.pauseFrameMove = Math.min(gameState.pauseFrameMove + 5, 10);
        
        // Accumulate hyperskill frame with proper delta time handling
        this.hyperskillframeAccumulator += (1 * 60) * time.secondsPassed;
        if (this.hyperskillframeAccumulator >= 1) {
            this.hyperskillframe += Math.floor(this.hyperskillframeAccumulator);
            this.hyperskillframeAccumulator -= Math.floor(this.hyperskillframeAccumulator);
            if (this.hyperskillframe >= 19) this.hyperskillframe = 1;
        }
        
        gameState.pauseTimer = Math.max(gameState.pauseTimer - (0.20 * 60) * time.secondsPassed, 0);
       // console.log(gameState.pauseFrameMove);
        if(time.previous > this.timeTimer + TIME_DELAY + this.timerDelay){
            if(!gameState.pause)this.time -=1;
           // console.log(gameState.pause, gameState.pauseTimer);
            
            
            if(gameState.pause && gameState.pauseTimer <= 0){
                gameState.pause = false;
                this.timerDelay = 400;
                gameState.hyperSkill = false;
            } 
           
            if(this.fightOver) this.fightOverTimer += 1;
            this.timeTimer = time.previous;
        }
        if(time.previous > this.timeFlashTimer + TIME_FLASH_DELAY){
            this.blinkMax = !this.blinkMax;
             this.timeFlashTimer = time.previous;
        }
        if(
            this.time < 10 && this.time > -1 
            && time.previous > this.timeFlashTimer + TIME_FLASH_DELAY
        ) {
            
            this.useFlashFrames = !this.useFlashFrames;
             
            this.timeFlashTimer = time.previous;
        }

    }

    updateHealthBars(time){
        for (const index in this.healthBars){
            if (this.healthBars[index].hitPoints <= gameState.fighters[index].hitPoints) continue;
            this.healthBars[index].hitPoints = Math.max(0, this.healthBars[index].hitPoints- (time.secondsPassed * FPS));
        }
        
    }

   updateSkillBars(time) {
    
    for (let i = 0; i < this.SkillBars.length; i++) {
        const playerKey = i === 0 ? 'player1' : 'player2';
        if(gameState.practiceMode.infiniteSkill) {
            this.SkillBars[i].skillPoints = SKILL_MAX_POINTS;
            gameState.fighters[i].skillNumber = SKILL_MAX_NUMBER;
        }

        // 1st skill trigger
        if(gameState.fighters[i].skillNumber === 0){
            this.skillReady[0][playerKey].skillColor = SKILL_POINTS1_COLOR;
        } else if(gameState.fighters[i].skillNumber === 1){
            this.skillReady[0][playerKey].skillColor = SKILL_POINTS2_COLOR;
        } else if(gameState.fighters[i].skillNumber === 2){
            this.skillReady[0][playerKey].skillColor = SKILL_POINTS3_COLOR;
        } else if(gameState.fighters[i].skillNumber === 3){
            this.skillReady[0][playerKey].skillColor = SKILL_POINTS4_COLOR;
        } else if(gameState.fighters[i].skillNumber === 4){
            this.skillReady[0][playerKey].skillColor = SKILL_POINTS5_COLOR;
        } else if(gameState.fighters[i].skillNumber === 5){
            this.skillReady[0][playerKey].skillColor = SKILL_POINTSMAX_COLOR;
        }
        
        if (gameState.fighters[i].skillNumber === 0 && this.SkillBars[i].skillPoints >= 67) {
             playSound(this.soundSkillAdd, 0.7);
            this.SkillBars[i].skillPoints = 0;
            gameState.fighters[i].skillPoints = 0;
            this.skillReady[0][playerKey].skillColor = SKILL_POINTS2_COLOR;
            gameState.fighters[i].skillNumber += 1;
            
           
        }

        // 2nd skill trigger
        if (gameState.fighters[i].skillNumber === 1 && this.SkillBars[i].skillPoints >= 67) {
             playSound(this.soundSkillAdd, 0.7);
            this.SkillBars[i].skillPoints = 0;
            gameState.fighters[i].skillPoints = 0;
            this.skillReady[0][playerKey].skillColor = SKILL_POINTS3_COLOR;
            gameState.fighters[i].skillNumber += 1;
            
          
        }

         // 3rd skill trigger
        if (gameState.fighters[i].skillNumber === 2 && this.SkillBars[i].skillPoints >= 67) {
             playSound(this.soundSkillAdd, 0.7);
            this.SkillBars[i].skillPoints = 0;
            gameState.fighters[i].skillPoints = 0;
            this.skillReady[0][playerKey].skillColor = SKILL_POINTS4_COLOR;
            gameState.fighters[i].skillNumber += 1;
            
           
        }

        // 4th skill trigger
        if (gameState.fighters[i].skillNumber === 3 && this.SkillBars[i].skillPoints >= 67) {
             playSound(this.soundSkillAdd, 0.7);
            this.SkillBars[i].skillPoints = 0;
            gameState.fighters[i].skillPoints = 0;
            this.skillReady[0][playerKey].skillColor = SKILL_POINTS5_COLOR;
            gameState.fighters[i].skillNumber += 1;
            
           
        }

        // 5th skill trigger
        if (gameState.fighters[i].skillNumber === 4 && this.SkillBars[i].skillPoints >= 67) {
             playSound(this.soundSkillAdd, 0.7);
            this.SkillBars[i].skillPoints = 0;
            gameState.fighters[i].skillPoints = 0;
            this.skillReady[0][playerKey].skillColor = SKILL_POINTSMAX_COLOR;
            gameState.fighters[i].skillNumber += 1;
            
           
        }

        
         // max skill trigger
        if (gameState.fighters[i].skillNumber >= SKILL_MAX_NUMBER && this.SkillBars[i].skillPoints >= 67) {
           
            this.SkillBars[i].skillPoints = 66;
            gameState.fighters[i].skillPoints = 66;
            this.skillReady[0][playerKey].skillColor = SKILL_POINTSMAX_COLOR;
            gameState.fighters[i].skillNumber = SKILL_MAX_NUMBER;
           
        }
        if(gameState.fighters[i].resetSkillBar){
            this.SkillBars[i].skillPoints = 0;
            
            gameState.fighters[i].resetSkillBar = false;
        }

        // Increase skill bar display smoothly
        if (this.SkillBars[i].skillPoints >= gameState.fighters[i].skillPoints) continue;
        
        this.SkillBars[i].skillPoints += time.secondsPassed * FPS;
    }
}



    updateKoIcon(time){
        if (this.healthBars.every((healthBar) => healthBar.hitPoints > HEALTH_CRITICAL_HIT_POINTS)) return;
        if (time.previous < this.koAnimationTimer + KO_FLASH_DELAY[this.koFrame]) return;

        this.koFrame = 1 - this.koFrame;
        this.koAnimationTimer = time.previous;
    }

    startTimer(time){
        if (this.screenFlashTrigger === true ){
            this.flashScreen = true;
            this.screenTimer = Math.min(this.screenTimer + (1 * 60) * time.secondsPassed, this.screenTimerMax);
             if(this.screenTimer >= this.screenTimerMax){
                this.fade.fadeOut();
                this.screenFlashTrigger = false;
               
               }
        }
        if (this.screenFlashTrigger === false ) {
            this.screenTimer = Math.max(this.screenTimer - (1 * 60) * time.secondsPassed, 0);
            if(this.screenTimer <= 0){
               
                this.screenFlashTrigger = false;
                this.flashScreen = false;
                
               
               }
        }
       
        }

    update(time){
        
        this.updateTime(time);
        this.updateHealthBars(time);
        this.updateKoIcon(time);
        if(this.updateSkill){
            this.updateSkillBars(time);
        }
        
        this.fade.update(time);
        if(this.flashScreen)this.startTimer(time);
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

practiceModeHealthBar(){
    // console.log("drawing health bars p/Gamestate.hitpoints", this.healthBars[1].hitPoints, gameState.fighters[1].hitPoints);

    for (let i = 0; i < 2; i++) {
        if(gameState.fighters[i].resetHP){
            console.log(`resetting HP for player ${i+1}`);
            this.healthBars[i].hitPoints = Math.min(this.healthBars[i].hitPoints + 3, 144);
            gameState.fighters[i].hitPoints = Math.min(this.healthBars[i].hitPoints, 144);
            if(this.healthBars[i].hitPoints >= 144){
                gameState.fighters[i].resetHP = false;
            }
            
        }
}

        
}

    drawHealthBars(context){
       if(gameState.practiceMode.enabled) this.practiceModeHealthBar();
        this.drawFrame(context, 'health-bar', 31, 20);
        this.drawFrame(context, KO_ANIMATION[this.koFrame], 176, 18 - this.koFrame);
        this.drawFrame(context, 'health-bar', 353, 20,-1);

        context.fillStyle = HEALTH_DAMAGE_COLOR;

        context.beginPath();
        context.fillRect(
            32, 21,
            HEALTH_MAX_HIT_POINTS - Math.floor(this.healthBars[0].hitPoints), 9,
        );

         context.fillRect(
            208 + Math.floor(this.healthBars[1].hitPoints), 21,
            HEALTH_MAX_HIT_POINTS - Math.floor(this.healthBars[1].hitPoints), 9,
        );
    }

    
drawSkillNum(context, label, x, y){
    const strLabel = String(label);
    for (let i = 0; i < strLabel.length; i++) {
        this.drawFrame(context, `skill-${strLabel.charAt(i)}`, x + i * 12, y);
    }
}

    drawSkillBars(context){ 
        this.drawFrame(context, 'skill-bar', 105, 205, -1);
        this.drawFrame(context, 'skill-bar', 280, 205);
      //  this.drawFrame(context, 'skill-num', 270, 205);
      //  this.drawFrame(context, 'skill-num', 107, 205);
        this.drawSkillNum(context, gameState.fighters[0].skillNumber, 107,205);
        this.drawSkillNum(context, gameState.fighters[1].skillNumber, 270,205);

        if(gameState.fighters[0].skillNumber >= 3){
            context.fillStyle = this.blinkMax ? SKILL_POINTSMAX_COLOR : this.skillReady[0]['player1'].skillColor;
        } else {
            context.fillStyle = this.skillReady[0]['player1'].skillColor;
        }

        context.beginPath();
        context.fillRect(
            36, 207,
            SKILL_POINTS + Math.floor(this.SkillBars[0].skillPoints), 5,
        );
        if(gameState.fighters[0].skillNumber === SKILL_MAX_NUMBER){
            context.fillStyle = this.blinkMax ? SKILL_EMPTY_POINTS : this.skillReady[0]['player1'].skillColor;
            context.fillRect(
            36, 207,
            SKILL_POINTS + 66, 5,
        );
        if(this.blinkMax) this.drawFrame(context, 'maximum', 42,202, 1, 0.9);
        else if (!this.blinkMax) this.drawFrame(context, 'maximum-white', 42,202, 1, 0.9);
        }
        if(gameState.fighters[0].skillNumber >= 3 && this.blinkMax){
            this.soundSkillMax.volume = 0.15;
            this.soundSkillMax.play();
        }

        if(gameState.fighters[1].skillNumber >= 3){
            context.fillStyle = this.blinkMax ? SKILL_POINTSMAX_COLOR : this.skillReady[0]['player2'].skillColor;
        } else {
            context.fillStyle = this.skillReady[0]['player2'].skillColor;
        }

         context.fillRect(
            349, 207,
            SKILL_POINTS - Math.floor(this.SkillBars[1].skillPoints) , 5,
        );
        if(gameState.fighters[1].skillNumber === SKILL_MAX_NUMBER){
            context.fillStyle = this.blinkMax ? SKILL_EMPTY_POINTS : this.skillReady[0]['player2'].skillColor;
            context.fillRect(
            349, 207,
            SKILL_POINTS - 66, 5,
        );
        if(this.blinkMax) this.drawFrame(context, 'maximum', 288,202, 1, 0.9);
        else if (!this.blinkMax) this.drawFrame(context, 'maximum-white', 288,202, 1, 0.9);
        }
        if(gameState.fighters[1].skillNumber >= 3 && this.blinkMax){
            this.soundSkillMax.volume = 0.15;
            this.soundSkillMax.play();
        }

        

    }

    drawNameTags(context){
        const [name1, name2] = this.names;
        const nameP2 = gameState.fighters[1].id;
        

         this.drawFrame(context, name1, 32, 33);
        // this.drawFrame(context, name2, 270, 33);
         this.drawNameTag(context,nameP2, 293);
    }
    
    drawTime(context){
 const timeString = String(Math.max(this.time, 0)).padStart(2,'00');
 const flashFrame = TIME_FRAME_KEYS[Number(this.useFlashFrames)];

        this.drawFrame(context, `${flashFrame}-${timeString.charAt(0)}`, 178, 33);
        this.drawFrame(context, `${flashFrame}-${timeString.charAt(1)}`, 194, 33);
   
    }

    drawScore(context, score, x){
        const strValue = score;
        const buffer = ((6*12)) - strValue.length * 12;

        for(let i = 0; i < strValue.length; i++){
            this.drawFrame(context, `score-${strValue[i]}`, x + buffer + i * 12, 1);
        }
    }

     drawNameTag(context, nameP2, x){
        const name = nameP2.toUpperCase();
        const strValue = String(name);
        const buffer = ((6*12)) - strValue.length * 12;

        for(let i = 0; i < strValue.length; i++){
            this.drawFrame(context, `name-${strValue[i]}`, x + buffer + i * 9, 33);
        }
    }

    drawScoreLabel(context, label, x, y){
        for (const index in label) {
            this.drawFrame(context, `score-${label.charAt(index)}`, x + index * 12, y);
        }
    }

    drawRound(context, label, x, y){
    const strLabel = String(label);
    for (let i = 0; i < strLabel.length; i++) {
        this.drawFrame(context, `round-${strLabel.charAt(i)}`, x + i * 12, y);
    }
}



    drawFightOver(context){
       // this.fightOverTimer = -1 * this.time;
    
        if(this.fightOverTimer <= 2 && this.time < 0){
             this.drawFrame(context, 'time-over', 158,103);
             gameState.fighterNotIdle = false;
        }
        if(this.fightOverTimer >= 4 && this.fightOverTimer <= 6){
             
            if(this.winSituation === 'DRAW')this.drawFrame(context, 'draw-game', 158,103);
            
           
            if(this.winSituation === 'P1WIN'){
                if(!this.soundEnable && this.fightOverTimer <=4){
                playSound(this.soundWin, 1);
                 this.soundEnable = true;
                 console.log('Sound on win');
                 gameState.fighterNotIdle = false;
            }
                 this.drawScoreLabel(context, 'WINNER!', 4, 90);
              
            }
            if(this.winSituation === 'P2WIN'){
                if(!this.soundEnable && this.fightOverTimer <=4){
                     console.log('Sound on lose');
                     gameState.fighterNotIdle = false;
                    playSound(this.soundLose, 1);
                    this.soundEnable = true;
                }
                
                this.drawScoreLabel(context, 'WINNER!', 299, 90);
            } 
        }
        
        if(this.fightOverTimer >= 6 && this.fightOverTimer <= 10) this.drawPerfect(context);
        

         if(this.fightOverTimer >= 8 && this.fightOverTimer <= 10 && !this.fightOverEnable){
            console.log('Next round');
             this.drawPerfect(context);
            this.fightOverEnable = true;
            this.screenFlashTrigger = true;
            this.flashScreen = true
            this.flash = true;
         }
       
    }

    drawTextLabel(context, label, x, y, direction, scale){
        for (const index in label) {
            this.drawFrame(context, `score-${label.charAt(index)}`, x + index * 9, y, direction, scale);
        }
    }
    

    drawScores(context){
        this.drawScoreLabel(context, 'P1', 4,1);
        this.drawScore(context, gameState.fighters[0].score, 45);

        this.drawScoreLabel(context, 'GOLEM', 133, 1);
        this.drawScore(context, 50000, 190);

        this.drawScoreLabel(context, 'P2', 269, 1);
        this.drawScore(context, gameState.fighters[1].score, 309);

    }

    drawFlash(context, time){
        if (this.flash === true){
            if (!this.fade.active) {
                this.fade.fadeIn();
            }
        }
        if (this.flash === false){
            if (this.fade.fadingIn) {
                this.fade.fadeOut();
            }
        }
        this.fade.draw(context, 400, 400);
    }

drawCredits(context){
        this.drawTextLabel(context, 'CREDITS' + ' ' + `${gameState.credits}`, 270,10, 1, 0.7);
    }

    drawWins(context){
         
        if(gameState.fighters[0].wins === 1) this.drawFrame(context, 'win', 159, 2);
        if(gameState.fighters[1].wins === 1) this.drawFrame(context, 'win', 207, 2);
    }

   drawMenuStroke(context, x, y, width, height, strokeWidth){
        context.strokeStyle = "white";
        context.lineWidth = strokeWidth;
        context.borderRadius = 5;
        context.strokeRect(x, y, width, height);
    }

    drawMenu(context, time){
        if(gameState.pauseMenu.confirmSelection) return;
          
            const menu = {
                x: 72,
                y: 80,
                width: 240,
                height: 110,
                strokeWidth: 3,
            }
            const nameP2 = gameState.fighters[1].id.toUpperCase();
            const nameP1 = gameState.fighters[0].id.toUpperCase();
            const stringp1 = String(nameP1);
            const stringp2 = String(nameP2);
            
            //Upper Part of the pause Menu
                 context.fillStyle = 'rgb(12, 2, 82)';
                  context.fillRect(menu.x, menu.y - 30, menu.width, menu.height-90);
    
                  context.strokeStyle = "yellow";
                  context.lineWidth = menu.strokeWidth;
                  context.strokeRect(menu.x, menu.y - 30, menu.width, menu.height-90);
    
            //lower Part of the pause Menu
                  context.fillStyle = 'rgb(12, 2, 82)';
                  context.fillRect(menu.x, menu.y, menu.width, menu.height);
    
                  context.strokeStyle = "yellow";
                  context.lineWidth = menu.strokeWidth;
                  context.strokeRect(menu.x, menu.y, menu.width, menu.height);
                  
                //pAUSE menu options
                  if(gameState.fighters[1].pause)this.drawScoreLabel(context, 'P2 PAUSE', menu.x + 75, menu.y - 25);
                  else this.drawScoreLabel(context, 'P1 PAUSE', menu.x + 75, menu.y - 25);
                  this.drawScoreLabel(context, 'RESUME', menu.x + 20, menu.y + 15);
                  this.drawScoreLabel(context, 'CHANGE PAYTER', menu.x + 20, menu.y + 30);
                  this.drawScoreLabel(context, `MOVE LIST`, menu.x + 20, menu.y + 45);
                  this.drawScoreLabel(context, 'OPTIONS', menu.x + 20, menu.y + 60);
                  this.drawScoreLabel(context, 'QUIT', menu.x + 20, menu.y + 75);
                  
                  if(gameState.pauseMenu.selectPosition.y > 4) gameState.pauseMenu.selectPosition.y = 0;
                  this.drawMenuStroke(context, menu.x + 15 + gameState.pauseMenu.selectPosition.x, menu.y + 12 + gameState.pauseMenu.selectPosition.y * 15, menu.width - 30, 15, 1);
    }

    //confirm selection drawmenu
    drawConfirmSelection(context, time){
        if(!gameState.pauseMenu.confirmSelection) return;
        const confirmMenu = {
                x: 72,
                y: 115,
                width: 240,
                height: 110,
                strokeWidth: 3,
            }

            //Upper Part of the pause Menu
                 context.fillStyle = 'rgb(12, 2, 82)';
                  context.fillRect(confirmMenu.x, confirmMenu.y - 30, confirmMenu.width, confirmMenu.height-90);
    
                  context.strokeStyle = "yellow";
                  context.lineWidth = confirmMenu.strokeWidth;
                  context.strokeRect(confirmMenu.x, confirmMenu.y - 30, confirmMenu.width, confirmMenu.height-90);
            //lower Part of the pause Menu
                  context.fillStyle = 'rgb(12, 2, 82)';
                  context.fillRect(confirmMenu.x, confirmMenu.y, confirmMenu.width, confirmMenu.height-90);
    
                  context.strokeStyle = "yellow";
                  context.lineWidth = confirmMenu.strokeWidth;
                  context.strokeRect(confirmMenu.x, confirmMenu.y, confirmMenu.width, confirmMenu.height-90);
                  this.drawScoreLabel(context, `CONFIRM ${gameState.pauseMenu.confirmText}?`, confirmMenu.x + gameState.pauseMenu.selectPosition.x, confirmMenu.y - 25);
                  this.drawScoreLabel(context, 'NO', confirmMenu.x + 65, confirmMenu.y + 5);
                  this.drawScoreLabel(context, 'YES', confirmMenu.x + 140, confirmMenu.y + 5);
                  if(gameState.pauseMenu.selectPosition.y > 1) gameState.pauseMenu.selectPosition.y = 0;
                this.drawFrame(context, 'pointer', confirmMenu.x + 35 + gameState.pauseMenu.selectPosition.y * 75, confirmMenu.y + 3);
                  
    }

    drawPerfect(context){
         if(gameState.fighters[1].perfectHP || gameState.fighters[0].perfectHP){
        this.drawScoreLabel(context, 'PERFECT!', 158, 90);

         if(this.soundPerfectEnable){
            playSound(this.soundPerfect, 1);
            this.soundPerfectEnable = false;
         } 
         }
    }

    drawMoveList(context, time){
        const nameP2 = gameState.fighters[1].id.toUpperCase();
        const nameP1 = gameState.fighters[0].id.toUpperCase();
        
        // Create mapping for character movesets
        const characterMoves = {
            'MALUPITON': MALUPITON,
            'GOLEM': GOLEM,
        };

        let moveList = [];

        const stringp1 = String(nameP1);
        const stringp2 = String(nameP2);
        const menu = {
                x: 25,
                y: 80,
                width: 330,
                height: 120,
                strokeWidth: 3,
            }
        const movelistOffsets = {
            placement: 130,
            arrow:20,
            button: 20,
        }
         //Upper Part of the Movelist
                 context.fillStyle = 'rgb(12, 2, 82)';
                  context.fillRect(menu.x, menu.y - 30, menu.width, menu.height-90);
    
                  context.strokeStyle = "yellow";
                  context.lineWidth = menu.strokeWidth;
                  context.strokeRect(menu.x, menu.y - 30, menu.width, menu.height-90);
    
            //lower Part of the Movelist
                  context.fillStyle = 'rgb(12, 2, 82)';
                  context.fillRect(menu.x, menu.y, menu.width, menu.height);
    
                  context.strokeStyle = "yellow";
                  context.lineWidth = menu.strokeWidth;
                  context.strokeRect(menu.x, menu.y, menu.width, menu.height);

                  if(gameState.fighters[1].pause) this.drawScoreLabel(context, `MOVELIST (${nameP2})`, menu.x + 15, menu.y - 20);
                  else if(gameState.fighters[0].pause) this.drawScoreLabel(context, `MOVELIST (${nameP1})`, menu.x + 15, menu.y - 20);
                  
                 if(gameState.fighters[0].pause) moveList = characterMoves[nameP1] || [];
                 if(gameState.fighters[1].pause) moveList = characterMoves[nameP2] || [];

                 if(this.movelistPageIndex < 0) this.movelistPageIndex = 0;
                 const maxPageIndex = Math.floor((moveList.length - 1) / this.movelistPageSize);
                 if(this.movelistPageIndex > maxPageIndex) this.movelistPageIndex = 0;
                 
                 // Calculate pagination
                 const totalPages = Math.ceil(moveList.length / this.movelistPageSize);
                 const startIdx = this.movelistPageIndex * this.movelistPageSize;
                 const endIdx = Math.min(startIdx + this.movelistPageSize, moveList.length);
                 const pagedMoves = moveList.slice(startIdx, endIdx);
                 
                 // Handle page navigation
                 
                  for(let moveIdx = 0; moveIdx < pagedMoves.length; moveIdx++){
                      const move = pagedMoves[moveIdx];
                      this.drawScoreLabel(context, move.name, menu.x + 15, menu.y + move.y + (moveIdx * 18));
                      
                      for(let inputIdx = 0; inputIdx < move.inputs.length; inputIdx++){
                          const icon = move.inputs[inputIdx];
                          const xOffset = moveIdx === 0 ? movelistOffsets.arrow : movelistOffsets.button;
                          const xPosition = menu.x + 8 + movelistOffsets.placement + (inputIdx + 1) * xOffset;
                          this.drawFrame(context, icon, xPosition, menu.y - 3 + move.y + (moveIdx * 18));
                      }
                  }
                  
                  // Draw page indicator
                  if(totalPages > 1) {
                      this.drawScoreLabel(context, `PAGE ${this.movelistPageIndex + 1}/${totalPages}`, menu.x + 220, menu.y + 105);
                  }
    }           
     
    

    draw(context, time){
      
        if(this.time===this.timeCount - 1 && this.soundEnable){
             console.log('Round 1');
             gameState.fighters[0].hitPoints = HEALTH_MAX_HIT_POINTS;
             gameState.fighters[1].hitPoints = HEALTH_MAX_HIT_POINTS;

             //reset Gamestate death of the players
             gameState.fighters[0].dead = "alive";
             gameState.fighters[1].dead = "alive";


             gameState.rounds += 1;
             const soundName = `soundRound${gameState.rounds}`;
             playSound(this[soundName], 1);
             console.log(gameState.rounds);
             this.soundEnable = false;
            
        }
        if (this.time === this.timeCount - 2){
            this.soundEnable = true;
        }
        if(this.time===this.timeCount - 5 && this.soundEnable){
           
             playSound(this.soundFight, 1);
             this.music.play();
             console.log('Fight');
             gameState.fighters[0].skillPoints += 10;
             gameState.fighters[1].skillPoints += 10;
             this.soundEnable = false;
             
        }

        
        // Control input state based on game time
        if (this.time < 0) {
            // Time ran out - disable input
            gameState.fighterNotIdle = false;
        } else if (this.time > this.timeCount - 4) {
            // Before fight starts - disable input during countdown
            gameState.fighterNotIdle = false;
        } else if (this.time === this.timeCount - 6) {
            // Fight is active - enable input
            gameState.fighterNotIdle = true;
        }

        if (this.time > 0) {
            if (this.time === this.timeCount - 5) {
                this.drawFrame(context, 'fight', 156, 103);
                this.timerDelay = 400;
            }
            
            if (this.time < this.timeCount - 5) {
                if (this.gameIn === true) {
                    gameState.inputEnable = true;
                    if(gameState.practiceMode.infiniteTime) this.time = 84;
                    this.drawHealthBars(context);
                    this.updateSkill = true;
                    this.drawSkillBars(context);
                    this.drawWins(context);
                    this.drawNameTags(context);
                    this.drawTime(context);
                   
                    
                    if(gameState.pauseMenu.show){
                        
                      this.music.pause();
                       context.fillStyle = 'rgba(0, 0, 0, 0.30)';
                        context.fillRect(0, 0, 400, 400);
                        this.drawMenu(context, time);
                       
                    } 
                    this.enemyStart = true;
                } else if (this.gameIn === false) {
                    this.enemyStart = false;
                    gameState.inputEnable = false;
                }
            } else if (this.time > this.timeCount - 4) {
                this.drawFrame(context, 'round', 150, 103);
                this.drawRound(context, gameState.rounds, 217, 104);
            }
        }
       
        if(!this.fightStart){
            this.flashScreen = true;
            this.fightStart = !this.fightStart;
        }
         if(this.fightOver){
             this.timerDelay = 0;
           if(!(gameState.fighters[0].wins === 2 || gameState.fighters[1].wins === 2)) this.drawFightOver(context);
           
        }
        if(this.flashScreen)this.drawFlash(context, time);
       //  this.drawMenu(context, time);
         this.drawConfirmSelection(context, time);
         if(gameState.pauseMenu.showMoveList)this.drawMoveList(context,time);
        }
        
    }
    