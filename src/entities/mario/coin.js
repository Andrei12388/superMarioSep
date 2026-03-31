import { playSound } from '../../soundHandler.js';
import { gameState } from '../../state/gameState.js';
import { ScoreText } from "./scoreText.js";

export class Coin {
    constructor(game, x, y) {
        this.game = game;

        // Position
        this.position = { x, y };

        // Coin floats upward initially, no gravity
        this.floatOffset = -16; // how much it pops up
        this.startY = y;

        this.image = document.querySelector('img[alt="mario"]');
        this.frame = [194, 150, 14, 15]; // coin sprite

        this.markedForDeletion = false;

        // Collision boxes
        this.boxes = {
            push: { x: 0, y: 0, width: 14, height: 15 },
            hurt: { x: 0, y: 0, width: 14, height: 15 }
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
        // Float upward until target offset
        if (!this.collected) {
            const targetY = this.startY + this.floatOffset;
            if (this.position.y > targetY) {
                this.position.y -= 1; // float speed
            }
        }

        // --- Collision with Mario ---
        const marioBox = {
            x: this.game.mario.position.x + this.game.mario.boxes.push.x,
            y: this.game.mario.position.y + this.game.mario.boxes.push.y,
            width: this.game.mario.boxes.push.width,
            height: this.game.mario.boxes.push.height
        };

        const coinBox = this.getWorldBox();
        const isColliding =
            coinBox.x < marioBox.x + marioBox.width &&
            coinBox.x + coinBox.width > marioBox.x &&
            coinBox.y < marioBox.y + marioBox.height &&
            coinBox.y + coinBox.height > marioBox.y;

        if (isColliding) {
            this.collect();
        }
    }

    collect() {
        if (this.collected) return;
        this.collected = true;
        this.markedForDeletion = true;

        // Add coin and score
      
        gameState.mario.coins += 1;
        gameState.mario.score += 100;

        playSound(document.querySelector('audio#sound-coin'), 1);

        // Spawn floating "100" score text
        this.game.debris.push(
            new ScoreText(this.game, this.position.x, this.position.y, 100)
        );
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
       //  context.strokeStyle = 'yellow';
        // const box = this.getWorldBox();
        // context.strokeRect(box.x - stage.x, box.y - stage.y, box.width, box.height);
    }
}