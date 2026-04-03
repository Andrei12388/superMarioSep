export class ScoreText {
    constructor(game, x, y, value = 100) {
        this.game = game;

        this.position = { x, y };
        this.velocity = { x: 0, y: -1 }; // float upward

        this.value = value;

        this.life = 40;
        this.opacity = 1;

        this.markedForDeletion = false;
    }

    update(time) {
         const dt = Math.min(time.secondsPassed, 0.06);
        this.position.y += this.velocity.y * dt * 60;

        // fade out
        this.opacity -= dt * 60 * 0.02;

        this.life -= dt * 60;

        if (this.life <= 0) {
            this.markedForDeletion = true;
        }
    }

    draw(context, stage) {
        context.save();

        context.globalAlpha = this.opacity;
        context.fillStyle = "white";
        context.font = "12px Arial";
        context.textAlign = "center";

        context.fillText(
            this.value,
            this.position.x - stage.x,
            this.position.y - stage.y
        );

        context.restore();
    }
}