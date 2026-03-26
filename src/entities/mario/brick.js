import { playSound } from '../../soundHandler.js';
export class Brick {
    constructor(game, x, y) {
        this.game = game;

        this.position = { x, y };
        this.velocity = { x: 0, y: 0 };
        this.soundBrick = document.querySelector('audio#sound-brick');

        this.image = document.querySelector('img[alt="mario"]');

        this.isBroken = false;
        this.breakTimer = 0;
        this.breakDuration = 20;
        this.remove = false;

        // Simple brick frame (adjust to your sprite sheet)
        this.frames = new Map([
            ['brick', [[16, 150, 16, 16]]], // CHANGE coords if needed
        ]);

        this.currentAnimationKey = 'brick';
        this.animationFrame = 0;

        // Collision box
        this.box = {
            x: 0,
            y: 0,
            width: 16,
            height: 16
        };
    }

    getWorldBox() {
        return {
            x: this.position.x + this.box.x,
            y: this.position.y + this.box.y,
            width: this.box.width,
            height: this.box.height
        };
    }

    break() {
        if (this.isBroken) return;

        this.isBroken = true;
        this.breakTimer = 0;
        playSound(this.soundBrick, 1)
       
        console.log("Brick broken!");
    }

    update() {
        if (this.isBroken) {
            this.breakTimer++;

            // simple "pop" effect
            this.position.y -= 1;

            if (this.breakTimer >= this.breakDuration) {
                this.remove = true;
            }
        }
    }

    draw(context, stage) {
        if (this.isBroken) return;

        const [sx, sy, sw, sh] = this.frames.get(this.currentAnimationKey)[0];

        context.drawImage(
            this.image,
            sx, sy, sw, sh,
            this.position.x - stage.x,
            this.position.y - stage.y,
            sw, sh
        );
    }

    drawDebug(context, stage) {
        const box = this.getWorldBox();

        context.strokeStyle = 'orange';
        context.strokeRect(
            box.x - stage.x,
            box.y - stage.y,
            box.width,
            box.height
        );
    }
}