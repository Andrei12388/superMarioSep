import * as control from '../../inputHandler.js'
import { FIGHTER_HURT_DELAY, FighterAttackStrength, FighterAttackType, FighterState, FrameDelay, HitBox, HurtBox, PushBox, SpecialMoveButton, SpecialMoveDirection } from '../../constants/fighter.js';
import { STAGE_FLOOR } from '../../constants/stage.js';
import { playSound } from '../../soundHandler.js';
import { gameState } from '../../state/gameState.js';
//import { FighterState, PushBox, AnimationFrame } from '../../constants/fighter.js';

import { Fighter, AnimationFrame } from './Fighter.js';
import { KnockLiftSplash } from './shared/KnockLiftSplash.js';
import { Fireball } from './special/Fireball.js';
import { boxOverlap, getActualBoxDimensions } from '../../utils/collisions.js';
import { BlockHitSplash } from './shared/BlockHitSplash.js';
import { HeavyHitSplash } from './shared/HeavyHitSplash.js';
import { GreenHitSplash } from './shared/GreenHitSplash.js';
import { DashEffectSplash } from './shared/DashEffectSplash.js';

export class Malupiton extends Fighter {
    constructor(playerId, onAttackHit, effectSplash, entityList, entityListForeground) {
        super(playerId, onAttackHit, effectSplash); //Change Direction of the player

        this.entityList = entityList;
        this.entityListForeground = entityListForeground;

        this.image = document.querySelector('img[alt="malupiton"]');
        this.voiceSpecial3 = document.querySelector('audio#sound-malupiton-special-3');
        this.voiceSpecial2 = document.querySelector('audio#sound-malupiton-special-2');
        this.voiceSpecial1 = document.querySelector('audio#sound-malupiton-special-1');
        this.voiceHyperSkill1 = document.querySelector('audio#sound-malupiton-hyperskill-1');
        this.knockliftSound = document.querySelector('audio#sound-malupiton-knock-lift');
        this.knockliftdownSound = document.querySelector('audio#sound-malupiton-knock-lift-down');
        this.headbuttSound = document.querySelector('audio#sound-malupiton-headbutt');
        this.headbuttDashSound = document.querySelector('audio#sound-malupiton-headbutt-dash');
        this.voiceSpecial1.volume = 0.8;
        this.voiceSpecial2.volume = 0.9;
        this.voiceSpecial3.volume = 0.9;
        this.voiceHyperSkill1.volume = 0.9;
        this.deathSound = document.querySelector('audio#sound-malupiton-death');
        this.deathSound.volume = 0.9;
        this.soundSuperLaunch = document.querySelector('audio#super-launch');
        this.frames = new Map([
           
           //Forwards or Idle
            ['forwards-1', [[[70, 255, 52, 95],[26,93]], PushBox.IDLE, HurtBox.IDLE]],
            ['forwards-2', [[[140, 255,53,90],[26,88]], PushBox.IDLE, HurtBox.IDLE]],
            ['forwards-3', [[[206, 255,52,91],[26,89]], PushBox.IDLE, HurtBox.IDLE]],
            ['forwards-4', [[[269, 257,59,90],[30,88]], PushBox.IDLE, HurtBox.IDLE]],
            ['forwards-5', [[[335, 257,69,91],[34,89]], PushBox.IDLE, HurtBox.IDLE]],
            ['forwards-6', [[[408, 257,65,91],[32,89]], PushBox.IDLE, HurtBox.IDLE]],
            ['forwards-7', [[[473, 255,61,97],[30,95]], PushBox.IDLE, HurtBox.IDLE]],
            ['forwards-8', [[[469, 156,67,94],[33,92]], PushBox.IDLE, HurtBox.IDLE]],
            ['forwards-9', [[[473, 255,61,97],[30,95]], PushBox.IDLE, HurtBox.IDLE]],
            ['forwards-10',[[[408, 257,65,91],[32,89]], PushBox.IDLE, HurtBox.IDLE]],
            ['forwards-11',[[[335, 257,69,91],[34,89]], PushBox.IDLE, HurtBox.IDLE]],
            ['forwards-12', [[[269, 257,59,90],[30,88]], PushBox.IDLE, HurtBox.IDLE]],
            ['forwards-13', [[[206, 255,52,91],[26,89]], PushBox.IDLE, HurtBox.IDLE]],
            ['forwards-14', [[[140, 253,53,90],[26,88]], PushBox.IDLE, HurtBox.IDLE]],

            //Dodge
             ['dodge-1', [[[730, 25, 55, 92],[27,90]], PushBox.NULL, HurtBox.IDLE]],
             ['dodge-2', [[[790, 23, 52, 93],[26,91]], PushBox.NULL, HurtBox.IDLE]],
             ['dodge-3', [[[847, 23, 55, 92],[27,90]], PushBox.NULL, HurtBox.IDLE]],
             ['dodge-4', [[[911, 23, 52, 92],[26,90]], PushBox.NULL, HurtBox.IDLE]],
           
            
            //Jump Up
            ['jumpup-1', [[[408, 257,64,91],[32,89]], PushBox.JUMP, HurtBox.JUMP]],
            ['jumpup-2', [[[335, 257,69,91],[34,89]], PushBox.JUMP, HurtBox.JUMP]],
            ['jumpup-3', [[[269, 257,59,92],[30,90]], PushBox.JUMP, HurtBox.JUMP]],
            
            
            //Jump Forwards/Backwards
            ['jump-roll-1', [[[70, 124, 55, 88], [27,86]], PushBox.JUMP, HurtBox.JUMP]],
            ['jump-roll-2', [[[136, 127, 82, 70], [41,68]], PushBox.JUMP, HurtBox.JUMP]],
            ['jump-roll-3', [[[236, 138, 88, 48], [44,46]], PushBox.JUMP, HurtBox.JUMP]],
            ['jump-roll-4', [[[339, 115, 50, 94], [24,91]], PushBox.JUMP, HurtBox.JUMP]],
            ['jump-roll-5', [[[327, 43, 100, 68], [50,68]], PushBox.JUMP, HurtBox.JUMP]],
            ['jump-roll-6', [[[236, 23, 73, 105], [36,103]], PushBox.JUMP, HurtBox.JUMP]],
            ['jump-roll-7', [[[469, 156,67,94],[33,92]], PushBox.JUMP, HurtBox.JUMP]],

            //Special Roll
            ['special-roll-1', [[[70, 124, 55, 88], [27,86]], PushBox.JUMP, HurtBox.JUMP, HitBox.LIGHT_PUNCH]],
            ['special-roll-2', [[[136, 127, 82, 70], [41,68]], PushBox.JUMP, HurtBox.JUMP]],
            ['special-roll-3', [[[231, 138, 88, 48], [44,46]], PushBox.JUMP, HurtBox.JUMP]],
            ['special-roll-4', [[[339, 115, 50, 94], [24,91]], PushBox.JUMP, HurtBox.JUMP, HitBox.LIGHT_PUNCH]],
            ['special-roll-5', [[[327, 43, 100, 68], [50,68]], PushBox.JUMP, HurtBox.JUMP]],
            ['special-roll-6', [[[251, 21, 56, 102], [28,100]], PushBox.JUMP, HurtBox.JUMP]],
            ['special-roll-7', [[[469, 156,67,94],[33,92]], PushBox.JUMP, HurtBox.JUMP, HitBox.LIGHT_PUNCH]],

            //knock lift kick
            ['knock-lift-1', [[[70, 124, 55, 88], [27,86]], PushBox.JUMP, HurtBox.JUMP]],
            ['knock-lift-2', [[[136, 127, 82, 70], [41,68]], PushBox.JUMP, HurtBox.JUMP]],
            ['knock-lift-3', [[[231, 138, 88, 48], [44,46]], PushBox.JUMP, HurtBox.JUMP]],
            ['knock-lift-4', [[[339, 115, 50, 94], [24,91]], PushBox.JUMP, HurtBox.JUMP, [12,-55,60,55],]],
            ['knock-lift-4-down', [[[339, 115, 50, 94], [24,91]], PushBox.JUMP, HurtBox.JUMP, [20,-55,60,55],]],
            ['knock-lift-5', [[[327, 43, 100, 68], [50,68]], PushBox.JUMP, HurtBox.JUMP]],
            ['knock-lift-6', [[[251, 21, 56, 102], [28,100]], PushBox.JUMP, HurtBox.JUMP]],
            ['knock-lift-7', [[[469, 156,67,94],[33,92]], PushBox.JUMP, HurtBox.JUMP]],

            //Headbutt
            ['headbutt-1', [[[264, 957, 93, 75], [46,73]], PushBox.JUMP, HurtBox.JUMP]],
            ['headbutt-2', [[[367, 970, 100, 59], [50,59]], PushBox.JUMP, HurtBox.JUMP]],
            ['headbutt-3', [[[477, 980, 116, 39], [58,37]], [0,-32,26,22], [[-52,-26,40,24],[-28,-26,45,28],[28,-34,30,27]],[38,-25,20,15]]],

            //Headbutt Up
            ['headbutt-up-1', [[[277, 1052, 60, 89], [30,87]], PushBox.JUMP, HurtBox.JUMP]],
            ['headbutt-up-2', [[[361, 1063, 88, 79], [44,77]], PushBox.JUMP, HurtBox.JUMP]],
            ['headbutt-up-3', [[[459, 1058, 98, 74], [49,72]], PushBox.JUMP, HurtBox.JUMP, [38,-75,20,15],]],

            //Headbutt Down
            ['headbutt-down-1', [[[261, 1157, 98, 53], [49,51]], PushBox.JUMP, HurtBox.JUMP]],
            ['headbutt-down-2', [[[367, 1156, 88, 63], [44,61]], PushBox.JUMP, HurtBox.JUMP]],
            ['headbutt-down-3', [[[464, 1151, 102, 73], [51,71]], PushBox.JUMP, HurtBox.JUMP, [20,-30,20,15],]],


            //Jump first/Last frame
            ['jump-land', [[[269, 257,59,90],[29,88]], PushBox.IDLE, HurtBox.IDLE]],

             //Crouch
            ['crouch-1', [[[17, 19, 52, 81], [26,79]], PushBox.IDLE, HurtBox.JUMP]],
            ['crouch-2', [[[81, 32, 57, 69], [28,67]], PushBox.BEND, HurtBox.BEND]],
            ['crouch-3', [[[154, 44, 66, 60], [33,58]], PushBox.CROUCH, HurtBox.CROUCH]], 
           
            //Idle

            ['stands-1', [[[200, 523, 55, 92], [27,90]], PushBox.IDLE, HurtBox.IDLE]],
            ['stands-2', [[[133, 526,59,92],[29,90]], PushBox.IDLE, HurtBox.IDLE]],
            ['stands-3', [[[67, 528,60,90],[30,88]], PushBox.IDLE, HurtBox.IDLE]],
            ['stands-4', [[[2, 528,61,90],[30,88]], PushBox.IDLE, HurtBox.IDLE]], 

            //Idle Turn
            ['idle-turn-3', [[[206, 254, 51, 88], [25,86]], PushBox.IDLE, [[-10, -89, 28, 10],[-14, -74, 40, 24], [-14, -31, 40, 32]]]],
            ['idle-turn-2', [[[141, 252, 51, 89], [25,87]], PushBox.IDLE, [[-16, -96, 28, 18],[-14, -74, 40, 24], [-14, -31, 40, 32]]]],
            ['idle-turn-1', [[[70, 252, 52, 91], [26,89]], PushBox.IDLE, [[-16, -96, 28, 18],[-14, -74, 40, 24], [-14, -31, 40, 32]]]],

            //Crouch Turn
            ['crouch-turn-1', [[[154, 44, 66, 60], [33,58]], PushBox.CROUCH, [[7, -60, 24, 18],[-28, -46, 44, 24], [-28, -24, 44, 24]]]],
            ['crouch-turn-2', [[[81, 32, 57, 67], [28,65]], PushBox.CROUCH, [[7, -60, 24, 18],[-28, -46, 44, 24], [-28, -24, 44, 24]]]],
            ['crouch-turn-3', [[[492, 34, 46, 67], [23,65]], PushBox.CROUCH, [[-26, -61, 24, 18],[-28, -46, 44, 24], [-28, -24, 44, 24]]]],

            //Standing Block
            ['stand-block-1', [[[634, 119, 56, 71], [28,69]], PushBox.IDLE, HurtBox.IDLE,]],
            

            //Crouch Block
            ['crouch-block-1', [[[558, 127, 62, 49], [31,47]], PushBox.CROUCH, HurtBox.CROUCH,]],
            
             //Crouch Light Kick
            ['crouch-lightkick-1', [[[555, 195, 53, 53], [21,51]], PushBox.CROUCH, HurtBox.CROUCH]],
            ['crouch-lightkick-2', [[[615, 196, 91, 50], [45,48]], PushBox.CROUCH, HurtBox.CROUCH, HitBox.CROUCH_LIGHTKICK ]],
            
            //Crouch Heavvy Kick
            ['crouch-heavykick-1', [[[548, 254, 63, 50], [31,48]], PushBox.CROUCH, HurtBox.CROUCH]],
            ['crouch-heavykick-2', [[[622, 250, 49, 67], [24,65]], PushBox.CROUCH, HurtBox.CROUCH]],
            ['crouch-heavykick-3', [[[696, 241, 114, 74], [57,64]], PushBox.CROUCH, HurtBox.CROUCH, HitBox.CROUCH_HEAVYKICK ]],

            //Jump-attack
            ['jump-attack-1', [[[555, 42, 94, 54], [46,52]], PushBox.LIGHT_KICK, HurtBox.LIGHT_KICK, HitBox.JUMP_HEAVYKICK]],

            //lIGHT Punch
            ['light-punch-1', [[[70, 124, 55, 88], [27,86]], PushBox.IDLE, [[3, -76, 30, 18],[-3, -59, 30, 20], [-32, -52, 44, 58]]]],
            ['light-punch-2', [[[136, 127, 82, 70], [27,78]], PushBox.BEND, [[3, -76, 30, 18],[-3, -69, 50, 20], [-2, -52, 44, 58]], HitBox.LIGHT_PUNCH]],
            ['light-punch-3', [[[136, 127, 82, 70], [27,78]], PushBox.BEND, [[3, -76, 30, 18],[-3, -69, 50, 20], [-2, -52, 44, 58]]]],

             //Heavy Punch
            ['heavy-punch-1', [[[230, 140, 91, 49], [1,77]], PushBox.BEND, [[3, -76, 30, 18],[3, -69, 84, 30], [-2, -52, 44, 58]], HitBox.HEAVY_PUNCH]],

             //lIGHT kick
            ['light-kick-1', [[[81, 34, 57, 69], [27,86]], PushBox.IDLE,  [[3, -76, 30, 18],[-3, -59, 64, 20], [-32, -52, 44, 58]]]],
            ['light-kick-2', [[[560, 26, 84, 71], [27,78]], PushBox.BEND, [[3, -76, 30, 18],[-3, -59, 64, 20], [-32, -52, 44, 58]], HitBox.LIGHT_KICK]],

             //Heavy kick
            ['heavy-kick-1', [[[153, 44, 59, 60], [30,58]], PushBox.BEND, [[3, -76, 30, 18],[-3, -59, 30, 20], [-32, -52, 44, 58]]]],
            ['heavy-kick-2', [[[660, 29, 58, 87], [19,85]], PushBox.BEND, [[3, -76, 30, 18],[-3, -59, 30, 20], [-32, -52, 44, 58]]]],
            ['heavy-kick-3', [[[560, 26, 84, 71], [1,78]], PushBox.BEND, [[3, -76, 30, 18],[8, -58, 75, 20], [-2, -52, 44, 58]], HitBox.HEAVY_KICK]],
            ['heavy-kick-4', [[[269, 256, 51, 91], [16,89]], PushBox.BEND, [[3, -76, 30, 18],[-3, -59, 30, 20], [-32, -52, 44, 58]]]],
            ['heavy-kick-5', [[[206, 259, 51, 87], [15,85]], PushBox.BEND, [[3, -76, 30, 18],[-3, -59, 30, 20], [-32, -52, 44, 58]]]],

            //Hit Face
            ['hurt-face-3', [[[91, 1158,75,93],[37,91]], PushBox.IDLE, HurtBox.IDLE]],
            ['hurt-face-2', [[[21, 1153,60,101],[30,99]], PushBox.IDLE, HurtBox.IDLE]],
            ['hurt-face-1', [[[20, 1042,51,90],[25,88]], PushBox.IDLE, HurtBox.IDLE]],

            //Hurt Body
            ['hurt-body-1', [[[20, 1042, 51, 90], [25,88]], PushBox.CROUCH, [[7, -60, 24, 18],[-28, -46, 44, 24], [-28, -24, 44, 24]]]],
            ['hurt-body-2', [[[82, 1049, 68, 83], [34,81]], PushBox.CROUCH, [[7, -60, 24, 18],[-28, -46, 44, 24], [-28, -24, 44, 24]]]],
            ['hurt-body-3', [[[159, 1051, 74, 80], [37,78]], PushBox.CROUCH, [[-26, -61, 24, 18],[-28, -46, 44, 24], [-28, -24, 44, 24]]]],

             //Special 1 - Roll
            ['special-1', [[[70, 124, 55, 88], [27,86]], PushBox.IDLE, [[3, -76, 30, 18],[-3, -59, 30, 20], [-32, -52, 44, 58]]]],
            ['special-2', [[[136, 127, 82, 70], [27,78]], PushBox.BEND, [[3, -76, 30, 18],[-3, -69, 50, 20], [-2, -52, 44, 58]]]],
            ['special-3', [[[230, 140, 91, 49], [1,77]], PushBox.BEND, [[3, -76, 30, 18],[3, -69, 84, 30], [-2, -52, 44, 58]]]],

            //HyperSkill1
            ['hyperskill1-1', [[[533, 419, 58, 114], [29,112]], PushBox.IDLE, HurtBox.NULL,]],
            ['hyperskill1-2', [[[592, 438, 53, 90], [26,88]], PushBox.IDLE, HurtBox.NULL]],
            ['hyperskill1-3', [[[650, 415, 52, 116], [26,114]], PushBox.IDLE, HurtBox.NULL]],
            ['hyperskill1-4', [[[707, 381, 130, 150], [65,148]], PushBox.IDLE, HurtBox.NULL, HitBox.HYPERSKILL_1]],
            ['hyperskill1-5', [[[845, 386, 151, 146], [75,144]], PushBox.IDLE, HurtBox.NULL, HitBox.HYPERSKILL_1]],
            ['hyperskill1-6', [[[445, 535, 145, 138], [72,136]], PushBox.IDLE, HurtBox.NULL, HitBox.HYPERSKILL_1]],
            ['hyperskill1-7', [[[597, 535, 131, 136], [65,134]], PushBox.IDLE, HurtBox.NULL, HitBox.HYPERSKILL_1]],
            ['hyperskill1-8', [[[745, 534, 119, 160], [64,158]], PushBox.IDLE, HurtBox.NULL,]],
            ['hyperskill1-9', [[[887, 554, 95, 140], [47,138]], PushBox.IDLE, HurtBox.NULL,]],

            //HyperSkill2
            ['hyperskill2--4', [[[333, 718, 67, 94], [33,92]], PushBox.IDLE, HurtBox.NULL,]],
            ['hyperskill2--3', [[[258, 720, 67, 92], [33,90]], PushBox.IDLE, HurtBox.NULL,]],
            ['hyperskill2--2', [[[365, 613, 52, 92], [26,90]], PushBox.IDLE, HurtBox.NULL,]],
            ['hyperskill2--1', [[[329, 608, 33, 102], [16,100]], PushBox.IDLE, HurtBox.NULL,]],
            ['hyperskill2-0', [[[268, 608, 47, 102], [23,100]], PushBox.IDLE, HurtBox.NULL,]],
            ['hyperskill2-1', [[[70, 482, 43, 100], [22,98]], PushBox.IDLE, HurtBox.NULL,]],
            ['hyperskill2-2', [[[18, 506, 39, 72], [19,70]], PushBox.IDLE, HurtBox.NULL,]],
            ['hyperskill2-3', [[[124, 463, 66, 127], [33,125]], PushBox.IDLE, HurtBox.NULL, HitBox.SLASH]],
            ['hyperskill2-4', [[[199, 501, 59, 90], [29,88]], PushBox.IDLE, HurtBox.NULL, HitBox.SLASH]],
            ['hyperskill2-5', [[[266, 498, 101, 103], [50,101]], PushBox.IDLE, HurtBox.NULL, HitBox.SLASH]],
            ['hyperskill2-6', [[[8, 606, 59, 70], [30,68]], PushBox.IDLE, HurtBox.NULL, HitBox.SLASH]],
            ['hyperskill2-7', [[[91, 604, 67, 71], [33,69]], PushBox.IDLE, HurtBox.NULL, HitBox.SLASH]],
            ['hyperskill2-8', [[[181, 605, 58, 111], [29,109]], PushBox.IDLE, HurtBox.NULL, HitBox.SLASH]],

            //Death State
              
            ['death-1', [[[9,838,53,91],[27,89]], [-10,-84,29,52], [[8,-83,25,30],[-11,-85,36,41],[-24,-43,45,40]], [0,-500,0,0]]],
            ['death-2', [[[84,836,48,98],[24,96]], [-24,-93,39,66], [[-5,-89,27,27],[-21,-93,36,46],[-24,-44,45,40]], [0,-500,0,0]]],
            ['death-3', [[[150,840,69,97],[34,95]], [-29,-85,40,51], [[-16,-90,25,26],[-28,-93,41,50],[-13,-55,43,47]], [0,-500,0,0]]],
            ['death-4', [[[234,852,77,76],[38,74]], [-36,-66,57,43], [[-28,-77,25,25],[-37,-71,40,41],[0,-57,33,53]], [0,-500,0,0]]],
            ['death-5', [[[321,855,101,51],[50,49]], [-43,-35,63,35], [[-47,-39,31,32],[-44,-33,52,34],[-4,-43,30,41]], [0,-500,0,0]]],
            ['death-6', [[[433,870,99,37],[49,35]], [-48,-31,55,31], [[-48,-39,30,30],[-44,-31,45,32],[-4,-32,30,30]], [0,-500,0,0]]],
            ['death-7', [[[537,867,116,37],[58,35]], [-47,-22,96,22], [[-52,-26,24,24],[-28,-26,45,28],[17,-26,30,27]], [0,-500,0,0]]],
             ['death-8', [[[537,867,116,37],[58,35]], [-53,-26,106,23], [[0,-500,0,0],[0,-500,0,0],[0,-500,0,0]], [0,-500,0,0]]],
            
            //GetUp State
            ['getUp-1', [[[11,955,53,55],[27,53]], [-20,-50,36,46], [[0,-500,0,0],[0,-500,0,0],[0,-500,0,0]], [0,-500,0,0]]],
            ['getUp-2', [[[82,959,63,50],[31,48]], [-19,-43,37,37], [[0,-500,0,0],[0,-500,0,0],[0,-500,0,0]], [0,-500,0,0]]],
            ['getUp-3', [[[160,959,60,59],[30,57]], [-18,-57,46,47], [[0,-500,0,0],[0,-500,0,0],[0,-500,0,0]], [0,-500,0,0]]],

            //fall state
            ['fall-4', [[[234,852,77,76],[38,74]], [0,0,0,0], [[-28,-77,25,25],[-37,-71,40,41],[0,-57,33,53]], [0,-500,0,0]]],
            ['fall-5', [[[321,855,101,51],[50,49]], [0,0,0,0], [[-47,-39,31,32],[-44,-33,52,34],[-4,-43,30,41]], [0,-500,0,0]]],
            ['fall-6', [[[433,870,99,37],[49,35]], [0,0,0,0], [[-48,-39,30,30],[-44,-31,45,32],[-4,-32,30,30]], [0,-500,0,0]]],
            ['fall-7', [[[537,867,116,37],[58,35]], [0,0,0,0], [[-52,-26,24,24],[-28,-26,45,28],[17,-26,30,27]], [0,-500,0,0]]],

  

            
        ]);

                  
         this.animations = {
            [FighterState.IDLE]:[ 
                ['forwards-14', 85],['forwards-13',85],
                ['forwards-12',85],['forwards-11',85],
                ['forwards-10',85],['forwards-9',85],
                ['forwards-8',85],['forwards-7',85],
                ['forwards-6',85],['forwards-5',85],
                ['forwards-4',85],['forwards-3',85],
                ['forwards-2',85],['forwards-1',85],
            ],
            [FighterState.DODGE_BACKWARD]:[ 
                ['dodge-1', 40], ['dodge-2', 40],
                ['dodge-3', 40], ['dodge-4', 150],
                ['dodge-3', 40], ['dodge-2', 40],
                ['dodge-1',FrameDelay.TRANSITION],
            ],
            [FighterState.DODGE_FORWARD]:[ 
                ['dodge-1', 40], ['dodge-2', 40],
                ['dodge-3', 40], ['dodge-4', 150],
                ['dodge-3', 40], ['dodge-2', 40],
                ['dodge-1',FrameDelay.TRANSITION],
            ],

            [FighterState.WALK_FORWARD]: [
             
                ['forwards-6',85],['forwards-5',85],
                ['forwards-4',85],['forwards-3',85],
                ['forwards-2',85],['forwards-1',85],
                        
            ],
            [FighterState.WALK_BACKWARD]:[
             
                ['forwards-6',85],['forwards-5',85],
                ['forwards-4',85],['forwards-3',85],
                ['forwards-2',85],['forwards-1',85],
        ],
            [FighterState.JUMP_START]:[
                ['jump-land', 50],['jump-land',FrameDelay.TRANSITION],
             ],
            [FighterState.JUMP_LAND]:[
            ['jump-land', 33],['jump-land',117],['jump-land',FrameDelay.TRANSITION],
             ],
            [FighterState.JUMP_UP]:[
                ['jumpup-1', 180],['jumpup-2', 100],
                ['jumpup-3', 100],
            ],
            [FighterState.JUMP_FORWARD]:[
                ['jump-roll-1', 232],['jump-roll-2', 50],
                ['jump-roll-3', 50],['jump-roll-4', 50],
                ['jump-roll-5', 50],['jump-roll-6', 50],
                ['jump-roll-7', FrameDelay.FREEZE],
            ],
            [FighterState.JUMP_BACKWARD]:[
                ['jump-roll-7', 249],['jump-roll-6', 50],
                ['jump-roll-5', 50],['jump-roll-4', 50],
                ['jump-roll-3', 50],['jump-roll-2', 50],
                ['jump-roll-1', FrameDelay.FREEZE],
            ],
            [FighterState.CROUCH]:[['crouch-3',FrameDelay.FREEZE]],
            [FighterState.CROUCH_DOWN]:[
                ['crouch-1', 30],['crouch-2', 30],['crouch-3', 30],['crouch-3', FrameDelay.TRANSITION],
            ],
            [FighterState.CROUCH_UP]:[
                ['crouch-3', 30],['crouch-2', 30],['crouch-1', 30],['crouch-1', FrameDelay.TRANSITION],
            ],
            [FighterState.IDLE_TURN]:[
                ['idle-turn-3', 33],['idle-turn-2', 33],
                ['idle-turn-1', 33],['idle-turn-1', FrameDelay.TRANSITION],
            ],
            [FighterState.CROUCH_TURN]:[
                ['crouch-turn-3', 33],['crouch-turn-2', 33],
                ['crouch-turn-1', 33],['crouch-turn-1', FrameDelay.TRANSITION],
            ],
             [FighterState.LIGHT_PUNCH]:[
                ['light-punch-1', 33],['light-punch-1', 33],['light-punch-2', 66],
                ['light-punch-1', 66],['light-punch-1', FrameDelay.TRANSITION],
            ],
            [FighterState.HEAVY_PUNCH]:[
                ['light-punch-1', 50],['light-punch-1', 50],['light-punch-3', 33],['heavy-punch-1', 100],
                ['light-punch-3', 250],['light-punch-1', 199],['light-punch-1', FrameDelay.TRANSITION],
            ],
             [FighterState.LIGHT_KICK]:[
                ['light-punch-1', 50],['light-kick-1', 50],['light-kick-2', 133],
                ['light-kick-1', 66],['light-kick-1', FrameDelay.TRANSITION],
            ],
             [FighterState.CROUCH_LIGHTKICK]:[
                ['crouch-lightkick-1', 33],['crouch-lightkick-1', 33],['crouch-lightkick-2', 106],
                ['crouch-lightkick-1', 66],['crouch-lightkick-1', FrameDelay.TRANSITION],
            ],
           [FighterState.CROUCH_HEAVYKICK]:[
                ['crouch-heavykick-1', 40],['crouch-heavykick-2', 40],['crouch-heavykick-3', 143],
                ['crouch-heavykick-2', 166],['crouch-heavykick-1', 196],['crouch-heavykick-1', FrameDelay.TRANSITION],
            ],
            [FighterState.HEAVY_KICK]:[
                ['heavy-kick-1', 66],['heavy-kick-2', 78],['heavy-kick-3', 100],
                ['heavy-kick-2', 250],['heavy-kick-1', 106],['heavy-kick-5', FrameDelay.TRANSITION],
            ],
            [FighterState.JUMP_HEAVYKICK]:[
                ['heavy-kick-1', 66],['heavy-kick-2', 78],['heavy-kick-3', 88],
                ['heavy-kick-2', 106],['heavy-kick-1', 106],['heavy-kick-5', FrameDelay.TRANSITION],
               // ['jump-attack-1',FrameDelay.TRANSITION],
            ],
            [FighterState.JUMP_LIGHTKICK]:[
                ['light-kick-1', 50],['light-kick-2', 133],
                ['light-kick-1', 66],['light-kick-1', FrameDelay.TRANSITION],
                 // ['jump-attack-1',FrameDelay.TRANSITION],
            ],
            [FighterState.KNOCKLIFT]:[
                ['knock-lift-7', 50],['knock-lift-6', 50],
                ['knock-lift-5', 50],['knock-lift-4', 50],
                ['knock-lift-3', 50],['knock-lift-2', 50],
                ['knock-lift-1', FrameDelay.TRANSITION],
            ],
            [FighterState.KNOCKLIFTDOWN]:[
                ['knock-lift-1', 50],['knock-lift-2', 50],
                ['knock-lift-3', 50],['knock-lift-4-down', 50],
                ['knock-lift-5', 50],['knock-lift-6', 50],
                ['knock-lift-7', FrameDelay.TRANSITION],
            ],
            [FighterState.HEADBUTT]:[
                ['headbutt-1', 80],['headbutt-2', 80],
                ['headbutt-3', 1000],
                ['headbutt-3', FrameDelay.TRANSITION],
            ],
            [FighterState.HEADBUTT_UP]:[
                ['headbutt-up-1', 80],['headbutt-up-2', 80],
                ['headbutt-up-3', 1000],
                ['headbutt-up-3', FrameDelay.TRANSITION],
            ],
            [FighterState.HEADBUTT_DOWN]:[
                ['headbutt-down-1', 40],['headbutt-down-2', 40],
                ['headbutt-down-3', 1000],
                ['headbutt-down-3', FrameDelay.TRANSITION],
            ],
            
            [FighterState.HURT_HEAD_LIGHT]:[
                ['hurt-face-1', FIGHTER_HURT_DELAY],['hurt-face-1', 30],
                ['hurt-face-2', 40],['hurt-face-3', 40], ['hurt-face-2', 20], ['hurt-face-1', 20],
                ['hurt-face-1', FrameDelay.TRANSITION],
            ],
            [FighterState.HURT_HEAD_HEAVY]:[
                ['hurt-face-3', FIGHTER_HURT_DELAY],['hurt-face-3', 80],
                ['hurt-face-2', 50],['hurt-face-1', 70],['hurt-face-1', FrameDelay.TRANSITION],
            ],
            [FighterState.HURT_BODY_LIGHT]:[
                ['hurt-body-1', FIGHTER_HURT_DELAY],['hurt-body-1', 30],
                ['hurt-body-2', 60], ['hurt-body-1', 60], ['hurt-body-1', FrameDelay.TRANSITION],
            ],
            [FighterState.HURT_BODY_HEAVY]:[
                ['hurt-body-1', FIGHTER_HURT_DELAY],['hurt-body-2', 80],
                ['hurt-body-3', 120],['hurt-body-2', 90],['hurt-body-1', 90],['hurt-body-1', FrameDelay.TRANSITION],
            ],
            [FighterState.SPECIAL_1]:[
                ['special-1', 20],['special-2', 80],['special-3', 20],['special-3', 400],
                ['special-3', FrameDelay.TRANSITION],
            ],
            [FighterState.SPECIAL_2]:[
                ['special-roll-7', 249],['special-roll-6', 50],
                ['special-roll-5', 50],['special-roll-4', 50],
                ['special-roll-3', 50],['special-roll-2', 50],
                ['special-roll-1', 50],
                ['special-roll-7', 249],['special-roll-6', 50],
                ['special-roll-5', 50],['special-roll-4', 50],
                ['special-roll-3', 50],['special-roll-2', 50],
                ['special-roll-1', 50],
                ['special-roll-7', 249],['special-roll-6', 50],
                ['special-roll-5', 50],['special-roll-4', 50],
                ['special-roll-3', 50],['special-roll-2', 50],
                ['special-roll-1', FrameDelay.TRANSITION],
            ],
            [FighterState.BLOCK]:[
                ['stand-block-1', 60],
                ['stand-block-1', FrameDelay.TRANSITION],
            ],
            [FighterState.CROUCH_BLOCK]:[
                ['crouch-block-1', 60],
                ['crouch-block-1', FrameDelay.TRANSITION],
            ],
            [FighterState.HYPERSKILL_1]:[
                ['hyperskill1-1', 60], ['hyperskill1-2', 210],
                ['hyperskill1-3', 120], ['hyperskill1-4', 130],
                ['hyperskill1-5', 170], ['hyperskill1-6', 150],
                ['hyperskill1-7', 70], ['hyperskill1-8', 70],
                ['hyperskill1-7', 70],
                ['hyperskill1-6', 70], ['hyperskill1-7', 70],
                ['hyperskill1-8', 70],
                ['hyperskill1-7', 70],
                ['hyperskill1-6', 70], ['hyperskill1-7', 70],
                ['hyperskill1-8', 70],
                ['hyperskill1-7', 70], ['hyperskill1-8', 70],
                ['hyperskill1-9', 70], 
                ['hyperskill1-3', 60], ['hyperskill1-2', 120],
                ['hyperskill1-1', 120],
                ['hyperskill1-1', FrameDelay.TRANSITION],
            ],
             [FighterState.HYPERSKILL_2]:[
                ['hyperskill2-0', 700], ['hyperskill2-1', 50], ['hyperskill2-2', 140],
                ['hyperskill2-3', 100], ['hyperskill2-4', 100],
                ['hyperskill2-5', 100], ['hyperskill2-6', 100],
                ['hyperskill2-7', 100], ['hyperskill2-8', 100],
                ['hyperskill2-3', 100], ['hyperskill2-4', 100],
                ['hyperskill2-5', 100], ['hyperskill2-6', 100],
                ['hyperskill2-7', 100], ['hyperskill2-8', 100],['hyperskill2-3', 70],
                ['hyperskill2-2', 60], ['hyperskill2-1', 150],
                ['hyperskill2-0', 150],['hyperskill2--1', 150],
                ['hyperskill2--2', 150], ['hyperskill2--3', 200],
                ['hyperskill2--4', 150],
                ['hyperskill2--4', FrameDelay.TRANSITION],
            ],
             [FighterState.DEATH]:[
                ['death-1', 300], ['death-2', 120], ['death-3', 120], 
                ['death-4', 120], ['death-5', 120], ['death-6', 120], 
                ['death-7', 120],
                ['death-7', FrameDelay.TRANSITION],
            ],
            [FighterState.DIE]:[
                ['death-7', 7000],
                ['death-7', FrameDelay.TRANSITION],
            ],
            [FighterState.KNOCKUP]:[
                ['death-1', 100], ['death-2', 120], ['death-3', 120], 
                ['death-4', 120], ['death-5', 120], ['death-6', 130], 
                ['death-7', 120],
                ['death-7', FrameDelay.TRANSITION],
            ],
            [FighterState.LAYDOWN_GROUND]:[
                ['death-1', 300], ['death-2', 120], ['death-3', 120], 
                ['death-4', 120], ['death-5', 120], ['death-6', 120], 
                ['death-7', 120],
                ['death-7', FrameDelay.FREEZE],
            ],
            [FighterState.FALL]:[
                ['fall-4', 100], ['fall-5', 100], ['fall-6', 100], 
                ['fall-7', 100],
                ['fall-7', FrameDelay.TRANSITION],
            ],
             [FighterState.GETUP]:[
                ['death-8', 300], ['getUp-1', 120], ['getUp-2', 120], ['getUp-3', 120],
                ['getUp-3', FrameDelay.TRANSITION],
            ],

        };

        this.initialVelocity = {
            x:{
                [FighterState.WALK_FORWARD]: 3 * 60,
                [FighterState.WALK_BACKWARD]: -(2 * 60),
                [FighterState.JUMP_FORWARD]: ((48 * 3) + (12 * 2)),
                [FighterState.JUMP_BACKWARD]: -((45 * 4) + (15 * 3)),
                [FighterState.HEADBUTT]: 600,
                [FighterState.HEADBUTT_UP]: 600,
                [FighterState.HEADBUTT_DOWN]: 700,
            },
            jump: -420,
        };
       
        this.SpecialMoves = [
            {
                state: FighterState.SPECIAL_1,
                sequence: 
                [SpecialMoveDirection.DOWN, SpecialMoveDirection.BACKWARD_DOWN, 
                SpecialMoveDirection.BACKWARD, SpecialMoveButton.AB,
                ],
                cursor: 0,
            },
            {
                state: FighterState.SPECIAL_2,
                sequence: 
                [SpecialMoveDirection.FORWARD, 
                SpecialMoveDirection.BACKWARD, SpecialMoveButton.BD,
                ],
                cursor: 0,
            },
            {
                state: FighterState.HYPERSKILL_1,
                sequence: 
                [SpecialMoveDirection.DOWN,
                SpecialMoveDirection.UP, SpecialMoveButton.AD,
                ],
                cursor: 0,
            },
            {
                state: FighterState.HYPERSKILL_2,
                sequence: 
                [SpecialMoveDirection.BACKWARD, SpecialMoveDirection.BACKWARD_DOWN, SpecialMoveDirection.DOWN, SpecialMoveDirection.FORWARD_DOWN, SpecialMoveDirection.FORWARD,
                SpecialMoveButton.AC,
                ],
                cursor: 0,
            },
            {
                state: FighterState.DODGE_FORWARD,
                sequence: 
                [SpecialMoveDirection.FORWARD, SpecialMoveDirection.FORWARD, SpecialMoveButton.BC,
                ],
                cursor: 0,
            },
            {
                state: FighterState.DODGE_BACKWARD,
                sequence: 
                [SpecialMoveDirection.BACKWARD, SpecialMoveDirection.BACKWARD, SpecialMoveButton.BC,
                ],
                cursor: 0,
            },
             {
                state: FighterState.KNOCKLIFT,
                sequence: 
                [SpecialMoveDirection.DOWN,SpecialMoveDirection.BACKWARD_DOWN, SpecialMoveDirection.BACKWARD, SpecialMoveButton.HEAVY_KICK,
                ],
                cursor: 0,
            },
            {
                state: FighterState.KNOCKLIFTDOWN,
                sequence: 
                [SpecialMoveDirection.DOWN, SpecialMoveDirection.FORWARD_DOWN, SpecialMoveDirection.FORWARD, SpecialMoveButton.HEAVY_KICK,
                ],
                cursor: 0,
            },
           {
                state: FighterState.HEADBUTT_DOWN,
                sequence: 
                [SpecialMoveDirection.DOWN,SpecialMoveDirection.FORWARD_DOWN, SpecialMoveDirection.FORWARD, SpecialMoveDirection.FORWARD, SpecialMoveButton.HEAVY_PUNCH,
                ],
                cursor: 0,
            },
            {
                state: FighterState.HEADBUTT_UP,
                sequence: 
                [SpecialMoveDirection.DOWN,SpecialMoveDirection.FORWARD_DOWN, SpecialMoveDirection.FORWARD, SpecialMoveDirection.FORWARD, SpecialMoveButton.HEAVY_PUNCH,
                ],
                cursor: 0,
            },
             {
                state: FighterState.HEADBUTT,
                sequence: 
                [SpecialMoveDirection.DOWN,SpecialMoveDirection.BACKWARD_DOWN, SpecialMoveDirection.BACKWARD, SpecialMoveDirection.BACKWARD, SpecialMoveButton.HEAVY_PUNCH,
                ],
                cursor: 0,
            },
            
        ];
        this.gravity = 1000;
        
        this.fireball = {fired: false, strength: undefined};
        this.headbuttActivate = false;
        
        this.states[FighterState.SPECIAL_1] = {
            init: this.handleSpecial1Init.bind(this),
            update: this.handleSpecial1State.bind(this),
            shadow: [1.6, 1, -40, 0],
            validFrom: [
                FighterState.IDLE, FighterState.WALK_FORWARD, FighterState.IDLE_TURN, FighterState.JUMP_BACKWARD, FighterState.JUMP_FORWARD, FighterState.JUMP_START,
                FighterState.HEAVY_PUNCH, FighterState.LIGHT_PUNCH, FighterState.LIGHT_KICK, FighterState.HEAVY_KICK,
                FighterState.CROUCH, FighterState.CROUCH_DOWN, FighterState.CROUCH_UP, FighterState.CROUCH_TURN,
                FighterState.KNOCKLIFT, FighterState.KNOCKLIFTDOWN,
            ],
        }
        this.states[FighterState.SPECIAL_2] = {
            attackType: FighterAttackType.PUNCH,
            attackStrength: FighterAttackStrength.LIGHT,
            init: this.handleSpecial2Init.bind(this),
            update: this.handleSpecial2State.bind(this),
            shadow: [1.6, 1, -40, 0],
            validFrom: [
                FighterState.IDLE, FighterState.WALK_FORWARD, FighterState.IDLE_TURN, 
                FighterState.HEAVY_PUNCH, FighterState.LIGHT_PUNCH, FighterState.LIGHT_KICK, FighterState.HEAVY_KICK,
                FighterState.CROUCH, FighterState.CROUCH_DOWN, FighterState.CROUCH_UP, FighterState.CROUCH_TURN,
                FighterState.KNOCKLIFT, FighterState.KNOCKLIFTDOWN,
            ],
        }
        this.states[FighterState.HYPERSKILL_1] = {
            attackType: FighterAttackType.PUNCH,
            attackStrength: FighterAttackStrength.SUPER2,
            init: this.handleHyperSkill1Init.bind(this),
            update: this.handleHyperSkill1State.bind(this),
            shadow: [1.6, 1, -40, 0],
            validFrom: [
                FighterState.IDLE, FighterState.WALK_FORWARD, FighterState.IDLE_TURN, FighterState.JUMP_UP, FighterState.JUMP_BACKWARD, FighterState.JUMP_FORWARD, FighterState.JUMP_LAND,
                FighterState.HEAVY_PUNCH, FighterState.LIGHT_PUNCH, FighterState.LIGHT_KICK, FighterState.HEAVY_KICK,
                FighterState.CROUCH, FighterState.CROUCH_DOWN, FighterState.CROUCH_UP, FighterState.CROUCH_TURN,
                FighterState.HEADBUTT, FighterState.KNOCKLIFT, FighterState.KNOCKLIFTDOWN,
            ],
        }
        this.states[FighterState.HYPERSKILL_2] = {
            attackType: FighterAttackType.PUNCH,
            attackStrength: FighterAttackStrength.SLASH,
            init: this.handleHyperSkill2Init.bind(this),
            update: this.handleHyperSkill2State.bind(this),
            shadow: [1.6, 1, -40, 0],
            validFrom: [
                FighterState.IDLE, FighterState.WALK_FORWARD, FighterState.IDLE_TURN, FighterState.JUMP_UP, FighterState.JUMP_BACKWARD, FighterState.JUMP_FORWARD, FighterState.JUMP_LAND,
                FighterState.HEAVY_PUNCH, FighterState.LIGHT_PUNCH, FighterState.LIGHT_KICK, FighterState.HEAVY_KICK,
                FighterState.CROUCH, FighterState.CROUCH_DOWN, FighterState.CROUCH_UP, FighterState.CROUCH_TURN, FighterState.CROUCH_HEAVYKICK, FighterState.CROUCH_LIGHTKICK, FighterState.CROUCH_BLOCK,
                FighterState.HEADBUTT, FighterState.KNOCKLIFT, FighterState.KNOCKLIFTDOWN,
            ],
        }
        
        this.states[FighterState.DODGE_FORWARD] = {
             init: this.handleDodgeForwardInit.bind(this),
             update: this.handleDodgeState.bind(this),
           
            validFrom: [
                FighterState.IDLE, FighterState.WALK_FORWARD, FighterState.IDLE_TURN, 
                FighterState.HEAVY_PUNCH, FighterState.LIGHT_PUNCH, FighterState.LIGHT_KICK, FighterState.HEAVY_KICK,
                FighterState.CROUCH, FighterState.CROUCH_DOWN, FighterState.CROUCH_UP, FighterState.CROUCH_TURN,
                FighterState.JUMP_UP, FighterState.JUMP_FORWARD, FighterState.JUMP_BACKWARD,
                 FighterState.HEADBUTT, FighterState.KNOCKLIFT, FighterState.KNOCKLIFTDOWN,
            ],
        }
        this.states[FighterState.DODGE_BACKWARD] = {
            init: this.handleDodgeBackwardInit.bind(this),
            update: this.handleDodgeState.bind(this),
           
            validFrom: [
                FighterState.IDLE, FighterState.WALK_FORWARD, FighterState.IDLE_TURN, 
                FighterState.HEAVY_PUNCH, FighterState.LIGHT_PUNCH, FighterState.LIGHT_KICK, FighterState.HEAVY_KICK,
                FighterState.CROUCH, FighterState.CROUCH_DOWN, FighterState.CROUCH_UP, FighterState.CROUCH_TURN,
                FighterState.JUMP_UP, FighterState.JUMP_FORWARD, FighterState.JUMP_BACKWARD,
                FighterState.KNOCKLIFT, FighterState.KNOCKLIFTDOWN,
            ],
        }
        this.states[FighterState.KNOCKLIFT] = {
             attackType: FighterAttackType.PUNCH,
            attackStrength: FighterAttackStrength.KNOCKLIFT,
             init: this.handleKnockLiftInit.bind(this),
             update: this.handleKnockLiftState.bind(this),
           
            validFrom: [
                FighterState.IDLE, FighterState.WALK_FORWARD, FighterState.IDLE_TURN, 
                FighterState.HEAVY_PUNCH, FighterState.LIGHT_PUNCH, FighterState.LIGHT_KICK, FighterState.HEAVY_KICK, FighterState.CROUCH_HEAVYKICK, FighterState.CROUCH_LIGHTKICK, FighterState.CROUCH_BLOCK,
                FighterState.CROUCH, FighterState.CROUCH_DOWN, FighterState.CROUCH_UP, FighterState.CROUCH_TURN, FighterState.JUMP_LIGHTKICK, FighterState.JUMP_HEAVYKICK,
                FighterState.JUMP_UP, FighterState.JUMP_FORWARD, FighterState.JUMP_BACKWARD, FighterState.JUMP_START, FighterState.JUMP_LAND, FighterState.KNOCKLIFTDOWN
                 
            ],
        }
        this.states[FighterState.KNOCKLIFTDOWN] = {
            attackType: FighterAttackType.KICK,
            attackStrength: FighterAttackStrength.KNOCKLIFTDOWN,
             init: this.handleKnockLiftInit.bind(this),
             update: this.handleKnockLiftState.bind(this),
           
            validFrom: [
                FighterState.IDLE, FighterState.WALK_FORWARD, FighterState.IDLE_TURN, 
                FighterState.HEAVY_PUNCH, FighterState.LIGHT_PUNCH, FighterState.LIGHT_KICK, FighterState.HEAVY_KICK, FighterState.CROUCH_HEAVYKICK, FighterState.CROUCH_LIGHTKICK, FighterState.CROUCH_BLOCK,
                FighterState.CROUCH, FighterState.CROUCH_DOWN, FighterState.CROUCH_UP, FighterState.CROUCH_TURN, FighterState.JUMP_LIGHTKICK, FighterState.JUMP_HEAVYKICK,
                FighterState.JUMP_UP, FighterState.JUMP_FORWARD, FighterState.JUMP_BACKWARD, FighterState.JUMP_START, FighterState.JUMP_LAND, FighterState.KNOCKLIFT,
               
            ],
        }
        this.states[FighterState.HEADBUTT] = {
            attackType: FighterAttackType.PUNCH,
            attackStrength: FighterAttackStrength.HEAVY,
             init: this.handleHeadbuttInit.bind(this),
             update: this.handleHeadbuttState.bind(this),
           
            validFrom: [
                FighterState.IDLE, FighterState.WALK_FORWARD, FighterState.IDLE_TURN, FighterState.WALK_BACKWARD,
                FighterState.HEAVY_PUNCH, FighterState.LIGHT_PUNCH, FighterState.LIGHT_KICK, FighterState.HEAVY_KICK, FighterState.CROUCH_HEAVYKICK, FighterState.CROUCH_LIGHTKICK, FighterState.CROUCH_BLOCK,
                FighterState.JUMP_LIGHTKICK, FighterState.JUMP_HEAVYKICK,
                FighterState.CROUCH, FighterState.CROUCH_DOWN, FighterState.CROUCH_UP, FighterState.CROUCH_TURN, FighterState.JUMP_BACKWARD, FighterState.JUMP_FORWARD,
                FighterState.JUMP_UP, FighterState.JUMP_START, FighterState.JUMP_LAND, FighterState.KNOCKLIFT, FighterState.KNOCKLIFTDOWN,
            ],
        }
        this.states[FighterState.HEADBUTT_UP] = {
            attackType: FighterAttackType.PUNCH,
            attackStrength: FighterAttackStrength.HEAVY,
             init: this.handleHeadbuttUpInit.bind(this),
             update: this.handleHeadbuttUpState.bind(this),
           
            validFrom: [
                FighterState.IDLE, FighterState.WALK_FORWARD, FighterState.IDLE_TURN, FighterState.WALK_BACKWARD,
                FighterState.HEAVY_PUNCH, FighterState.LIGHT_PUNCH, FighterState.LIGHT_KICK, FighterState.HEAVY_KICK, FighterState.CROUCH_HEAVYKICK, FighterState.CROUCH_LIGHTKICK, FighterState.CROUCH_BLOCK,
                FighterState.CROUCH, FighterState.CROUCH_DOWN, FighterState.CROUCH_UP, FighterState.CROUCH_TURN, 
                FighterState.KNOCKLIFT, FighterState.KNOCKLIFTDOWN,
            ],
        }
        this.states[FighterState.HEADBUTT_DOWN] = {
            attackType: FighterAttackType.PUNCH,
            attackStrength: FighterAttackStrength.HEAVY,
             init: this.handleHeadbuttDownInit.bind(this),
             update: this.handleHeadbuttDownState.bind(this),
           
            validFrom: [
                FighterState.JUMP_LIGHTKICK, FighterState.JUMP_HEAVYKICK,
                 FighterState.JUMP_BACKWARD, FighterState.JUMP_FORWARD,
                FighterState.JUMP_UP, FighterState.JUMP_START, FighterState.JUMP_LAND, FighterState.KNOCKLIFT, FighterState.KNOCKLIFTDOWN,
            ],
        }
        
    
        this.states[FighterState.IDLE].validFrom = [...this.states[FighterState.IDLE].validFrom, FighterState.SPECIAL_1];
        this.states[FighterState.IDLE].validFrom = [...this.states[FighterState.IDLE].validFrom, FighterState.SPECIAL_2];
        this.states[FighterState.JUMP_BACKWARD].validFrom = [...this.states[FighterState.JUMP_BACKWARD].validFrom, FighterState.HYPERSKILL_1];
        this.states[FighterState.IDLE].validFrom = [...this.states[FighterState.IDLE].validFrom, FighterState.HYPERSKILL_2];
        //DOdges
        this.states[FighterState.IDLE].validFrom = [...this.states[FighterState.IDLE].validFrom, FighterState.DODGE_FORWARD];
        this.states[FighterState.IDLE].validFrom = [...this.states[FighterState.IDLE].validFrom, FighterState.DODGE_BACKWARD];
        //special moves
        this.states[FighterState.IDLE].validFrom = [...this.states[FighterState.IDLE].validFrom, FighterState.KNOCKLIFT];
        
        this.states[FighterState.IDLE].validFrom = [...this.states[FighterState.IDLE].validFrom, FighterState.KNOCKLIFTDOWN];
        this.states[FighterState.IDLE].validFrom = [...this.states[FighterState.IDLE].validFrom, FighterState.HEADBUTT];
        this.states[FighterState.IDLE].validFrom = [...this.states[FighterState.IDLE].validFrom, FighterState.HEADBUTT_UP];
        this.states[FighterState.IDLE].validFrom = [...this.states[FighterState.IDLE].validFrom, FighterState.HEADBUTT_DOWN];

         //headbutt up valid states
        this.states[FighterState.JUMP_BACKWARD].validFrom = [...this.states[FighterState.JUMP_BACKWARD].validFrom, FighterState.HEADBUTT];
        this.states[FighterState.JUMP_FORWARD].validFrom = [...this.states[FighterState.JUMP_FORWARD].validFrom, FighterState.HEADBUTT];
        this.states[FighterState.KNOCKLIFT].validFrom = [...this.states[FighterState.KNOCKLIFT].validFrom, FighterState.HEADBUTT];
        //headbutt up valid states
        this.states[FighterState.JUMP_BACKWARD].validFrom = [...this.states[FighterState.JUMP_BACKWARD].validFrom, FighterState.HEADBUTT_UP];
        this.states[FighterState.JUMP_FORWARD].validFrom = [...this.states[FighterState.JUMP_FORWARD].validFrom, FighterState.HEADBUTT_UP];
        this.states[FighterState.KNOCKLIFT].validFrom = [...this.states[FighterState.KNOCKLIFT].validFrom, FighterState.HEADBUTT_UP];
         //headbutt Down valid states
        this.states[FighterState.JUMP_BACKWARD].validFrom = [...this.states[FighterState.JUMP_BACKWARD].validFrom, FighterState.HEADBUTT_DOWN];
        this.states[FighterState.JUMP_FORWARD].validFrom = [...this.states[FighterState.JUMP_FORWARD].validFrom, FighterState.HEADBUTT_DOWN];
        this.states[FighterState.KNOCKLIFT].validFrom = [...this.states[FighterState.KNOCKLIFT].validFrom, FighterState.HEADBUTT_DOWN];
        
    }

    handleKnockLiftInit(time, _, strength, attackType, playerId) {
   
     playSound(this.knockliftSound);
        this.gravity = 1000;
    if (attackType === FighterAttackType.PUNCH) {
         playSound(this.knockliftdownSound);
         this.velocity.x = 150;
         this.velocity.y = -380;
        this.entityList.add(KnockLiftSplash, time, this.position.x, this.position.y - 50, this.playerId, 1, this.direction * -1);
    } else if (attackType === FighterAttackType.KICK) {
         playSound(this.knockliftSound);
          this.velocity.x = -100;
          this.velocity.y = -380;
        this.entityList.add(KnockLiftSplash, time, this.position.x, this.position.y + 50, this.playerId, -1, this.direction * -1);
        
    }
}


     handleKnockLiftState(){
      
        if (!this.isAnimationCompleted()) return;
        if(this.position.y >= STAGE_FLOOR)this.changeState(FighterState.IDLE);
    }

    handleHeadbuttInit(time) {
       console.log("HEADBUTT INIT");
        if(this.headbuttActivate){
            this.gravity = 1000;
             this.velocity.x = 0;
            this.changeState(FighterState.IDLE);
        } else {
             this.gravity = 0;
        this.velocity.y = 0;
        this.position.y -= 25;
        //this.position.x += 30*this.direction;
        playSound(this.headbuttDashSound);
        this.entityList.add(DashEffectSplash, time, this.position.x-30*this.direction, this.position.y-5, this.playerId, 1, this.direction * -1);
        this.handleMoveInit();
        }
       
    }

    handleHeadbuttUpInit(time) {
        console.log("HEADBUTT Up INIT");
        if(this.headbuttActivate){
            this.gravity = 1000;
             this.velocity.x = 0;
            this.changeState(FighterState.IDLE);
        } else {
             this.gravity = 0;
        this.velocity.y = -300;
       
        playSound(this.headbuttDashSound);
        this.entityList.add(DashEffectSplash, time, this.position.x-30*this.direction, this.position.y-5, this.playerId, 1, this.direction * -1);
        this.handleMoveInit();
        }
       
    }
    handleHeadbuttDownInit(time) {
        console.log("HEADBUTT Down INIT");
        if(this.headbuttActivate){
            this.gravity = 1000;
             this.velocity.x = 0;
            this.changeState(FighterState.IDLE);
        } else {
             this.gravity = 0;
        this.velocity.y = 400;
       
        playSound(this.headbuttDashSound);
        this.entityList.add(DashEffectSplash, time, this.position.x-30*this.direction, this.position.y-5, this.playerId, 1, this.direction * -1);
        this.handleMoveInit();
        }
       
    }

     handleIdleInit(){
            this.resetVelocities();
            this.gravity = 1000;
            this.attackStruck = false;
            if(this.position.y >= STAGE_FLOOR)this.headbuttActivate = false;
        }


    handleHeadbuttState(time, context, camera){
        let isTouchingCamera;

        if (this.direction === -1) {
            isTouchingCamera =
                this.position.x-5 < camera.position.x + this.boxes.push.width;
        } else {
            isTouchingCamera =
               this.position.x+5 > camera.position.x + context.canvas.width - this.boxes.push.width
        }


       
 
        if(this.headbuttActivate){
            this.gravity = 1000;
             this.velocity.x = 0;
            this.changeState(FighterState.JUMP_FORWARD);
        } 
       
        const headbuttHit = this.checkHeadbuttHit(camera, context);
        
        if(headbuttHit || this.attackStruck || isTouchingCamera || this.isAnimationCompleted()) {
            if(isTouchingCamera){
             this.entityList.add(GreenHitSplash, time, this.position.x+30*this.direction, this.position.y - 30, this.playerId, 1, this.direction * -1);
             playSound(this.headbuttSound);
        }
           this.headbuttActivate = true;
           this.gravity = 1000;
           
           
             if (control.isBackward(this.playerId, this.direction)) this.changeState(FighterState.JUMP_BACKWARD);
              else  this.changeState(FighterState.JUMP_FORWARD);
        }
    
    }

    handleHeadbuttUpState(time, context, camera){
        console.log("HEADBUTT up STATE");
    let isTouchingCamera;

        if (this.direction === -1) {
            isTouchingCamera =
                this.position.x-5 < camera.position.x + this.boxes.push.width;
        } else {
            isTouchingCamera =
               this.position.x+5 > camera.position.x + context.canvas.width - this.boxes.push.width
        }
 
        if(this.headbuttActivate){
            this.gravity = 1000;
             this.velocity.x = 0;
            this.changeState(FighterState.JUMP_FORWARD);
        } 
       
        const headbuttHit = this.checkHeadbuttHit(camera, context);
        
        if(headbuttHit || this.attackStruck || isTouchingCamera || this.isAnimationCompleted()) {
            if(isTouchingCamera){
             this.entityList.add(GreenHitSplash, time, this.position.x+30*this.direction, this.position.y - 30, this.playerId, 1, this.direction * -1);
             playSound(this.headbuttSound);
        }
           this.headbuttActivate = true;
           this.gravity = 1000;
           
           
             if (control.isBackward(this.playerId, this.direction)) this.changeState(FighterState.JUMP_BACKWARD);
              else  this.changeState(FighterState.JUMP_FORWARD);
        }
    
    }
    handleHeadbuttDownState(time, context, camera){
       console.log("HEADBUTT DOWN STATE");
     let isTouchingCamera;

        if (this.direction === -1) {
            isTouchingCamera =
                this.position.x-5 < camera.position.x + this.boxes.push.width;
        } else {
            isTouchingCamera =
               this.position.x+5 > camera.position.x + context.canvas.width - this.boxes.push.width
        }
 
        if(this.headbuttActivate){
            this.gravity = 1000;
             this.velocity.x = 0;
            this.changeState(FighterState.JUMP_FORWARD);
        } 
       
        const headbuttHit = this.checkHeadbuttHit(camera, context);
        
        if(headbuttHit || this.attackStruck || isTouchingCamera || this.position.y >= STAGE_FLOOR || this.isAnimationCompleted()) {
            if(isTouchingCamera || this.position.y >= STAGE_FLOOR){
             this.entityList.add(GreenHitSplash, time, this.position.x+30*this.direction, this.position.y - 30, this.playerId, 1, this.direction * -1);
             playSound(this.headbuttSound);
        }
           this.headbuttActivate = true;
           this.gravity = 1000;
           
           
             if (control.isBackward(this.playerId, this.direction)) this.changeState(FighterState.JUMP_BACKWARD);
              else  this.changeState(FighterState.JUMP_FORWARD);
        }
    
    }

    checkHeadbuttHit(camera, context) {
           // Check if touching camera directly instead of using this.touchingCamera
        if (!this.boxes?.hit || !this.opponent?.boxes?.hurt) return false;
        
        const actualHitBox = getActualBoxDimensions(this.position, this.direction, this.boxes.hit);
        if (!actualHitBox || actualHitBox.width <= 0 || actualHitBox.height <= 0) return false;
        
        for (const [hurtLocation, hurtBox] of Object.entries(this.opponent.boxes.hurt)) {
            const [x, y, width, height] = hurtBox;
            const actualOpponentHurtBox = getActualBoxDimensions(
                this.opponent.position, this.opponent.direction, {x, y, width, height}
            );
            if (!actualOpponentHurtBox || actualOpponentHurtBox.width <= 0 || actualOpponentHurtBox.height <= 0) continue;
            
            if (boxOverlap(actualHitBox, actualOpponentHurtBox)) {
                
                return true;
            }
        }
        return false;
    }

    handleDodgeForwardInit(distance, playerId){
        distance = 100;
        this.gravity = 1000;
        this.position.x -= distance;

       // gameState.fighters[this.playerId].sprite += 1;

        playSound(this.soundTeleport);
        this.handleMoveInit();
    }

     handleDodgeBackwardInit(distance, playerId){
        distance = 100;
        this.gravity = 1000;
        this.position.x += distance;

      //  gameState.fighters[this.playerId].sprite += 1;
 
        playSound(this.soundTeleport);
        this.handleMoveInit();
    }

     handleDodgeState(){
       
        if (!this.isAnimationCompleted()) return;
        this.changeState(FighterState.IDLE);
    }

    
  // Hyper Skill 1 - Ultimate Blast
  handleHyperSkill1Init(_, strength) {
    const fighter = gameState.fighters[this.playerId];
    
    // ✅ Ensure enough skill points & prevent double use
    if (fighter.skillNumber < 3 || fighter.skillUsedThisFrame) return;
    fighter.skillConsumed = false;
    fighter.skillUsedThisFrame = true; // guard
    fighter.skillNumber -= 3; // 🛡️ immediately spend skill
    fighter.resetSkillBar = true;

   // this.voiceHyperSkill1.play();
    playSound(this.voiceHyperSkill1, 1);
    this.fireball = { fired: false, strength };
    this.soundSuperLaunch.play();

    fighter.superAcivated = true;
    gameState.pauseTimer = 1;
    gameState.pauseFrameMove = -100;
    gameState.pause = true;
    gameState.hyperSkill = true;
    fighter.hyperSprite += 1;

    console.log('🔥 Hyper Skill 1 initiated — skill points spent immediately');
  }

  handleHyperSkill1State() {
    const frameActivation = 130;
    const fighter = gameState.fighters[this.playerId];

    if (fighter.skillNumber >= 0 && !fighter.skillConsumed) {
      this.gravity = 0;
      this.velocity.y = 0;
     // this.opponent.velocity.y = 0;
      this.position.y -= 0.8;
      this.changeState(FighterState.HYPERSKILL_1);

      if (this.isHyperSkillEnabled(frameActivation)) {
        gameState.flash = true;
        console.log('⚡ Hyper Attack Activated!');
      }

      if (!this.isAnimationCompleted()) return;
      fighter.skillConsumed = true;
      // ✅ Reset guard and state after animation
      gameState.flash = false;
      fighter.superAcivated = false;
      fighter.skillUsedThisFrame = false;
      this.gravity = 1000;
    }else this.changeState(FighterState.IDLE);

    this.changeState(FighterState.JUMP_BACKWARD);
  }

  // ==============================
  // Hyper Skill 2 - Berserker Barrage
  // ==============================
  handleHyperSkill2Init(_, strength) {
    const fighter = gameState.fighters[this.playerId];
    
    if (fighter.skillNumber < 3 || fighter.skillUsedThisFrame) return;
    fighter.skillConsumed = false;
    fighter.skillUsedThisFrame = true;
    fighter.skillNumber -= 3;
    fighter.resetSkillBar = true;

    //this.voiceSpecial1.play();
    playSound(this.voiceSpecial1, 1);
    this.soundSuperLaunch.play();

    fighter.superAcivated = true;
    gameState.pauseTimer = 1;
    gameState.pauseFrameMove = -100;
    gameState.pause = true;
    gameState.hyperSkill = true;
    fighter.hyperSprite += 1;

    console.log('🔥 Hyper Skill 2 initiated — skill points spent immediately');
  }

  handleHyperSkill2State() {
    const frameActivation = 140;
    const frameDeactivation = 60;
    const fighter = gameState.fighters[this.playerId];

    if (fighter.skillNumber >= 0 && !fighter.skillConsumed) {
      if (!this.fireball.fired && this.animationFrame === 3) {
        this.fireball.fired = true;
        this.changeState(FighterState.HYPERSKILL_2);
      }

      if (this.isHyperSkillEnabled(frameActivation)) {
        this.velocity.x = 800;
        console.log('⚡ Berserker Barrage Activated!');
      } else if (this.isHyperSkillEnabled(frameDeactivation)) {
        this.velocity.x = 0;
        console.log('🛑 Berserker Barrage Deactivated!');
      }

      if (!this.isAnimationCompleted()) return;
      fighter.skillConsumed = true;
      // ✅ Reset guard and flags
      fighter.superAcivated = false;
      fighter.skillUsedThisFrame = false;
    }else this.changeState(FighterState.IDLE);

    this.changeState(FighterState.IDLE);
  }

  handleSpecial1Init(_, strength) {
    const fighter = gameState.fighters[this.playerId];
    this.gravity = 1000;
    if (fighter.skillNumber < 1 || fighter.skillUsedThisFrame) return;

    fighter.skillUsedThisFrame = true;
    fighter.skillConsumed = false;
    fighter.skillNumber -= 1; // 🛡️ spend skill immediately

    if (fighter.skillNumber === 2) fighter.resetSkillBar = true;

  //  this.voiceSpecial3.play();
    playSound(this.voiceSpecial3,1);
    this.fireball = { fired: false, strength };
    this.soundSuperLaunch.play();

    fighter.superAcivated = true;
    gameState.pauseTimer = 1;
    gameState.pauseFrameMove = -100;
    gameState.pause = true;

   
    
    fighter.sprite += 1;

    console.log('🔥 Special 1 (Fireball) started — skill spent instantly');
  }

  handleSpecial1State(time) {
    const fighter = gameState.fighters[this.playerId];

    if (fighter.skillNumber >= 0 && !fighter.skillConsumed) {
      if (!this.fireball.fired && this.animationFrame === 3) {
        this.entityList.add.call(this.entityList, Fireball, time, this, this.fireball.strength);
        this.fireball.fired = true;
        console.log('🔥 Fireball launched!');
      }

      if (!this.isAnimationCompleted()) return;
        fighter.skillConsumed = true;
      fighter.superAcivated = false;
      fighter.skillUsedThisFrame = false; // reset guard
    }else this.changeState(FighterState.IDLE);

    this.changeState(FighterState.IDLE);
  }

  // ==============================
  // Special Skill 2 - Roll Attack
  // ==============================
  handleSpecial2Init(_, strength) {
    const fighter = gameState.fighters[this.playerId];
    this.gravity = 1000;
    if (fighter.skillNumber < 1 || fighter.skillUsedThisFrame) return;

    fighter.skillUsedThisFrame = true;
    fighter.skillConsumed = false;
    fighter.skillNumber -= 1;

    if (fighter.skillNumber === 2) fighter.resetSkillBar = true;

   // this.voiceSpecial2.play();
    playSound(this.voiceSpecial2,1);
    this.fireball = { fired: false, strength };
    this.soundSuperLaunch.play();

    fighter.superAcivated = true;
    gameState.pauseTimer = 1;
    gameState.pauseFrameMove = -100;
    gameState.pause = true;

    this.velocity.x = +300;
    this.velocity.y = -100;
    fighter.sprite += 1;

    console.log('🔥 Special 2 (Roll Attack) started — skill spent instantly');
  }

  handleSpecial2State(time) {
    const fighter = gameState.fighters[this.playerId];

    if (fighter.skillNumber >= 0 && !fighter.skillConsumed) {
      if (!this.fireball.fired && this.animationFrame === 3) {
        this.fireball.fired = true;
        this.changeState(FighterState.SPECIAL_2);
        console.log('⚡ Rolling Attack in motion');
      }

      if (!this.isAnimationCompleted()) return;
      fighter.skillConsumed = true;
      fighter.superAcivated = false;
      fighter.skillUsedThisFrame = false;
       this.changeState(FighterState.HEAVY_PUNCH);
    }else this.changeState(FighterState.IDLE);

    this.changeState(FighterState.HEAVY_PUNCH);
  }

  // ==============================
  // Fireball Spawn (unchanged)
  // ==============================
  spawnFireball(time) {
    if (!this.position || !this.entityList) {
      console.warn("⚠️ Missing position or entityList in spawnFireball");
      return;
    }

    if (!this.fireball.fired && this.canFireball(time)) {
      const strength = Control.HEAVY_PUNCH;
      this.entityList.add(Fireball, [this, strength], time, this.entityList);
      this.fireball.fired = true;
      this.fireball.lastFired = time.now || performance.now();
      console.log("🔥 Fireball launched by AI");
    }
  }
}
