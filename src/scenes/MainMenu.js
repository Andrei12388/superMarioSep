import * as control from '../inputHandler.js';
import { playSound } from '../soundHandler.js';
import { gameState } from '../state/gameState.js';
import { MarioScene } from './MarioScene.js';

export class MainMenu {
    constructor(game) {
        this.game = game;
        this.image = document.querySelector('img[alt="mario"]');
        this.stageMusic = document.querySelector('audio#music-ground');
        this.soundPowerDown = document.querySelector('audio#sound-powerDown');

        this.frames = new Map([
            ['menu', [17, 182, 384, 224]],
            ['kapHead', [92, 112, 15, 17]],
            ['coin',[194, 150, 14, 15]],
        ]);

        this.selection = 0; // 0 for Player 1, 1 for Player 2
        this.kapHeadPos = { x: 50, y: 150 }; // Position for kapHead pointer
        this.options = [
            { label: '1 Player Game', x: 120, y: 165 },
            { label: '2 Player Game', x: 120, y: 185 }
        ];
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

    update(time) {
        // Handle input for selection
        if (control.isUp(0,1) && this.selection > 0) {
            this.selection--;
        } else if (control.isDown(0,1) && this.selection < this.options.length - 1) {
            this.selection++;
        }

        if(control.isStart(0,1)) {
            playSound(this.soundPowerDown, 1);
            this.stageMusic.pause();
            // Transition to character select or next scene
            this.game.setScene(new MarioScene(this.game));
        }

        // Update kapHead position based on selection
        this.kapHeadPos.x = this.options[this.selection].x - 20; // Offset to the left of the text
        this.kapHeadPos.y = this.options[this.selection].y - 13; // Align with text
    }

     drawText(context){
        context.font = "11px MarioFont";
        context.fillStyle = "white";
        context.fillText("Mario-Sep", 20, 20);
        context.fillText("World", 224, 20);
        context.fillText("Time", 304, 20);
        context.fillText("x00", 158, 32);
        this.drawFrame(context, 'coin', 140, 19);

        context.fillText(String(gameState.mario.score).padStart(6, '0'), 20, 32);
        context.fillText("1-1", 234, 32);
        context.fillText(
        String(gameState.mario.time).padStart(3, '0'),
            314,
            32
        );
    }

    draw(context) {
        // Draw the menu background
        this.drawFrame(context, 'menu', 0, 0);

        // Draw kapHead as pointer
        this.drawFrame(context, 'kapHead', this.kapHeadPos.x, this.kapHeadPos.y);

        // Draw menu options
        context.font = "11px MarioFont";
        context.fillStyle = "white";
        this.options.forEach((option, index) => {
            context.fillText(option.label, option.x, option.y);
        });
        this.drawText(context);
    }
}