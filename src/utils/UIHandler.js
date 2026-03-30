import { gameState } from '../state/gameState.js';

/**
 * Draw a frame from a sprite sheet
 * @param {CanvasRenderingContext2D} context - Canvas context
 * @param {HTMLImageElement} image - Image element
 * @param {Map} frames - Map of frame definitions
 * @param {string} frameKey - Key of the frame to draw
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} direction - Direction/scale on X axis (default: 1)
 * @param {number} scale - Scale factor (default: 1)
 * @param {number} alpha - Alpha transparency (default: 1)
 */
export function drawFrame(context, image, frames, frameKey, x, y, direction = 1, scale = 1, alpha = 1) {
    const [sx, sy, sw, sh] = frames.get(frameKey);
    context.save();
    context.globalAlpha = alpha;
    context.translate(x, y);
    context.scale(direction * scale, scale);
    context.drawImage(image, sx, sy, sw, sh, 0, 0, sw, sh);
    context.restore();
}

/**
 * Draw the Mario game UI text (score, coins, time, world)
 * @param {CanvasRenderingContext2D} context - Canvas context
 * @param {HTMLImageElement} image - Image element for drawing frames
 * @param {Map} frames - Map of frame definitions
 */
export function drawText(context, image, frames) {
    context.font = "11px MarioFont";
    context.fillStyle = "white";
    context.fillText("Mario-Sep", 20, 20);
    context.fillText("Mundo", 224, 20);
    context.fillText("Time", 304, 20);
    
    context.fillText(`x`, 158, 32);
    drawFrame(context, image, frames, 'coin', 140, 19);
    context.fillText(String(gameState.mario.coins).padStart(2, '0'), 170, 32);

    context.fillText(String(gameState.mario.score).padStart(6, '0'), 20, 32);
    context.fillText("1-1", 234, 32);
    context.fillText(
        String(gameState.mario.time).padStart(3, '0'),
        314,
        32
    );
}
