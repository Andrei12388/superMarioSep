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
import { LevelTransition } from './levelTransition.js';

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
        if(gameState.mario.players === 2){
            this.players = [
            new Mario(this, 0),
            new Mario(this, 1)
        ];
        } else {
            this.players = [
            new Mario(this, 0),
        ];
        }
        
        this.mario = this.players[0];

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

    getPlayerPushBox(player) {
        return this.getWorldBox(player.boxes.push, player);
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

        // Reset player ground flags
        for (const player of this.players) {
            player.onGround = false;
        }

        // Brick colliders for each player
        for (const brick of this.bricks) {
            const brickBox = brick.getWorldBox();
            const brickBottomY = brickBox.y + brickBox.height;
            const brickTopY = brickBox.y;

            for (const player of this.players) {
                const playerPush = player.boxes.push;
                const playerHeadY = player.position.y + playerPush.y;
                const playerFeetY = player.position.y + playerPush.y + playerPush.height;
                const isHorizontallyOverlapping =
                    player.position.x + playerPush.x + playerPush.width > brickBox.x &&
                    player.position.x + playerPush.x < brickBox.x + brickBox.width;

                // HEADBUTT
                if (player.velocity.y < 0 &&
                    playerHeadY < brickBottomY &&
                    playerHeadY + playerPush.height > brickBox.y &&
                    isHorizontallyOverlapping
                ) {
                    if (brick.type !== undefined && typeof brick.hit === 'function') {
                        brick.hit(); // secret block behavior
                    } else if (player.isBig && typeof brick.break === 'function') {
                        brick.break();
                    } else if (!player.isBig && typeof brick.bump === 'function') {
                        brick.bump();
                    }

                    player.velocity.y = 2;  // always bounce
                }

                // LANDING
                const landingTolerance = 5;

                if ((brick.isSolid || typeof brick.isBroken !== 'undefined') &&
                    player.velocity.y >= 0 &&
                    playerFeetY <= brickTopY + landingTolerance &&
                    playerFeetY + player.velocity.y >= brickTopY - landingTolerance &&
                    isHorizontallyOverlapping
                ) {
                    player.position.y = brickTopY - playerPush.height - playerPush.y;
                    player.velocity.y = 0;
                    player.onGround = true;
                }
            }
        }

        // Player vs player bumping (no damage/death from collisions)
        for (let i = 0; i < this.players.length; i++) {
            for (let j = i + 1; j < this.players.length; j++) {
                const p1 = this.players[i];
                const p2 = this.players[j];
                if (p1.isDead || p2.isDead) continue;

                const p1Box = this.getPlayerPushBox(p1);
                const p2Box = this.getPlayerPushBox(p2);

                if (!this.isColliding(p1Box, p2Box)) continue;

                const overlapX = Math.min(p1Box.x + p1Box.width, p2Box.x + p2Box.width) - Math.max(p1Box.x, p2Box.x);
                const overlapY = Math.min(p1Box.y + p1Box.height, p2Box.y + p2Box.height) - Math.max(p1Box.y, p2Box.y);

                if (overlapX < overlapY) {
                    const shift = overlapX / 2 + 0.5;
                    if (p1.position.x < p2.position.x) {
                        p1.position.x -= shift;
                        p2.position.x += shift;
                        p1.velocity.x = -Math.abs(p1.velocity.x * 0.3);
                        p2.velocity.x = Math.abs(p2.velocity.x * 0.3);
                    } else {
                        p1.position.x += shift;
                        p2.position.x -= shift;
                        p1.velocity.x = Math.abs(p1.velocity.x * 0.3) * -1;
                        p2.velocity.x = -Math.abs(p2.velocity.x * 0.3);
                    }
                } else {
                    const shift = overlapY / 2 + 0.5;
                    if (p1.position.y < p2.position.y) {
                        p1.position.y -= shift;
                        p2.position.y += shift;
                        p1.velocity.y = Math.min(p1.velocity.y, -1);
                        p2.velocity.y = Math.max(p2.velocity.y, 1);
                    } else {
                        p1.position.y += shift;
                        p2.position.y -= shift;
                        p1.velocity.y = Math.max(p1.velocity.y, 1);
                        p2.velocity.y = Math.min(p2.velocity.y, -1);
                    }
                }
            }
        }
    }

    update(time) {
        if (gameState.changeScene) this.game.setScene(new LevelTransition(this.game));

        // Update players
        for (const player of this.players) {
            player.update(time);
        }

        // continue if at least one player alive
        if (this.players.every(player => player.isDead)) return;

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

        // Enemy interactions for all players
        for (const enemy of this.enemies) {
            enemy.update(time);

            for (const player of this.players) {
                    if (player.isDead) continue;

                    const playerPush = this.getWorldBox(player.boxes.push, player);
                    const playerHurt = this.getWorldBox(player.boxes.hurt, player);

                    const enemyPush = this.getWorldBox(enemy.boxes.push, enemy);
                    const enemyHurt = this.getWorldBox(enemy.boxes.hurt, enemy);

                    // STOMP
                    if (!enemy.isDead &&
                        this.isColliding(playerPush, enemyHurt) &&
                        player.velocity.y > 0 &&
                        playerPush.y < enemyHurt.y
                    ) {
                        enemy.isDead = true;
                        enemy.changeState(FighterState.DIE, 'dead');
                        player.velocity.y = -6;
                    }

                    // DAMAGE
                    if (!enemy.isDead && this.isColliding(enemyPush, playerHurt) && !player.isHurt) {
                        if (player.isBig) {
                            player.changeState(FighterState.GROW, 'growSmall');
                            playSound(this.soundPowerDown, 1);
                            console.log("Mario shrunk to small!");
                        } else {
                            player.die();
                            console.log("Mario died!");
                        }

                        player.isHurt = true;
                        player.hurtTimer = 30;
                        player.velocity.x = 3 * player.direction * -1;
                        player.velocity.y -= 3;
                    }
                }
            }
        

        // Stage scrolling (follow first active player)
        var activePlayer = this.players.find(function(p) { return !p.isDead; }) || this.players[0];
        var canvasWidth = 200;
        var stageWidth = this.frames.get('stage')[2];
        var leftBoundary = canvasWidth / 3;
        var rightBoundary = canvasWidth * 2 / 3;

        if (activePlayer.position.x <= 5) activePlayer.position.x = 5;
        if (activePlayer.position.x >= stageWidth - canvasWidth + 100) activePlayer.position.x = stageWidth - canvasWidth + 100;

        if (activePlayer.position.x - this.stage.x < leftBoundary)
            this.stage.x = activePlayer.position.x - leftBoundary;
        else if (activePlayer.position.x - this.stage.x > rightBoundary)
            this.stage.x = activePlayer.position.x - rightBoundary;

        if (this.stage.x < 0) this.stage.x = 0;
        if (this.stage.x > stageWidth - canvasWidth - 300)
            this.stage.x = stageWidth - canvasWidth - 300;
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

        // Draw players
        for (const player of this.players) {
            player.drawFrame(
                context,
                player.position.x - this.stage.x,
                player.position.y - this.stage.y,
                player.direction
            );
            player.drawDebug(context, this.stage);
        }

        this.debris.forEach(d => d.draw(context, this.stage));
        this.scoreTexts.forEach(t => t.draw(context, this.stage));
        drawText(context, this.imageUI, this.frames);
     
    }
}