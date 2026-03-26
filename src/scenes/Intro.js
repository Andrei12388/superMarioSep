
import { Control } from '../constants/control.js';
import { IntroBG, IntroScreen } from '../entities/IntroScreen.js';
import { playSound, stopSound } from '../soundHandler.js';
import { gameState } from '../state/gameState.js';
import { CharacterSelect } from './CharacterSelect.js';
import * as control from '../inputHandler.js'; 
import { MainMenu } from './MainMenu.js';



export class Intro {
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

        

        this.introScreen = new IntroScreen(this.game, this.fighters);
        this.entities = [
            new IntroBG(),
            this.introScreen,
        ];
    }

    
    startTimer(time) {
    if (this.screenFlashTrigger === true && gameState.gameStarted) {
        this.flashScreen = true;
        this.screenTimer = Math.min(this.screenTimer + (1 * 60) * time.secondsPassed, this.screenTimerMax);

        if (this.screenTimer >= this.screenTimerMax) {
            this.flashAlpha = 1;

            // SAFETY CHECK: only go to MainMenu if a valid start was made
            if (this.introScreen.gameStart) {
                this.game.setScene(new MainMenu(this.game));
            } else {
                console.warn("Prevented scene switch — no valid credit/game start flag.");
            }

            this.flash = false;
            this.screenFlashTrigger = false;
            console.log('exit');
        }
    }

    // Reset flash gradually if trigger is false
    if (this.screenFlashTrigger === false) {
        this.screenTimer = Math.max(this.screenTimer - (1 * 60) * time.secondsPassed, 0);
        if (this.screenTimer <= 0) {
            this.flash = false;
            this.screenFlashTrigger = false;
            this.flashScreen = false;
            this.flashAlpha = 1;
            console.log('False');
        }
    }
}


    updateEntities(time, context) {
        for (const entity of this.entities) {
            entity.update(time, context, this.camera);
        }
    }

    handleFlash() {
    if (!gameState.gameStarted) return; // ✅ ignore if not started
    this.screenFlashTrigger = true;
    this.flashScreen = true;
    this.flash = true;
}


    
        handleInput(playerId) {
    // Use a static map to track if START or SELECT were already pressed
    if (!this.keyPressed) this.keyPressed = { start: false, select: false };

    const startPressed = control.isControlPressed(playerId, Control.START);
    const selectPressed = control.isControlPressed(playerId, Control.SELECT);

  
    if (startPressed && !this.keyPressed.start && gameState.kapeCom) {
    this.keyPressed.start = true;

    if (gameState.credits >= 1) {
    gameState.credits -= 1;
    gameState.gameStarted = true; 
    playSound(this.soundSelect, 1);
    this.introScreen.stopwatch = 11;
    this.introScreen.time = 0;
    this.introScreen.gameStart = true;
    this.introScreen.insertCoin = false;
    this.introScreen.timeDraw = true;
    this.introScreen.kapecomPresent = false;
    stopSound(this.musicIntro);
}
 else {
        
        playSound(this.soundChoose, 1);
        console.warn("No credits available, cannot start game!");
        return; 
    }
}

    
    if (selectPressed && !this.keyPressed.select && gameState.kapeCom) {
        this.keyPressed.select = true;
        gameState.credits += 1;

        playSound(this.soundSelect, 1);

        // optional visual feedback for coin insert
        this.introScreen.stopwatch = 11;
        this.introScreen.time = 10;
        this.introScreen.gameStart = true;
        this.introScreen.insertCoin = false;
        this.introScreen.timeDraw = true;
        this.introScreen.kapecomPresent = false;

        stopSound(this.musicIntro);
    }

    // --- Reset flags when buttons are released ---
    if (!startPressed) this.keyPressed.start = false;
    if (!selectPressed) this.keyPressed.select = false;
}


    update(time, context) {
         this.handleInput(0);
        this.handleInput(1);
        this.updateEntities(time, context);
         if(this.flashScreen)this.startTimer(time);

        // Check if time reached -1
       if (this.introScreen.time <= -1 && !this.nextScene) {
    if (gameState.gameStarted) { // ✅ only if game actually started
        console.log('times up!');
        this.handleFlash();
        playSound(this.soundStart, 1);
        stopSound(this.musicIntro);
        this.nextScene = true;
    } else {
        console.log('Cannot transition — no credits or game not started!');
    }
}


        
    }

  drawFlash(context, time){
    if (this.flash === true){
    this.flashAlpha = Math.min(this.flashAlpha + (0.1 * 60) * time.secondsPassed, 1);
    context.globalAlpha = this.flashAlpha;
     context.fillStyle = "rgb(0, 0, 0)";
     context.fillRect(0, 0, 400, 400);
     console.log('flash enable');
    }
    if (this.flash === false){
        this.screenFlashTrigger = false;
        this.flashAlpha = Math.max(this.flashAlpha - (0.1 * 60) * time.secondsPassed, 0);
        context.globalAlpha = this.flashAlpha;
        context.fillStyle = "rgb(0, 0, 0)";
        context.fillRect(0, 0, 400, 400);
        console.log('flash out');
    }
     context.globalAlpha = 1;
    
}

    drawEntities(context, time) {
        for (const entity of this.entities) {
            entity.draw(context, time, this.camera);
        }
    }

   

    draw(context, time) {
        
        this.drawEntities(context, time);
        
        
         if(this.flashScreen)this.drawFlash(context, time);
        
    }
    
}

