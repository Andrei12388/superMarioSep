import { gameState } from "./state/gameState.js";

export class EntityList {
    entities = [];

      add(EntityClass, time, ...args){
       console.log('Creating entity:', EntityClass.name);
        this.entities.push(new EntityClass(args, time, this));
    }

    remove(entity){
    this.entities = this.entities.filter((thisEntity) => thisEntity !== entity);
}

  update(time, context, camera){
        for (const entity of this.entities){
            entity.update(time, context, camera);
        }
    }

     draw(context, camera){
        for(const entity of this.entities){
        entity.draw(context, camera);
    }

    // Draw debug information for all entities if debug is enabled
    if(gameState.debug.entities){
        for(const entity of this.entities){
            if(entity.drawDebug){
                entity.drawDebug(context, camera);
            }
        }
    }
    }
}