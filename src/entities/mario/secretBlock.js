
import { playSound } from '../../soundHandler.js';
export class SecretBlock {
    constructor(game, x, y) {
        this.game = game;
        this.position = { x, y };
        this.image = document.querySelector('img[alt="mario"]');
        this.soundCoin = document.querySelector('audio#sound-coin');
        this.soundBump = document.querySelector('audio#sound-bump');

        // Always solid
        this.isSolid = true;
        this.bouncing = false;
        this.bounceY = 0;
        this.disabled = false;
        this.bounceSpeed = -2;
        this.gravity = 0.2;

        // Used state
        this.used = false;

        // Animation frames
        this.frames = new Map([
            ['brickIdle', [
                [[43, 150, 16, 16], [8, 8]],
                [[63, 150, 16, 16], [8, 8]],
                [[83, 150, 16, 16], [8, 8]],
            ]],
            ['brickHit', [
                [[166, 150, 16, 16], [8, 8]]
            ]]
        ]);

        this.currentAnimationKey = 'brickIdle';
        this.animationFrame = 0;
        this.animationTimer = 0;

        this.box = { x: 0, y: 0, width: 16, height: 16 };
    }

    // Always safe to call .break()
    break() {
        this.hit();
    }

    // Headbutt logic
    hit() {
       if(this.used) {
        playSound(this.soundBump, 1)
       }
        if (this.bouncing) return;
        
        this.bouncing = true;
        this.bounceY = 0;
        this.bounceSpeed = -2;

        if (!this.used) {
            this.currentAnimationKey = 'brickHit';
            this.animationFrame = 0;
            this.animationTimer = 0;
            this.spawnItem();
            this.used = true;
        }

        console.log("SecretBlock hit!");
    }

    spawnItem() {
        this.soundCoin.play();
        console.log("💡 Spawn item here!");
    }

    update() {
         if(this.disabled) return
        if (this.bouncing) {
            this.bounceY += this.bounceSpeed;
            this.bounceSpeed += this.gravity;
            if (this.bounceY >= 0) {
                this.bounceY = 0;
                  this.disabled = true;
                this.bouncing = false;
            }
        }

        // Animate
        this.animationTimer++;
        const frames = this.frames.get(this.currentAnimationKey);
        if (frames && frames.length > 1 && this.animationTimer >= 10) {
            this.animationFrame = (this.animationFrame + 1) % frames.length;
            this.animationTimer = 0;
        }
    }

    draw(context, stage) {
        const frames = this.frames.get(this.currentAnimationKey);
        if (!frames) return;

        const frame = frames[this.animationFrame % frames.length][0];
        const [sx, sy, sw, sh] = frame;

        context.drawImage(
            this.image,
            sx, sy, sw, sh,
            this.position.x - stage.x,
            this.position.y - stage.y + this.bounceY,
            sw, sh
        );
    }

    drawDebug(context, stage) {
        const box = this.getWorldBox();
        context.strokeStyle = 'orange';
        context.lineWidth = 1;
        context.strokeRect(
            box.x - stage.x,
            box.y - stage.y,
            box.width,
            box.height
        );
    }

    getWorldBox() {
        return {
            x: this.position.x + this.box.x,
            y: this.position.y + this.box.y,
            width: this.box.width,
            height: this.box.height
        };
    }
}