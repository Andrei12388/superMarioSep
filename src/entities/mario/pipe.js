export class Pipe {
    constructor(game, x, y, width, height, options = {}) {
        this.game = game;
        this.options = options;
        this.position = { x, y };
        this.image = document.querySelector('img[alt="mario"]');

        this.box = {
            x: 0,
            y: 0,
            width,
            height
        };

        // where the pipe leads
        this.destination = options.destination || null;

        this.isPipe = true; // 👈 important flag
    }

    getWorldBox() {
        return {
            x: this.position.x + this.box.x,
            y: this.position.y + this.box.y,
            width: this.box.width,
            height: this.box.height
        };
    }

   draw(context, stage) {
    context.save();

    // Draw semi-transparent pipe
    context.globalAlpha = 0.5;
    context.fillStyle = 'green';
    context.fillRect(
        this.position.x - stage.x,
        this.position.y - stage.y,
        this.box.width,
        this.box.height
    );

    context.restore();
}

    drawDebug(context, stage) {
        const box = this.getWorldBox();
        context.strokeStyle = 'lime';
        context.strokeRect(
            box.x - stage.x,
            box.y - stage.y,
            box.width,
            box.height
        );
    }
}