
import { Control } from '../constants/control.js';

import { playSound, stopSound } from '../soundHandler.js';
import { gameState } from '../state/gameState.js';
import { CharacterSelect } from './CharacterSelect.js';
import * as control from '../inputHandler.js'; 
import { MainMenuIntroBG, MainMenuScreen } from '../entities/MainMenuScreen.js';
import { FadeEffect } from './utils/FadeEffect.js';
import { Intro } from './Intro.js';
import { BattleScene } from './Battlescene.js';
import { OptionsMenu } from './OptionsMenu.js';



export class MainMenu {
    entities = [];

    constructor(game) {
        gameState.practiceMode.enabled = false;
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

        this.fade = new FadeEffect({ color: 'black', speed: 0.05 });

        this.introScreen = new MainMenuScreen(this.game, this.fighters);
        this.entities = [
            new MainMenuIntroBG(),
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
    
    gameState.buttonHold = false;

    if(!this.introScreen.vsMode){
            if(this.introScreen.pointer.cursor === 0){
                //if(this.fade.done) this.game.setScene(new Intro(this.game));
                //this.handleFlash();
                control.showNotice(`Story Mode not yet available.`);
                 console.log("Start mode selected");
            } else if (this.introScreen.pointer.cursor === 1){
               //if(this.fade.done) this.game.setScene(new CharacterSelect(this.game));
                 this.introScreen.pointer.y = 108;
                 this.introScreen.pointer.x = 95;
                 this.introScreen.pointer.cursor = 0;
               this.introScreen.vsMode = true;
                console.log("Vs mode selected");
        } else if (this.introScreen.pointer.cursor === 2){
          //  if(this.fade.done) this.game.setScene(new BattleScene(this.game));
          this.handleFlash();
                console.log("Practice mode selected");
        } else if (this.introScreen.pointer.cursor === 3){
            this.handleFlash();
           if(this.fade.done) this.game.setScene(new OptionsMenu(this.game));
                console.log("Options selected");
    }
} else {
     if(this.introScreen.pointer.cursor === 0){
            gameState.bot.player1 = false;
            gameState.bot.player2 = false;
                this.handleFlash();
                 console.log("PVP Selected");
            } else if (this.introScreen.pointer.cursor === 1){
                 gameState.bot.player1 = false;
            gameState.bot.player2 = true;
               this.handleFlash();
                console.log("P VS Cpu selected");
        } else if (this.introScreen.pointer.cursor === 2){
             gameState.bot.player1 = true;
            gameState.bot.player2 = true;
          this.handleFlash();
                console.log("CPU vs CPU Selected");
        } else if (this.introScreen.pointer.cursor === 3){
            this.introScreen.vsMode = false;
            this.introScreen.pointer.y = 108;
            this.introScreen.pointer.x = 135;
                 this.introScreen.pointer.cursor = 0;
                console.log("Vs mode Back");
    }
}
    
}

    
    if (selectPressed && !this.keyPressed.select && gameState.buttonHold) {
        this.keyPressed.select = true;
        this.introScreen.pointer.y += 15;
        this.introScreen.pointer.cursor += 1;
        if(this.introScreen.pointer.y > 165){
            this.introScreen.pointer.y = 108;
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
if(!this.introScreen.vsMode){
 if(this.introScreen.pointer.cursor === 0){
                if(this.fade.done) this.game.setScene(new Intro(this.game));
               
                 
            } else if (this.introScreen.pointer.cursor === 1){
                
        } else if (this.introScreen.pointer.cursor === 2){
            gameState.practiceMode.enabled = true;
            if(this.fade.done) this.game.setScene(new CharacterSelect(this.game));
   
        } else if (this.introScreen.pointer.cursor === 3){
    
           if(this.fade.done) this.game.setScene(new OptionsMenu(this.game));
              
    }
} else {
    if(this.introScreen.pointer.cursor === 0){
            gameState.bot.player1 = false;
            gameState.bot.player2 = false;
                if(this.fade.done) this.game.setScene(new CharacterSelect(this.game));
               gameState.practiceMode.enabled = false;
                 console.log("PVP Selected");
            } else if (this.introScreen.pointer.cursor === 1){
                 gameState.bot.player1 = false;
            gameState.bot.player2 = true;
               if(this.fade.done) this.game.setScene(new CharacterSelect(this.game));
               gameState.practiceMode.enabled = false;
                console.log("P VS Cpu selected");
        } else if (this.introScreen.pointer.cursor === 2){
             gameState.bot.player1 = true;
            gameState.bot.player2 = true;
          if(this.fade.done) this.game.setScene(new CharacterSelect(this.game));
          gameState.practiceMode.enabled = false;
                console.log("CPU vs CPU Selected");
        } 
}
         this.handleInput(0);
        this.handleInput(1);
        this.updateEntities(time, context);
         if(this.flashScreen)this.startTimer();
    }

    drawEntities(context, time) {
        for (const entity of this.entities) {
            entity.draw(context, time, this.camera);
        }
    }

   

    draw(context, time) {
        
        this.drawEntities(context, time);
        this.fade.draw(context, 400, 400);
        
    }
    
}

