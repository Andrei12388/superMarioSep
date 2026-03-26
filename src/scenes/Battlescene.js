import { Camera } from "../Camera.js";
import { FIGHTER_HURT_DELAY, FighterAttackBaseData, FighterAttackStrength, FighterDirection, FighterId } from "../constants/fighter.js";
import { FRAME_TIME } from "../constants/game.js";
import { STAGE_FLOOR, STAGE_MID_POINT, STAGE_PADDING } from "../constants/stage.js";
import { controlHistory, pollControl } from "../controlHistory.js";
import { Malupiton } from "../entities/fighters/Malupiton.js";
import { Shadow } from "../entities/fighters/Shadow.js";

import { LightHitSplash, HeavyHitSplash, SuperHitSplash, BlockHitSplash, GreenHitSplash, HyperHitSplash, FlameHitSplash, GroundShakeSplash, GroundSmokeSplash } from "../entities/fighters/shared/index.js";

import { FpsCounter } from "../entities/FpsCounter.js";
import { StatusBar } from "../entities/overlays/StatusBar.js";
import { ComboOverlay } from "../entities/overlays/ComboOverlay.js";

//stages import
import { payatasStage } from "../entities/stage/payatasStage.js";
import { pasayStage } from "../entities/stage/pasayStage.js";
import { boholStage } from "../entities/stage/boholStage.js";


import { EntityList } from "../EntityList.js";
import { registerKeyboardEvents, registerScreenButtonEvents, unregisterKeyboardEvents, unregisterScreenButtonEvents, heldKeys, pressedKeys } from "../inputHandler.js";
import { playSound, stopSound } from "../soundHandler.js";
import { gameState } from "../state/gameState.js";
import { EnemyAI } from "../entities/fighters/EnemyAI.js";
import { HEALTH_MAX_HIT_POINTS, TIME_FLASH_DELAY } from "../constants/battle.js";
import { Golem } from "../entities/fighters/Golem.js";
import { createDefaultFighterState } from "../state/fighterState.js";
import { SlashHitSplash } from "../entities/fighters/shared/SlashHitSplash.js";
import { CharacterSelect } from "./CharacterSelect.js";
import { PrePostMatch } from "./PrePostMatch.js";
import { FadeEffect } from "./utils/FadeEffect.js";
import { finalStage } from "../entities/stage/finalStage.js";
import { Control } from "../constants/control.js";
import * as control from '../inputHandler.js'; 
import { MainMenu } from "./MainMenu.js";
import { tondoStage } from "../entities/stage/tondoStage.js";



export class BattleScene {
    fighters = [];
    camera = undefined;
    shadows = [];
    hurtTimer = undefined;
    fighterDrawOrder = [0, 1];
    enemyAI = undefined; 
    paused = false;
    timeScale = 1;
    sceneChangeInfo = null;
    transitionCountdown = 0;

    constructor(game, selectedCharacters){
        gameState.pause = false;
        gameState.practiceMode.enabled = false;
        gameState.practiceMode.infiniteHealth = false;
        gameState.practiceMode.infiniteSkill = false;
        gameState.practiceMode.infiniteTime = false;
        this.game = game;

        gameState.characterSelectMode = false;
        gameState.pauseMenu.pauseGame = false;
        gameState.pauseMenu.selectPosition.y = 0;
        gameState.pauseMenu.selectPosition.x = 0;
        gameState.pauseMenu.show = false;
        gameState.pauseMenu.confirmSelection = false;

         controlHistory[0].time = 0;
         controlHistory[1].time = 0;
        this.image = document.querySelector('img[alt="misc"]');
        this.selectedCharacters = selectedCharacters;
        this.selectedCharacterP1 = selectedCharacters[0].name;
        this.selectedCharacterP2 = selectedCharacters[1].name;
        console.log(this.selectedCharacterP1, this.selectedCharacterP2);
        gameState.fighters = [createDefaultFighterState(this.selectedCharacterP1),createDefaultFighterState(this.selectedCharacterP2)];
        gameState.fighters[0].skillConsumed = true;
        gameState.fighters[1].skillConsumed = true;
        gameState.gameScene = 'postmatch';
        gameState.flash = false;
        gameState.rounds = 0;
        gameState.hyperSkill = false;
        gameState.pauseTimer = 0;
        gameState.fighters[0].wins = 0;
        gameState.fighters[1].wins = 0;
        gameState.fighters[0].hitPoints = HEALTH_MAX_HIT_POINTS;
        gameState.fighters[1].hitPoints = HEALTH_MAX_HIT_POINTS;

        this.fade = new FadeEffect({ color: 'white', speed: 0.005 });
        this.hyperSkillFlash = new FadeEffect({ color: 'white', speed: 0.035 });
        this.hyperSkillTriggered = false;

        this.soundSelect = document.querySelector('audio#sound-select');
        this.soundChoose = document.querySelector('audio#sound-choose');

        this.entities = new EntityList();
        this.entitiesBackground = new EntityList();
        this.entitiesForeground = new EntityList();
        this.stage = this.getStageMap();
        this.fightOver = false;
        this.statsBar = new StatusBar(this.game, this.fighters);
        this.inGame = true;
        this.winFlashred = false;
        this.timeFlashTimer = 0;
        this.useFlashFrames = false;
        this.winFlashStartTime = 0;
        // win slow-motion effect guards
        this.winSlowTimeoutId = null;
        this.winFinishTriggered = false;
        this.names = gameState.fighters.map(({ id }) => `${id.toLowerCase()}Big`)
        this.frames = new Map([
        
                    //Char Select Big imgs
                     ['unknownBig', [16, 739, 100, 100]],
                     ['malupitonBig', [117, 739, 100, 100]],
                     ['babygiantBig', [218, 739, 100, 100]],
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


                ]);

        this.fighters = this.getFighterEntities();
        this.camera = new Camera(STAGE_MID_POINT + STAGE_PADDING - 192, 16, this.fighters);
        this.shadows = this.fighters.map(fighter => new Shadow(fighter));

        
        // Initialize AI to control player 2 (index 1)
        this.enemyAI = new EnemyAI(this.fighters[1], this.fighters[0], gameState.difficulty);
        this.enemyAI2 = new EnemyAI(this.fighters[0], this.fighters[1], gameState.difficulty);
            
        this.overlays = [
           // new StatusBar(this.game, this.fighters),
           // new FpsCounter(),
            this.statsBar,
            // show player combos (left for P1, right for P2)
            new ComboOverlay(this.fighters),
        ];
        this.resetBattle();
      
    }

    getFighterEntityClass(id){
        switch (id) {
            case FighterId.MALUPITON:
                return Malupiton;
            case FighterId.GOLEM:
                return Golem;
            default:
                 control.showNotice(`${id} not yet available.`);
                throw new Error('Unimplemented fighter entity request!');
        }
    }

    getStageMap(){
        const stage = gameState.stage;
        switch (stage) {
            case 'litex':
                return new payatasStage;
            case 'pasay':
                return new pasayStage;
            case 'bohol':
                return new boholStage;
            case 'tondo':
                return new tondoStage;
            case 'final':
                return new finalStage;
            default:
                throw new Error('Unimplemented Map entity request!');
        }
    }

    getFighterEntity(fighterState, index){
        const FighterEntityClass = this.getFighterEntityClass(fighterState.id, this.game);

        return new FighterEntityClass(index, this.handleAttackHit.bind(this), this.handleEffectSplash.bind(this), this.entities, this.entitiesForeground);
    }

    getFighterEntities(){
        const fighterEntities = gameState.fighters.map(this.getFighterEntity.bind(this));
        fighterEntities[0].opponent = fighterEntities[1];
        fighterEntities[1].opponent = fighterEntities[0];

        if (gameState.fighters[0].id === gameState.fighters[1].id ) {
        fighterEntities[1].applyPalette("normal"); 
    }

        return fighterEntities;
    }

    getHitSplashClass(strength){
        switch(strength){
            case FighterAttackStrength.LIGHT:
                return LightHitSplash;
            case FighterAttackStrength.HEAVY:
                return HeavyHitSplash;
            case FighterAttackStrength.HEAVYKICK:
                return HeavyHitSplash;
            case FighterAttackStrength.KNOCKLIFT:
            case FighterAttackStrength.KNOCKUP:
            case FighterAttackStrength.KNOCKLIFTDOWN:
                return HeavyHitSplash;
            case FighterAttackStrength.SUPER1:
                return GreenHitSplash;
            case FighterAttackStrength.SUPER2:
                return FlameHitSplash;
            case FighterAttackStrength.BLOCK:
                return BlockHitSplash;
            case FighterAttackStrength.SLASH:
                return SlashHitSplash;
            default:
                throw new Error('Unknown strength requested');

        }
    }

    getEffectSplashClass(effect){
        switch(effect){
            case "groundShake":
                return GroundShakeSplash;
            case "groundSmoke":
                return GroundSmokeSplash;
            default:
                throw new Error('Unknown Effect requested');

        }
    }

    resetBattle() {
   // this.fighters = this.getFighterEntities();
   // this.camera = new Camera(STAGE_MID_POINT + STAGE_PADDING - 192, 16, this.fighters);
    // this.shadows = this.fighters.map(fighter => new Shadow(fighter));
    this.hurtTimer = undefined;
    this.hyperSkillTriggered = false;
    this.fighterDrawOrder = [0, 1];
  //  this.enemyAI = new EnemyAI(this.fighters[1], this.fighters[0]);
   // this.statsBar = new StatusBar(this.game, this.fighters);
   // this.overlays = [new FpsCounter(), this.statsBar];
    this.fightOver = false;
    this.inGame = true;
    gameState.fighters[0].skillConsumed = true;
    gameState.fighters[1].skillConsumed = true;
    // reset combo trackers
    gameState.fighters[0].comboCount = 0;
    gameState.fighters[0].lastHitTime = 0;
    gameState.fighters[0].comboExpiresAt = 0;
    gameState.fighters[1].comboCount = 0;
    gameState.fighters[1].lastHitTime = 0;
    gameState.fighters[1].comboExpiresAt = 0;
    console.log('Reset Battle');
    this.statsBar.resetBattle();
    controlHistory[0].time = 0;
    controlHistory[1].time = 0;
    // Clear any lingering held inputs (safeguard in case inputs were left active)
    try {
        heldKeys.clear();
        pressedKeys.clear();
    } catch (e) {
        // ignore
    }
    if (this.enemyAI && typeof this.enemyAI.resetInputs === 'function') this.enemyAI.resetInputs();
    if (this.enemyAI2 && typeof this.enemyAI2.resetInputs === 'function') this.enemyAI2.resetInputs();

    // Ensure any pending slow-win timeout is cleared and timing state is restored
    if (this.winSlowTimeoutId) {
        clearTimeout(this.winSlowTimeoutId);
        this.winSlowTimeoutId = null;
    }
    this.timeScale = 1;
    gameState.slowFX = 1;
    this.winFinishTriggered = false;
}

handleFlash() {
        this.fade.fadeIn(); 
    }
    handleHyperSkillFlash() {
        this.hyperSkillFlash.fadeIn(); 
    }


    handleAttackHit(time, playerId, opponentId, position, strength, direction){
         
        gameState.fighters[playerId].score += FighterAttackBaseData[strength].score;
        gameState.fighters[playerId].skillPoints += FighterAttackBaseData[strength].skill;
        gameState.fighters[opponentId].hitPoints -= FighterAttackBaseData[strength].damage;
        gameState.fighters[opponentId].skillPoints += 2;

        this.hurtTimer = time.previous + (FIGHTER_HURT_DELAY * FRAME_TIME);
        this.fighterDrawOrder = [opponentId, playerId];
        // update combo state for the player who landed the hit
        try {
            const now = time.previous;
            const attacker = gameState.fighters[playerId];
            // don't count BLOCK as a combo-increasing hit
            if (strength !== FighterAttackStrength.BLOCK) {
                if (!attacker.lastHitTime || (now - attacker.lastHitTime) > 3000) {
                    attacker.comboCount = 1; // start a new combo
                } else {
                    attacker.comboCount = (attacker.comboCount || 0) + 1; // continue combo
                }
                attacker.lastHitTime = now;
                attacker.comboExpiresAt = now + 3000; // 3 second cooldown
            }
        } catch (e) {
            // fail silently if state is not available
        }

        // if position is missing (e.g. special entities), still proceed with combo update
        if (position) {
            this.entities.add(this.getHitSplashClass(strength), time, position.x, position.y, playerId, direction);
        }
        try {
            const now = time.previous;
            const attacker = gameState.fighters[playerId];
            // don't count BLOCK as a combo-increasing hit
            if (strength !== FighterAttackStrength.BLOCK) {
                if (!attacker.lastHitTime || (now - attacker.lastHitTime) > 2000) {
                    //attacker.comboCount = 1; // start a new combo
                } else {
                   // attacker.comboCount = (attacker.comboCount || 0) + 1; // continue combo
                }
                attacker.lastHitTime = now;
                attacker.comboExpiresAt = now + 1500; // 3 second cooldown
            }
        } catch (e) {
            // fail silently if state is not available
        }
    }

     handleEffectSplash(time, playerId, opponentId, position, effect, display, direction){
       
        this.fighterDrawOrder = [opponentId, playerId];
        if(!position) return;
        if(display === "foreground") this.entitiesForeground.add(this.getEffectSplashClass(effect), time, position.x, STAGE_FLOOR, playerId, direction);
        else if(display === "background") this.entitiesBackground.add(this.getEffectSplashClass(effect), time, position.x, STAGE_FLOOR, playerId, direction);
    }

    updateSpriteEntity(time, context){
        const player1 = this.fighters[0];
        const player2 = this.fighters[1];
        const sprite1 = gameState.fighters[0].sprite;
        const sprite2 = gameState.fighters[1].sprite;
        const hyperSprite1 = gameState.fighters[0].hyperSprite;
        const hyperSprite2 = gameState.fighters[1].hyperSprite;

        if(sprite1 === 1){
            
            this.entities.add(SuperHitSplash, time, player1.position.x, player1.position.y - 50, player1.playerId);
            
            gameState.fighters[0].sprite = 0;
        }
        if(sprite2 === 1){
            
            this.entities.add(SuperHitSplash, time, player2.position.x, player2.position.y - 50, player2.playerId);
            gameState.fighters[1].sprite = 0;
        }

        if(hyperSprite1 === 1){
            
            this.entities.add(HyperHitSplash, time, player1.position.x, player1.position.y - 50, player1.playerId);
            gameState.fighters[0].hyperSprite = 0;
        }

        if(hyperSprite2 === 1){
            
            this.entities.add(HyperHitSplash, time, player2.position.x, player2.position.y - 50, player2.playerId);
            gameState.fighters[1].hyperSprite = 0;
        }
        
        
    }

    updateFighters(time, context) {
            
                    for (const fighter of this.fighters) {
                     const startPressed = control.isControlPressed(fighter.playerId, Control.START);
                    const selectPressed = control.isControlPressed(fighter.playerId, Control.SELECT);
                        
                      //  console.log(gameState.pauseMenu.selectedMenu);
                        if(gameState.inputEnable){
                            
                            pollControl(time, fighter.playerId, FighterDirection);
                            if (!this.keyPressed) this.keyPressed = { start: false, select: false };
                        if(gameState.pauseMenu.showMoveList){
                                console.log('In Move List');
                                if (startPressed && !this.keyPressed.start && gameState.buttonHold) {
                                    console.log('Exiting Move List');
                                    gameState.fighters[fighter.playerId].pause = true;
                                    gameState.pauseMenu.selectPosition.y = 0;
                                    gameState.pauseMenu.showMoveList = false;
                                    this.keyPressed.start = true;
                                    playSound(this.soundSelect, 1);
                                    gameState.buttonHold = false;
                                }
                                 if (selectPressed && !this.keyPressed.select && gameState.buttonHold) {
                                    console.log('Page Next');
                                    this.statsBar.movelistPageIndex += 1;
                                    this.keyPressed.select = true;
                                    playSound(this.soundChoose, 1);
                                    gameState.buttonHold = false;gameState.buttonHold = false;
                                }
                                // SELECT button is handled by StatusBar.drawMoveList for pagination
                                // Reset button pressed states
                                if (!startPressed) this.keyPressed.start = false;
                                if (!selectPressed) this.keyPressed.select = false;
                                continue;
                            }
                    if (startPressed && !this.keyPressed.start && gameState.buttonHold) {
                                gameState.pauseMenu.select = true;
                    
                                gameState.fighters[fighter.playerId].pause = true;
                                playSound(this.soundSelect, 1);
                                //Reset buttonholds
                                gameState.buttonHold = false;
                                this.keyPressed.start = true;
                                if(gameState.pauseMenu.confirmSelection && gameState.pauseMenu.selectPosition.y === 0){
                                    gameState.pauseMenu.confirmSelection = false;
                                    gameState.pauseMenu.showMoveList = false;
                                    gameState.pauseMenu.selectPosition.x = 0;
                                    return;
                                }
                                 if(gameState.pauseMenu.selectPosition.y === 0 && gameState.pauseMenu.pauseGame && gameState.pauseMenu.select && !gameState.pauseMenu.confirmSelection){
                            gameState.pauseMenu.pauseGame = false;
                            this.statsBar.music.play();
                             this.statsBar.movelistPageIndex = 0;
                            gameState.pauseMenu.show = false;
                            gameState.pauseMenu.select = false;
                            gameState.fighters[0].pause = false;
                            gameState.fighters[1].pause = false;
                            
                            return;
                          }else if(gameState.pauseMenu.selectPosition.y === 1 && gameState.pauseMenu.select){
                               console.log('Change Character');
                               
                                if(!gameState.pauseMenu.confirmSelection) gameState.pauseMenu.selectedMenu = 'changeCharacter';
                                if(gameState.pauseMenu.confirmSelection && gameState.pauseMenu.selectedMenu === 'changeCharacter'){
                                     //transition countdown before set scene
                                    this.transitionCountdown = 4;
                                    this.handleFlash();
                                    gameState.pauseMenu.pauseGame = false;
                                    gameState.pauseMenu.confirmSelection = false;
                                    gameState.pauseMenu.show = false;
                                    gameState.pauseMenu.select = false;
                                    this.sceneChangeInfo = { SceneClass: CharacterSelect, args: [this.game, this.selectedCharacters] };
                                    this.statsBar.music.pause();
                                    return;
                                }else if(gameState.pauseMenu.confirmSelection && gameState.pauseMenu.selectedMenu === 'exit'){
                                    //transition countdown before set scene
                                    this.transitionCountdown = 4;
                                    this.handleFlash();
                                    gameState.pauseMenu.pauseGame = false;
                                    gameState.pauseMenu.confirmSelection = false;
                                    gameState.pauseMenu.show = false;
                                    gameState.pauseMenu.select = false;
                                    this.statsBar.music.pause();
                                    this.sceneChangeInfo = { SceneClass: MainMenu, args: [this.game, this.selectedCharacters] };
                                    return;
                                }
                                gameState.pauseMenu.confirmText = 'REPICK';
                                gameState.pauseMenu.selectPosition.y = 0;
                                gameState.pauseMenu.selectPosition.x = 35;
                                 gameState.pauseMenu.confirmSelection = true;
                               
                            } else if(gameState.pauseMenu.selectPosition.y === 2 && gameState.pauseMenu.select){
                                console.log('Showing Move List');
                                this.statsBar.movelistPageIndex = 0;
                                 gameState.pauseMenu.selectedMenu = 'moveList';
                                 
                                 gameState.pauseMenu.showMoveList = true;
                                
                                
                            } 
                          else if(gameState.pauseMenu.selectPosition.y === 4 && gameState.pauseMenu.select){
                                console.log('Quitting to main menu');
                                 gameState.pauseMenu.selectedMenu = 'exit';
                                 gameState.pauseMenu.confirmText = 'EXIT';
                                gameState.pauseMenu.confirmSelection = true;
                                gameState.pauseMenu.selectPosition.y = 0;
                                gameState.pauseMenu.selectPosition.x = 45;
                                
                            } 
                                if(!gameState.pauseMenu.pauseGame){
                                    console.log("pausing game");
                                    gameState.pauseMenu.pauseGame = true;
                                    gameState.pauseMenu.show = true;
                                }
                                
                          
                               
                            }
                            if( selectPressed && !this.keyPressed.select && gameState.buttonHold && gameState.pauseMenu.pauseGame && !gameState.pauseMenu.showMoveList) {
                                playSound(this.soundChoose, 1);
                                gameState.pauseMenu.selectPosition.y += 1;
                                //Reset buttonholds
                                this.keyPressed.select = true;
                                gameState.buttonHold = false;
                            }
                            //reset button pressed
                            gameState.pauseMenu.select = false;
        
                             if (!startPressed) this.keyPressed.start = false;
                            if (!selectPressed) this.keyPressed.select = false;
                        }
                    
            
                    if (this.paused) {
                        // Optional: still draw overlays like pause text
                       
                        continue;
                    }
                    
                
                
            
                            // Let AI control fighter 1 (index 1)
                if(this.statsBar.enemyStart === true){
                    if(gameState.bot.player2) this.enemyAI.update(time); 
                    if(gameState.bot.player1) this.enemyAI2.update(time);
                }
            
                    if (time.previous < this.hurtTimer) {
                        fighter.updateHurtShake(time, this.hurtTimer);
                    } else {
                        fighter.update(time, context, this.camera);
                    }
                }
            }

    updateShadows(time, context){
        for (const shadow of this.shadows){
            shadow.update(time, context, this.camera);
        }
    }

    updateOverlays(time, context){
        for (const overlay of this.overlays){
            overlay.update(time, context, this.camera);
        }
    }

    

    update(time, context){
     
        //camera shake
        // trigger a camera shake based on attack strength
        try {
            if (this.camera && typeof this.camera.shake === 'function') {
                if(gameState.cameraShake.enable){
                    this.camera.shake(gameState.cameraShake.intensity, gameState.cameraShake.duration);
                    gameState.cameraShake.enable = false;
                }
            }
        } catch (e) {
            // fail silently if camera or shake isn't available
        }

         this.fade.update(time);
         this.hyperSkillFlash.update(time);

        
        if (gameState.flash) {
            if (!this.hyperSkillTriggered && !this.hyperSkillFlash.active) {
                this.handleHyperSkillFlash();
                console.log('Hyper-skill flash fade-in triggered');
                this.hyperSkillTriggered = true;
            }
        }

        // If fade-in completed, ensure we fade out
        if (!gameState.flash) {
            if (this.hyperSkillTriggered && this.hyperSkillFlash.active) {
            
            this.hyperSkillFlash.fadeOut();
            console.log('Hyper-skill flash fade-out triggered');
            this.hyperSkillTriggered = false; // reset for next time
        }
    }


        // Handle countdown transition
        if (this.transitionCountdown > 0) {
            this.transitionCountdown -= time.secondsPassed;
            gameState.inputEnable = false;
            if (this.transitionCountdown <= 0 && this.sceneChangeInfo) {
                // Clear any lingering held inputs (safeguard in case inputs were left active)
                    try {
                        heldKeys.clear();
                        pressedKeys.clear();
                        console.log('Cleared held and pressed keys during scene transition');
                    } catch (e) {
                        // ignore
                        console.log('No held/pressed keys to clear during scene transition');
                    }
                    if (this.enemyAI && typeof this.enemyAI.resetInputs === 'function') this.enemyAI.resetInputs();
                    if (this.enemyAI2 && typeof this.enemyAI2.resetInputs === 'function') this.enemyAI2.resetInputs();
                // Only create the scene instance when countdown completes
                const newScene = new this.sceneChangeInfo.SceneClass(...this.sceneChangeInfo.args);
                this.game.setScene(newScene);
                console.log('Scene changed to:', newScene.constructor.name);
                this.sceneChangeInfo = null;
            }
        }

       
        const scaledTime = {
            ...time,
            secondsPassed: time.secondsPassed * this.timeScale
        };
        this.updateSpriteEntity(scaledTime, context);
        this.updateFighters(scaledTime, context);
        this.updateShadows(scaledTime, context);
         if(gameState.pauseMenu.pauseGame) return;
          gameState.fighters[0].pause = false;
          gameState.fighters[1].pause = false;
        this.stage.update(scaledTime);
        this.entities.update(scaledTime, context, this.camera);
        
        this.entitiesBackground.update(scaledTime, context, this.camera);
        this.entitiesForeground.update(scaledTime, context, this.camera);
        this.camera.update(scaledTime, context);
        this.updateOverlays(scaledTime, context);
        if(this.statsBar.fightOverTimer === 2 && this.statsBar.fightOver){
            if(gameState.fighters[0].wins === 2 || gameState.fighters[1].wins === 2)this.handleFlash();
        }
        if(this.statsBar.fightOverTimer === 9 && this.statsBar.fightOver){
            this.statsBar.fightOver = false;
             this.timeScale= 1;
            if(gameState.fighters[0].wins === 2 || gameState.fighters[1].wins === 2){
                
                this.handleFlash();
                if(gameState.fighters[0].wins === 2) gameState.gamePlayerWinned = 'P1';
                else if(gameState.fighters[1].wins === 2) gameState.gamePlayerWinned = 'P2';
                this.statsBar.enemyStart = false;
                gameState.slowFX = 1;
               
                // Ensure any held inputs (keyboard, touch, or AI-driven) are cleared so
                // controls won't remain active after the match finishes.
                try {
                    heldKeys.clear();
                    pressedKeys.clear();
                } catch (e) {
                    // heldKeys/pressedKeys may be undefined in some test contexts; ignore
                }

                if (this.enemyAI && typeof this.enemyAI.resetInputs === 'function') this.enemyAI.resetInputs();
                if (this.enemyAI2 && typeof this.enemyAI2.resetInputs === 'function') this.enemyAI2.resetInputs();

                this.resetBattle();

                this.game.setScene(new PrePostMatch(this.game, this.selectedCharacters));
            }
             gameState.fighters[0].hitPoints = HEALTH_MAX_HIT_POINTS;
             gameState.fighters[1].hitPoints = HEALTH_MAX_HIT_POINTS;
           
           this.resetBattle();
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

    drawFighters(context){
      for(const fighterId of this.fighterDrawOrder){
        this.fighters[fighterId].draw(context, this.camera);
    }
}
    drawShadows(context){
        for(const shadow of this.shadows){
        //shadow.draw(context, this.camera);
    }
    }

    drawOverlays(context){
        for(const overlay of this.overlays){
        overlay.draw(context, this.camera);
    }
    }

    drawBigImage(context){
        const x = gameState.pauseFrameMove;
        const x2 = -gameState.pauseFrameMove;
        const [name1, name2] = this.names;

   if(gameState.pause) {
   
    if(gameState.fighters[0].superAcivated)this.drawFrame(context,  name1, x, 20, 1, 1.5);
    if(gameState.fighters[1].superAcivated)this.drawFrame(context,  name2, x2 + 360, 20, -1, 1.5);
   }
}

drawHyperSkillBG(context){
        
        const hyperskillFrames = this.statsBar.hyperskillframe;

   if(gameState.pause) {
    this.drawFrame(context, `hyper${hyperskillFrames}`, 0, 0, 1);
   }
}

winFinish(){
    // Trigger a one-shot slow-motion effect when the match winner reaches 2 wins.
    // We guard so it only triggers once and restores back to normal after a short delay.
    if ((gameState.fighters[0].wins === 2 || gameState.fighters[1].wins === 2) && !this.winFinishTriggered) {
        // Mark that we've triggered the finish flow so we don't repeatedly restart timers
        this.winFinishTriggered = true;

        // Pause music once for the finish
        if (this.statsBar && this.statsBar.music && typeof this.statsBar.music.pause === 'function') {
            this.statsBar.music.pause();
        }

        // If the statsBar time is still counting down, bail out and don't slow right now
        if (this.statsBar && this.statsBar.time < 0) return;

        // Apply short slow motion
        this.timeScale = 0.2; // slow down updates/rendering by 70%
        gameState.slowFX = 2; // keep global slowFX consistent for animations

        // Clear any existing timeout to be safe
        if (this.winSlowTimeoutId) {
            clearTimeout(this.winSlowTimeoutId);
        }

        this.winSlowTimeoutId = setTimeout(() => {
            this.timeScale = 0.5;
            gameState.slowFX = 1.5;
            this.winSlowTimeoutId = null;
        }, 2000);
    }
}

winFlash(time){
    if(this.winFlashred){
        
        if(time.previous - this.winFlashStartTime > 1000) {
            this.winFlashred = false;
            return;
        }
        
        if(time.previous > this.timeFlashTimer + TIME_FLASH_DELAY) {
                    
                    this.useFlashFrames = !this.useFlashFrames;
                    this.timeFlashTimer = time.previous;
                }
    }
}

    WinCondition(time){
        this.winFinish();
        this.winFlash(time);
    if (gameState.fighters[1].hitPoints <= 0 && !this.fightOver && !this.statsBar.fightOver) {
        this.winFlashred = true;
        this.winFlashStartTime = time.previous;
        this.statsBar.fightOverTimer = 0;
        gameState.fighterNotIdle = false;
        this.statsBar.enemyStart = false;
        this.statsBar.fightOver = true;
        this.fightOver = true;
         this.statsBar.winSituation = 'P1WIN';
        console.log('P1 Win');
        this.statsBar.gameIn = false;
        gameState.fighters[0].wins += 1;

        //deadState
        gameState.fighters[1].dead = "dead";
        if(gameState.fighters[0].hitPoints === HEALTH_MAX_HIT_POINTS) gameState.fighters[0].perfectHP = true;
        return;
    }
    if (gameState.fighters[0].hitPoints <= 0 && !this.statsBar.fightOver && !this.fightOver) {
         this.winFlashred = true;
         this.winFlashStartTime = time.previous;
       
        this.statsBar.fightOverTimer = 0;
        gameState.fighterNotIdle = false;
        this.statsBar.enemyStart = false;
        this.statsBar.fightOver = true;
        this.fightOver = true;
        this.statsBar.winSituation = 'P2WIN';
        console.log('P2 Win');
        this.statsBar.gameIn = false;
        gameState.fighters[1].wins += 1;

        //deadState
        gameState.fighters[0].dead = "dead";
        if(gameState.fighters[1].hitPoints === HEALTH_MAX_HIT_POINTS) gameState.fighters[1].perfectHP = true;
        return;
    }

    if(this.statsBar.time < 0 && !this.statsBar.fightOver && !this.fightOver){
        if(gameState.fighters[0].hitPoints === gameState.fighters[1].hitPoints){
            this.statsBar.fightOver = true;
            this.fightOver = true;
            this.statsBar.enemyStart = false;

            gameState.fighterNotIdle = false;

            console.log('draw');
            this.statsBar.winSituation = 'DRAW';
           
            console.log(gameState.fighters[0].hitPoints,gameState.fighters[1].hitPoints);
            console.log(gameState.fighters[0].wins, "P1win");
            console.log(gameState.fighters[1].wins, "P2win");
        }
        if(gameState.fighters[0].hitPoints > gameState.fighters[1].hitPoints){
            gameState.fighters[0].wins += 1;
            this.statsBar.fightOver = true;
            this.fightOver = true;
           gameState.fighterNotIdle = false;
            this.statsBar.winSituation = 'P1WIN';
            this.statsBar.enemyStart = false;
             console.log('P1 win');
             
             //deadState
             gameState.fighters[1].dead = "dead";
              
             console.log(gameState.fighters[0].hitPoints,gameState.fighters[1].hitPoints);
            console.log(gameState.fighters[0].wins, "P1win");
        console.log(gameState.fighters[1].wins, "P2win");
        } else if (gameState.fighters[0].hitPoints < gameState.fighters[1].hitPoints){
            gameState.fighters[1].wins += 1;
            this.statsBar.fightOver = true;
            this.fightOver = true;
            gameState.fighterNotIdle = false;
            //deadState
             gameState.fighters[0].dead = "dead";

            this.statsBar.winSituation = 'P2WIN';
            this.statsBar.enemyStart = false;
            console.log('P2 win');

             console.log(gameState.fighters[0].hitPoints,gameState.fighters[1].hitPoints);
            console.log(gameState.fighters[0].wins, "P1win");
        console.log(gameState.fighters[1].wins, "P2win");
        }
    }
}

    draw(context, time){
      //  console.log(this.statsBar.timerDelay);
        this.stage.drawBackground(context, this.camera);
        //When Super Activates
         if (gameState.pause) { // P or ESC to pause
            this.paused = true;
            this.statsBar.timerDelay = 0;
               // this.timeScale = 0.3;
                context.fillStyle = 'rgba(0, 0, 0, 0.60)';
              context.fillRect(0, 0, 400, 400);
               console.log('paused');
            } else {
                this.paused = false;
                 
               // this.timeScale = 1;
            }
            if(gameState.hyperSkill) this.drawHyperSkillBG(context);
        this.drawBigImage(context);
        
        this.drawShadows(context);
        // Draw hyperskill flash effect when active (triggered in update())
        if(this.hyperSkillFlash.active)this.hyperSkillFlash.draw(context, 400, 400);
        
        if(this.winFlashred){
            if(this.useFlashFrames){
                context.fillStyle = 'rgba(255, 0, 0, 1)';
            } else {
                context.fillStyle = 'rgba(255, 255, 255, 1)';
            }
            context.fillRect(0, 0, 400, 400);
        }
        this.entitiesBackground.draw(context, this.camera);
        this.drawFighters(context);
        this.entitiesForeground.draw(context, this.camera);
        this.entities.draw(context, this.camera);
        this.stage.drawForeground(context, this.camera);

        this.drawOverlays(context);
         this.WinCondition({previous: performance.now()});
        this.fade.draw(context, 400, 400);
         //Show when Paused
                if (gameState.pauseMenu.pauseGame) { 
                    this.paused = true;
                    }
       
    }
}



