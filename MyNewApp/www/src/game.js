
import * as control from './inputHandler.js'; 
import { getContext } from './utils/context.js';
import { MainMenu } from './scenes/MainMenu.js';
import { FpsCounter } from './entities/FpsCounter.js';
import { MarioScene } from './scenes/MarioScene.js';


export class JSGame{
     context = getContext();
    
    frameTime ={
        previous: 0,
        secondsPassed: 0,
    };

    constructor(){
        this.fpsCounter = new FpsCounter();
        
        //Mainscenes

this.scene = new MainMenu(this);

//this.scene = new MarioScene(this)

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
    
    window.requestAnimationFrame(this.frame.bind(this));
}
}