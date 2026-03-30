import { FighterState } from '../../constants/fighter.js';
import { playSound } from '../../soundHandler.js';
import { gameState } from '../../state/gameState.js';
import { ScoreText } from "./scoreText.js";

export class PowerUpMushRoom {
    constructor(game, x, y, sourceBlock = null) {
        this.game = game;
        this.sourceBlock = sourceBlock;

        // Position & physics
        this.position = { x, y };
        this.velocity = { x: 0.5, y: -2 }; // initial pop-up + horizontal
        this.gravity = 0.5;
        this.friction = 0.05;

        this.direction = 1; // initial movement
        this.onGround = false;

        this.image = document.querySelector('img[alt="mario"]');
        this.frame = [218, 145, 16, 16]; // mushroom sprite
        this.markedForDeletion = false;
        
        this.life = 9999;
        // Collision boxes (like KapNino)
        this.boxes = {
            push: { x: 0, y: 0, width: 10, height: 16 },
            hurt: { x: 0, y: 0, width: 10, height: 16 },
        };
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
    // Apply gravity
    this.velocity.y += this.gravity;

    // Horizontal movement
    this.position.x += this.velocity.x * this.direction;
    this.position.y += this.velocity.y;

    this.onGround = false;

    // --- Collision with bricks / ground ---
    for (const brick of this.game.bricks) {
        const brickBox = brick.getWorldBox();
        const pushBox = this.getWorldBox();

        const mushroomBottom = pushBox.y + pushBox.height;
        const mushroomTop = pushBox.y;
        const mushroomLeft = pushBox.x;
        const mushroomRight = pushBox.x + pushBox.width;

        // LANDING
        if (
            this.velocity.y >= 0 &&
            mushroomBottom <= brickBox.y + 5 &&
            mushroomBottom + this.velocity.y >= brickBox.y - 5 &&
            mushroomRight > brickBox.x &&
            mushroomLeft < brickBox.x + brickBox.width
        ) {
            this.position.y = brickBox.y - pushBox.height - this.boxes.push.y;
            this.velocity.y = 0;
            this.onGround = true;
        }

        // HORIZONTAL collision → flip direction
        // require vertical overlap to avoid immediate flip when on top of the block
        const verticalOverlap = mushroomTop < brickBox.y + brickBox.height && mushroomBottom > brickBox.y;

        const hittingLeftWall = verticalOverlap && this.direction > 0 && mushroomRight > brickBox.x && mushroomLeft < brickBox.x;
        const hittingRightWall = verticalOverlap && this.direction < 0 && mushroomLeft < brickBox.x + brickBox.width && mushroomRight > brickBox.x + brickBox.width;

        if ((hittingLeftWall || hittingRightWall) && this.onGround) {
            this.direction *= -1;
            this.position.x += this.direction * Math.abs(this.velocity.x); // push away to prevent sticking
        }
    }

    // --- Collision with Mario ---
    const marioBox = {
        x: this.game.mario.position.x + this.game.mario.boxes.push.x,
        y: this.game.mario.position.y + this.game.mario.boxes.push.y,
        width: this.game.mario.boxes.push.width,
        height: this.game.mario.boxes.push.height
    };

    const mushroomBox = this.getWorldBox();
    const isColliding =
        mushroomBox.x < marioBox.x + marioBox.width &&
        mushroomBox.x + mushroomBox.width > marioBox.x &&
        mushroomBox.y < marioBox.y + marioBox.height &&
        mushroomBox.y + mushroomBox.height > marioBox.y;

    if (isColliding) {
        this.markedForDeletion = true;

        const mario = this.game.mario;
        if (!mario.isBig) {
            mario.changeState(FighterState.GROW, 'growBig');
            playSound(document.querySelector('audio#sound-powerUp'), 1);
        }

        gameState.mario.poweredUp = true;

        this.game.debris.push(
            new ScoreText(this.game, this.position.x, this.position.y, 1000)
        );
        gameState.mario.score += 1000;
    }
}

    draw(context, stage) {
        const [sx, sy, sw, sh] = this.frame;

        context.drawImage(
            this.image,
            sx, sy, sw, sh,
            this.position.x - stage.x,
            this.position.y - stage.y,
            sw,
            sh
        );

        // Optional debug box
         context.strokeStyle = 'red';
         const box = this.getWorldBox();
         context.strokeRect(box.x - stage.x, box.y - stage.y, box.width, box.height);
    }
}