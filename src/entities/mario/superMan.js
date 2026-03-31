import { FighterState } from '../../constants/fighter.js';
import { playSound } from '../../soundHandler.js';
import { gameState } from '../../state/gameState.js';
import { Laser } from './entity/laser.js';
import { ScoreText } from './scoreText.js';

export class SuperMan {
    constructor(game, x, y) {
        this.game = game;

        this.soundDead = document.querySelector('audio#sound-stomp');
        this.soundSuperman = document.querySelector('audio#sound-superman');
        this.soundSupermanLaser = document.querySelector('audio#sound-laserShot');
        this.soundSuperman.volume = 0.5;
        this.soundSupermanLaser.volume = 0.5;
        this.soundSuperman.play();

        this.position = { x, y };
        this.velocity = { x: 0, y: 0 };

        this.direction = -1;

        this.isDead = false;
        this.remove = false;

        // --- RANDOM MOVEMENT ---
        this.moveTimer = 0;
        this.moveDuration = Math.random() * 2 + 1;
        this.speed = 1.1;

        // --- ATTACK SYSTEM ---
        this.isAttacking = false;
        this.attackTimer = 0;
        this.attackDuration = 2; // STOP for 2 seconds

        this.attackCooldown = Math.random() * 3 + 2;
        this.attackCooldownTimer = 0;

        // --- DEATH ---
        this.deathTimer = 0;
        this.deathDuration = 1;

        this.gravity = 0.5;

        this.image = document.querySelector('img[alt="mario"]');

        this.frames = new Map([
            ['idle', [
                [[288, 86, 69, 35], [34, 33], { push: [-34, -35, 69, 35], hurt: [-33, -35, 69, 35] }],
            ]],
            ['laserAttack', [
                [[288, 126, 68, 35], [34, 33], { push: [0, 0, 0, 0], hurt: [0, 0, 0, 0] }],
            ]],
        ]);

        this.currentAnimationKey = 'idle';
        this.animationFrame = 0;
        this.animationTimer = 0;

        this.boxes = {
            push: { x: 0, y: 0, width: 0, height: 0 },
            hurt: { x: 0, y: 0, width: 0, height: 0 },
        };

        this.changeState(FighterState.IDLE);
    }

    changeState(newState, animationKey = null) {
        this.currentState = newState;
        if (animationKey) this.currentAnimationKey = animationKey;
    }

    // --- SHOOT LASER ---
    shootLaser() {
       
        const mario = this.game.mario;
        if (!mario) return;
         this.currentAnimationKey = 'idle';
        const dx = mario.position.x - this.position.x;
        const dy = mario.position.y - this.position.y;

        const angle = Math.atan2(dy, dx);

        const laser = new Laser(
            this.game,
            this.position.x,
            this.position.y,
            angle,
            7
        );
        this.soundSuperman.play();
        // 🔥 push into enemies array so it updates/draws automatically
        this.game.enemies.push(laser);
    }

    // --- DEAD ---
    handleDead(time) {
        this.velocity.x = 0;
        this.velocity.y += this.gravity;
        this.position.y += this.velocity.y;

        this.deathTimer += time.secondsPassed;

        if (this.deathTimer >= this.deathDuration) {
            this.remove = true;
        }
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
    if (this.isDead) {
        this.handleDead(time);
        this.updateBoxes();
        return;
    }

    const mario = this.game.mario;
    if (!mario) return;

    // --- ATTACK COOLDOWN ---
    this.attackCooldownTimer += time.secondsPassed;

    // START ATTACK
    if (!this.isAttacking && this.attackCooldownTimer >= this.attackCooldown) {
        this.soundSupermanLaser.play();
        this.isAttacking = true;
        this.attackTimer = 0;
        this.attackCooldownTimer = 0;
    }

    const dx = mario.position.x - this.position.x;
const distance = Math.abs(dx);

const maxSpeed = 3;
const minSpeed = 0.5;
const acceleration = 0.15;

// scale speed based on distance
const speedFactor = Math.min(distance / 200, 1); 
const targetSpeed = minSpeed + (maxSpeed - minSpeed) * speedFactor;

if (distance > 5) {
    this.direction = dx > 0 ? 1 : -1;

    // accelerate toward target speed
    this.velocity.x += this.direction * acceleration;

    // clamp to dynamic target speed
    if (this.velocity.x > targetSpeed) this.velocity.x = targetSpeed;
    if (this.velocity.x < -targetSpeed) this.velocity.x = -targetSpeed;
} else {
    // smooth stop
    if (this.velocity.x > 0) {
        this.velocity.x -= acceleration;
        if (this.velocity.x < 0) this.velocity.x = 0;
    } else if (this.velocity.x < 0) {
        this.velocity.x += acceleration;
        if (this.velocity.x > 0) this.velocity.x = 0;
    }
}

    this.velocity.y = 0;

    // --- ATTACK LOGIC (no movement cancel anymore) ---
    if (this.isAttacking) {
        this.currentAnimationKey = 'laserAttack';
        this.attackTimer += time.secondsPassed;

        if (this.attackTimer >= this.attackDuration) {
            this.shootLaser();

            this.isAttacking = false;
            this.attackCooldown = Math.random() * 3 + 2;
        }
    } else {
        this.currentAnimationKey = 'idle';
    }

    // --- APPLY MOVEMENT ---
    this.position.x += this.velocity.x;

    // --- WALL COLLISION ---
    for (const brick of this.game.bricks) {
        if (brick.isBroken) continue;

        const box = brick.getWorldBox();

        if (
            this.position.x < box.x + box.width &&
            this.position.x + 50 > box.x &&
            this.position.y < box.y + box.height &&
            this.position.y + 40 > box.y
        ) {
            this.direction *= -1;
            this.velocity.x = 0;
            break;
        }
    }

    this.updateBoxes();
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

    drawFrame(context, x, y, direction = 1) {
        const frame = this.frames.get(this.currentAnimationKey)[0];
        const [[sx, sy, sw, sh], [ox, oy]] = frame;

        context.save();
        context.translate(x, y);
        context.scale(direction, 1);
        context.drawImage(this.image, sx, sy, sw, sh, -ox, -oy, sw, sh);
        context.restore();
    }

    draw(context) {
        this.drawFrame(
            context,
            this.position.x,
            this.position.y,
            this.direction
        );
    }
}