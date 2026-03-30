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
        this.velocity.y += this.gravity;

        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        this.life -= time * 60;
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