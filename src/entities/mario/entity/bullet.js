import { FighterState } from "../../../constants/fighter.js";

// bullet.js
export class Bullet {
    constructor(game, x, y, direction = 1, speed = 6) {
        this.game = game;
        this.position = { x, y };
        this.direction = direction; // 1 = right, -1 = left
        this.speed = speed;

        this.frameIndex = 0;
        this.frameTimer = 0;
        this.markedForDeletion = false;

        // collision box
        this.width = 8;
        this.height = 8;
    }

    getBox() {
        return {
            x: this.position.x,
            y: this.position.y,
            width: this.width,
            height: this.height
        };
    }

    checkCollision(enemy) {
        const b = this.getBox();
        const e = enemy.boxes.hurt; // using KapNino hurt box
        const ex = enemy.position.x + e.x;
        const ey = enemy.position.y + e.y;

        return b.x < ex + e.width &&
               b.x + b.width > ex &&
               b.y < ey + e.height &&
               b.y + b.height > ey;
    }

    update() {
        // move bullet
        this.position.x += this.speed * this.direction;

        // animate
        this.frameTimer++;
        if (this.frameTimer >= 5) {
            this.frameTimer = 0;
            this.frameIndex++;
        }

        const frames = this.game.mario.frames.get('gunBullet');
        if (frames && this.frameIndex >= frames.length) {
            this.frameIndex = 0;
        }

        // remove if offscreen
        if (this.position.x < 0 || this.position.x > 4000) {
            this.markedForDeletion = true;
        }

        // --- collision with enemies ---
        for (const enemy of this.game.enemies) {
            if (!enemy.isDead && this.checkCollision(enemy)) {
                enemy.isDead = true;
                console.log('Enemy hit!');
                enemy.changeState(FighterState.DIE); // trigger death animation
                this.markedForDeletion = true; // remove bullet on hit
            }
        }
    }

    draw(ctx, stage) {
        const frames = this.game.mario.frames.get('gunBullet');
        if (!frames) return;

        const frame = frames[this.frameIndex];
        if (!frame) return;

        const [[sx, sy, sw, sh], [ox, oy]] = frame;

        ctx.save();
        if (this.direction === -1) {
            ctx.scale(-1, 1);
            ctx.drawImage(
                this.game.mario.image,
                sx, sy, sw, sh,
                -((this.position.x - stage.x) + sw - ox),
                (this.position.y - stage.y) - oy,
                sw,
                sh
            );
        } else {
            ctx.drawImage(
                this.game.mario.image,
                sx, sy, sw, sh,
                (this.position.x - stage.x) - ox,
                (this.position.y - stage.y) - oy,
                sw,
                sh
            );
        }
        ctx.restore();
    }

    drawDebug(ctx, stageOffset = { x: 0, y: 0 }, scale = 1) {
        const box = this.getBox();
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 1;

        ctx.strokeRect(
            (box.x - stageOffset.x) * scale,
            (box.y - stageOffset.y) * scale,
            box.width * scale,
            box.height * scale
        );
    }
}