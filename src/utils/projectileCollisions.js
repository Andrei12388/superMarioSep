import { FireballCollidedState } from "../constants/fireball.js";
import { Fireball } from "../entities/fighters/special/Fireball.js";
import { HeavyRock } from "../entities/fighters/special/HeavyRock.js";
import { Rock } from "../entities/fighters/special/Rock.js";
import { RockSplash } from "../entities/fighters/special/RockSplash.js";
import { TornadoSpin } from "../entities/fighters/special/TornadoSpin.js";
import { boxOverlap, getActualBoxDimensions } from "./collisions.js";


/**
 * Checks if a projectile has collided with the opponent fighter
 * @param {Object} projectile - The projectile entity
 * @param {Array} hitBox - The hit box dimensions [x, y, width, height]
 * @returns {string|null} Collision state or null
 */
export function hasCollidedWithOpponent(projectile, hitBox) {
    for (const [, hurtBox] of Object.entries(projectile.fighter.opponent.boxes.hurt)) {
        const [x, y, width, height] = hurtBox;
        const actualOpponentHurtBox = getActualBoxDimensions(
            projectile.fighter.opponent.position,
            projectile.fighter.opponent.direction,
            {x, y, width, height}
        );

        if (boxOverlap(hitBox, actualOpponentHurtBox)) {
            return FireballCollidedState.OPPONENT;
        }
    }
    return null;
}

/**
 * Checks if a projectile has collided with other projectiles
 * @param {Object} projectile - The projectile entity
 * @param {Array} hitBox - The hit box dimensions [x, y, width, height]
 * @returns {string|null} Collision state or null
 */
export function hasCollidedWithOtherProjectile(projectile, hitBox) {
    const others = projectile.entityList.entities.filter(
        (entity) =>
            entity !== projectile &&
            typeof entity.getCollisionHitBox === "function"
    );

    for (const other of others) {
        const otherHitBox = other.getCollisionHitBox();
        if (!otherHitBox) continue;

        if (boxOverlap(hitBox, otherHitBox)) {
            return FireballCollidedState.FIREBALL;
        }
    }

    return null;
}




/**
 * Main collision detection function that checks both opponent and other projectiles
 * @param {Object} projectile - The projectile entity
 * @param {Array} hitBox - The hit box dimensions [x, y, width, height]
 * @returns {string|null} Collision state or null
 */
export function checkProjectileCollision(projectile, hitBox) {
    return hasCollidedWithOpponent(projectile, hitBox) || hasCollidedWithOtherProjectile(projectile, hitBox);
}


