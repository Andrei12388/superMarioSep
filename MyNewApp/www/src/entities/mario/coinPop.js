import { gameState } from "../../state/gameState.js";
import { ScoreText } from "./scoreText.js";

export class CoinPop {
    constructor(game, x, y) {
        this.game = game;

        this.position = { x, y };

        // Shoot upward
        this.velocity = { x: 0, y: -5 };

        this.image = document.querySelector('img[alt="mario"]');

        this.frame = [194, 150, 14, 15] ; // coin sprite

        this.life = 30;
        this.markedForDeletion = false;
    }

update(time) {
     const dt = Math.min(time.secondsPassed, 0.06);
    // gravity
    this.velocity.y += 0.3 * dt * 60;
    this.position.y += this.velocity.y * dt * 60;

    this.life -= dt * 60;

    if (this.life <= 0) {
        // 🔥 spawn "100" text
        gameState.mario.coins += 1; // Increment coin count
        this.game.scoreTexts.push(
            new ScoreText(
                this.game,
                this.position.x+5,
                this.position.y+20,
                100
            )
        );

        this.markedForDeletion = true;
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
    }
}