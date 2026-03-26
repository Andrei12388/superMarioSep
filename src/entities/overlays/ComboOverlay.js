import { gameState } from "../../state/gameState.js";
import { FighterAttackStrength } from "../../constants/fighter.js";

export class ComboOverlay {
    constructor(fighters) {
        this.fighters = fighters; // entity objects used to find positions
        this.cooldownMs = 2000;   // combo cooldown
        this.prevCombo = new Array(fighters.length).fill(0); // track previous combo count
    }

    update(time) {
        for (let i = 0; i < gameState.fighters.length; i++) {
            const f = gameState.fighters[i];
            if (!f) continue;

            // reset expired combos
            if (f.comboCount > 0 && time.previous > (f.comboExpiresAt || 0)) {
                console.log("resetting combo for fighter", i);
                if(i === 0) gameState.fighters[i+1].resetHP = true;
                else if(i === 1) gameState.fighters[i-1].resetHP = true;
                f.comboCount = 0;
                f.lastHitTime = 0;
                f.comboExpiresAt = 0;
                f.comboScale = 1;
                this.prevCombo[i] = 0;
            }

            // detect combo increase
            if (f.comboCount > this.prevCombo[i]) {
                f.comboScale = 1.3; // reset pop-scale
                this.prevCombo[i] = f.comboCount;
            }

            // ease scale back to 1.0
            if (f.comboScale && f.comboScale > 1) {
                f.comboScale += (1 - f.comboScale) * 0.2;
            }
        }
    }

    draw(context, camera) {
        if(gameState.pauseMenu.pauseGame) return;
        const screenY = 70;

        for (let i = 0; i < this.fighters.length; i++) {
            const fighter = this.fighters[i];
            const fstate = gameState.fighters[i];
            if (!fighter || !fstate) continue;

            const count = fstate.comboCount || 0;
            if (count <= 1) continue;

            const isP1 = i === 0;
            const x = isP1 ? 30 : context.canvas.width - 30;

            if (!fstate.comboScale) fstate.comboScale = 1; 

            const text = `${count} HIT`;

            context.save();

            
            context.translate(x, screenY);
            context.scale(fstate.comboScale, fstate.comboScale);
            context.translate(-x, -screenY);

           //semi arcade font and effects
            context.font = "italic bold 24px Verdana";
            context.textAlign = isP1 ? "left" : "right";
            context.textBaseline = "middle";

           
            context.strokeStyle = "#000000";
            context.lineWidth = 6;

           
            const grad = context.createLinearGradient(
                isP1 ? x : x - 150,
                0,
                isP1 ? x + 150 : x,
                0
            );
            grad.addColorStop(0, "#0048ff");
            grad.addColorStop(0.5, "#00eaff");
            grad.addColorStop(1, "#9500ffff");
            context.fillStyle = grad;

            context.strokeText(text, x, screenY);
            context.fillText(text, x, screenY);

            context.restore();
        }
    }
}
