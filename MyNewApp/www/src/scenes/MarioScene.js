import { FighterState } from '../constants/fighter.js';
import { Brick } from '../entities/mario/brick.js';
import { CloudEnemy } from '../entities/mario/cloudEnemy.js';
import { Coin } from '../entities/mario/coin.js';
import { FlagPole } from '../entities/mario/flagPole.js';
import { Ground } from '../entities/mario/ground.js';
import { KapNino } from '../entities/mario/KapNino.js';
import { Mario } from '../entities/mario/Mario.js';
import { Pipe } from '../entities/mario/pipe.js';
import { SecretBlock } from '../entities/mario/secretBlock.js';
import { SelectaEnemy } from '../entities/mario/selectaEnemy.js';
import { SuperMan } from '../entities/mario/superMan.js';
import * as control from '../inputHandler.js';
import { playSound } from '../soundHandler.js';
import { gameState } from '../state/gameState.js';
import { drawText } from '../utils/UIHandler.js';
import { LevelTransition } from './LevelTransitions.js';
import { getDelta } from './utils/GetDeltaTime.js';



export class MarioScene {
    constructor(game) {
        gameState.changeScene = false;
        this.game = game;
        this.image = document.querySelector('img[alt="level1"]');
        this.imageUI = document.querySelector('img[alt="mario"]');
        this.stageMusic = document.querySelector('audio#music-ground');
        this.stageMusic.currentTime = 0;
        gameState.mario.time = 400;
        gameState.hordeActive = false;
        gameState.hordekillCount = 0;
        if(gameState.explicitMode) this.soundKapNinoBoss = document.querySelector('audio#sound-kapNinoBoss');
        else this.soundKapNinoBoss = document.querySelector('audio#sound-kapNinoBossNonExplicit');
        this.soundKapNinoBoss.currentTime = 0;

        this.cameraLock = false;
        this.cameraLockDone = false;
        this.enemySpawn = false;
        this.enemySpawn2 = false;
        this.enemySpawn3 = false;

        this.hordeTimer = 0;
        this.hordeCount = 0;
        this.hordeInterval = 3; // seconds
        this.hordeSpawnSide = 'left'; // or true/false

        this.stageContext = {
            frame: 'stage',
            width: 200,
        }

        // 1️⃣ Make sure arrays exist once in your game constructor
        this.bricks = this.bricks || [];
        this.enemies = this.enemies || [];
        this.pipes = this.pipes || [];
        this.bullets = this.bullets || [];

        // 2️⃣ When resetting stage, clear first, then push
        this.bricks.length = 0;
        this.enemies.length = 0;
        this.pipes.length = 0;
                

        this.superManSpawned = false;
       
        this.soundPowerDown = document.querySelector('audio#sound-powerDown');
        this.debris = [];
        this.scoreTexts = [];
        this.stageMusic.play();
        this.onGround = false;
        

        this.debris.push(new FlagPole(this, 3163, 40));

        this.stage = { x: 0, y: 0 };
        if(gameState.mario.players === 2){
            this.players = [
            new Mario(this, 0,30),
            new Mario(this, 1,30)
        ];
        } else {
            this.players = [
            new Mario(this, 0, 30),
        ];
        }
        
        this.mario = this.players[0];
        this.mario2 = this.players[1];

        this.setEnemies([
           new KapNino(this, 400, 150,0.5, -1),
            new KapNino(this, 440, 150,0.5, -1),
            new CloudEnemy(this, 470, 100),
           
          //  new SuperMan(this, 2000, 50),
            new KapNino(this, 682, 150,0.5, -1),
            new KapNino(this, 656, 150,0.5, -1),

            

        ]);

        this.setPipes([
             new Pipe(this, 915, 144, 15, 64, {
                stage: 'stagePipe',
                width: 40,
                direction: 'down',
                destination: { x: 40, y: 50 },
                music: document.querySelector('audio#music-underground'),
            }),
        ]);

        this.setBricks([
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
            new Ground(this, -16, 0, 16, 208),
            new Ground(this, 3507, 0, 16, 208),
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

            new Ground(this, 2395, 160, 48, 48),
            new Ground(this, 2411, 144, 32, 16),
            new Ground(this, 2379, 176, 16, 32),
            new Ground(this, 2363, 192, 16, 16),

            new Ground(this, 2475, 160, 32, 48),
            new Ground(this, 2475, 144, 16, 16),
            new Ground(this, 2507, 176, 16, 32),
            new Ground(this, 2523, 192, 16, 16),

            //last section blocks
            new Ground(this, 2971, 112, 64, 96),
            new Ground(this, 3003, 80, 32, 32),
            new Ground(this, 2955, 128, 16, 80),
            new Ground(this, 2939, 144, 16, 64),
            new Ground(this, 2907, 176, 32, 32),
            new Ground(this, 2891, 192, 16, 16),
            new Ground(this, 2923, 160, 16, 16),
            new Ground(this, 2987, 96, 16, 16),

             new SecretBlock(this, 2565,141,{
                type: 'powerup',
                power: 'gunPowerup'
            }),

            new Brick(this, 1888, 141),
            
            new Brick(this, 2048, 80),
            new SecretBlock(this, 2062, 80),
            new SecretBlock(this, 2078, 80),
            new Brick(this, 2094, 80),

            new Brick(this, 2062, 141),
            new Brick(this, 2078, 141),

            new Brick(this, 2704, 141),
            new Brick(this, 2720, 141),
            new Brick(this, 2736, 141),
            new Brick(this, 2752, 141),

        ]);
        
        this.frames = new Map([
            ['stage', [5, 0, 3584, 480]],
            ['stagePipe', [2368, 272, 272, 208]],
            ['coin', [194, 150, 14, 15]],
        ]);
    }

    // Add inside MarioScene class
setBricks(newBricks) {
    this.bricks = newBricks;
}

setPipes(newPipes) {
    this.pipes = newPipes;
}

setEnemies(newEnemies) {
    this.enemies = newEnemies;
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
        const delta = getDelta(time);
        
        for (const brick of this.bricks) brick.update(time);

        for (const pipe of this.pipes) {
    const pipeBox = pipe.getWorldBox();

    for (const player of this.players) {
        const playerBox = this.getPlayerPushBox(player);

// Player and pipe bounding boxes
const playerLeft = playerBox.x;
const playerRight = playerBox.x + playerBox.width;
const playerTop = playerBox.y;
const playerBottom = playerBox.y + playerBox.height;

const pipeLeft = pipeBox.x;
const pipeRight = pipeBox.x + pipeBox.width;
const pipeTop = pipeBox.y;
const pipeBottom = pipeBox.y + pipeBox.height;

const sideTolerance = 5; // for side collisions

// Collision checks

// TOP collision (landing on pipe)
const isOnTop =
    playerBottom <= pipeTop + 5 && // small tolerance
    playerRight > pipeLeft &&
    playerLeft < pipeRight;

// RIGHT side collision (player hits pipe from left → blocked on right side)
const isNearRight =
    playerLeft >= pipeRight - sideTolerance &&
    playerLeft <= pipeRight + sideTolerance &&
    playerBottom > pipeTop + 2 &&
    playerTop < pipeBottom - 2;

// LEFT side collision (player hits pipe from right → blocked on left side)
const isNearLeft =
    playerRight <= pipeLeft + sideTolerance &&
    playerRight >= pipeLeft - sideTolerance &&
    playerBottom > pipeTop + 2 &&
    playerTop < pipeBottom - 2;

// BOTTOM collision (player hits underside of pipe)
const isUnder =
    playerTop >= pipeBottom - 5 && // tolerance
    playerLeft < pipeRight &&
    playerRight > pipeLeft;

   
        if (isOnTop && player.onGround ) {
            // 👇 CHECK INPUT
              player.currentPipe = pipe;
            if (control.isDown(player.playerId, 0) && player.currentPipe?.options.direction === 'down') {
                
                // lock movement
                player.velocity.x = 0;
                player.velocity.y = 1;

                player.enteringPipe = true;
                player.pipeTimer = 0;

                player.currentPipe = pipe;
            }
        }
          
           if (isNearLeft && player.onGround) {
              player.currentPipe = pipe;
            if (control.isBackward(player.playerId, 0) && pipe.options.direction === 'right') {
                // lock movement and start entering pipe
                player.velocity.x = 1;
                player.velocity.y = 0;
                player.enteringPipe = true;
                player.pipeTimer = 0;
            }
        
        }
             if (isNearRight && player.onGround) {
              player.currentPipe = pipe;
            if (control.isForward(player.playerId, 0) && pipe.options.direction === 'left') {
                // lock movement and start entering pipe
                player.velocity.x = -1;
                player.velocity.y = 0;
                player.enteringPipe = true;
                player.pipeTimer = 0;
            }
        
        }

        if (isUnder) {
              player.currentPipe = pipe;
            if (control.isUp(player.playerId, 0) && player.velocity.y > 0 && pipe.options.direction === 'up') {
                // lock movement and start entering pipe
                player.velocity.x = 0;
                player.velocity.y = -1;
                player.enteringPipe = true;
                player.pipeTimer = 0;
            }
        
        }
    }
}

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

updateHorde(time) {
       // 🔒 Safety clamp (VERY IMPORTANT)
    const dt = Math.min(time.secondsPassed, 0.05); // max 50ms

    this.hordeTimer += dt;
    if(gameState.hordekillCount >= 15 && !this.enemySpawn3){
        this.enemies.push(
                new SelectaEnemy(this, 2875, 157, 2.5, -1),
            );
        this.enemySpawn3 = true;
    }
    if (gameState.hordekillCount >= 25) {
        this.stageMusic.play();
        document.querySelector('audio#music-warning').pause();
        this.soundKapNinoBoss.pause();
        this.cameraLock = false;
        gameState.hordeActive = false;
    }

    if (this.hordeTimer >= this.hordeInterval) {
        this.hordeTimer = 0;

        // Random interval between 1–3 seconds
        this.hordeInterval = Math.random() * 2 + 1;

        this.hordeCount++;

        // Randomly pick left or right
        const spawnSide = Math.random() < 0.5 ? 'left' : 'right';

        if (spawnSide === 'left') {
            this.enemies.push(
                new KapNino(this, 2620, 157, 2.5, 1),
            );
        } else {
            this.enemies.push(
                new KapNino(this, 2875, 157, 2.5, -1),
            );
        }

        console.log("Enemy spawned:", spawnSide, "Next spawn in", this.hordeInterval.toFixed(2), "s");
    }
}

    update(time) {
           // 🔒 Safety clamp (VERY IMPORTANT)
    const dt = Math.min(time.secondsPassed, 0.06); 

        if(this.cameraLock){
             this.updateHorde(time);
             gameState.hordeActive = true;
        }
        if (gameState.changeScene) this.game.setScene(new LevelTransition(this.game));
        if(gameState.levelFinished) {
            this.enemies.length = 0;
        };

        // Update players
        for (const player of this.players) {
            player.update(time);
        }

       if (this.players.some(p => p.changeStage)){
            if(gameState.stage=== 'stagePipe') {
    // Clear & push new stage
       this.bricks = this.bricks || [];
        this.enemies = this.enemies || [];
        this.pipes = this.pipes || [];
            // Clear old arrays
        this.bricks.length = 0;
        this.bricks.length = 0;
        this.enemies.length = 0;
        this.pipes.length = 0;

         this.debris.push(new Coin(this, 64, 48));
         this.debris.push(new Coin(this, 80, 48));
         this.debris.push(new Coin(this, 96, 48));
         this.debris.push(new Coin(this, 112, 48));
         this.debris.push(new Coin(this, 128, 48));
         this.debris.push(new Coin(this, 144, 48));
         this.debris.push(new Coin(this, 160, 48));

         this.debris.push(new Coin(this, 64, 74));
         this.debris.push(new Coin(this, 80, 74));
         this.debris.push(new Coin(this, 96, 74));
         this.debris.push(new Coin(this, 112, 74));
         this.debris.push(new Coin(this, 128, 74));
         this.debris.push(new Coin(this, 144, 74));
         this.debris.push(new Coin(this, 160, 74));

         this.debris.push(new Coin(this, 64, 100));
         this.debris.push(new Coin(this, 80, 100));
         this.debris.push(new Coin(this, 96, 100));
         this.debris.push(new Coin(this, 112, 100));
         this.debris.push(new Coin(this, 128, 100));
         this.debris.push(new Coin(this, 144, 100));
         this.debris.push(new Coin(this, 160, 100));
    
    // Push new elements
    this.bricks.push(
        new Brick(this, 64, 128, 'dark'),
        new Brick(this, 80, 128, 'dark'),
        new Brick(this, 96, 128, 'dark'),
        new Brick(this, 112, 128, 'dark'),
        new Brick(this, 128, 128, 'dark'),
        new Brick(this, 144, 128, 'dark'),
        new Brick(this, 160, 128, 'dark'),

        new Brick(this, 64, 0, 'dark'),
        new Brick(this, 80, 0, 'dark'),
        new Brick(this, 96, 0, 'dark'),
        new Brick(this, 112, 0, 'dark'),
        new Brick(this, 128, 0, 'dark'),
        new Brick(this, 144, 0, 'dark'),
        new Brick(this, 160, 0, 'dark'),

      
        new Ground(this, 1, 176, 271, 31),
        new Ground(this, 0, 0, 15, 176),
        new Ground(this, 208, 145, 38, 30),
        new Ground(this, 242, 0, 29, 177),
    );
    
    this.enemies.push(
     new KapNino(this, 150, 60, 2, -1),
    );
    
    this.pipes.push(
        new Pipe(this, 208, 145, 38, 30, {
            stage: 'stage',
            width: 200,
            direction: 'right',
            destination: { x: 2610, y: 170 },
            music: document.querySelector('audio#music-ground'),
        }),
        
    );
    
    // Reset Mario
    this.mario.resetVelocities();
    this.mario.changeStage = false;
   if(gameState.mario.players === 2) this.mario2.resetVelocities();
     if(gameState.mario.players === 2) this.mario2.changeStage = false;
}
 else if(gameState.stage === 'stage') {
    // Clear & push new stage
       this.bricks = this.bricks || [];
        this.enemies = this.enemies || [];
        this.pipes = this.pipes || [];
            // Clear old arrays
        this.bricks.length = 0;
        this.debris.length = 0;
        this.enemies.length = 0;
        this.pipes.length = 0;

        this.enemies.push(
           new KapNino(this, 400, 150,0.5, -1),
            new KapNino(this, 440, 150,0.5, -1),
            new CloudEnemy(this, 470, 100),
          //  new SuperMan(this, 2000, 50),
            new KapNino(this, 682, 150,0.5, -1),
            new KapNino(this, 656, 150,0.5, -1),
           
        );

        this.pipes.push(
             new Pipe(this, 915, 144, 15, 64, {
                stage: 'stagePipe',
                width: 40,
                direction: 'down',
                destination: { x: 40, y: 50 },
                music: document.querySelector('audio#music-underground'),
            }),
        );

        this.bricks.push(
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
             new Ground(this, 3507, 0, 16, 208),
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

            new Ground(this, 2395, 160, 48, 48),
            new Ground(this, 2411, 144, 32, 16),
            new Ground(this, 2379, 176, 16, 32),
            new Ground(this, 2363, 192, 16, 16),

            new Ground(this, 2475, 160, 32, 48),
            new Ground(this, 2475, 144, 16, 16),
            new Ground(this, 2507, 176, 16, 32),
            new Ground(this, 2523, 192, 16, 16),

            //last section blocks
            new Ground(this, 2971, 112, 64, 96),
            new Ground(this, 3003, 80, 32, 32),
            new Ground(this, 2955, 128, 16, 80),
            new Ground(this, 2939, 144, 16, 64),
            new Ground(this, 2907, 176, 32, 32),
            new Ground(this, 2891, 192, 16, 16),
            new Ground(this, 2923, 160, 16, 16),
            new Ground(this, 2987, 96, 16, 16),


            new Brick(this, 1888, 141),
            
            new Brick(this, 2048, 80),
            new SecretBlock(this, 2062, 80),
            new SecretBlock(this, 2078, 80),
            new Brick(this, 2094, 80),

            new Brick(this, 2062, 141),
            new Brick(this, 2078, 141),

            new Brick(this, 2704, 141),
            new Brick(this, 2720, 141),
            new SecretBlock(this, 2565,141,{
                type: 'powerup',
                power: 'gunPowerup'
            }),
            new Brick(this, 2736, 141),
            new Brick(this, 2752, 141),
        );

        this.debris.push(new FlagPole(this, 3163, 40));
         // Reset Mario
    this.superManSpawned = false;
   
    this.mario.resetVelocities();
    this.mario.changeStage = false;
      if(gameState.mario.players === 2) this.mario2.resetVelocities();
     if(gameState.mario.players === 2) this.mario2.changeStage = false;
}
        }

         // Spawn SuperMan dynamically when Mario reaches x = 1500
    if (!this.superManSpawned && this.mario.position.x >= 700) {
        this.enemies.push(new SuperMan(this, 1000, 35)); // spawn near the target position
        this.superManSpawned = true; // make sure it only happens once
    }
   
     if (!this.enemySpawn && this.mario.position.x >=1430 && this.mario.position.x <= 2300) {
        this.enemies.push(new KapNino(this, 1730, 175)); 
        this.enemies.push(new KapNino(this, 1705, 175)); 
         this.enemies.push(new SelectaEnemy(this, 2100, 50, 1, 1));
        this.enemySpawn = true; // make sure it only happens once
         
    }
     if (!this.enemySpawn2 && this.mario.position.x >=2600) {
     
         this.enemies.push(new SelectaEnemy(this, 2750, 50, 1, 1));
       this.enemySpawn2 = true; // make sure it only happens once
    }

        // continue if at least one player alive
        if (this.players.every(player => player.isDead)) return;

        // Initialize timer helpers (only once)
        this.scoreTexts.forEach(t => t.update(time));
        this.scoreTexts = this.scoreTexts.filter(t => !t.markedForDeletion);
        if (!this.timeCounter) this.timeCounter = 0;

        // Timer always updates
        this.timeCounter += dt;
        if (this.timeCounter >= 1) {
            this.timeCounter -= 1;
            if (gameState.mario.time > 0) {
                gameState.mario.time--;
            }
        }

       this.debris.forEach(d => d.update(time));
        this.bullets.forEach(d => d.update(time));
        this.bullets = this.bullets.filter(d => !d.markedForDeletion);
        this.debris = this.debris.filter(d => !d.markedForDeletion);

        this.updateEntities(time);

        this.enemies = this.enemies.filter(e => !e.remove);


        // Enemy interactions for all players
        for (const enemy of this.enemies) {
            if (!enemy.boxes) continue;
            enemy.update(time);
          // --- BULLET COLLISION HANDLER ---
for (const bullet of this.bullets) {
    if (bullet.markedForDeletion) continue;

    const bulletBox = bullet.getBox();

    // 1️⃣ Check collision with enemies
    for (const enemy of this.enemies) {
        if (!enemy.boxes || enemy.isDead) continue;

        if (this.isColliding(bulletBox, enemy.boxes.push)) {
            bullet.markedForDeletion = true;
            if(enemy.lives < 1)enemy.isDead = true;
            enemy.changeState(FighterState.DIE);
            enemy.velocity.y = -3;
            playSound(enemy.soundDead, 1);
        }
    }

    // 2️⃣ Check collision with bricks
    for (const brick of this.bricks) {
        if (!brick.getWorldBox) continue;

        const brickBox = brick.getWorldBox();
        if (this.isColliding(bulletBox, brickBox)) {
            bullet.markedForDeletion = true;
            
            if (brick.break) {
                brick.break();   // heavy or destructible brick
            } else if (brick.bump) {
                brick.bump();    // secret block or light brick
            }
        }
    }

    // 3️⃣ Check collision with pipes
    for (const pipe of this.pipes) {
        if (!pipe.getWorldBox) continue;

        const pipeBox = pipe.getWorldBox();
        if (this.isColliding(bulletBox, pipeBox)) {
            bullet.markedForDeletion = true;
            // Optionally play a sound for hitting a pipe
            playSound(document.querySelector('audio#sound-bump'), 1);
        }
    }

    // 4️⃣ Optionally, check other debris / objects
    for (const debris of this.debris) {
        if (!debris.getWorldBox) continue;
        const debrisBox = debris.getWorldBox();
        if (this.isColliding(bulletBox, debrisBox)) {
            bullet.markedForDeletion = true;
            // Add effects if desired
        }
    }
}

// 5️⃣ Clean up bullets
this.bullets = this.bullets.filter(b => !b.markedForDeletion);


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
                       player.hurtTimer = 0.5; // half a second
                        player.velocity.x = 3 * player.direction * -1;
                        player.velocity.y -= 3;
                    }
                }
            }
        

    // Stage scrolling (follow first active player)
const activePlayer = this.players.find(p => !p.isDead) || this.players[0];
const canvasWidth = this.stageContext.width || 200;
const stageWidth = this.frames.get(this.stageContext.frame)[2];
const leftBoundary = canvasWidth / 3;
const rightBoundary = canvasWidth * 2 / 3;

// === CAMERA LOCK TRIGGER ===
if (!this.cameraLock && activePlayer.position.x >= 2730 && !this.cameraLockDone) {
    this.cameraLock = true;
     
    this.stageMusic.pause();
    document.querySelector('audio#music-warning').currentTime = 0;
    document.querySelector('audio#music-warning').play();
    document.querySelector('audio#sound-kapNinoBoss').currentTime = 0;
    this.soundKapNinoBoss.play();

    this.cameraLockDone = true;
    // lock camera at current stage.x or far right if desired
    this.lockedStageX = 2550; 
}

// === CAMERA SCROLLING ===
if (!this.cameraLock) {
    if (activePlayer.position.x - this.stage.x < leftBoundary)
        this.stage.x = activePlayer.position.x - leftBoundary;
    else if (activePlayer.position.x - this.stage.x > rightBoundary)
        this.stage.x = activePlayer.position.x - rightBoundary;

    // clamp stage.x
    if (this.stage.x < 0) this.stage.x = 0;
    if (this.stage.x > stageWidth - canvasWidth - 300)
        this.stage.x = stageWidth - canvasWidth - 300;
} else {
    // camera locked
    this.stage.x = this.lockedStageX;

    // clamp player inside visible camera area
    const visibleLeft = this.stage.x;
    const visibleRight = this.stage.x + canvasWidth+180;
    if (activePlayer.position.x < visibleLeft) activePlayer.position.x = visibleLeft;
    if (activePlayer.position.x > visibleRight) activePlayer.position.x = visibleRight;
}
    }

    drawEntities(context) {
        if(this.cameraLock) {
             context.font = "11px MarioFont";
            context.fillStyle = "white";
            context.fillText(`HORDE! Kill all Kap Ninos!`, 50, 90);
            context.fillText(`Kill: ${gameState.hordekillCount}/25`, 50, 105);
        }
        for (const brick of this.bricks) {
            brick.draw(context, this.stage);
          if(gameState.debug.entities) brick.drawDebug(context, this.stage);
        }
           for (const pipe of this.pipes) {
           // pipe.draw(context, this.stage);
          if(gameState.debug.entities) pipe.drawDebug(context, this.stage);
        }

         for (const bullet of this.bullets) {
            bullet.draw(context, this.stage);
           if(gameState.debug.entities) bullet.drawDebug(context, this.stage);
        }

        for (const enemy of this.enemies) {
            enemy.drawFrame(
                context,
                enemy.position.x - this.stage.x,
                enemy.position.y - this.stage.y,
                enemy.direction
            );
           enemy.draw(context, this.stage);
          if(gameState.debug.entities) enemy.drawDebug?.(context, this.stage);
        }
    }

    draw(context) {
        // Draw stage
        context.fillStyle = 'black';
    context.fillRect(
       0,
        0,
        400,
        224,
    );
        this.drawFrame(context, this.stageContext.frame, -this.stage.x, -this.stage.y);

        // Draw players
        for (const player of this.players) {
            player.drawFrame(
                context,
                player.position.x - this.stage.x,
                player.position.y - this.stage.y,
                player.direction
            );
           if(gameState.debug.entities) player.drawDebug(context, this.stage);
        }
         // Draw bricks behind Mario
        this.drawEntities(context);

        this.debris.forEach(d => d.draw(context, this.stage));
        
        this.scoreTexts.forEach(t => t.draw(context, this.stage));
        drawText(context, this.imageUI, this.frames);
     
    }
}