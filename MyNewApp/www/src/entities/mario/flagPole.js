import { playSound } from '../../soundHandler.js';
import { gameState } from '../../state/gameState.js';
import { ScoreText } from './scoreText.js';

export class FlagPole {
    constructor(game, x, y) {
        this.game = game;

        // Position
        this.position = { x, y };
        this.topY = y;              // top of pole
        this.bottomY = y + 168;    // bottom of pole (same as sprite height)

        // Coin floats upward initially, no gravity
        this.floatOffset = -16; // how much it pops up
        // How far above the bottom Mario should stop
this.flagBottomOffset = 16; // tweak this value
        this.startY = y;

        this.isActivated = false;
        this.flagY = y+6; // flag position
        this.slideSpeed = 0.8;

        // Horizontal sway
this.baseX = x;        // original X position
this.offsetX = 0;      // current offset
this.direction = 1;    // 1 = right, -1 = left
this.maxOffset = 30;   // max left/right movement
this.speedX = 1;     // horizontal speed

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

   update(time) {
     const dt = Math.min(time.secondsPassed, 0.06);
    const mario = this.game.mario;

// Update actual position
this.position.x = this.baseX + this.offsetX;

  if (mario.onFlagPole) {
    // Calculate where Mario should stop (slightly above bottom)
    const bottomStopY = this.bottomY - this.flagBottomOffset;

    // Move Mario down
    mario.position.y += this.slideSpeed * dt * 60;

    // Clamp Mario's position
    if (mario.position.y >= bottomStopY) {
        mario.position.y = bottomStopY;
        mario.velocity.y = 0;
        mario.onFlagPole = false;

        // TELEPORT TO OTHER SIDE
        mario.position.x = this.position.x + 20; // adjust spacing
        mario.direction = 1;

        // START AUTO WALK
        mario.autoWalk = true;

        console.log("Start auto walk!");
    }

    // Update flag position to follow Mario, but also clamp
    this.flagY = Math.min(mario.position.y, this.bottomY - this.flagBottomOffset-12);
}

if(!this.collected){
    
    // Move flagpole left/right
this.offsetX += this.direction * this.speedX;

// Reverse direction if max offset reached
if (this.offsetX > this.maxOffset) {
    this.offsetX = this.maxOffset;
    this.direction = -1;
} else if (this.offsetX < -this.maxOffset) {
    this.offsetX = -this.maxOffset;
    this.direction = 1;
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
    gameState.levelFinished = true;

    this.game.stageMusic.pause();
    this.collected = true;
    this.isActivated = true;

    const mario = this.game.mario;

    // Lock Mario
    mario.velocity.x = 0;
    mario.velocity.y = 0;

    mario.onFlagPole = true;
    mario.flagPole = this;

    // Snap Mario to pole
    mario.position.x = this.position.x;

    // Set flag position
    this.flagY = mario.position.y;

    // ✅ CALCULATE HEIGHT
    const poleHeight = this.bottomY - this.topY;
    const grabHeight = this.bottomY - mario.position.y;

    const ratio = grabHeight / poleHeight;

    let score = 100;

    if (ratio > 0.9) score = 5000;
    else if (ratio > 0.7) score = 2000;
    else if (ratio > 0.5) score = 800;
    else if (ratio > 0.3) score = 400;
    else if (ratio > 0.1) score = 200;

    // ✅ ADD SCORE
    gameState.mario.score += score;

    this.game.debris.push(
            new ScoreText(this.game, mario.position.x, mario.position.y, score)
        );

    playSound(document.querySelector('audio#sound-flagPole'), 1);
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
        439, 71, 44, 31, // ← FLAG sprite coords (adjust!)
        this.position.x - stage.x-11,
        this.flagY - stage.y,
        20,
        16
    );
}
}