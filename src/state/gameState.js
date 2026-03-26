import { FighterId } from "../constants/fighter.js";
import { createDefaultFighterState } from "./fighterState.js";

export const gameState = {
    fighters: [
      null, 
      null
      //P1 Character
     //  createDefaultFighterState(FighterId.MALUPITON),
      //  createDefaultFighterState(FighterId.GOLEM),

      //P2 Character
      // createDefaultFighterState(FighterId.MALUPITON),
    //  createDefaultFighterState(FighterId.GOLEM),
    ],
    inputEnable: false,

    gameScene: 'prematch',
    gameStarted: false,
    gamePlayerWinned: 'P1',
    rounds: 0,
    pause: false,
    slowFX: 1,
    pauseTimer: 0,
    credits: 5,
    pauseFrameMove: -30,
    skillNumber: 1,
    fighterNotIdle: false,
    difficultyIndex: 1,
    difficulty: 'normal',
    buttonHold: false,
    stage: 'final',
    flash: false,
    characterSelectMode: true,
    hyperSkill: false,
    dodging: false,
    kapeCom: false,
    stageMusic: 'audio#stage-payatas',
    debug: {
      fighters: false,
      entities: false,
    },
    cameraShake: {
        enable: false,
        duration: 0,
        intensity: 0,
    },
    shadowInvert: true,
    // for Enemy AI
    bot: {
      player1: false,
      player2: false,
    },
    // Onscreen controls settings
    buttonTransparency: .75, // 0 to 1
    buttonSize: 1, // 0.5 to 2 (multiplier)
    //for Gamepad Switch Player
    gamepadSwitchPlayer: true,
    FpsCounterEnable: false,

    controlPositions: {
    joystick: { x: '15vw', y: '60vh' },

    // container (optional)
    buttonsP1: { x: '2.5vw', y: '65%' },

    BP1: { x: '65vw', y: '48vh' },  // Top
    DP1: { x: '72vw', y: '63vh' },  // Right
    AP1: { x: '58vw', y: '63vh' },  // Left
    CP1: { x: '65vw', y: '78vh' },  // Bottom

    start1: { x: '90vw', y: '50vh' },
    select1: { x: '90vw', y: '70vh' },

    //player2 placement button
    buttonsP2: { x: '95vw', y: '65%' },  // container
    BP2: { x: '65vw', y: '48vh' },  // Top
    DP2: { x: '72vw', y: '63vh' },  // Right
    AP2: { x: '58vw', y: '63vh' },  // Left
    CP2: { x: '65vw', y: '78vh' },  // Bottom
    start2: { x: '90vw', y: '50vh' },
    select2: { x: '90vw', y: '70vh' }
    },

    //for practice mode
    practiceMode: {
        enabled: false,
        infiniteHealth: false,
        infiniteSkill: false,
        infiniteTime: false,
    },
    pauseMenu: {
      show: false,
      showMoveList: false,
      selectedMenu: 'resume',
      confirmText: 'exit',
      confirmSelection: false,
      pauseGame: false,
      select: false,
      selectPosition:{
        x: 0,
        y: 0,
      }
    },
};