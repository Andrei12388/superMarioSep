// enemyAI.js
import { Control, controls } from "../../constants/control.js";
import { heldKeys, pressedKeys } from "../../inputHandler.js";
import { FighterHurtBox, FighterState } from "../../constants/fighter.js";
import { getActualBoxDimensions } from "../../utils/collisions.js";

const DIFFICULTY_PRESETS = {
  easy: {
    blockChance: 0.15,
    dodgeChance: 0.10,
    attackCooldown: 1500,
    reactionDelay: [300, 600],
    engageDistance: 50,
    dodgeDistance: 120,
    superChance: 0.15,
  },
  normal: {
    blockChance: 0.3,
    dodgeChance: 0.25,
    attackCooldown: 1000,
    reactionDelay: [150, 350],
    engageDistance: 70,
    dodgeDistance: 150,
    superChance: 0.3,
  },
  hard: {
    blockChance: 0.65,
    dodgeChance: 0.45,
    attackCooldown: 600,
    reactionDelay: [50, 150],
    engageDistance: 100,
    dodgeDistance: 180,
    superChance: 0.55,
  },
  expert: {
    blockChance: 0.9,
    dodgeChance: 0.05,
    attackCooldown: 300,
    reactionDelay: [20, 70],
    engageDistance: 100,
    dodgeDistance: 200,
    superChance: 0.8,
  },
};

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export class EnemyAI {
  constructor(fighter, opponent, difficulty = "expert") {
    this.settings = DIFFICULTY_PRESETS[difficulty] || DIFFICULTY_PRESETS.normal;
    this.fighter = fighter;
    this.opponent = opponent;

    this.comboQueue = [];
    this.comboTimer = 0;

    this.blockChance = this.settings.blockChance;
    this.dodgeChance = this.settings.dodgeChance;
    this.superChance = this.settings.superChance;
    this.attackCooldownBase = this.settings.attackCooldown;
    this.attackCooldown = 0;

    this.reactionDelay = this.settings.reactionDelay;
    this.engageDistance = this.settings.engageDistance;
    this.dodgeDistance = this.settings.dodgeDistance;

    this.isBlocking = false;
    this.blockUntil = 0;
    this.nextDecisionTime = 0;

    this.boxes = {
      push: { x: 0, y: 0, width: 0, height: 0 },
      hit: { x: 0, y: 0, width: 0, height: 0 },
      hurt: {
        [FighterHurtBox.HEAD]: [0, 0, 0, 0],
        [FighterHurtBox.BODY]: [0, 0, 0, 0],
        [FighterHurtBox.FEET]: [0, 0, 0, 0],
      },
    };
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

      // 🔹 Check for death
  if (this.fighter.hitPoints <= 0 && this.fighter.dead !== "die" && this.fighter.dead !== "dead") {
    this.fighter.dead = "die";
    this.fighter.changeState(FighterState.DEATH, time);
    return; // stop AI logic when dead
  }

  // Safety: don't act while fighter is in locked/uninterruptible states
  if (this.isInLockedState()) return;

    // Safety: don't act while fighter is in locked/uninterruptible states
    if (this.isInLockedState()) return;

    if (this.attackCooldown > 0) {
      this.attackCooldown = Math.max(0, this.attackCooldown - delta);
    }

    if (this.comboQueue.length) {
      this.runCombo(delta);
      return;
    }

    if (this.isBlocking) {
  if (now >= this.blockUntil || !this.opponentIsAttacking()) {
    this.resetInputs(); // stop moving backward
   // this.fighter.changeState(FighterState.IDLE, time);
    this.isBlocking = false;
  }
  return;
}


    if (!this.nextDecisionTime || now >= this.nextDecisionTime) {
      this.nextDecisionTime = now + randomBetween(this.reactionDelay[0], this.reactionDelay[1]);
      this.makeDecision(time, now);
    } else {
      const dx = this.opponent.position.x - this.fighter.position.x;
      this.fighter.direction = dx > 0 ? 1 : -1;
    }
  }

  // -------------------- STATE LOCKS --------------------
  isInLockedState() {
    const s = (this.fighter.currentState || "").toString();
    // If fighter is doing any of these, AI should not interrupt
    if (!s) return false;
    return (
      s.includes("KNOCKUP") ||
      s.includes("GETUP") ||
      s.includes("DEATH") ||
      s.includes("DIE") ||
      s.includes("HURT") ||
      // If special animation still running don't interrupt
      (s.includes("SPECIAL") && !this.fighter.isAnimationCompleted()) ||
      (s.includes("HYPERSKILL") && !this.fighter.isAnimationCompleted())
    );
  }

  // -------------------- DECISIONS --------------------
  makeDecision(time, now) {
    const myPos = this.fighter.position;
    const oppPos = this.opponent.position;
    const dx = oppPos.x - myPos.x;
    const distance = Math.abs(dx);

    this.fighter.direction = dx > 0 ? 1 : -1;

    if (this.fighter.currentState.includes("HURT") || this.fighter.currentState.includes("DEAD")) return;

    // Reactive: block if opponent attacking nearby
   // Reactive: move backward instead of blocking when opponent attacks
if (this.opponentIsAttacking() && distance < Math.max(this.engageDistance, 900) && Math.random() < this.blockChance) {
  this.resetInputs();

  // Determine which direction is backward
  const backwardControl = this.fighter.direction === 1 ? Control.LEFT : Control.RIGHT;

  // Hold backward movement for a short "defensive" duration
  // this.fighter.changeState(FighterState.IDLE, time);
  this.press(backwardControl);
  this.isBlocking = true; // still use this flag to time release
  this.blockUntil = now + 400; // same duration as before
  return;
}


   

    // Attack logic
    if (this.attackCooldown <= 0 && distance < this.engageDistance) {
      if (Math.random() < 0.7) {
        this.performAttack();
        if (Math.random() < this.superChance) {
          // pass time so performer can forward to fighter.init
          this.performSuper(time);
        }
        this.attackCooldown = this.attackCooldownBase;
        return;
      }
    }

     // Reactive: dodge if projectile or attack and in dodge distance
    // (simple heuristic: if opponent is performing a special/hyperskill, try dodge)
    if (distance < this.dodgeDistance && Math.random() < this.dodgeChance) {
      this.performDodge(dx);
      return;
    }

    // Move toward opponent
    this.chaseOrIdle(dx);
    
  }

  chaseOrIdle(dx) {
    if (Math.random() < 0.05) return;
    this.press(dx > 0 ? Control.RIGHT : Control.LEFT);
  }

  jumpOrIdle(dx) {
    if (Math.random() < 0.05) return;

    if (this.attackCooldown <= 0) {
      if (Math.random() < 0.7) {
         this.press(dx > 0 ? Control.UP : Control.DOWN);
        return;
      }
    }

   
  }

  opponentIsAttacking() {
    return (
      this.opponent.currentState.includes(FighterState.LIGHT_PUNCH) ||
      this.opponent.currentState.includes(FighterState.LIGHT_KICK) ||
      this.opponent.currentState.includes(FighterState.HEAVY_PUNCH) ||
      this.opponent.currentState.includes(FighterState.HEAVY_KICK) ||
      this.opponent.currentState.includes(FighterState.HYPERSKILL_1) ||
      this.opponent.currentState.includes(FighterState.HYPERSKILL_2) ||
      this.opponent.currentState.includes(FighterState.SPECIAL_1) ||
      this.opponent.currentState.includes(FighterState.SPECIAL_2)
    );
  }

  performAttack() {
    const r = Math.random();
    if (r < 0.33) {
      this.queueCombo([
        { control: Control.DOWN, duration: 100 },
        { control: [Control.LEFT, Control.DOWN], duration: 100 },
        { control: Control.LEFT, duration: 100 },
        { control: Control.HEAVY_PUNCH, duration: 100 },
      ]);
    } else if (r < 0.66) {
      this.queueCombo([
        { control: Control.LIGHT_PUNCH, duration: 100 },
        { control: Control.HEAVY_KICK, duration: 120 },
      ]);
    } else {
      this.queueCombo([
        { control: Control.HEAVY_KICK, duration: 120 },
        { control: Control.LIGHT_KICK, duration: 100 },
      ]);
    }
  }

  /**
   * performSuper(time)
   * - time: pass the current frame time so changeState init receives correct time arg
   *
   * This will call the fighter's explicit helper if it exists (e.g. performSpecial1),
   * otherwise it will call changeState and pass the `time` and a `strength` value so the fighter's init handler receives needed args.
   */
  performSuper(time) {
    const moves = [
      FighterState.HYPERSKILL_1,
      FighterState.HYPERSKILL_2,
      FighterState.SPECIAL_1,
      FighterState.SPECIAL_2,
    ];

    const move = moves[Math.floor(Math.random() * moves.length)];

    // choose a sensible default strength for specials (Malupiton expects a "strength" param)
    // adjust value if your fighter expects different keys (0/1/2...).
    const defaultStrength = 1;

    switch (move) {
      case FighterState.SPECIAL_1:
        if (typeof this.fighter.performSpecial1 === "function") {
          // let fighter helper handle its own args
          try {
            this.fighter.performSpecial1(time, defaultStrength);
          } catch (e) {
            // fallback to changeState signature
            this.fighter.changeState(FighterState.SPECIAL_1, time, defaultStrength);
          }
        } else {
          this.fighter.changeState(FighterState.SPECIAL_1, time, defaultStrength);
        }
        break;

      case FighterState.SPECIAL_2:
        if (typeof this.fighter.performSpecial2 === "function") {
          try {
            this.fighter.performSpecial2(time, defaultStrength);
          } catch (e) {
            this.fighter.changeState(FighterState.SPECIAL_2, time, defaultStrength);
          }
        } else {
          this.fighter.changeState(FighterState.SPECIAL_2, time, defaultStrength);
        }
        break;

      case FighterState.HYPERSKILL_1:
        if (typeof this.fighter.performHyperSkill1 === "function") {
          try {
            this.fighter.performHyperSkill1(time, defaultStrength);
          } catch (e) {
            this.fighter.changeState(FighterState.HYPERSKILL_1, time, defaultStrength);
          }
        } else {
          this.fighter.changeState(FighterState.HYPERSKILL_1, time, defaultStrength);
        }
        break;

      case FighterState.HYPERSKILL_2:
        if (typeof this.fighter.performHyperSkill2 === "function") {
          try {
            this.fighter.performHyperSkill2(time, defaultStrength);
          } catch (e) {
            this.fighter.changeState(FighterState.HYPERSKILL_2, time, defaultStrength);
          }
        } else {
          this.fighter.changeState(FighterState.HYPERSKILL_2, time, defaultStrength);
        }
        break;

      default:
        this.fighter.changeState(move, time, defaultStrength);
    }
  }

  performDodge(dx) {
    this.jumpOrIdle(dx);
    const forward = Math.random() < 0.5;
    this.fighter.changeState(forward ? FighterState.DODGE_FORWARD : FighterState.DODGE_BACKWARD);
  }
}
