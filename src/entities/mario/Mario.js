import { FighterState, FrameDelay } from '../../constants/fighter.js';
import * as control from '../../inputHandler.js';
import { playSound } from '../../soundHandler.js';

export class Mario {
    constructor(game) {
        this.game = game;
        this.soundJump = document.querySelector('audio#sound-jump');
        

        // --- Constants & initial state ---
        this.ground = 207;
        this.maxSpeed = 2;
        this.acceleration = 0.1;
        this.friction = 0.1;
        this.gravity = 0.5;
        this.jumpForce = 10;
        this.isHurt = false;
        this.hurtTimer = 0;

        // --- ON GROUND FLAG ---
        this.onGround = false; // <-- property only, no method

        this.direction = 1; // 1 = right, -1 = left
        this.velocity = { x: 0, y: 0 };
        this.position = { x: 50, y: 20 };

        this.image = document.querySelector('img[alt="mario"]');

        // --- Animation & frames ---
        this.frames = new Map([
            ['idleSmall', [[[131, 63, 31, 30], [15, 28], { push: [-10, -30, 20, 30], hurt: [-10, -30, 20, 30] }]]],
            ['walkSmall', [
                [[2, 61, 37, 35], [19, 33], { push: [-10, -30, 20, 30], hurt: [-10, -30, 20, 30] }],
                [[45, 62, 29, 35], [15, 33], { push: [-10, -30, 20, 30], hurt: [-10, -30, 20, 30] }],
                [[87, 63, 29, 33], [15, 31], { push: [-10, -30, 20, 30], hurt: [-10, -30, 20, 30] }],
                [[131, 63, 31, 30], [15, 28], { push: [-10, -30, 20, 30], hurt: [-10, -30, 20, 30] }],
                [[87, 63, 29, 33], [15, 31], { push: [-10, -30, 20, 30], hurt: [-10, -30, 20, 30] }],
                [[45, 62, 29, 35], [15, 33], { push: [-10, -30, 20, 30], hurt: [-10, -30, 20, 30] }]
            ]],
            ['idle', [[[2, 1, 37, 49], [19, 47], { push: [-10, -49, 20, 49], hurt: [-10, -49, 20, 49] }]]],
            ['walk', [
                [[2, 1, 37, 49], [19, 47], { push: [-10, -49, 20, 49], hurt: [-10, -49, 20, 49] }],
                [[50, 2, 29, 50], [15, 48], { push: [-10, -49, 20, 49], hurt: [-10, -49, 20, 49] }],
                [[92, 4, 29, 47], [15, 45], { push: [-10, -49, 20, 49], hurt: [-10, -49, 20, 49] }],
                [[136, 4, 31, 44], [15, 42], { push: [-10, -49, 20, 49], hurt: [-10, -49, 20, 49] }]
            ]],
            ['getUp-1', [[[11, 955, 53, 55], [27, 53], { push: [-20, -50, 36, 46], hurt: [0, -500, 0, 0] }]]]
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
        this.currentAnimationKey = 'idleSmall';
    }

    handleIdleState() {
        
        if (control.isHeavyKick(0) && this.onGround) { // <-- property
            this.velocity.y = -this.jumpForce;
             playSound(this.soundJump, 1)
        } else if (control.isForward(0, 1)) {
            this.changeState(FighterState.WALK_FORWARD, 'walkSmall');
        } else if (control.isBackward(0, 1)) {
            this.changeState(FighterState.WALK_BACKWARD, 'walkSmall');
        }
    }

    // --- WALK STATES ---
    handleWalkForwardInit() { this.direction = 1; this.currentAnimationKey = 'walkSmall'; }
    handleWalkBackwardInit() { this.direction = -1; this.currentAnimationKey = 'walkSmall'; }

    handleWalkForwardState() {
       
        this.velocity.x = Math.min(this.velocity.x, this.maxSpeed);
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

        if (!control.isForward(0, 1)) this.changeState(FighterState.IDLE, 'idleSmall');
        if (control.isHeavyKick(0) && this.onGround) {
           playSound(this.soundJump, 1)
            this.velocity.y = -this.jumpForce;
        }
    }

    handleWalkBackwardState() {
      
        this.velocity.x = Math.max(this.velocity.x, -this.maxSpeed);
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

        if (!control.isBackward(0, 1)) this.changeState(FighterState.IDLE, 'idleSmall');
        if (control.isHeavyKick(0) && this.onGround){
            playSound(this.soundJump, 1)
            this.velocity.y = -this.jumpForce;
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

    // --- PHYSICS & UPDATE ---
   update(time) {
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

// Clamp speed
this.velocity.x = Math.max(-this.maxSpeed, Math.min(this.velocity.x, this.maxSpeed));
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
        brick.break();
    }
}

    // --- Update FSM state ---
    const state = this.states[this.currentState];
    if (state && state.update) state.update(time);

    // --- Update collision boxes ---
    this.updateBoxes();

    // --- Animate ---
    this.animationTimer += 1;
    if (this.animationTimer >= 10) {
        this.animationFrame = (this.animationFrame + 1) % this.frames.get(this.currentAnimationKey).length;
        this.animationTimer = 0;
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
        context.globalAlpha = alpha;
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
}