import { FighterState } from '../constants/fighter.js';
import { Brick } from '../entities/mario/brick.js';
import { Ground } from '../entities/mario/ground.js';
import { KapNino } from '../entities/mario/KapNino.js';
import { Mario } from '../entities/mario/Mario.js';
import { SecretBlock } from '../entities/mario/secretBlock.js';
import * as control from '../inputHandler.js';
import { playSound } from '../soundHandler.js';
import { gameState } from '../state/gameState.js';
import { drawText } from '../utils/UIHandler.js';

export class MarioScene {
    constructor(game) {
        gameState.changeScene = false;
        this.game = game;
        this.image = document.querySelector('img[alt="level1"]');
        this.imageUI = document.querySelector('img[alt="mario"]');
        this.stageMusic = document.querySelector('audio#music-ground');
        this.stageMusic.currentTime = 0;
       
        this.soundPowerDown = document.querySelector('audio#sound-powerDown');
        this.debris = [];
        this.scoreTexts = [];
        this.stageMusic.play();
        this.onGround = false;

        this.stage = { x: 0, y: 0 };
        this.mario = new Mario(this);

        this.enemies = [
            new KapNino(this, 400, 150),
            new KapNino(this, 440, 150),
        ];

        this.bricks = [
            new Brick(this, 320, 141),
            new Brick(this, 352, 141),
            new Brick(this, 384, 141),

            new Brick(this, 1232, 141),
            new SecretBlock(this, 1248,141),
            new Brick(this, 1264, 141),

            new Brick(this, 1280, 80),
            new Brick(this, 1296, 80),
            new Brick(this, 1312, 80),
            new Brick(this, 1328, 80),
            new Brick(this, 1344, 80),
            new Brick(this, 1360, 80),
            new Brick(this, 1376, 80),
            new Brick(this, 1392, 80),

            new Brick(this, 1456, 80),
            new Brick(this, 1472, 80),
            new SecretBlock(this, 1488, 80),
            new Brick(this, 1498, 141),

            new Brick(this, 1600, 141),
            new Brick(this, 1616, 141),

            new SecretBlock(this, 1696, 141),
            new SecretBlock(this, 1744, 141),
            new SecretBlock(this, 1744, 80),
            new SecretBlock(this, 1792, 141),

          
            //early stage blocks
            new SecretBlock(this, 336,141,{
                type: 'powerup',
                power: 'mushroom'
            }),
            new SecretBlock(this, 256,141),
            new SecretBlock(this, 368,141),
            new SecretBlock(this, 353,80),

            //ground
            new Ground(this, 0, 208, 1100, 16),
            new Ground(this, 1131, 208, 240, 16),
            new Ground(this, 1419, 208, 1024, 16),
            new Ground(this, 2475, 208, 1105, 16),

            //pipes
            new Ground(this, 442, 175, 34, 30),
            new Ground(this, 602, 160, 32, 48),
            new Ground(this, 731, 144, 31, 64),
            new Ground(this, 907, 144, 31, 64),
            new Ground(this, 2602, 176, 32, 32),
            new Ground(this, 2857, 176, 32, 32),

            //heavybrick
            new Ground(this, 2155, 176, 48, 32),
            new Ground(this, 2139, 192, 16, 16),
            new Ground(this, 2171, 160, 32, 16),
            new Ground(this, 2187, 144, 16, 16),

            new Ground(this, 2235, 176, 48, 32),
            new Ground(this, 2283, 192, 16, 16),
            new Ground(this, 2235, 160, 32, 16),
            new Ground(this, 2235, 144, 16, 16),

            new Brick(this, 1888, 141),
            
            new Brick(this, 2048, 80),
            new SecretBlock(this, 2062, 80),
            new SecretBlock(this, 2078, 80),
            new Brick(this, 2094, 80),

            new Brick(this, 2062, 141),
            new Brick(this, 2078, 141),

            new Brick(this, 2688, 141),
            new Brick(this, 2704, 141),
            new SecretBlock(this, 2720, 141),
            new Brick(this, 2736, 141),

        ];
        
        this.frames = new Map([
            ['stage', [5, 0, 3584, 480]],
            ['coin', [194, 150, 14, 15]],
        ]);
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
    for (const brick of this.bricks) brick.update(time);

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
        if (brick.type !== undefined && typeof brick.hit === 'function') {
            brick.hit(); // secret block behavior
        } else if (this.mario.isBig && typeof brick.break === 'function') {
            brick.break();
        } else if (!this.mario.isBig && typeof brick.bump === 'function') {
            brick.bump();
        }

        this.mario.velocity.y = 2;  // always bounce
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
        if(gameState.changeScene) this.game.setScene(new MarioScene(this.game));;
        this.mario.update(time);

if (this.mario.isDead) return;
        // Initialize timer helpers (only once)
        this.scoreTexts.forEach(t => t.update(time));
this.scoreTexts = this.scoreTexts.filter(t => !t.markedForDeletion);
if (!this.timeCounter) this.timeCounter = 0;

// Timer always updates
this.timeCounter += time.secondsPassed;
if (this.timeCounter >= 1) {
    this.timeCounter -= 1;
    if (gameState.mario.time > 0) {
        gameState.mario.time--;
    }
}

this.debris.forEach(d => d.update(time));
this.debris = this.debris.filter(d => !d.markedForDeletion);
        this.updateEntities(time);
        

        if (this.mario.currentState !== FighterState.GROW) {
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
                if (this.mario.isBig) {
                    this.mario.changeState(FighterState.GROW, 'growSmall');
                    playSound(this.soundPowerDown, 1);
                    console.log("Mario shrunk to small!");
                } else {
                    this.mario.die();
                    console.log("Mario died!");
                }

                this.mario.isHurt = true;
                this.mario.hurtTimer = 30;
                this.mario.velocity.x = 3 * this.mario.direction * -1;
                this.mario.velocity.y -= 3;
            }
        }
        }

        if (this.mario.currentState !== FighterState.GROW) {
        // Stage scrolling
        const canvasWidth = 200;
        const stageWidth = this.frames.get('stage')[2];
        const leftBoundary = canvasWidth / 3;
        const rightBoundary = canvasWidth * 2 / 3;

        if (this.mario.position.x <= 5) this.mario.position.x = 5;
        if (this.mario.position.x >= stageWidth - canvasWidth+100) this.mario.position.x = stageWidth - canvasWidth+100;

        if (this.mario.position.x - this.stage.x < leftBoundary)
            this.stage.x = this.mario.position.x - leftBoundary;
        else if (this.mario.position.x - this.stage.x > rightBoundary)
            this.stage.x = this.mario.position.x - rightBoundary;

        if (this.stage.x < 0) this.stage.x = 0;
        if (this.stage.x > stageWidth - canvasWidth-300)
            this.stage.x = stageWidth - canvasWidth-300;
        }
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
       this.scoreTexts.forEach(t => t.draw(context, this.stage));
       drawText(context, this.imageUI, this.frames);
     
    }
}