export class BrickDebris {
    constructor(game, x, y, vx, vy, frame) {
        this.game = game;

        this.position = { x, y };
        this.velocity = { x: vx, y: vy };

        this.image = document.querySelector('img[alt="mario"]');

        this.frame = frame; // sprite coords
        this.gravity = 0.3;

        this.life = 40; // frames before disappearing
    }

    update(time) {
        const dt = Math.min(time.secondsPassed, 0.06);
        this.velocity.y += this.gravity * dt * 60;

        this.position.x += this.velocity.x * dt * 60;
        this.position.y += this.velocity.y * dt * 60;

      
            const scale = dt * 60;

            this.life -= scale;
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