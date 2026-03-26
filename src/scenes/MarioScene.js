import { FighterState } from '../constants/fighter.js';
import { Brick } from '../entities/mario/brick.js';
import { Ground } from '../entities/mario/ground.js';
import { KapNino } from '../entities/mario/KapNino.js';
import { Mario } from '../entities/mario/Mario.js';
import { SecretBlock } from '../entities/mario/secretBlock.js';
import * as control from '../inputHandler.js';
import { playSound } from '../soundHandler.js';

export class MarioScene {
    constructor() {
        this.image = document.querySelector('img[alt="level1"]');
        this.stageMusic = document.querySelector('audio#music-ground');
        this.soundPowerDown = document.querySelector('audio#sound-powerDown');
        this.debris = [];
        this.stageMusic.play();
        this.onGround = false;

        this.stage = { x: 0, y: 0 };
        this.mario = new Mario(this);

        this.enemies = [
            new KapNino(this, 220, 150),
            new KapNino(this, 260, 150),
        ];

        this.bricks = [
            new Brick(this, 326, 141),
            new Brick(this, 160, 140),
          
            new SecretBlock(this, 345,141),
            new Ground(this, 0, 208, 1100, 16),
            new Ground(this, 442, 175, 34, 30)
        ];

        this.frames = new Map([['stage', [5, 0, 3584, 480]]]);
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

    getWorldBox(box, entity) {
        const x = entity.direction === 1
            ? entity.position.x + box.x
            : entity.position.x - box.x - box.width;
        const y = entity.position.y + box.y;
        return { x, y, width: box.width, height: box.height };
    }

    isColliding(a, b) {
        return (
            a.x < b.x + b.width &&
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y
        );
    }

    // --- ENTITY UPDATES ---
    updateEntities(time) {
    // Update bricks
    for (const brick of this.bricks) brick.update();

    // Reset Mario ground flag
    this.mario.onGround = false;

    const marioPush = this.mario.boxes.push;
const marioHeadY = this.mario.position.y + marioPush.y;

for (const brick of this.bricks) {
    const brickBox = brick.getWorldBox();
    const brickBottomY = brickBox.y + brickBox.height;
    const isHorizontallyOverlapping =
        marioPush.x + marioPush.width > brickBox.x &&
        marioPush.x < brickBox.x + brickBox.width;

    // HEADBUTT
    if (this.mario.velocity.y < 0 &&
        marioHeadY < brickBottomY &&
        marioHeadY + marioPush.height > brickBox.y &&
        isHorizontallyOverlapping
    ) {
        brick.break();       // safe call for all bricks now
        this.mario.velocity.y = 2;
    }

    // LANDING
    const marioFeetY = this.mario.position.y + marioPush.y + marioPush.height;
    const brickTopY = brickBox.y;
    const landingTolerance = 5;

    if ((brick.isSolid || typeof brick.isBroken !== 'undefined') &&
        this.mario.velocity.y >= 0 &&
        marioFeetY <= brickTopY + landingTolerance &&
        marioFeetY + this.mario.velocity.y >= brickTopY - landingTolerance &&
        isHorizontallyOverlapping
    ) {
        this.mario.position.y = brickTopY - marioPush.height - marioPush.y;
        this.mario.velocity.y = 0;
        this.mario.onGround = true;
    }
}
}

    update(time) {
        this.debris.forEach(d => d.update());
        this.debris = this.debris.filter(d => d.life > 0);
        this.updateEntities(time);
        this.mario.update(time);

        for (const enemy of this.enemies) {
            enemy.update(time);

            const marioPush = this.getWorldBox(this.mario.boxes.push, this.mario);
            const marioHurt = this.getWorldBox(this.mario.boxes.hurt, this.mario);

            const enemyPush = this.getWorldBox(enemy.boxes.push, enemy);
            const enemyHurt = this.getWorldBox(enemy.boxes.hurt, enemy);

            // STOMP
            if (!enemy.isDead &&
                this.isColliding(marioPush, enemyHurt) &&
                this.mario.velocity.y > 0 &&
                marioPush.y < enemyHurt.y
            ) {
                enemy.isDead = true;
                enemy.changeState(FighterState.DIE, 'dead');
                this.mario.velocity.y = -6;
            }

            // DAMAGE
            if (!enemy.isDead && this.isColliding(enemyPush, marioHurt) && !this.mario.isHurt) {
                this.mario.isHurt = true;
                this.mario.hurtTimer = 30;
                this.mario.velocity.x = 3 * this.mario.direction * -1;
                this.mario.velocity.y -= 3;
                console.log("Mario damaged!");
                playSound(this.soundPowerDown,1)
            }
        }

        // Stage scrolling
        const canvasWidth = 200;
        const stageWidth = this.frames.get('stage')[2];
        const leftBoundary = canvasWidth / 3;
        const rightBoundary = canvasWidth * 2 / 3;

        if (this.mario.position.x <= 5) this.mario.position.x = 5;

        if (this.mario.position.x - this.stage.x < leftBoundary)
            this.stage.x = this.mario.position.x - leftBoundary;
        else if (this.mario.position.x - this.stage.x > rightBoundary)
            this.stage.x = this.mario.position.x - rightBoundary;

        if (this.stage.x < 0) this.stage.x = 0;
        if (this.stage.x > stageWidth - canvasWidth)
            this.stage.x = stageWidth - canvasWidth;
    }

    drawEntities(context) {
        for (const brick of this.bricks) {
            brick.draw(context, this.stage);
            brick.drawDebug(context, this.stage);
        }

        for (const enemy of this.enemies) {
            enemy.drawFrame(
                context,
                enemy.position.x - this.stage.x,
                enemy.position.y - this.stage.y,
                enemy.direction
            );
            enemy.drawDebug(context, this.stage);
        }
    }

    drawText(context){
        context.font = "11px MarioFont";
        context.fillStyle = "white";
        context.fillText("Mario-Sep", 20, 20);
        context.fillText("World", 224, 20);
        context.fillText("Time", 304, 20);

        context.fillText("000000", 20, 32);
        context.fillText("1-1", 234, 32);
        context.fillText("399", 314, 32);
    }

    draw(context) {
        // Draw stage
        this.drawFrame(context, 'stage', -this.stage.x, -this.stage.y);

        // Draw bricks behind Mario
        this.drawEntities(context);

        // Draw Mario
        this.mario.drawFrame(
            context,
            this.mario.position.x - this.stage.x,
            this.mario.position.y - this.stage.y,
            this.mario.direction
        );
       this.mario.drawDebug(context, this.stage);
       this.debris.forEach(d => d.draw(context, this.stage));
       this.drawText(context)
     
    }
}