import { MarioScene } from './MarioScene.js';
import { CharacterSelect } from './CharacterSelect.js';
import { gameState } from '../state/gameState.js';
import { MainMenu } from './MainMenu.js';
import { drawText } from '../utils/UIHandler.js';

export class LevelTransition {
    constructor(game, options = {}) {
        this.game = game;
        this.image = document.querySelector('img[alt="mario"]');
        this.gameOverMusic = document.querySelector('audio#music-gameOverTransition');
        if(gameState.mario.lives <= -1) {
            this.gameOverMusic.play();
        }

        this.frames = new Map([
            ['menu', [17, 182, 384, 224]],
            ['kapHead', [92, 112, 15, 17]],
            ['coin',[194, 150, 14, 15]],
            ['mario',[131, 63, 31, 32]],
        ]);
        gameState.mario.time = 400;

        this.timer = 0;
        this.duration = 4; // 3 seconds
        this.finished = false;

        this.players = options.players || 1;
        this.nextSceneClass = options.nextSceneClass || MarioScene;
    }

    update(deltaTime) {
        if (this.finished) return;

        // Key bugfix: frame uses {secondsPassed, previous}
        const seconds = typeof deltaTime === 'number' ? deltaTime : deltaTime.secondsPassed || 0;
        this.timer += seconds;

        if (this.timer >= this.duration) {
            this.finished = true;
            if(gameState.mario.lives <= -1) {
                this.game.setScene(new MainMenu(this.game));
                gameState.mario.lives = 2; // Reset lives for new game
                gameState.mario.score = 0; // Reset score for new game
                gameState.mario.coins = 0;
                gameState.mario.time = 400;
                return;
            }
            const SceneClass = this.nextSceneClass || MarioScene;
            this.game.setScene(new SceneClass(this.game, {
                players: this.players
            }));
        }
    }

    drawFrame(context, frameKey, x, y, direction = 1, scale = 1, alpha = 1) {
        const [sx, sy, sw, sh] = this.frames.get(frameKey);
        context.save();
        context.globalAlpha = alpha;
        context.translate(x, y);
        context.scale(direction * scale, scale);
        context.drawImage(this.image, sx, sy, sw, sh, 0, 0, sw, sh);
        context.restore();
    }

    draw(context) {
        context.save();
       

        const width = this.game.width || context.canvas.width;
        const height = this.game.height || context.canvas.height;

        // 🖤 Background
        context.fillStyle = 'black';
        context.fillRect(0, 0, width, height);

        if (gameState.mario.lives <= -1) {
            context.fillStyle = 'white';        // 👈 important
            context.font = "11px MarioFont";   // 👈 make it visible
            context.textAlign = 'center';       // 👈 center horizontally
            context.textBaseline = 'middle';    // 👈 center vertically

            context.fillText('Game Over!', width / 2, height / 2);
            context.restore();

             if (this.timer > this.duration - 1) {
            const alpha = (this.timer - (this.duration - 1)) / 0.5;
            context.fillStyle = `rgba(0,0,0,${Math.min(Math.max(alpha, 0), 1)})`;
            context.fillRect(0, 0, width, height);
        }

            return;
        }

        drawText(context, this.image, this.frames);
        context.fillText(`World ${gameState.world}-${gameState.level}`, width/2-60, height/2-25);
        this.drawFrame(context,`mario`, width/2-60, height/2-5);
       
        context.fillText(` X ${gameState.mario.lives}`, width/2-25, height/2+20);

        // ✨ Fade out effect (last 0.5s)
        if (this.timer > this.duration - 1) {
            const alpha = (this.timer - (this.duration - 1)) / 0.5;
            context.fillStyle = `rgba(0,0,0,${Math.min(Math.max(alpha, 0), 1)})`;
            context.fillRect(0, 0, width, height);
        }

        

        context.restore();
    }
}