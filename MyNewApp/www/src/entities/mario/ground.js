export class Ground {
    constructor(game, x, y, width, height) {
        this.game = game;

        this.position = { x, y };
        this.velocity = { x: 0, y: 0 };

        this.image = document.querySelector('img[alt="mario"]');

      
        this.breakTimer = 0;
        this.breakDuration = 20;
        this.remove = false;

        // Simple brick frame (adjust to your sprite sheet)
        this.frames = new Map([
            ['brick', [[0, 0, 0, 0]]], // CHANGE coords if needed
        ]);

        this.currentAnimationKey = 'brick';
        this.animationFrame = 0;

        // Collision box
        this.box = {
            x: 0,
            y: 0,
            width: width,
            height: height
        };
    }

    getWorldBox() {
        return {
            x: this.position.x + this.box.x,
            y: this.position.y + this.box.y,
            width: this.box.width,
            height: this.box.height
        };
    }

    break() {
     
        console.log("Brick broken!");
    }

    update() {
       
    }

    draw(context, stage) {
        if (this.isBroken) return;

        const [sx, sy, sw, sh] = this.frames.get(this.currentAnimationKey)[0];

        context.drawImage(
            this.image,
            sx, sy, sw, sh,
            this.position.x - stage.x,
            this.position.y - stage.y,
            sw, sh
        );
    }

    drawDebug(context, stage) {
        const box = this.getWorldBox();

        context.strokeStyle = 'orange';
        context.strokeRect(
            box.x - stage.x,
            box.y - stage.y,
            box.width,
            box.height
        );
    }
}