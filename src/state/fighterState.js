import { HEALTH_MAX_HIT_POINTS, SKILL_POINTS } from "../constants/battle.js";
import { gameState } from "./gameState.js";

export const createDefaultFighterState = (id) => ({
id, 
resetHP: false,
score: 100,
battles: 0,
wins: 0,
touchingCamera: false,
status: 'normal',
alpha: 1,
pause: false,
perfectHP: false,
skillNumber: gameState.skillNumber,
skillConsumed: true,
resetSkillBar: false,
hitPoints: HEALTH_MAX_HIT_POINTS,
skillPoints: SKILL_POINTS,
superAcivated: false,
sprite: 0,
spawnEntity: false,
dead: "alive",
hyperSprite: 0,
	statusExpiresAt: 0,
    // combo tracking (used by overlays and the battle scene)
    comboCount: 0,
    // timestamp (ms) of the last registered hit the fighter landed
    lastHitTime: 0,
    // timestamp (ms) when the current combo expires (i.e. lastHitTime + cooldown)
    comboExpiresAt: 0,
    comboscale: 1,
});