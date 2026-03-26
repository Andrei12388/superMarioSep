// enemyAI.js
import { Control, controls } from "../../constants/control.js";
import { heldKeys, pressedKeys } from "../../inputHandler.js";
import { FighterHurtBox, FighterState } from "../../constants/fighter.js";

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const DIFFICULTY_PRESETS = {
  insane: {
    blockChance: 0.99,
    dodgeChance: 0.1,
    attackCooldown: 50,       
    reactionDelay: [2, 15],   
    engageDistance: 25,
    dodgeDistance: 500,
    superChance: 0.99,        
  },
};

export class EnemyAI {
  constructor(fighter, opponent, difficulty = "insane") {
    this.settings = DIFFICULTY_PRESETS[difficulty] || DIFFICULTY_PRESETS.normal;
    this.fighter = fighter;
    this.opponent = opponent;

    this.comboQueue = [];
    this.comboTimer = 0;
    this.attackCooldownBase = this.settings.attackCooldown;
    this.attackCooldown = 0;

    this.blockChance = this.settings.blockChance;
    this.dodgeChance = this.settings.dodgeChance;
    this.superChance = this.settings.superChance;
    this.reactionDelay = this.settings.reactionDelay;
    this.engageDistance = this.settings.engageDistance;
    this.dodgeDistance = this.settings.dodgeDistance;

    this.isBlocking = false;
    this.blockUntil = 0;
    this.nextDecisionTime = 0;
  }

  // -------------------- INPUT HELPERS --------------------
  resetInputs() {
    const inputMap = controls[this.fighter.playerId];
    if (!inputMap) return;
    Object.values(inputMap.keyboard || {}).forEach((c) => heldKeys.delete(c));
    Object.values(inputMap.buttons || {}).forEach((c) => heldKeys.delete(c));
  }

  press(control) {
    const inputMap = controls[this.fighter.playerId];
    if (!inputMap) return;
    (Array.isArray(control) ? control : [control]).forEach((name) => {
      const code = inputMap.keyboard?.[name] || inputMap.buttons?.[name];
      if (code) {
        heldKeys.add(code);
        pressedKeys.delete(code);
      }
    });
  }

  // -------------------- COMBO --------------------
  queueCombo(steps) {
    this.comboQueue = [...steps];
    this.comboTimer = 0;
  }

  runCombo(delta) {
    if (!this.comboQueue.length) return;
    this.comboTimer -= delta;
    if (this.comboTimer <= 0) {
      const step = this.comboQueue.shift();
      if (step) {
        this.resetInputs();
        this.press(step.control);
        this.comboTimer = step.duration || 0;
      }
    }
  }

  // -------------------- MAIN UPDATE --------------------
  update(time) {
    const now = time.now || performance.now();
    const delta = (time.secondsPassed || 0) * 1000;

    if (this.fighter.hitPoints <= 0) {
      if (this.fighter.dead !== "die" && this.fighter.dead !== "dead") {
        this.fighter.dead = "die";
        this.fighter.changeState(FighterState.DEATH, time);
      }
      return;
    }

    if (this.isInLockedState()) return;

    this.attackCooldown = Math.max(0, this.attackCooldown - delta);

    // Always run combo if queued
    if (this.comboQueue.length) {
      this.runCombo(delta);
      return;
    }

    if (this.isBlocking) {
      if (now >= this.blockUntil || !this.opponentIsAttacking()) {
        this.resetInputs();
        this.isBlocking = false;
      }
      return;
    }

    if (!this.nextDecisionTime || now >= this.nextDecisionTime) {
      this.nextDecisionTime = now + randomBetween(this.reactionDelay[0], this.reactionDelay[1]);
      this.makeDecision(time, now);
    } else {
      this.faceOpponent();
    }
  }

  isInLockedState() {
    const s = (this.fighter.currentState || "").toString();
    if (!s) return false;
    return (
      s.includes("KNOCKUP") ||
      s.includes("GETUP") ||
      s.includes("DEATH") ||
      s.includes("DIE") ||
      s.includes("HURT") ||
      (s.includes("SPECIAL") && !this.fighter.isAnimationCompleted()) ||
      (s.includes("HYPERSKILL") && !this.fighter.isAnimationCompleted())
    );
  }

  makeDecision(time, now) {
    const dx = this.opponent.position.x - this.fighter.position.x;
    const distance = Math.abs(dx);
    this.faceOpponent();

    // Dodge or block
    if (this.opponentIsAttacking() && distance < this.dodgeDistance) {
      if (Math.random() < this.blockChance) this.performBlockOrBackstep(now, dx);
      if (Math.random() < this.dodgeChance) this.performDodge(dx);
      return;
    }

    // Attack and super if opponent vulnerable
    if (this.opponentIsVulnerable() && distance < this.engageDistance + 30 && this.attackCooldown <= 0) {
      this.performAttack();
      this.attackCooldown = this.attackCooldownBase;
      if (Math.random() < this.superChance) this.performSuper(time);
      return;
    }

    // Aggressive positioning
    this.chaseOrMixup(dx, distance);
  }

  faceOpponent() {
    this.fighter.direction = this.opponent.position.x - this.fighter.position.x > 0 ? 1 : -1;
  }

  performBlockOrBackstep(now, dx) {
    this.resetInputs();
    const backwardControl = this.fighter.direction === 1 ? Control.LEFT : Control.RIGHT;
    this.press(backwardControl);
    this.isBlocking = true;
    this.blockUntil = now + randomBetween(150, 300);
  }

  chaseOrMixup(dx, distance) {
    if (distance > 20) {
      this.press(dx > 0 ? Control.RIGHT : Control.LEFT);
    } else {
      const rand = Math.random();
      if (rand < 0.2) this.press(Control.UP);
      else if (rand < 0.6) this.press(Control.DOWN);
      else if (rand < 0.8) {
        const back = this.fighter.direction === 1 ? Control.LEFT : Control.RIGHT;
        this.press(back);
      }
    }
  }

  performAttack() {
    const combos = [
      [{ control: Control.LIGHT_PUNCH, duration: 40 }],
      [{ control: Control.HEAVY_PUNCH, duration: 40 }],
      [{ control: Control.LIGHT_KICK, duration: 40 }],
      [{ control: Control.HEAVY_KICK, duration: 40 }],
      [{ control: Control.DOWN, duration: 40 },{ control: Control.LIGHT_KICK, duration: 40 }],
      [{ control: Control.DOWN, duration: 40 },{ control: Control.HEAVY_KICK, duration: 40 }],
      [{ control: Control.LIGHT_PUNCH, duration: 40 }, { control: Control.HEAVY_PUNCH, duration: 40 }],
      [{ control: Control.LIGHT_KICK, duration: 40 }, { control: Control.HEAVY_KICK, duration: 40 }],
      [{ control: Control.DOWN, duration: 30 }, { control: [Control.LEFT, Control.DOWN], duration: 30 }, { control: Control.HEAVY_PUNCH, duration: 30 }],
    ];
    this.queueCombo(combos[Math.floor(Math.random() * combos.length)]);
  }

  performSuper(time) {
    const moves = [FighterState.HYPERSKILL_1, FighterState.HYPERSKILL_2, FighterState.SPECIAL_1, FighterState.SPECIAL_2];
    const move = moves[Math.floor(Math.random() * moves.length)];
    const defaultStrength = 1;

    this.resetInputs(); // Make sure skill triggers
    switch (move) {
      case FighterState.SPECIAL_1:
        this.fighter.performSpecial1?.(time, defaultStrength) ?? this.fighter.changeState(FighterState.SPECIAL_1, time, defaultStrength);
        break;
      case FighterState.SPECIAL_2:
        this.fighter.performSpecial2?.(time, defaultStrength) ?? this.fighter.changeState(FighterState.SPECIAL_2, time, defaultStrength);
        break;
      case FighterState.HYPERSKILL_1:
        this.fighter.performHyperSkill1?.(time, defaultStrength) ?? this.fighter.changeState(FighterState.HYPERSKILL_1, time, defaultStrength);
        break;
      case FighterState.HYPERSKILL_2:
        this.fighter.performHyperSkill2?.(time, defaultStrength) ?? this.fighter.changeState(FighterState.HYPERSKILL_2, time, defaultStrength);
        break;
      default:
        this.fighter.changeState(move, time, defaultStrength);
    }
  }

  performDodge(dx) {
    this.jumpOrMixup(dx);
    const forward = Math.random() < 0.5;
    this.fighter.changeState(forward ? FighterState.DODGE_FORWARD : FighterState.DODGE_BACKWARD);
  }

  jumpOrMixup(dx) {
    const rand = Math.random();
    if (rand < 0.5) this.press(Control.UP);
    else this.press(Control.DOWN);
  }

  opponentIsVulnerable() {
    return (
      this.opponent.currentState.includes(FighterState.LIGHT_PUNCH) ||
      this.opponent.currentState.includes(FighterState.LIGHT_KICK) ||
      this.opponent.currentState.includes(FighterState.HEAVY_PUNCH) ||
      this.opponent.currentState.includes(FighterState.HEAVY_KICK) ||
      this.opponent.currentState.includes(FighterState.IDLE) ||
      this.opponent.currentState.includes(FighterState.WALK_FORWARD) ||
      this.opponent.currentState.includes(FighterState.WALK_BACKWARD) ||
      this.opponent.currentState.includes(FighterState.CROUCH) ||
      this.opponent.currentState.includes(FighterState.JUMP_LAND) ||
      this.opponent.currentState.includes(FighterState.JUMP_START) ||
      this.opponent.currentState.includes(FighterState.JUMP_UP) ||
      this.opponent.currentState.includes(FighterState.JUMP_FORWARD) ||
      this.opponent.currentState.includes(FighterState.JUMP_BACKWARD) ||
       this.opponent.currentState.includes(FighterState.JUMP_LIGHTKICK) ||
      this.opponent.currentState.includes(FighterState.JUMP_HEAVYKICK) ||
      this.opponent.currentState.includes(FighterState.CROUCH_LIGHTKICK) ||
      this.opponent.currentState.includes(FighterState.CROUCH_HEAVYKICK) 
    );
  }

  opponentIsAttacking() {
    return (
      this.opponent.currentState.includes(FighterState.LIGHT_PUNCH) ||
      this.opponent.currentState.includes(FighterState.LIGHT_KICK) ||
      this.opponent.currentState.includes(FighterState.HEAVY_PUNCH) ||
      this.opponent.currentState.includes(FighterState.HEAVY_KICK) ||
      this.opponent.currentState.includes(FighterState.JUMP_LIGHTKICK) ||
      this.opponent.currentState.includes(FighterState.JUMP_HEAVYKICK) ||
      this.opponent.currentState.includes(FighterState.CROUCH_LIGHTKICK) ||
      this.opponent.currentState.includes(FighterState.CROUCH_HEAVYKICK) ||
      this.opponent.currentState.includes(FighterState.HYPERSKILL_1) ||
      this.opponent.currentState.includes(FighterState.HYPERSKILL_2) ||
      this.opponent.currentState.includes(FighterState.SPECIAL_1) ||
      this.opponent.currentState.includes(FighterState.SPECIAL_2)
    );
  }
}
