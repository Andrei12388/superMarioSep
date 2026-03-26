import { gameState } from "../state/gameState.js";

export class FpsCounter {
    constructor(){
        this.fps = 0;
    }
    update(time){
        this.fps = Math.trunc(1 / time.secondsPassed);
    }
    draw(context) {
    if (!gameState.FpsCounterEnable) return;

    context.font = "12px Arial";
    context.textAlign = "center";

    // Outline
    context.lineWidth = 3;
    context.strokeStyle = "black";
    context.strokeText(`${this.fps}`, 15, 15);

    // Fill
    context.fillStyle = "yellow";
    context.fillText(`${this.fps}`, 15, 15);
}

}