export class SceneBackgroundAnimation {
    constructor(image, frames, animation, startFrame = 0) {
        this.image = image;
        this.frames = new Map(frames);
        this.animation = animation;
        this.animationFrame = startFrame;
        this.animationTimer = 0;
        this.frameDelay = animation[this.animationFrame][1]; // ✅ Fixed
    }

    update(time) {
        if (time.previous > this.animationTimer + this.frameDelay) {
            this.animationFrame += 1;

            if (this.animationFrame >= this.animation.length) {
                this.animationFrame = 0;
            }

            this.frameDelay = this.animation[this.animationFrame][1]; // ✅ Fixed
            this.animationTimer = time.previous;
        }
    }

    /**
     * Draws the current animation frame with extra options
     * @param {CanvasRenderingContext2D} context
     * @param {number} x - world X position
     * @param {number} y - world Y position
     * @param {number} direction - 1 = normal, -1 = flipped horizontally
     * @param {number} scale - scale multiplier for both x & y
     * @param {number} alpha - global opacity (0–1)
     */
    draw(context, x, y, direction = 1, scale = 1, alpha = 1) {
        const [frameKey] = this.animation[this.animationFrame];
        const [frameX, frameY, frameWidth, frameHeight] = this.frames.get(frameKey);

        context.save();
        context.globalAlpha = alpha;

        // Translate first, then scale/flip.
        context.translate(x, y);
        context.scale(direction * scale, scale);

        // After translating, draw at (0, 0) relative to new origin.
        context.drawImage(
            this.image,
            frameX, frameY, frameWidth, frameHeight,
            0, 0, frameWidth, frameHeight
        );

        context.restore();
    }
}
