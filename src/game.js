
import { pollGamepads, registerGamepadEvents, registerKeyboardEvents } from './inputHandler.js';

import { registerScreenButtonEvents } from './inputHandler.js';
import * as control from './inputHandler.js'; 
import { getContext } from './utils/context.js';
import { BattleScene } from './scenes/Battlescene.js';
import { Intro } from './scenes/Intro.js';
import { CharacterSelect } from './scenes/CharacterSelect.js';
import { PrePostMatch } from './scenes/PrePostMatch.js';
import { MainMenu } from './scenes/MainMenu.js';
import { OptionsMenu } from './scenes/OptionsMenu.js';
import { Disclaimer } from './scenes/Disclaimer.js';
import { FpsCounter } from './entities/FpsCounter.js';
import { PracticeBattleScene } from './scenes/PracticeBattlescene.js';
import { MarioScene } from './scenes/MarioScene.js';

const selectedCharacters = [
    { 
        name: "Malupiton", 
        namePos: 5,
        sayings: 'Sabi ko naman sayo burger ka saken',
        color: "gray", 
        imageSml: 'malupitonSmall', 
        imageBig: 'malupitonBig',
        voice: 'voice-malupiton',
    },
    { 
        name: "Golem", 
        color: "gray", 
        namePos: 5,
        sayings: 'Sabi ko naman sayo burger ka saken',
        imageSml: 'malupitonSmall', 
        imageBig: 'malupitonBig',
        voice: 'voice-malupiton',
    }
];

export class JSGame{
     context = getContext();
    
    frameTime ={
        previous: 0,
        secondsPassed: 0,
    };

    constructor(){
        this.fpsCounter = new FpsCounter();
        
        //Mainscenes
//this.scene = new Intro(this);
//this.scene = new Disclaimer(this, selectedCharacters);
this.scene = new MainMenu(this);
//this.scene = new OptionsMenu(this);
//this.scene = new BattleScene(this, selectedCharacters);
//this.scene = new MarioScene(this)
 //this.scene = new CharacterSelect(this);
// this.scene = new PrePostMatch(this, selectedCharacters);

//practice mode scene
//this.scene = new PracticeBattleScene(this, selectedCharacters);
    }

    setScene(newScene) {
        this.scene = newScene;
    };
    

frame(time){
    window.requestAnimationFrame(this.frame.bind(this));
    
    this.frameTime ={
        secondsPassed: (time - this.frameTime.previous)/1000,
        previous: time,
    }
    control.pollGamepads();
    
   this.scene.update(this.frameTime, this.context);
   this.scene.draw(this.context, this.frameTime);
   this.fpsCounter.update(this.frameTime);
   this.fpsCounter.draw(this.context);
  
    }

start(){
    control.registerGamepadEvents();
    control.registerKeyboardEvents();
    control.registerScreenButtonEvents();
    //document.addEventListener('submit', this.handleFormSubmit.bind(this));
    window.requestAnimationFrame(this.frame.bind(this));
}
}