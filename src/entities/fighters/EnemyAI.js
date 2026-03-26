// enemyAI.js
import { Control, controls } from "../../constants/control.js";
import { heldKeys, pressedKeys } from "../../inputHandler.js";
import { FighterHurtBox, FighterState } from "../../constants/fighter.js";
import { gameState } from "../../state/gameState.js";

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const MAX_VERTICAL_ATTACK_DISTANCE = 45; // tweak per game feel


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
    blockChance: 0.65,
    dodgeChance: 0.45,
    attackCooldown: 600,
    reactionDelay: [50, 150],
    engageDistance: 50,
    dodgeDistance: 180,
    superChance: 0.55,
  },
  hard: {
    blockChance: 0.75,
    dodgeChance: 0.55,
    attackCooldown: 400,
    reactionDelay: [30, 100],
    engageDistance: 40,
    dodgeDistance: 190,
    superChance: 0.60,
  },
  expert: {
    blockChance: 0.9,
    dodgeChance: 0.05,
    attackCooldown: 300,
    reactionDelay: [20, 70],
    engageDistance: 50,
    dodgeDistance: 200,
    superChance: 0.8,
  },
  insane: {
    blockChance: 1,
    dodgeChance: 0.1,
    attackCooldown: 50,       
    reactionDelay: [2, 15],   
    engageDistance: 25,
    dodgeDistance: 500,
    superChance: 0.99,        
  },
};

export class EnemyAI {
  constructor(fighter, opponent, difficulty) {
    

    this.settings = DIFFICULTY_PRESETS[difficulty] || DIFFICULTY_PRESETS.normal;
    console.log(`EnemyAI initialized with difficulty: ${difficulty}`);
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
    // Enable to log slow AI frames (ms)
    this.debugProfiling = true;
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
    const tStart = this.debugProfiling ? performance.now() : 0;
    try {
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
      // Cap minimum reaction delay to avoid extremely-frequent decisions
      const rawDelay = randomBetween(this.reactionDelay[0], this.reactionDelay[1]);
      const delay = Math.max(rawDelay, 50); // ms
      this.nextDecisionTime = now + delay;
      this.makeDecision(time, now);
    } else {
    // if(this.fighter.position.y >= 200)this.faceOpponent();
      }
      } finally {
        if (this.debugProfiling) {
          const elapsed = performance.now() - tStart;
          if (elapsed > 8) console.warn(`EnemyAI.update (${this.fighter.playerId}) took ${elapsed.toFixed(2)}ms`);
        }
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
  const dy = this.opponent.position.y - this.fighter.position.y;

  const distance = Math.abs(dx);


    // if(this.fighter.position.y >= 200)this.faceOpponent();

    // Dodge or block
    if (
  this.opponentIsAttacking() &&
  distance < this.dodgeDistance
) {
      if (Math.random() < this.blockChance) this.performBlockOrBackstep(now, dx);
      if (Math.random() < this.dodgeChance) this.performDodge(dx);
      return;
    }

    // Long distance move if opponent is far away
   if (
  distance > this.engageDistance + 100 &&
  this.attackCooldown <= 0 &&
  Math.random() < 0.4
) {
  this.performLongDistanceMove(time);
  this.attackCooldown = this.attackCooldownBase * 1.5;
  return;
}

    // Attack or special move if opponent vulnerable
    if (
  this.opponentIsVulnerable() &&
  distance < this.engageDistance + 40 &&
  this.attackCooldown <= 0
) {
  if (Math.random() < 0.5) {
    this.performAttack();
  } else {
    this.performSpecialMove(time);
  }

  this.attackCooldown = this.attackCooldownBase;

  if (Math.random() < this.superChance) {
    this.performSuper(time);
  }
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

    // 65% chance to do NOTHING (Rugal calm)
    if (Math.random() < 0.65) return;

    if (distance > this.settings.engageDistance) {
      // Slow walk forward
      if (Math.random() < 0.5)
        this.press(dx > 0 ? Control.RIGHT : Control.LEFT);
    } else {
      // Slight step back
      const back =
        this.fighter.direction === 1 ? Control.LEFT : Control.RIGHT;
      this.press(back);
    }
  }

    chaseOrMixupOld(dx, distance) {
    if (distance > 20) {
      this.press(dx > 0 ? Control.RIGHT : Control.LEFT);
    } else {
      const rand = Math.random();
      if (rand < 0.6) this.press(Control.UP);
      else if (rand < 0.6) this.press(Control.DOWN);
      else if (rand < 0.8) {
        const back = this.fighter.direction === 1 ? Control.LEFT : Control.RIGHT;
        this.press(back);
      }
    }
  }

  performAttack() {
    const combos = [
      [{ control: Control.LIGHT_PUNCH, duration: 150 },{ control: Control.LIGHT_PUNCH, duration: 150 }, { control: Control.HEAVY_PUNCH, duration: 150 }],
      [{ control: Control.LIGHT_KICK, duration: 150 },{ control: Control.LIGHT_PUNCH, duration: 150 }, { control: Control.HEAVY_KICK, duration: 150 }],
      //[{ control: Control.DOWN, duration: 100 }, { control: [Control.LEFT, Control.DOWN], duration: 100 }, { control: Control.HEAVY_PUNCH, duration: 100 }],
    ];
    this.queueCombo(combos[Math.floor(Math.random() * combos.length)]);
  }

  safeChangeState(state, time, strength) {
  if (!this.fighter.states?.[state]) {
    // state not implemented by this fighter → skip
    return false;
  }

  this.fighter.changeState(state, time, strength);
  return true;
}


  performSuper(time) {
    const enemySkillNumber = gameState.fighters[this.fighter.playerId].skillNumber;
    const moves = [FighterState.HYPERSKILL_1, FighterState.HYPERSKILL_2, FighterState.SPECIAL_1, FighterState.SPECIAL_2];
    const move = moves[Math.floor(Math.random() * moves.length)];
    const defaultStrength = 1;

    this.resetInputs(); // Make sure skill triggers
    switch (move) {
      case FighterState.SPECIAL_1:
        if(enemySkillNumber < 1) return;
        this.fighter.skillNumber -= 1;
        this.fighter.performSpecial1?.(time, defaultStrength) ??  this.safeChangeState(FighterState.SPECIAL_1, time, defaultStrength);
        break;
      case FighterState.SPECIAL_2:
        if(enemySkillNumber < 1) return;
        this.fighter.skillNumber -= 1;
        this.fighter.performSpecial2?.(time, defaultStrength) ??  this.safeChangeState(FighterState.SPECIAL_2, time, 300);
        break;
      case FighterState.HYPERSKILL_1:
        if(enemySkillNumber < 3) return;
        this.fighter.skillNumber -= 3;
        this.fighter.performHyperSkill1?.(time, defaultStrength) ??  this.safeChangeState(FighterState.HYPERSKILL_1, time, defaultStrength);
        break;
      case FighterState.HYPERSKILL_2:
        if(enemySkillNumber < 3) return;
        this.fighter.skillNumber -= 3;
        this.fighter.performHyperSkill2?.(time, defaultStrength) ??  this.safeChangeState(FighterState.HYPERSKILL_2, time, defaultStrength);
        break;
      default:
         this.safeChangeState(move, time, defaultStrength);
    }
  }

  // Special move: knocklift or knockliftdown (does not require skill energy)
  performSpecialMove(time) {
    const moves = [FighterState.KNOCKLIFT, FighterState.KNOCKLIFTDOWN, FighterState.KNEEDASH,FighterState.HEADBUTT_DOWN, FighterState.HEADBUTT,FighterState.TORNADO_DIG,];
    const move = moves[Math.floor(Math.random() * moves.length)];
    this.resetInputs();
     this.safeChangeState(move, time, 1); // strength default 1
  }

  // Long distance move: ranged attacks for when opponent is far
  performLongDistanceMove(time) {
    const enemySkillNumber = gameState.fighters[this.fighter.playerId].skillNumber;
    const moves = [FighterState.HEADBUTT, FighterState.SPECIAL_1, FighterState.SPECIAL_2, FighterState.SPECIAL_2_ROCKRELEASE, FighterState.TORNADO_DIG,FighterState.KNEEDASH, FighterState.HEADBUTT_DOWN];
    const move = moves[Math.floor(Math.random() * moves.length)];
    const defaultStrength = 1;

    this.resetInputs(); // Make sure move triggers
    switch (move) {
      case FighterState.SPECIAL_1:
        if(enemySkillNumber < 1) return;
        this.fighter.skillNumber -= 1;
        this.fighter.performSpecial1?.(time, defaultStrength) ?? this.safeChangeState(FighterState.SPECIAL_1, time, defaultStrength);
        break;
      case FighterState.SPECIAL_2:
        if(enemySkillNumber < 1) return;
        this.fighter.skillNumber -= 1;
        this.fighter.performSpecial2?.(time, defaultStrength) ?? this.safeChangeState(FighterState.SPECIAL_2, time, 300);
        break;
      case FighterState.SPECIAL_2_ROCKRELEASE:
        this.fighter.performSpecial2?.(time, defaultStrength) ?? this.safeChangeState(FighterState.SPECIAL_2_ROCKRELEASE, time, 300);
        break;
      case FighterState.HYPERSKILL_1:
        if(enemySkillNumber < 3) return;
        this.fighter.skillNumber -= 3;
        this.fighter.performHyperSkill1?.(time, defaultStrength) ?? this.safeChangeState(FighterState.HYPERSKILL_1, time, defaultStrength);
        break;
      case FighterState.HYPERSKILL_2:
        if(enemySkillNumber < 3) return;
        this.fighter.skillNumber -= 3;
        this.fighter.performHyperSkill2?.(time, defaultStrength) ?? this.safeChangeState(FighterState.HYPERSKILL_2, time, defaultStrength);
        break;
      case FighterState.HEADBUTT:
        this.safeChangeState(FighterState.HEADBUTT, time, 1);
        break;
      case FighterState.HEADBUTT_DOWN:
        this.safeChangeState(FighterState.HEADBUTT_DOWN, time, 1);
        break;
      case FighterState.HEADBUTT_UP:
        this.safeChangeState(FighterState.HEADBUTT_UP, time, 1);
        break;
      case FighterState.TORNADO_DIG:
        this.safeChangeState(FighterState.TORNADO_DIG, time, 1);
        break;
      case FighterState.KNEEDASH:
        this.safeChangeState(FighterState.KNEEDASH, time, 'heavyKick');
        break;
      default:
        this.safeChangeState(move, time, defaultStrength);
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
      this.opponent.currentState.includes(FighterState.IDLE) ||
      this.opponent.currentState.includes(FighterState.GETUP) ||
      this.opponent.currentState.includes(FighterState.KNOCKUP) ||
      this.opponent.currentState.includes(FighterState.HURT_BODY_HEAVY) ||
      this.opponent.currentState.includes(FighterState.HURT_BODY_LIGHT) ||
      this.opponent.currentState.includes(FighterState.HURT_HEAD_HEAVY) ||
      this.opponent.currentState.includes(FighterState.HURT_HEAD_LIGHT) ||
      this.opponent.currentState.includes(FighterState.WALK_FORWARD) ||
      this.opponent.currentState.includes(FighterState.WALK_BACKWARD) ||
      this.opponent.currentState.includes(FighterState.CROUCH) ||
      this.opponent.currentState.includes(FighterState.JUMP_LAND) ||
      this.opponent.currentState.includes(FighterState.JUMP_START) ||
      this.opponent.currentState.includes(FighterState.JUMP_UP) ||
      this.opponent.currentState.includes(FighterState.JUMP_FORWARD) ||
      this.opponent.currentState.includes(FighterState.JUMP_BACKWARD) ||
      this.opponent.currentState.includes(FighterState.SPECIAL_2) ||
       this.opponent.currentState.includes(FighterState.TORNADO_DIG) ||
       this.opponent.currentState.includes(FighterState.PICKUP) ||
       this.opponent.currentState.includes(FighterState.TOSS) ||
       this.opponent.currentState.includes(FighterState.KNEEDASH) ||
       this.opponent.currentState.includes(FighterState.KNOCKLIFT) ||
       this.opponent.currentState.includes(FighterState.KNOCKLIFTDOWN) 
    );
  }

  opponentIsAttacking() {
    return (
      this.opponent.currentState.includes(FighterState.LIGHT_PUNCH) ||
      this.opponent.currentState.includes(FighterState.LIGHT_KICK) ||
      this.opponent.currentState.includes(FighterState.HEAVY_PUNCH) ||
      this.opponent.currentState.includes(FighterState.HEAVY_KICK) ||
      this.opponent.currentState.includes(FighterState.KNOCKLIFT) ||
      this.opponent.currentState.includes(FighterState.KNOCKLIFTDOWN) ||
      this.opponent.currentState.includes(FighterState.HEADBUTT) ||
      this.opponent.currentState.includes(FighterState.JUMP_LIGHTKICK) ||
      this.opponent.currentState.includes(FighterState.JUMP_HEAVYKICK) ||
      this.opponent.currentState.includes(FighterState.CROUCH_LIGHTKICK) ||
      this.opponent.currentState.includes(FighterState.CROUCH_HEAVYKICK) ||
      this.opponent.currentState.includes(FighterState.HYPERSKILL_1) ||
      this.opponent.currentState.includes(FighterState.HYPERSKILL_2) ||
      this.opponent.currentState.includes(FighterState.SPECIAL_1) ||
      this.opponent.currentState.includes(FighterState.SPECIAL_2) ||
      this.opponent.currentState.includes(FighterState.SPECIAL_2_ROCKRELEASE) ||
      this.opponent.currentState.includes(FighterState.KNEEDASH) ||
       this.opponent.currentState.includes(FighterState.HEADBUTT_DOWN) ||
       this.opponent.currentState.includes(FighterState.HEADBUTT_UP) 
    );
  }
}
