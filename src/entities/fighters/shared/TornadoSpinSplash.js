import { FRAME_TIME } from '../../../constants/game.js';
import { STAGE_FLOOR } from '../../../constants/stage.js';
import { HitSplash } from './HitSplash.js';

export class TornadoSpinSplash extends HitSplash {
    constructor(args, time, entityList){
        super(args, time, entityList);
        const [x, y, playerId, maybe4 = 1, maybe5] = args;
       
        this.flipped = maybe4;
        this.reverse = maybe5*-1;
        this.frameNumber = 4;
       
        this.direction = maybe5*-1;
        this.rotation = 0;
        this.rotationValue = 5;
        this.touchGround = false;
        this.opacity = 0;
        this.position.x -= 10 * this.direction;
       
        this.frames = [
            //Player1
            [[215, 602, 76, 80], [38, 78]],
            [[310, 602, 72, 80], [36, 78]],
            [[401, 599, 74, 83], [37, 81]],
            [[499, 597, 75, 85], [37, 83]],

            //Player2
            [[76, 215, 76, 80], [38, 78]],
            [[310, 602, 72, 80], [36, 78]],
            [[401, 599, 74, 83], [37, 81]],
            [[499, 597, 75, 85], [37, 83]],
           
        ];
    }
   update(time){
    const delay = 7;
  
     this.rotation -= this.rotationValue*this.direction;
     this.animationTimer += time.secondsPassed;
     if (this.animationTimer < delay * FRAME_TIME / 1000) return;
     this.animationFrame += 1;
     this.animationTimer -= delay * FRAME_TIME / 1000;
          
           if (!this.touchGround) {
                this.opacity = Math.min(this.opacity + 0.2, 1);
            } else {
                this.opacity = Math.max(this.opacity - 0.15, 0);
            }

   
           if (this.animationFrame >= this.frameNumber){
            this.animationFrame = 0;
            
           } //this.entityList.remove.call(this.entityList, this);
       }

       draw(context, camera, maybe4) {
        const dir = this.direction;

// Signed thresholds
const ROT_30  = -30  * dir;
const ROT_35  = -35  * dir;
const ROT_90  = -90  * dir;
const ROT_130 = -160 * dir;
const ROT_170 = -170 * dir;
const ROT_180 = -180 * dir;


       
        
         if (this.animationFrame < 0 || this.animationFrame >= this.frames.length) return;
         if(this.position.y <= 130) this.position.y = 130;
         if(this.position.y >= STAGE_FLOOR) this.position.y = STAGE_FLOOR;
         if (dir > 0) {
    if (this.rotation <= ROT_30 && this.rotation >= ROT_35) {
        this.position.y -= 8;
        
    }
     if (this.rotation <= ROT_130) {
        this.touchGround = true;
        
    }
    if (this.rotation <= ROT_170) {
        this.position.y += 8;
        this.touchGround = true;
    }
    if (this.rotation <= ROT_180) {
        this.rotation = ROT_180;
    }
} else {
    if (this.rotation >= ROT_30 && this.rotation <= ROT_35) {
        
        this.position.y -= 8;
    }
    if (this.rotation >= ROT_130) {
        this.touchGround = true;
        
    }
    if (this.rotation >= ROT_170) {
        
        this.position.y += 8;
    }
    if (this.rotation >= ROT_180) {
        this.rotation = ROT_180;
    }
}

       
        //else this.entityList.remove.call(this.entityList, this);

    const [
        [x, y, width, height], 
        [originX, originY]
    ] = this.frames[this.animationFrame];

    const scaleY = this.flipped;
    const drawX = Math.floor(this.position.x - camera.position.x - originX);
    const drawY = Math.floor(this.position.y - camera.position.y - originY);

    context.save();
    context.translate(drawX + originX, drawY + originY); 
    context.rotate(this.rotation* Math.PI / 180);

   
        context.scale(this.direction, scaleY);
        context.globalAlpha = this.opacity;
        context.drawImage(
             this.image,
            x, y, width, height,
            -8, -16, width+10, height+5
        );
        context.globalAlpha = 1.0;
    
    context.restore();
       }


}