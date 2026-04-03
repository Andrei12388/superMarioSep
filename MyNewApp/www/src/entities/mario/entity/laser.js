import { FighterState } from "../../../constants/fighter.js";


export class Laser {
    constructor(game, x, y, angle = 0, speed = 6) {
        this.game = game;

        this.soundLaser = document.querySelector('audio#sound-laserBeam');
        this.soundLaser.volume = 0.7;
        this.soundLaser.play();

        this.ground = 207;
        this.gravity = 0; // no gravity for laser
        this.isDead = false;

        this.position = { x, y };
        this.direction = Math.cos(angle) >= 0 ? 1 : -1;
        this.speed = speed;
        this.angle = angle;
        this.velocity = {
            x: Math.cos(angle) * speed,
            y: Math.sin(angle) * speed
        };

        this.deathTimer = 0;
        this.deathDuration = 0.3; // short death animation
        this.remove = false;

        this.width = 51;
        this.height = 14;

        this.image = document.querySelector('img[alt="mario"]');

        // --- Animation & frames ---
        // Laser only has idle and dead frames (can reuse simple sprite)
        this.frames = new Map([
            ['idle', [
                [[364, 91, 51, 14], [25, 7], { push: [-25, -7, 51, 14], hurt: [-25, -7, 51, 14] }]
            ]],
            ['dead', [
                [[364, 91, 51, 14], [25, 7], { push: [0, 0, 0, 0], hurt: [0, 0, 0, 0] }]
            ]]
        ]);

        this.currentAnimationKey = 'idle';
        this.animationFrame = 0;
        this.animationTimer = 0;

        this.boxes = {
            push: { x: 0, y: 0, width: 0, height: 0 },
            hurt: { x: 0, y: 0, width: 0, height: 0 }
        };

        this.states = {
            [FighterState.IDLE]: {
                init: this.handleIdleInit.bind(this),
                update: this.handleIdleState.bind(this),
                validFrom: [undefined, FighterState.IDLE]
            },
            [FighterState.DIE]: {
                init: this.handleDeadInit.bind(this),
                update: this.handleDeadState.bind(this),
                validFrom: [undefined, FighterState.IDLE]
            }
        };

        this.changeState(FighterState.IDLE);
    }

    // --- STATE HANDLING ---
    changeState(newState, animationKey = null, ...args) {
        const state = this.states[newState];
        if (!state || !state.validFrom.includes(this.currentState)) return;

        this.currentState = newState;
        this.animationFrame = 0;
        this.animationTimer = 0;

        if (animationKey) this.currentAnimationKey = animationKey;

        state.init(...args);
    }

    handleIdleInit() {
        this.currentAnimationKey = 'idle';
    }

    handleIdleState(time) {
        // Move laser
        const dt = Math.min(time.secondsPassed, 0.06);
        this.position.x += this.velocity.x * dt * 60;
        this.position.y += this.velocity.y * dt * 60;

        // Ground collision
        if (this.position.y >= this.ground) this.explode();

        // Brick collision
      // Brick collision
for (const brick of this.game.bricks) {
    if (brick.isBroken) continue;

    const box = brick.getWorldBox();
    const laserBox = this.getWorldBox(this.boxes.push);

    if (
        laserBox.x < box.x + box.width &&
        laserBox.x + laserBox.width > box.x &&
        laserBox.y < box.y + box.height &&
        laserBox.y + laserBox.height > box.y
    ) {
        // Break the brick
        if (typeof brick.break === 'function') {
            brick.break();
        }

        // Make the laser explode
        this.explode();
        break;
    }
}
    }

    handleDeadInit() {
        this.currentAnimationKey = 'dead';
        this.velocity.x = 0;
        this.velocity.y = 0;
        this.deathTimer = 0;
    }

    handleDeadState(time) {
        const dt = Math.min(time.secondsPassed, 0.06);
        this.deathTimer += dt;
        if (this.deathTimer >= this.deathDuration) this.remove = true;
    }

    explode() {
        if (this.isDead) return;
        this.isDead = true;
        this.changeState(FighterState.DIE);
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

    getWorldBox(box) {
        return {
            x: this.position.x + box.x,
            y: this.position.y + box.y,
            width: box.width,
            height: box.height
        };
    }

    // --- UPDATE ---
    update(time) {
        const dt = Math.min(time.secondsPassed, 0.06);

        const state = this.states[this.currentState];
        if (state && state.update) state.update(time);
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

    const drawRotatedBox = (box, color) => {
        // Rotate box around laser center
        const rotated = this.getWorldBoxRotated(box);

        context.strokeStyle = color;

        // Draw rotated box as axis-aligned bounding box
        context.strokeRect(
            Math.floor(rotated.x * scale - stageOffset.x),
            Math.floor(rotated.y * scale - stageOffset.y),
            rotated.width * scale,
            rotated.height * scale
        );
    };

    drawRotatedBox(push, 'green');
    drawRotatedBox(hurt, 'blue');
}
    rotateBox(box, angle) {
    const cx = box.x + box.width / 2;
    const cy = box.y + box.height / 2;

    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    // Rotate all four corners
    const corners = [
        { x: box.x, y: box.y },
        { x: box.x + box.width, y: box.y },
        { x: box.x + box.width, y: box.y + box.height },
        { x: box.x, y: box.y + box.height },
    ].map(p => ({
        x: cos * (p.x - cx) - sin * (p.y - cy) + cx,
        y: sin * (p.x - cx) + cos * (p.y - cy) + cy
    }));

    // Recompute bounding box
    const xs = corners.map(p => p.x);
    const ys = corners.map(p => p.y);
    return {
        x: Math.min(...xs),
        y: Math.min(...ys),
        width: Math.max(...xs) - Math.min(...xs),
        height: Math.max(...ys) - Math.min(...ys)
    };
}

getWorldBoxRotated(box) {
    const world = this.getWorldBox(box);
    return this.rotateBox(world, this.angle);
}

    // --- DRAW ---
   drawFrame(context, x, y, scale = 1, alpha = 1) {
    const frames = this.frames.get(this.currentAnimationKey);
    if (!frames) return;
    const frame = frames[this.animationFrame % frames.length];
    if (!frame) return;
    const [[sx, sy, sw, sh], [ox, oy]] = frame;

    context.save();
    context.globalAlpha = alpha;

    // Move to laser center
    context.translate(x, y);

    // Rotate by angle
    context.rotate(this.angle);

    // Draw image centered
    context.drawImage(this.image, sx, sy, sw, sh, -ox, -oy, sw, sh);

    context.restore();
}

    draw(context) {
      //  this.drawFrame(context, this.position.x, this.position.y, this.direction);
    }
}