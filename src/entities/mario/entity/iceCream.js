import { FighterState } from "../../../constants/fighter.js";

export class IceCream {
   constructor(game, x, y, direction = 1, speed = 6) { // upward default
        this.game = game;

       // this.soundThrow = document.querySelector('audio#sound-iceThrow');
       
       this.soundBounce = document.querySelector('audio#sound-jump');
        this.soundBounce.volume = 0.6;
       // this.soundThrow.play();

        this.ground = 300;
        this.gravity = 0.4;
        this.bounceDamping = 0.7; // lose 30% of speed on bounce

        this.position = { x, y };
       this.velocity = {
            x: direction * speed, // left or right
            y: -speed * 0.9       // upward arc (tweak this!)
        };

        this.width = 21;
        this.height = 26;

        this.isDead = false;
        this.remove = false;
        this.bounceCount = 0;
        this.maxBounces = 7;

        this.image = document.querySelector('img[alt="mario"]');

        this.frames = new Map([
            ['idle', [
                [[374, 128, 21, 26], [11, 24], { push: [-11, -24, 21, 26], hurt: [-11, -24, 21, 26] }]
            ]],
            ['dead', [
                [[374, 128, 21, 26], [11, 24], { push: [0, 0, 0, 0], hurt: [0, 0, 0, 0] }]
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

    changeState(newState, animationKey = null) {
        const state = this.states[newState];
        if (!state || !state.validFrom.includes(this.currentState)) return;

        this.currentState = newState;
        this.animationFrame = 0;
        this.animationTimer = 0;

        if (animationKey) this.currentAnimationKey = animationKey;

        state.init();
    }

    handleIdleInit() {
        this.currentAnimationKey = 'idle';
    }

    handleIdleState(time) {
        // Apply gravity
        this.velocity.y += this.gravity;

        // Update position
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        // --- Ground collision ---
        if (this.position.y + this.height >= this.ground) {
            this.position.y = this.ground - this.height;
            this.velocity.y = -this.velocity.y * this.bounceDamping;
            this.soundBounce.play();
            this.bounceCount++;
        }

        // --- Wall collisions (left/right stage bounds) ---
        if (this.position.x <= 0 || this.position.x + this.width >= this.game.stageWidth) {
            this.velocity.x = -this.velocity.x * this.bounceDamping;
            this.soundBounce.play();
            this.bounceCount++;
        }

        // --- Brick collision ---
        for (const brick of this.game.bricks) {
            if (brick.isBroken) continue;
            const box = brick.getWorldBox();
            const iceBox = this.getWorldBox(this.boxes.push);

            if (
                iceBox.x < box.x + box.width &&
                iceBox.x + iceBox.width > box.x &&
                iceBox.y < box.y + box.height &&
                iceBox.y + iceBox.height > box.y
            ) {
                // Bounce off brick
                if (iceBox.y + iceBox.height - this.velocity.y <= box.y) {
                    // Hit top
                    this.position.y = box.y - this.height;
                    this.velocity.y = -this.velocity.y * this.bounceDamping;
                } else if (iceBox.y - this.velocity.y >= box.y + box.height) {
                    // Hit bottom
                    this.position.y = box.y + box.height;
                    this.velocity.y = -this.velocity.y * this.bounceDamping;
                } else {
                    // Horizontal hit
                    if (this.velocity.x > 0) {
                        this.position.x = box.x - this.width;
                    } else {
                        this.position.x = box.x + box.width;
                    }
                    this.velocity.x = -this.velocity.x * this.bounceDamping;
                }

                this.soundBounce.play();
                this.bounceCount++;
            }
        }

        // --- Remove after max bounces ---
        if (this.bounceCount >= this.maxBounces) {
            this.explode();
        }
    }

    handleDeadInit() {
        this.currentAnimationKey = 'dead';
        this.velocity.x = 0;
        this.velocity.y = 0;
        this.isDead = true;
        this.deathTimer = 0;
    }

    handleDeadState(time) {
        this.deathTimer += time.secondsPassed;
        if (this.deathTimer >= 0.3) this.remove = true;
    }

    explode() {
        if (!this.isDead) {
            this.changeState(FighterState.DIE);
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

    updateBoxes() {
        const frame = this.frames.get(this.currentAnimationKey)[0];
        const boxData = frame[2];

        this.boxes.push = {
            x: boxData.push[0],
            y: boxData.push[1],
            width: boxData.push[2],
            height: boxData.push[3]
        };

        this.boxes.hurt = {
            x: boxData.hurt[0],
            y: boxData.hurt[1],
            width: boxData.hurt[2],
            height: boxData.hurt[3]
        };
    }

    update(time) {
        const state = this.states[this.currentState];
        if (state && state.update) state.update(time);
        this.updateBoxes();

        // Animate
        this.animationTimer += time.secondsPassed * 60;
        const frames = this.frames.get(this.currentAnimationKey);
        if (frames && frames.length > 1 && this.animationTimer >= 10) {
            this.animationFrame = (this.animationFrame + 1) % frames.length;
            this.animationTimer -= 10;
        }
    }

    drawFrame(context, x, y, scale = 1, alpha = 1) {
        const frames = this.frames.get(this.currentAnimationKey);
        if (!frames) return;
        const frame = frames[this.animationFrame % frames.length];
        const [[sx, sy, sw, sh], [ox, oy]] = frame;

        context.save();
        context.globalAlpha = alpha;
        context.translate(x, y);
        context.drawImage(this.image, sx, sy, sw, sh, -ox, -oy, sw, sh);
        context.restore();
    }

    draw(context) {
        this.drawFrame(context, this.position.x, this.position.y);
    }

    drawDebug(context, stageOffset = { x: 0, y: 0 }, scale = 1) {
        const { push, hurt } = this.boxes;
        const drawBox = (box, color) => {
            context.strokeStyle = color;
            context.lineWidth = 1;
            context.strokeRect(
                Math.floor(this.position.x + box.x - stageOffset.x),
                Math.floor(this.position.y + box.y - stageOffset.y),
                box.width * scale,
                box.height * scale
            );
        };
        drawBox(push, 'green');
        drawBox(hurt, 'blue');
    }
}