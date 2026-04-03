import { FighterState, FrameDelay } from '../../constants/fighter.js';
import * as control from '../../inputHandler.js';
import { playSound } from '../../soundHandler.js';
import { gameState } from '../../state/gameState.js';
import { ScoreText } from './scoreText.js';

export class KapNino {
    constructor(game, x, y, speed = 0.5, direction = 1) {
        this.game = game;
         this.soundDead = document.querySelector('audio#sound-stomp');
         if(gameState.explicitMode) {
            this.soundKapDead = document.querySelector('audio#sound-kapDead');
        } else {
            this.soundKapDead = document.querySelector('audio#sound-kapDeadNonExplicit');
        }
        // --- Constants & initial state ---
        this.ground = 207;
        this.maxSpeed = 1;
         this.baseSpeed = speed; 
        this.acceleration = 0.1;
        this.friction = 0.1;
        this.gravity = 0.5;
        this.jumpForce = 10;
        this.isDead = false;

        this.deathTimer = 0;
        this.deathDuration = 1; // 1 second
        this.remove = false;

        this.direction = direction; // 1 = right, -1 = left
        this.velocity = { x: 0, y: 0 };
        this.position = { x: x, y: y };

        this.image = document.querySelector('img[alt="mario"]');

        // --- Animation & frames ---
        // Each animation key has an array of frames
        // Each frame: [ [sx, sy, sw, sh], [ox, oy], { push: [x,y,w,h], hurt: [x,y,w,h] } ]
        this.frames = new Map([
             ['idle', [
                [[10, 108, 22, 28], [11, 26], { push: [-10, -18, 20, 18], hurt: [-10, -28, 20, 28] }],
            ]],           
             ['dead', [
                [[46, 111, 31, 21], [15, 19], { push: [0, 0, 0, 0], hurt: [0, 0, 0, 0] }],
            ]],        
        ]);

        
        this.currentAnimationKey = 'idle';
        this.animationFrame = 0;
        this.animationTimer = 0;

        // --- Boxes ---
        this.boxes = {
            push: { x: 0, y: 0, width: 0, height: 0 },
            hurt: { x: 0, y: 0, width: 0, height: 0 },
        };

        // --- States ---
        this.states = {
            [FighterState.IDLE]: {
                init: this.handleIdleInit.bind(this),
                update: this.handleIdleState.bind(this),
                validFrom: [undefined, FighterState.IDLE, FighterState.WALK_FORWARD, FighterState.WALK_BACKWARD]
            },
             [FighterState.DIE]: {
                init: this.handleDeadInit.bind(this),
                update: this.handleDeadState.bind(this),
                validFrom: [undefined, FighterState.IDLE, FighterState.WALK_FORWARD, FighterState.WALK_BACKWARD]
            },
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
       
        this.currentAnimationKey = 'idle';
    }

    handleIdleState(time) {
         const dt = Math.min(time.secondsPassed, 0.06);
            this.velocity.x -= this.acceleration * dt * 60;
            this.velocity.x = -0.5*dt * 60;

            this.position.x += this.velocity.x * dt * 60;
    }

       // --- dead STATE ---
   handleDeadInit() {
    if(gameState.hordeActive) gameState.hordekillCount++;
    console.log("Dead enemy");
    this.game.scoreTexts.push(
               new ScoreText(
                   this.game,
                   this.position.x+5,
                   this.position.y,
                   100
               )
           );
    playSound(this.soundDead, 1)
    playSound(this.soundKapDead, 1)

    gameState.mario.score += 100;
   
    this.currentAnimationKey = 'dead';
    this.deathTimer = 0;

    // optional: small bounce or fall feel
    this.velocity.y = -3;
}

   handleDeadState(time) {
     const dt = Math.min(time.secondsPassed, 0.06);
    this.velocity.x = 0;

    // gravity still applies for a nice drop
    this.velocity.y += this.gravity * dt * 60;
    this.position.y += this.velocity.y * dt * 60;

    this.deathTimer += dt;

    if (this.deathTimer >= this.deathDuration) {
        this.remove = true; // mark for deletion
    }
}

    
    // --- BOX HANDLING ---
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

    // --- UPDATE MOVEMENT & PHYSICS ---
   // --- UPDATE MOVEMENT & PHYSICS ---
update(time) {
     const dt = Math.min(time.secondsPassed, 0.06);
    if (this.isDead) {
        const state = this.states[this.currentState];
        if (state && state.update) state.update(time);
        this.updateBoxes();
        return;
    }

   // --- Horizontal movement based on direction ---
let speed = this.baseSpeed;

// Optional: scale speed by difficulty
if (this.game.level && this.game.level > 1) {
    speed += 0.1 * (this.game.level - 1); // +0.1 per level
}

// Optional: add random slight variation
speed *= 0.9 + Math.random() * 0.2; // 90%-110%

this.velocity.x = this.direction * speed * dt * 60;

    // --- Apply gravity ---
    this.velocity.y += this.gravity * dt * 60;

    let newX = this.position.x + this.velocity.x;
    let newY = this.position.y + this.velocity.y;
    this.onGround = false;

    // --- Check collisions ---
    for (const brick of this.game.bricks) {
        if (brick.isBroken) continue;
        const brickBox = brick.getWorldBox();
        const pushBox = {
            x: newX + this.boxes.push.x,
            y: newY + this.boxes.push.y,
            width: this.boxes.push.width,
            height: this.boxes.push.height
        };

        const kapFeetY = pushBox.y + pushBox.height;
        const kapLeft = pushBox.x;
        const kapRight = pushBox.x + pushBox.width;
        const verticallyOverlapping = kapFeetY > brickBox.y + 2 && pushBox.y < brickBox.y + brickBox.height - 2;

        // LANDING
        const landingTolerance = 5;
        if (this.velocity.y >= 0 &&
            kapFeetY <= brickBox.y + landingTolerance &&
            kapFeetY + this.velocity.y >= brickBox.y - landingTolerance &&
            kapRight > brickBox.x && kapLeft < brickBox.x + brickBox.width
        ) {
            newY = brickBox.y - this.boxes.push.height - this.boxes.push.y;
            this.velocity.y = 0;
            this.onGround = true;
        }

        // HORIZONTAL collision
        const fudge = 1;
        const hittingLeftWall = this.direction > 0 && kapRight > brickBox.x + fudge && kapLeft < brickBox.x;
        const hittingRightWall = this.direction < 0 && kapLeft < brickBox.x + brickBox.width - fudge && kapRight > brickBox.x + brickBox.width - fudge;

        if (verticallyOverlapping && (hittingLeftWall || hittingRightWall)) {
            this.direction *= -1; // flip direction
            this.velocity.x = this.direction * speed; // immediately apply new velocity
            newX = this.position.x; // prevent penetration
        }
    }

    this.position.x = newX;
    this.position.y = newY;

    this.updateBoxes();

    // Animate
    this.animationTimer += dt * 60;
    const frames = this.frames.get(this.currentAnimationKey);
    if (frames && frames.length > 1 && this.animationTimer >= 10) {
        this.animationFrame = (this.animationFrame + 1) % frames.length;
        this.animationTimer -= 10;
    }
}

    // --- DEBUG DRAW ---
drawDebug(context, stageOffset = { x: 0, y: 0 }, scale = 1) {
    const { push, hurt } = this.boxes;

    const drawBox = (box, color) => {
        context.strokeStyle = color;
        context.lineWidth = 1;

        // Calculate flipped position with stage offset applied
        const x = this.direction === 1
            ? this.position.x + box.x - stageOffset.x
            : this.position.x - box.x - box.width - stageOffset.x;

        const y = this.position.y + box.y - stageOffset.y;

        context.strokeRect(
            Math.floor(x * scale),
            Math.floor(y * scale),
            box.width * scale,
            box.height * scale
        );
    };

    // Push box (green)
    drawBox(push, 'green');

    // Hurt box (blue)
    drawBox(hurt, 'blue');

    // Optional: origin (red cross) with stage offset
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

    // --- ANIMATION & DRAW ---
    drawFrame(context, x, y, direction = 1, scale = 1, alpha = 1) {
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
        //
        
    }

    // --- HELPERS ---
    onGround() {
        return this.position.y >= this.ground;
    }

    resetVelocities() {
        this.velocity.x = 0;
        this.velocity.y = 0;
    }
}