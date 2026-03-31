import { playSound } from '../../soundHandler.js';
import { gameState } from '../../state/gameState.js';
import { ScoreText } from "./scoreText.js";

export class FlagPole {
    constructor(game, x, y) {
        this.game = game;

        // Position
        this.position = { x, y };

        // Coin floats upward initially, no gravity
        this.floatOffset = -16; // how much it pops up
        this.startY = y;

        this.isActivated = false;
        this.flagY = y; // flag position
        this.slideSpeed = 0.5;

        this.onFlagPole = false;
        this.flagPole = null;

        this.autoWalk = false; // 🚀 NEW

        this.image = document.querySelector('img[alt="mario"]');
        this.frame = [430, 120, 16, 168]; // flag sprite


        // Collision boxes
        this.boxes = {
            push: { x: 0, y: 0, width: 16, height: 168 },
            hurt: { x: 0, y: 0, width: 16, height: 168 }
        };

        this.collected = false;
    }

    getWorldBox() {
        return {
            x: this.position.x + this.boxes.push.x,
            y: this.position.y + this.boxes.push.y,
            width: this.boxes.push.width,
            height: this.boxes.push.height
        };
    }

   update() {
    const mario = this.game.mario;

    if (mario.onFlagPole) {
    mario.position.y += this.slideSpeed;
    this.flagY += this.slideSpeed;

    // When Mario reaches ground
    if (mario.onGround || mario.position.y >= 184) {
        mario.onFlagPole = false;

        // 🚀 TELEPORT TO OTHER SIDE
        mario.position.x = this.position.x + 20; // adjust spacing
        mario.direction = 1;

        // 🚀 START AUTO WALK
        mario.autoWalk = true;

        console.log("Start auto walk!");
    }
}

    if (!this.isActivated) {
        // normal collision check
        const marioBox = {
            x: mario.position.x + mario.boxes.push.x,
            y: mario.position.y + mario.boxes.push.y,
            width: mario.boxes.push.width,
            height: mario.boxes.push.height
        };

        const poleBox = this.getWorldBox();

        const isColliding =
            poleBox.x < marioBox.x + marioBox.width &&
            poleBox.x + poleBox.width > marioBox.x &&
            poleBox.y < marioBox.y + marioBox.height &&
            poleBox.y + poleBox.height > marioBox.y;

        if (isColliding) {
            this.collect();
        }
    } else {
        // 🚀 SLIDE DOWN LOGIC
        if (mario.onFlagPole) {
            mario.position.y += this.slideSpeed;
            this.flagY += this.slideSpeed;

            // Stop at ground
            if (mario.position.y >= this.game.ground || mario.onGround) {
                mario.onFlagPole = false;

                // Optional: trigger level end here
                console.log("Level Complete!");
            }
        }
    }
}

   collect() {
    if (this.collected) return;

    this.collected = true;
    this.isActivated = true;

    const mario = this.game.mario;

    // Lock Mario to pole
    mario.velocity.x = 0;
    mario.velocity.y = 0;

    mario.onFlagPole = true; // NEW STATE
    mario.flagPole = this;

    // Snap Mario to pole X
    mario.position.x = this.position.x;

    // Set flag at Mario height
    this.flagY = mario.position.y;

    playSound(document.querySelector('audio#sound-coin'), 1);
}

draw(context, stage) {
    const [sx, sy, sw, sh] = this.frame;

    // Draw pole
    context.drawImage(
        this.image,
        sx, sy, sw, sh,
        this.position.x - stage.x,
        this.position.y - stage.y,
        sw,
        sh
    );

    // ✅ Draw FLAG (example sprite area — adjust if needed)
    context.drawImage(
        this.image,
        450, 120, 16, 16, // ← FLAG sprite coords (adjust!)
        this.position.x - stage.x,
        this.flagY - stage.y,
        16,
        16
    );
}
}