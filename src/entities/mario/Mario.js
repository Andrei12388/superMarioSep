import { FighterState, FrameDelay } from '../../constants/fighter.js';
import { Control } from '../../constants/control.js';
import * as control from '../../inputHandler.js';
import { playSound } from '../../soundHandler.js';
import { gameState } from '../../state/gameState.js';

export class Mario {
    constructor(game) {
        this.game = game;
        this.soundJump = document.querySelector('audio#sound-jump');
         this.gameOver = document.querySelector('audio#music-gameOver');

        // --- Constants & initial state ---
        this.ground = 207;
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

        this.direction = 1; // 1 = right, -1 = left
        this.velocity = { x: 0, y: 0 };
        this.position = { x: 50, y: 20 };

        this.image = document.querySelector('img[alt="mario"]');

        // --- Animation & frames ---
        this.frames = new Map([
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
                validFrom: [undefined, FighterState.IDLE, FighterState.WALK_FORWARD, FighterState.WALK_BACKWARD, FighterState.GROW]
            },
            [FighterState.GROW]: {
                init: this.handleGrowInit.bind(this),
                update: this.handleGrowState.bind(this),
                validFrom: [undefined, FighterState.IDLE, FighterState.WALK_FORWARD, FighterState.WALK_BACKWARD]
            },
            [FighterState.WALK_FORWARD]: {
                init: this.handleWalkForwardInit.bind(this),
                update: this.handleWalkForwardState.bind(this),
                validFrom: [FighterState.IDLE, FighterState.WALK_BACKWARD]
            },
            [FighterState.WALK_BACKWARD]: {
                init: this.handleWalkBackwardInit.bind(this),
                update: this.handleWalkBackwardState.bind(this),
                validFrom: [FighterState.IDLE, FighterState.WALK_FORWARD]
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

    // --- IDLE STATE ---
    handleIdleInit() {
       // this.resetVelocities();
        this.currentAnimationKey = this.isBig ? 'idle' : 'idleSmall';
    }
    handleGrowInit() {
        
        this.alpha = 0.5;
        this.currentAnimationKey = this.isBig ? 'growSmall' : 'growBig';
    }

  handleGrowState() {
    const frames = this.frames.get(this.currentAnimationKey);

    // Wait until LAST FRAME (not frame 1)
    if (this.animationFrame === frames.length - 1) {
        if (this.currentAnimationKey === 'growBig') {
            this.isBig = true;
            this.alpha = 1;
            this.isPoweredUp = true;
            this.changeState(FighterState.IDLE, 'idle');
        }

        if (this.currentAnimationKey === 'growSmall') {
            this.isBig = false;
            this.alpha = 1;
            this.isPoweredUp = false;
            this.changeState(FighterState.IDLE, 'idleSmall');
        }
    }
}

    handleIdleState() {
        if (control.isHeavyKick(0) && this.onGround) { // <-- property
            this.velocity.y = -this.jumpForce;
            playSound(this.soundJump, 1)
        } else if (control.isForward(0, 1)) {
            this.changeState(FighterState.WALK_FORWARD, this.isBig ? 'walk' : 'walkSmall');
        } else if (control.isBackward(0, 1)) {
            this.changeState(FighterState.WALK_BACKWARD, this.isBig ? 'walk' : 'walkSmall');
        }
    }

    // --- WALK STATES ---
    handleWalkForwardInit() { this.direction = 1; this.currentAnimationKey = this.isBig ? 'walk' : 'walkSmall'; }
    handleWalkBackwardInit() { this.direction = -1; this.currentAnimationKey = this.isBig ? 'walk' : 'walkSmall'; }

    handleWalkForwardState() {
        const isRunning = control.isControlDown(0, Control.LIGHT_PUNCH) || control.isControlDown(0, Control.LIGHT_KICK);        if (isRunning) console.log('Running forward');        const currentMaxSpeed = isRunning ? 1.6 : this.maxSpeed;
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

        if (!control.isForward(0, 1)) this.changeState(FighterState.IDLE, this.isBig ? 'idle' : 'idleSmall');
        if (control.isHeavyKick(0) && this.onGround) {
            playSound(this.soundJump, 1)
            const jumpForce = isRunning ? this.runJumpForce : this.jumpForce;
            this.velocity.y = -jumpForce;
        }
    }

    handleWalkBackwardState() {
        const isRunning = control.isControlDown(0, Control.LIGHT_PUNCH) || control.isControlDown(0, Control.LIGHT_KICK);        if (isRunning) console.log('Running backward');        const currentMaxSpeed = isRunning ? 1.6 : this.maxSpeed;
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

        if (!control.isBackward(0, 1)) this.changeState(FighterState.IDLE, this.isBig ? 'idle' : 'idleSmall');
        if (control.isHeavyKick(0) && this.onGround){
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
    if (this.isDead) {
    this.handleDeath(time);
    return; // stop ALL normal logic
}
    // --- Apply horizontal friction ALWAYS ---
if (!control.isForward(0, 1) && !control.isBackward(0, 1)) {
    if (this.velocity.x > 0) {
        this.velocity.x -= this.friction;
        if (this.velocity.x < 0) this.velocity.x = 0;
    } else if (this.velocity.x < 0) {
        this.velocity.x += this.friction;
        if (this.velocity.x > 0) this.velocity.x = 0;
    }
}
// --- Horizontal input acceleration ---
if (control.isForward(0, 1)) {
    this.velocity.x += this.acceleration;
    this.direction = 1;
}

if (control.isBackward(0, 1)) {
    this.velocity.x -= this.acceleration;
    this.direction = -1;
}

this.position.x += this.velocity.x;

// Determine max speed based on running (holding low punch or low kick)
const isRunning = control.isControlDown(0, Control.LIGHT_PUNCH) || control.isControlDown(0, Control.LIGHT_KICK);if (isRunning) console.log('Running (update clamp)');const maxSpeed = isRunning ? 1.6 : this.maxSpeed;

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

if (this.animationTimer >= 10) {
    this.animationTimer = 0;

    // Grow/Shrink should NOT loop
    if (this.currentState === FighterState.GROW) {
        if (this.animationFrame < frames.length - 1) {
            this.animationFrame++;
        } else {
            // Animation finished → let state handle it
        }
    } else {
        // Normal looping animations
        this.animationFrame = (this.animationFrame + 1) % frames.length;
    }
}
}

    drawFrame(context, x, y, direction = 1, scale = 1, alpha = 1) {
        if (this.isHurt && Math.floor(this.hurtTimer / 5) % 2 === 0) alpha = 0.3;

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

   die() {
    if (this.isDead) return;
    this.game.stageMusic.pause();
    this.gameOver.currentTime = 0;
    playSound(this.gameOver, 1);
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