
import { Control } from '../constants/control.js';

import { playSound, stopSound } from '../soundHandler.js';
import { gameState } from '../state/gameState.js';
import { CharacterSelect } from './CharacterSelect.js';
import * as control from '../inputHandler.js'; 
import { MainMenuIntroBG, MainMenuScreen } from '../entities/MainMenuScreen.js';
import { FadeEffect } from './utils/FadeEffect.js';
import { Intro } from './Intro.js';
import { BattleScene } from './Battlescene.js';
import { OptionsMenuIntroBG, OptionsMenuScreen } from '../entities/OptionsMenuScreen.js';
import { MainMenu } from './MainMenu.js';



export class OptionsMenu {
    entities = [];

    constructor(game) {
        this.game = game; // store reference to main game
        this.image = document.querySelector('img[alt="misc"]');
        this.flashAlpha = 0;
        this.screenTimer = 0;
        this.screenTimerMax = 25;
        this.soundSelect = document.querySelector('audio#sound-select');
        this.soundChoose = document.querySelector('audio#sound-choose');
        this.nextScene = false;
        this.musicIntro = document.querySelector('audio#music-intro');
        this.soundStart = document.querySelector('audio#game-start');
        this.difficulty = gameState.difficultyIndex;
        

        this.fade = new FadeEffect({ color: 'black', speed: 0.05 });

        this.introScreen = new OptionsMenuScreen(this.game, this.fighters);
        this.entities = [
            new OptionsMenuIntroBG(),
            this.introScreen,
        ];
    }


    updateEntities(time, context) {
        for (const entity of this.entities) {
            entity.update(time, context, this.camera);
        }
    }

    handleFlash() {
        this.fade.fadeIn(); 
        
    }
    
        handleInput(playerId) {
    // Use a static map to track if START or SELECT were already pressed
    if (!this.keyPressed) this.keyPressed = { start: false, select: false };

    const startPressed = control.isControlPressed(playerId, Control.START);
    const selectPressed = control.isControlPressed(playerId, Control.SELECT);
            
    if (startPressed && !this.keyPressed.start && gameState.buttonHold) {
    this.keyPressed.start = true;
    this.nextScene = true;
        
    gameState.gameStarted = true; 
    playSound(this.soundSelect, 1);
    stopSound(this.musicIntro);
    if (this.introScreen.pointer.cursor === 5) this.handleFlash();

    
            if(this.introScreen.pointer.cursor === 0){
                
                this.difficulty += 1;
                gameState.difficultyIndex += 1;
                if (this.difficulty > 4){
                    this.difficulty = 0;
                    gameState.difficultyIndex = 0;
                } 
            } else if (this.introScreen.pointer.cursor === 1){
                gameState.shadowInvert = !gameState.shadowInvert;
              
            } else if (this.introScreen.pointer.cursor === 2){
               
                gameState.skillNumber += 1;
                if (gameState.skillNumber > 3)gameState.skillNumber = 0;
            } else if (this.introScreen.pointer.cursor === 3){
                
                gameState.gamepadSwitchPlayer = !gameState.gamepadSwitchPlayer;
            } else if (this.introScreen.pointer.cursor === 4){
                 gameState.FpsCounterEnable = !gameState.FpsCounterEnable;
            }
            
            gameState.buttonHold = false;
}

    
    if (selectPressed && !this.keyPressed.select && gameState.buttonHold) {
        this.keyPressed.select = true;
        this.introScreen.pointer.y += 15;
        this.introScreen.pointer.cursor += 1;
        if(this.introScreen.pointer.y > 110){
            this.introScreen.pointer.y = 33;
            this.introScreen.pointer.cursor = 0;
        }
        gameState.credits += 1;

        playSound(this.soundChoose, 1);
        stopSound(this.musicIntro);
        gameState.buttonHold = false;
    }

    // --- Reset flags when buttons are released ---
    if (!startPressed) this.keyPressed.start = false;
    if (!selectPressed) this.keyPressed.select = false;
}


    update(time, context) {
        this.fade.update(time);
        
        if(this.difficulty === 0) gameState.difficulty = 'easy';
        else if(this.difficulty === 1) gameState.difficulty = 'normal';
        else if(this.difficulty === 2) gameState.difficulty = 'hard';
        else if(this.difficulty === 3) gameState.difficulty = 'expert';
        else if(this.difficulty === 4) gameState.difficulty = 'insane';
              
       if (this.introScreen.pointer.cursor === 5){
            if(this.fade.done) this.game.setScene(new MainMenu(this.game));
}
         this.handleInput(0);
        this.handleInput(1);
        this.updateEntities(time, context);
         if(this.flashScreen)this.startTimer();
    }

    drawEntities(context) {
        for (const entity of this.entities) {
            entity.draw(context, this.camera);
        }
    }

   

    draw(context, time) {
        
        this.drawEntities(context);
        this.fade.draw(context, 400, 400);
        
    }
    
}

