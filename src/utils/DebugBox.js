import { getActualBoxDimensions } from './collisions.js';

export class DebugBox {
    static drawBox(context, camera, position, direction, box, color) {
        if (!box || box.width === 0 || box.height === 0) return;

        const actual = getActualBoxDimensions(position, direction, box);

        const drawX = Math.floor(actual.x - camera.position.x) + 0.5;
        const drawY = Math.floor(actual.y - camera.position.y) + 0.5;

        context.beginPath();
        context.strokeStyle = color + 'AA';
        context.fillStyle = color + '33';
        context.lineWidth = 1;
        context.rect(drawX, drawY, actual.width, actual.height);
        context.fill();
        context.stroke();
    }

    static drawOrigin(context, camera, position, color = 'red') {
        const originX = Math.floor(position.x - camera.position.x);
        const originY = Math.floor(position.y - camera.position.y);

        context.beginPath();
        context.strokeStyle = color;
        context.lineWidth = 1;
        context.moveTo(originX - 4, originY);
        context.lineTo(originX + 5, originY);
        context.moveTo(originX, originY - 5);
        context.lineTo(originX, originY + 4);
        context.stroke();
    }

    static drawForEntity(context, camera, entity) {
        context.lineWidth = 1;

        // Draw hit box
        if (entity.boxes?.hit) {
            this.drawBox(context, camera, entity.position, entity.direction, entity.boxes.hit, '#FF0000');
        }

        // Draw hurt box - handle both array and object formats
        if (entity.boxes?.hurt) {
            if (Array.isArray(entity.boxes.hurt)) {
                // For special entities with array hurt boxes
                this.drawBox(context, camera, entity.position, entity.direction, {
                    x: entity.boxes.hurt[0],
                    y: entity.boxes.hurt[1],
                    width: entity.boxes.hurt[2],
                    height: entity.boxes.hurt[3],
                }, '#7777FF');
            } else if (typeof entity.boxes.hurt === 'object') {
                // For fighters with multiple hurt boxes (HEAD, BODY, FEET)
                Object.values(entity.boxes.hurt).forEach(hurtBox => {
                    if (Array.isArray(hurtBox) && hurtBox.length === 4) {
                        this.drawBox(context, camera, entity.position, entity.direction, {
                            x: hurtBox[0],
                            y: hurtBox[1],
                            width: hurtBox[2],
                            height: hurtBox[3],
                        }, '#7777FF');
                    }
                });
            }
        }

        // Draw push box if exists
        if (entity.boxes?.push) {
            this.drawBox(context, camera, entity.position, entity.direction, entity.boxes.push, '#00FF00');
        }

        // Draw origin
        this.drawOrigin(context, camera, entity.position);
    }

    static drawForSpecialEntity(context, camera, entity, frameData) {
        if (!frameData) return;

        context.lineWidth = 1;

        const boxes = {
            hit: frameData[1],
            hurt: frameData[2] || [],
        };

        // Draw hit box
        this.drawBox(context, camera, entity.position, entity.direction, {
            x: boxes.hit[0],
            y: boxes.hit[1],
            width: boxes.hit[2],
            height: boxes.hit[3],
        }, '#FF0000');

        // Draw hurt box if it's an array
        if (Array.isArray(boxes.hurt) && boxes.hurt.length === 4) {
            this.drawBox(context, camera, entity.position, entity.direction, {
                x: boxes.hurt[0],
                y: boxes.hurt[1],
                width: boxes.hurt[2],
                height: boxes.hurt[3],
            }, '#7777FF');
        }

        // Draw origin
        this.drawOrigin(context, camera, entity.position);
    }
}