import { playSound } from '../../soundHandler.js';
import { gameState } from '../../state/gameState.js';
import { BrickDebris } from './brokenDebris.js';
export class Brick {
    constructor(game, x, y, color = 'brown') {
        this.game = game;

        this.position = { x, y };
        this.velocity = { x: 0, y: 0 };
        this.soundBrick = document.querySelector('audio#sound-brick');
         this.soundBump = document.querySelector('audio#sound-bump');

        this.image = document.querySelector('img[alt="mario"]');

        this.isBroken = false;
        this.bouncing = false;
        this.bounceY = 0;
        this.bounceSpeed = -2;
        this.gravity = 0.2;
        this.brickColor = color;
        this.breakTimer = 0;
        this.breakDuration = 20;
        this.remove = false;

        // Simple brick frame (adjust to your sprite sheet)
        this.frames = new Map([
            ['brown', [[16, 150, 16, 16]]],
            ['dark', [[125, 127, 16, 16]]], // CHANGE coords if needed
        ]);

        this.currentAnimationKey = this.brickColor;
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
    playSound(this.soundBrick, 1);
    gameState.mario.score += 50;

    // 4-piece explosion (classic Mario style)
    const pieces = [
        { vx: -2, vy: -5 },
        { vx:  2, vy: -5 },
        { vx: -1, vy: -3 },
        { vx:  1, vy: -3 },
    ];

    const frame = [16, 150, 8, 8]; // small chunk sprite (adjust!)

    pieces.forEach(p => {
        this.game.debris.push(
            new BrickDebris(
                this.game,
                this.position.x + 4,
                this.position.y + 4,
                p.vx,
                p.vy,
                frame
            )
        );
    });

    this.remove = true; // remove brick immediately
}

    bump() {
        if (this.isBroken || this.bouncing) return;
        playSound(this.soundBump, 1);
        this.bouncing = true;
        this.bounceY = 0;
        this.bounceSpeed = -2;
    }

    update(time) {
        if (this.isBroken) {
            this.breakTimer += time.secondsPassed * 60;

            // simple "pop" effect
            this.position.y -= 1;

            if (this.breakTimer >= this.breakDuration) {
                this.remove = true;
            }
        }

        if (this.bouncing) {
            this.bounceY += this.bounceSpeed;
            this.bounceSpeed += this.gravity;

            if (this.bounceY >= 0) {
                this.bounceY = 0;
                this.bouncing = false;
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
            this.position.y - stage.y + this.bounceY,
            sw, sh
        );
    }

    drawDebug(context, stage) {
        if (this.isBroken) return;
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