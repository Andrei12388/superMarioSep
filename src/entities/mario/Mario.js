import { FighterState, FrameDelay } from '../../constants/fighter.js';
import { Control } from '../../constants/control.js';
import * as control from '../../inputHandler.js';
import { playSound } from '../../soundHandler.js';
import { gameState } from '../../state/gameState.js';

export class Mario {
    constructor(game, playerId = 0) {
        this.game = game;
        this.playerId = playerId;
        this.soundJump = document.querySelector('audio#sound-jump');
         this.gameOver = document.querySelector('audio#music-gameOver');

        // --- Constants & initial state ---
        this.ground = 207;

        // Position offset for player2
        this.position = { x: 2600 + playerId * 40, y: 200 };
        this.direction = 1;

        this.powerType = null;

        this.walkEndAnim = false;
        this.removeMario = false; // flag to signal Mario removal after auto-walk finishes

        this.enteringPipe = false;
        this.pipeSoundPlay = false;
        this.pipeTimer = 0;
        this.changeStage = false;
        this.currentPipe = null;

        this.visible = true;

        this.maxSpeed = 1.1;
        this.acceleration = 0.1;
        this.friction = 0.1;
        this.gravity = 0.5;
        this.jumpForce = 9;
        this.runJumpForce = 10; // running jump boost
        this.isBig = false;
        this.isPoweredUp = false;
        this.lives = 2;
        this.isHurt = false;
        this.hurtTimer = 0;

        this.alpha = 1;

        this.isDead = false;
        this.deathTimer = 0;
        this.deathPhase = 0; // 0 = pause, 1 = jump, 2 = falling

        // --- ON GROUND FLAG ---
        this.onGround = false; // <-- property only, no method

        this.velocity = { x: 0, y: 0 };

        this.image = document.querySelector('img[alt="mario"]');

        // --- Animation & frames ---
        this.frames = new Map([
             ['gunBullet', [
                [[300, 467, 17, 6], [8, 4], { push: [-2, -8, 8, 6], hurt: [-2, -8, 8, 6],  }],
            ]],
            ['gunSmoke', [
                [[298, 439, 30, 18], [15, 16], { push: [0, 0, 0, 0], hurt: [0, 0, 0, 0], }],
                [[331, 436, 34, 21], [17, 19], { push: [0, 0, 0, 0], hurt: [0, 0, 0, 0], }],
                [[373, 429, 29, 31], [15, 29], { push: [0, 0, 0, 0], hurt: [0, 0, 0, 0], }],
                [[413, 431, 20, 29], [10, 15], { push: [0, 0, 0, 0], hurt: [0, 0, 0, 0], }],
            ]],
            ['idleSmall', [
                [[131, 63, 31, 30], [15, 28], { push: [-2, -30, 12, 30], hurt: [-2, -30, 12, 30] }]
            ]],
            ['walkSmall', [
                [[2, 61, 37, 35], [19, 33], { push: [-2, -30, 12, 30], hurt: [-2, -30, 12, 30] }],
                [[45, 62, 29, 35], [15, 33], { push: [-2, -30, 12, 30], hurt: [-2, -30, 12, 30] }],
                [[87, 63, 29, 33], [15, 31], { push: [-2, -30, 12, 30], hurt: [-2, -30, 12, 30] }],
                [[131, 63, 31, 30], [15, 28], { push: [-2, -30, 12, 30], hurt: [-2, -30, 12, 30] }],
                [[87, 63, 29, 33], [15, 31], { push: [-2, -30, 12, 30], hurt: [-2, -30, 12, 30] }],
                [[45, 62, 29, 35], [15, 33], { push: [-2, -30, 12, 30], hurt: [-2, -30, 12, 30] }]
            ]],
            ['idle', [
                [[2, 1, 37, 49], [19, 47], { push: [-2, -44, 12, 44], hurt: [-2, -44, 12, 44] }]
            ]],
            ['walk', [
                [[2, 1, 37, 49], [19, 47], { push: [-2, -44, 12, 44], hurt: [-2, -44, 12, 44] }],
                [[50, 2, 29, 50], [15, 48], { push: [-2, -44, 12, 44], hurt: [-2, -44, 12, 44] }],
                [[92, 4, 29, 47], [15, 45], { push: [-2, -44, 12, 44], hurt: [-2, -44, 12, 44] }],
                [[136, 4, 31, 44], [15, 42], { push: [-2, -44, 12, 44], hurt: [-2, -44, 12, 44] }]
            ]],
             ['idleGun', [
                [[144, 432, 45, 44], [22, 42], { push: [-2, -44, 12, 44], hurt: [-2, -44, 12, 44] }]
            ]],
            ['walkGun', [
                [[144, 432, 45, 44], [22, 42], { push: [-2, -44, 12, 44], hurt: [-2, -44, 12, 44] }],
                [[92, 432, 44, 47], [22, 45], { push: [-2, -44, 12, 44], hurt: [-2, -44, 12, 44] }],
                [[47, 430, 32, 50], [16, 48], { push: [-2, -44, 12, 44], hurt: [-2, -44, 12, 44] }],
                [[0, 429, 37, 49], [18, 47], { push: [-2, -44, 12, 44], hurt: [-2, -44, 12, 44] }]
            ]],
              ['GunShoot', [
                  [[144, 432, 45, 44], [22, 42], { push: [-2, -44, 12, 44], hurt: [-2, -44, 12, 44] }],
                [[199, 427, 39, 53], [19, 51], { push: [-2, -44, 12, 44], hurt: [-2, -44, 12, 44] }],
                [[243, 428, 43, 49], [22, 47], { push: [-2, -44, 12, 44], hurt: [-2, -44, 12, 44] }],
               
            ]],
            ['getUp-1', [
                [[11, 955, 53, 55], [27, 53], { push: [-20, -50, 36, 46], hurt: [0, -500, 0, 0] }]
            ]],
            ['growBig', [
                [[2, 1, 37, 49], [19, 47], { push: [-2, -44, 12, 44], hurt: [-2, -44, 12, 44] }],
                [[131, 63, 31, 30], [15, 28], { push: [-2, -30, 12, 30], hurt: [-2, -30, 12, 30] }],
                [[2, 1, 37, 49], [19, 47], { push: [-2, -44, 12, 44], hurt: [-2, -44, 12, 44] }],
                [[131, 63, 31, 30], [15, 28], { push: [-2, -30, 12, 30], hurt: [-2, -30, 12, 30] }]
            ]],
            ['growSmall', [
                [[2, 1, 37, 49], [19, 47], { push: [-2, -44, 12, 44], hurt: [-2, -44, 12, 44] }],
                [[131, 63, 31, 30], [15, 28], { push: [-2, -30, 12, 30], hurt: [-2, -30, 12, 30] }],
                [[2, 1, 37, 49], [19, 47], { push: [-2, -44, 12, 44], hurt: [-2, -44, 12, 44] }],
                [[131, 63, 31, 30], [15, 28], { push: [-2, -30, 12, 30], hurt: [-2, -30, 12, 30] }]
            ]]
        ]);

        this.currentAnimationKey = 'idleSmall';
        this.animationFrame = 0;
        this.animationTimer = 0;

        // --- Boxes ---
        this.boxes = {
            push: { x: 0, y: 0, width: 0, height: 0 },
            hurt: { x: 0, y: 0, width: 0, height: 0 }
        };

        // --- States ---
        this.states = {
            [FighterState.IDLE]: {
                init: this.handleIdleInit.bind(this),
                update: this.handleIdleState.bind(this),
                validFrom: [undefined, FighterState.IDLE, FighterState.WALK_FORWARD, FighterState.WALKEND,FighterState.WALK_BACKWARD, FighterState.GROW, FighterState.GUNSHOOT]
            },
            [FighterState.GROW]: {
                init: this.handleGrowInit.bind(this),
                update: this.handleGrowState.bind(this),
                validFrom: [undefined, FighterState.IDLE, FighterState.WALK_FORWARD, FighterState.WALK_BACKWARD, FighterState.GUNSHOOT]
            },
             [FighterState.GUNSHOOT]: {
                init: this.handleGunShootInit.bind(this),
                update: this.handleGunShootState.bind(this),
                validFrom: [undefined, FighterState.IDLE, FighterState.WALK_FORWARD, FighterState.WALK_BACKWARD, FighterState.GROW]
            },
            [FighterState.WALK_FORWARD]: {
                init: this.handleWalkForwardInit.bind(this),
                update: this.handleWalkForwardState.bind(this),
                validFrom: [FighterState.IDLE, FighterState.WALK_BACKWARD, FighterState.WALKEND]
            },
             [FighterState.WALKEND]: {
                init: this.handleWalkEndInit.bind(this),
                update: this.handleWalkEndState.bind(this),
                validFrom: [FighterState.IDLE, FighterState.WALK_BACKWARD, FighterState.WALK_FORWARD]
            },
            [FighterState.WALK_BACKWARD]: {
                init: this.handleWalkBackwardInit.bind(this),
                update: this.handleWalkBackwardState.bind(this),
                validFrom: [FighterState.IDLE, FighterState.WALK_FORWARD, FighterState.WALKEND]
            }
        };

        // Initialize state
        this.changeState(FighterState.IDLE);
    }

    // --- STATE HANDLING ---
    changeState(newState, animationKey = null, ...args) {
         

        const state = this.states[newState];
        if (!state || !state.validFrom.includes(this.currentState)) return;

        this.currentState = newState;
        this.animationFrame = 0;
        this.animationTimer = 0;
        this.attackStruck = false;

        if (animationKey) this.currentAnimationKey = animationKey;

        state.init(...args);
    }

    handleGunShootInit() {
        this.currentAnimationKey = 'GunShoot';
        this.shoot();
        console.log("Shooting")
    }

    handleGunShootState(time) {
      
    }
    
    handleWalkEndInit(){
        console.log("Entered WALKEND state");
        playSound(document.querySelector('audio#music-levelFinished'), 1);
        this.currentAnimationKey = this.isBig ? 'walk' : 'walkSmall'; 
    }

    handleWalkEndState() {
        this.velocity.x = 0.5;
        console.log("Auto walking...");
         this.currentAnimationKey = this.isBig ? 'walk' : 'walkSmall'; 
    }

    // --- IDLE STATE ---
   handleIdleInit() {
    this.currentAnimationKey = this.isPoweredUp
        ? 'idleGun'
        : (this.isBig ? 'idle' : 'idleSmall');
}
   handleGrowInit() {
    this.alpha = 0.5;

    // Always reuse grow animation
    this.currentAnimationKey = this.isBig ? 'growSmall' : 'growBig';
}

 handleGrowState() {
    const frames = this.frames.get(this.currentAnimationKey);

    if (this.animationFrame === frames.length - 1) {
        this.alpha = 1;

        if (this.powerType === 'gun') {
            // 🔫 GUN MODE
            this.isBig = true;
            this.isPoweredUp = true;

            this.changeState(FighterState.IDLE, 'idle');
        } 
        else {
            // 🍄 NORMAL MUSHROOM
            if (this.currentAnimationKey === 'growBig') {
                this.isBig = true;
                this.isPoweredUp = false; // 👈 important: not gun
                this.changeState(FighterState.IDLE, 'idle');
            }

            if (this.currentAnimationKey === 'growSmall') {
                this.isBig = false;
                this.isPoweredUp = false;
                this.changeState(FighterState.IDLE, 'idleSmall');
            }
        }

        // reset after use
        this.powerType = null;
    }
}

  handleIdleState() {
    // 🔫 SHOOT
    if (this.isPoweredUp && control.isLightPunch(this.playerId)) {
        this.changeState(FighterState.GUNSHOOT, 'GunShoot');
        return;
    }

    // Jump
    if (control.isHeavyKick(this.playerId) && this.onGround) {
        this.velocity.y = -this.jumpForce;
        playSound(this.soundJump, 1);
    }
    else if (control.isForward(this.playerId, 1)) {
        this.changeState(
            FighterState.WALK_FORWARD,
            this.isPoweredUp ? 'walkGun' : (this.isBig ? 'walk' : 'walkSmall')
        );
    }
    else if (control.isBackward(this.playerId, 1)) {
        this.changeState(
            FighterState.WALK_BACKWARD,
            this.isPoweredUp ? 'walkGun' : (this.isBig ? 'walk' : 'walkSmall')
        );
    }
}

    // --- WALK STATES ---
  handleWalkForwardInit() {
    this.direction = 1;
    this.currentAnimationKey = this.isPoweredUp
        ? 'walkGun'
        : (this.isBig ? 'walk' : 'walkSmall');
}
   handleWalkBackwardInit() {
    this.direction = -1;
    this.currentAnimationKey = this.isPoweredUp
        ? 'walkGun'
        : (this.isBig ? 'walk' : 'walkSmall');
}



    handleWalkForwardState() {
         if (this.isPoweredUp && control.isLightPunch(this.playerId)) {
        this.changeState(FighterState.GUNSHOOT, 'GunShoot');
        return;
    }
        const isRunning = control.isControlDown(this.playerId, Control.LIGHT_PUNCH) || control.isControlDown(this.playerId, Control.LIGHT_KICK);        if (isRunning) console.log('Running forward');        const currentMaxSpeed = isRunning ? 1.6 : this.maxSpeed;
        this.velocity.x = Math.min(this.velocity.x, currentMaxSpeed);
        this.position.x += this.velocity.x;
        // --- Horizontal collisions ---
        for (const brick of this.game.bricks) {
            if (brick.isBroken) continue;

            const brickBox = brick.getWorldBox();
            const pushBox = {
                x: this.position.x + this.boxes.push.x,
                y: this.position.y + this.boxes.push.y,
                width: this.boxes.push.width,
                height: this.boxes.push.height,
            };

            // Only check horizontal collisions if vertically overlapping
            const verticallyOverlapping =
                pushBox.y + pushBox.height > brickBox.y &&
                pushBox.y < brickBox.y + brickBox.height;

            if (!verticallyOverlapping) continue;

            // Moving right into a brick
            if (this.velocity.x > 0 && pushBox.x + pushBox.width > brickBox.x && pushBox.x < brickBox.x) {
                this.position.x = brickBox.x - pushBox.width - this.boxes.push.x;
                this.velocity.x = 0;
            }
            // Moving left into a brick
            else if (this.velocity.x < 0 && pushBox.x < brickBox.x + brickBox.width && pushBox.x + pushBox.width > brickBox.x + brickBox.width) {
                this.position.x = brickBox.x + brickBox.width - this.boxes.push.x;
                this.velocity.x = 0;
            }
        }

        if (!control.isForward(this.playerId, 1)) this.changeState(FighterState.IDLE, this.isBig ? 'idle' : 'idleSmall');
        if (control.isHeavyKick(this.playerId) && this.onGround) {
            playSound(this.soundJump, 1)
            const jumpForce = isRunning ? this.runJumpForce : this.jumpForce;
            this.velocity.y = -jumpForce;
        }
    }

    handleWalkBackwardState() {
         if (this.isPoweredUp && control.isLightPunch(this.playerId)) {
        this.changeState(FighterState.GUNSHOOT, 'GunShoot');
        return;
    }
        const isRunning = control.isControlDown(this.playerId, Control.LIGHT_PUNCH) || control.isControlDown(this.playerId, Control.LIGHT_KICK);        if (isRunning) console.log('Running backward');        const currentMaxSpeed = isRunning ? 1.6 : this.maxSpeed;
        this.velocity.x = Math.max(this.velocity.x, -currentMaxSpeed);
        this.position.x += this.velocity.x;
        // --- Horizontal collisions ---
        for (const brick of this.game.bricks) {
            if (brick.isBroken) continue;

            const brickBox = brick.getWorldBox();
            const pushBox = {
                x: this.position.x + this.boxes.push.x,
                y: this.position.y + this.boxes.push.y,
                width: this.boxes.push.width,
                height: this.boxes.push.height,
            };

            // Only check horizontal collisions if vertically overlapping
            const verticallyOverlapping =
                pushBox.y + pushBox.height > brickBox.y &&
                pushBox.y < brickBox.y + brickBox.height;

            if (!verticallyOverlapping) continue;

            // Moving right into a brick
            if (this.velocity.x > 0 && pushBox.x + pushBox.width > brickBox.x && pushBox.x < brickBox.x) {
                this.position.x = brickBox.x - pushBox.width - this.boxes.push.x;
                this.velocity.x = 0;
            }
            // Moving left into a brick
            else if (this.velocity.x < 0 && pushBox.x < brickBox.x + brickBox.width && pushBox.x + pushBox.width > brickBox.x + brickBox.width) {
                this.position.x = brickBox.x + brickBox.width - this.boxes.push.x;
                this.velocity.x = 0;
            }
        }

        if (!control.isBackward(this.playerId, 1)) this.changeState(FighterState.IDLE, this.isBig ? 'idle' : 'idleSmall');
        if (control.isHeavyKick(this.playerId) && this.onGround){
            playSound(this.soundJump, 1)
            const jumpForce = isRunning ? this.runJumpForce : this.jumpForce;
            this.velocity.y = -jumpForce;
        } 
    }

    // --- BOXES ---
    updateBoxes() {
        const frames = this.frames.get(this.currentAnimationKey);
        if (!frames) return;
        const frame = frames[this.animationFrame % frames.length];
        if (!frame) return;

        const boxData = frame[2];
        if (boxData.push) {
            const [x, y, w, h] = boxData.push;
            this.boxes.push = { x, y, width: w, height: h };
        }
        if (boxData.hurt) {
            const [x, y, w, h] = boxData.hurt;
            this.boxes.hurt = { x, y, width: w, height: h };
        }
    }

    // Add this inside Mario class
checkCollision(box) {
    const marioBox = {
        x: this.position.x + this.boxes.push.x,
        y: this.position.y + this.boxes.push.y,
        width: this.boxes.push.width,
        height: this.boxes.push.height
    };

    return !(
        marioBox.x + marioBox.width < box.x ||
        marioBox.x > box.x + box.width ||
        marioBox.y + marioBox.height < box.y ||
        marioBox.y > box.y + box.height
    );
}

handleDeath(time) {
    this.deathTimer += time.secondsPassed;

    // Phase 0: short pause (like NES freeze)
    if (this.deathPhase === 0) {
        if (this.deathTimer > 0.3) {
            this.deathPhase = 1;
            this.velocity.y = -8; // jump upward
        }
        return;
    }

    // Phase 1 & 2: physics (rise then fall)
    this.velocity.y += this.gravity;
    this.position.y += this.velocity.y;

    // After 3 seconds → change scene
    if (this.deathTimer >= 5) {
        console.log("Changing to Game Over scene");
        
            gameState.changeScene = true;
        
    }
}

    // --- PHYSICS & UPDATE ---
   update(time) {
    // 🚨 FLAG AUTO WALK OVERRIDE
if (this.autoWalk) {
    this.velocity.x = 0.5;
    this.direction = 1;

    // ✅ ONLY change state if not already walking
    if (!this.walkEndAnim) {
        console.log("Changing to WALKEND state");
        this.changeState(
            FighterState.WALKEND,
            this.isBig ? 'walk' : 'walkSmall'
        );
        this.walkEndAnim = true;
    }
    if (this.position.x >= 3263) {
        this.position.x = 3263;
        this.velocity.x = 0;
        this.removeMario = true; // signal to remove Mario after reaching end
    }
    this.position.x += this.velocity.x;


}
    if (this.onFlagPole) {
    this.velocity.x = 0;
    this.velocity.y = 0;
    return; // 🚨 stop ALL normal logic
}
   if (this.enteringPipe) {
    this.pipeTimer++;

    // move Mario down slowly into pipe
    if(!this.pipeSoundPlay) {
        document.querySelector('audio#sound-powerDown').play();
        this.pipeSoundPlay = true;
    }
   
    this.game.stageMusic.pause();
   
   if(!this.enteringPipe) this.velocity.y = 1.5;
  
    this.position.y += this.velocity.y;
    if(this.enteringPipe) this.position.x += this.velocity.x;

    // after some frames → hide / teleport
 if (this.pipeTimer > 40) {
    this.visible = false;

    this.position.x = this.currentPipe.options.destination.x;
    this.position.y = this.currentPipe.options.destination.y;

    this.game.stageContext.frame = this.currentPipe?.options.stage || 'stage';
    gameState.stage = this.currentPipe?.options.stage || 'stage';
    this.game.stageContext.width = this.currentPipe?.options.width || 200;
    this.game.stageMusic = this.currentPipe.options.music;
    this.game.stageMusic.currentTime = 0;
    this.game.stageMusic.play();
    

    this.changeStage = true;

    // ✅ RESET EVERYTHING IMPORTANT
    this.enteringPipe = false;
    this.pipeTimer = 0;
    this.pipeSoundPlay = false;

    this.visible = true;

    this.resetVelocities();        // 🔥 VERY IMPORTANT
    this.onGround = false;         // will be recalculated next frame

    this.changeState(FighterState.IDLE); // 🔥 reset FSM

    this.currentPipe = null;       // cleanup reference
}

    return; // 🚨 stop ALL other logic
}
    if (this.isDead) {
    this.handleDeath(time);
    return; // stop ALL normal logic
}
    if(this.position.y > 275) {
        this.die();
    }
    

    // --- Apply horizontal friction ALWAYS ---
if (!control.isForward(this.playerId, 1) && !control.isBackward(this.playerId, 1)) {
    if (this.velocity.x > 0) {
        this.velocity.x -= this.friction;
        if (this.velocity.x < 0) this.velocity.x = 0;
    } else if (this.velocity.x < 0) {
        this.velocity.x += this.friction;
        if (this.velocity.x > 0) this.velocity.x = 0;
    }
}

this.position.x += this.velocity.x;

// Determine max speed based on running (holding low punch or low kick)
const isRunning = control.isControlDown(this.playerId, Control.LIGHT_PUNCH) || control.isControlDown(this.playerId, Control.LIGHT_KICK);
if (isRunning) console.log('Running (update clamp)');
const maxSpeed = isRunning ? 1.6 : this.maxSpeed;

// Clamp speed
this.velocity.x = Math.max(-maxSpeed, Math.min(this.velocity.x, maxSpeed));
    if (this.isHurt) {
        this.hurtTimer--;
        if (this.hurtTimer <= 0) this.isHurt = false;
    }

    // --- Apply gravity ---
    this.velocity.y += this.gravity;
    this.position.y += this.velocity.y;

    

   // --- Brick collisions ---
for (const brick of this.game.bricks) {
    if (brick.isBroken) continue;

    const brickBox = brick.getWorldBox();
    const pushBox = {
        x: this.position.x + this.boxes.push.x,
        y: this.position.y + this.boxes.push.y,
        width: this.boxes.push.width,
        height: this.boxes.push.height,
    };

    const marioFeetY = pushBox.y + pushBox.height;
    const brickTopY = brickBox.y;

    const horizontallyOverlapping =
        pushBox.x + pushBox.width > brickBox.x &&
        pushBox.x < brickBox.x + brickBox.width;

    const tolerance = 5; // slightly bigger to prevent jitter

    

    // --- LANDING from above ---
    if (this.velocity.y >= 0 && marioFeetY >= brickTopY - tolerance && marioFeetY <= brickTopY + this.velocity.y && horizontallyOverlapping) {
        // Clamp Mario to top of brick
        this.position.y = brickTopY - this.boxes.push.height - this.boxes.push.y;
        this.velocity.y = 0;
        this.onGround = true;
    }

    // --- HEADBUTT from below ---
    const marioHeadY = pushBox.y;
    const brickBottomY = brickBox.y + brickBox.height;

    if (this.velocity.y < 0 && marioHeadY <= brickBottomY && marioHeadY >= brickBottomY + this.velocity.y && horizontallyOverlapping) {
        this.position.y = brickBottomY - this.boxes.push.y;
        this.velocity.y = 2; // bounce down

        if (brick.type !== undefined && typeof brick.hit === 'function') {
            brick.hit(); // secret block behavior
        } else if (this.isBig && typeof brick.break === 'function') {
            brick.break();
        } else if (!this.isBig && typeof brick.bump === 'function') {
            brick.bump();
        }
    }
}

    // --- Update FSM state ---
    const state = this.states[this.currentState];
    if (state && state.update) state.update(time);

    // --- Update collision boxes ---
    this.updateBoxes();

  // --- Animate ---
this.animationTimer += 1;

const frames = this.frames.get(this.currentAnimationKey);
if (!frames) return;

let animationFinished = false;

if (this.animationTimer >= 10) {
    this.animationTimer = 0;

    if (
        this.currentState === FighterState.GROW ||
        this.currentState === FighterState.GUNSHOOT
    ) {
        if (this.animationFrame < frames.length - 1) {
            this.animationFrame++;
        } else {
            animationFinished = true; // ✅ detect finish here
        }
    } else {
        this.animationFrame = (this.animationFrame + 1) % frames.length;
    }
}

if (this.currentState === FighterState.GUNSHOOT && animationFinished) {
    this.changeState(FighterState.IDLE, 'idleGun');
    console.log("Animation finished, changing back to idleGun");
}


if(this.autoWalk) return;
// --- Horizontal input acceleration ---
if (control.isForward(this.playerId, 1)) {
    
    this.velocity.x += this.acceleration;
    this.direction = 1;
}

if (control.isBackward(this.playerId, 1)) {
    this.velocity.x -= this.acceleration;
    this.direction = -1;
}

}

    drawFrame(context, x, y, direction = 1, scale = 1, alpha = 1) {
         if (this.removeMario) return;
        if (this.isHurt && !this.isDead && Math.floor(this.hurtTimer / 5) % 2 === 0) alpha = 0.3;

        const frames = this.frames.get(this.currentAnimationKey);
        if (!frames) return;
        const frame = frames[this.animationFrame % frames.length];
        if (!frame) return;

        const [[sx, sy, sw, sh], [ox, oy]] = frame;

        context.save();
        context.globalAlpha = this.alpha * alpha;
        context.translate(x, y);
        context.scale(direction * scale, scale);
        context.drawImage(this.image, sx, sy, sw, sh, -ox, -oy, sw, sh);
        context.restore();
    }

   draw(context) {
    if (!this.visible) return; // 👈 hide Mario completely
    this.drawFrame(context, this.position.x, this.position.y, this.direction);
}

    drawDebug(context, stageOffset = { x: 0, y: 0 }, scale = 1) {
        const { push, hurt } = this.boxes;
        const drawBox = (box, color) => {
            context.strokeStyle = color;
            context.lineWidth = 1;
            const x = this.direction === 1 ? this.position.x + box.x - stageOffset.x : this.position.x - box.x - box.width - stageOffset.x;
            const y = this.position.y + box.y - stageOffset.y;
            context.strokeRect(Math.floor(x * scale), Math.floor(y * scale), box.width * scale, box.height * scale);
        };
        drawBox(push, 'green');
        drawBox(hurt, 'blue');

        context.beginPath();
        context.strokeStyle = 'red';
        const originX = this.position.x - stageOffset.x;
        const originY = this.position.y - stageOffset.y;
        context.moveTo(originX - 4, originY);
        context.lineTo(originX + 5, originY);
        context.moveTo(originX, originY - 5);
        context.lineTo(originX, originY + 4);
        context.stroke();
    }

    resetVelocities() {
        this.velocity.x = 0;
        this.velocity.y = 0;
    }

    powerUp() {
        this.isBig = true;
        this.isPoweredUp = true;
        this.changeState(FighterState.IDLE, 'idle');
    }

    shrink() {
        this.isBig = false;
        this.isPoweredUp = false;
        this.changeState(FighterState.IDLE, 'idleSmall');
    }

    createSmoke(x, y, direction = 1) {
    const frames = 10; // number of smoke particles
    for (let i = 0; i < frames; i++) {
        this.game.debris.push({
            position: { x, y },
            velocity: { 
                x: (Math.random() - 0.5) * 1 + direction * 0.5, 
                y: -Math.random() * 1.5 
            },
            life: 30 + Math.floor(Math.random() * 20),
            size: 2 + Math.random() * 4,
            alpha: 1,
            update() {
                this.position.x += this.velocity.x;
                this.position.y += this.velocity.y;
                this.alpha -= 0.03;
                this.life--;
                if (this.life <= 0 || this.alpha <= 0) this.markedForDeletion = true;
            },
            draw(ctx, stage) {
                ctx.save();
                ctx.globalAlpha = this.alpha;
                ctx.fillStyle = 'rgb(76, 70, 70)'; // light gray smoke
                ctx.beginPath();
                ctx.arc(this.position.x - stage.x, this.position.y - stage.y, this.size / 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        });
    }
}

   shoot() {
    const bulletOffsetX = this.direction === 1 ? 22 : -22;
    const bulletOriginX = this.position.x + bulletOffsetX;
    const bulletOriginY = this.position.y - 25;

    const mario = this;
    playSound(document.querySelector('audio#sound-gunShot'), 1);

    // 🔥 Smoke animation
    this.game.debris.push({
        position: { x: bulletOriginX + 10*this.direction , y: bulletOriginY+7 },
        frameIndex: 0,
        frameTimer: 0,

        update() {
            this.frameTimer++;
            if (this.frameTimer >= 5) {
                this.frameTimer = 0;
                this.frameIndex++;
            }

            if (this.frameIndex >= mario.frames.get('gunSmoke').length) {
                this.markedForDeletion = true;
            }
        },

        draw(ctx, stage) {
            const frames = mario.frames.get('gunSmoke');
            const frame = frames[this.frameIndex];
            if (!frame) return;

            const [[sx, sy, sw, sh], [ox, oy]] = frame;

            ctx.save();

            if (mario.direction === 1) {
                // Flip horizontally
                ctx.scale(-1, 1);
                ctx.drawImage(
                    mario.image,
                    sx, sy, sw, sh,
                    -((this.position.x - stage.x) + sw - ox), // flip X
                    (this.position.y - stage.y) - oy,
                    sw,
                    sh
                );
            } else {
                ctx.drawImage(
                    mario.image,
                    sx, sy, sw, sh,
                    (this.position.x - stage.x) - ox,
                    (this.position.y - stage.y) - oy,
                    sw,
                    sh
                );
            }

            ctx.restore();
        }
    });

 
   // 🔫 Bullet debris
this.game.debris.push({
    position: { x: bulletOriginX, y: bulletOriginY },
    frameIndex: 0,
    frameTimer: 0,
    direction: this.direction,
    speed: 4, // bullet horizontal speed
    update() {
        this.position.x += this.speed * this.direction;

        this.frameTimer++;
        if (this.frameTimer >= 5) {
            this.frameTimer = 0;
            this.frameIndex++;
        }

        if (this.frameIndex >= mario.frames.get('gunBullet').length) {
            this.frameIndex = 0; // loop if you want animation, or remove if single frame
        }

        // Optional: remove bullet if offscreen
        if (this.position.x < 0 || this.position.x > 4000) { 
            this.markedForDeletion = true;
        }
    },
    draw(ctx, stage) {
        const frames = mario.frames.get('gunBullet');
        const frame = frames[this.frameIndex];
        if (!frame) return;

        const [[sx, sy, sw, sh], [ox, oy]] = frame;

        ctx.save();
        if (this.direction === -1) {
            ctx.scale(-1, 1);
            ctx.drawImage(
                mario.image,
                sx, sy, sw, sh,
                -((this.position.x - stage.x) + sw - ox), // flip X
                (this.position.y - stage.y) - oy,
                sw,
                sh
            );
        } else {
            ctx.drawImage(
                mario.image,
                sx, sy, sw, sh,
                (this.position.x - stage.x) - ox,
                (this.position.y - stage.y) - oy,
                sw,
                sh
            );
        }
        ctx.restore();
    }
});
}

   die() {
    if (this.isDead) return;
    this.game.stageMusic.pause();
    this.gameOver.currentTime = 0;
    playSound(this.gameOver, 1);
    gameState.mario.lives--;
    this.isDead = true;
    this.deathTimer = 0;
    this.deathPhase = 0;
    this.alpha = 1;

    this.resetVelocities();

    // Force small Mario (NES behavior)
    this.isBig = false;
    this.isPoweredUp = false;

    // Optional: set a death sprite later if you add one
    this.currentAnimationKey = 'idleSmall';

    console.log("Mario death triggered");
}
}