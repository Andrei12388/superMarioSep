const code = {
    u: 'arrow-up',
    d: 'arrow-down',
    l: 'arrow-left',
    r: 'arrow-right',
    ul: 'arrow-upLeft',
    ur: 'arrow-upRight',
    dl: 'arrow-downLeft',
    dr: 'arrow-downRight',
    A: 'button-a',
    B: 'button-b',
    C: 'button-c',
    D: 'button-d',
    x: 'score- ',

    O: 'score-O',
    R: 'score-R',


}

export const MALUPITON = [
    { 
        name: 'SPECIAL MOVES',
        y: 7,
        inputs: [code.x], 
    },
    { 
        name: 'F.DASH',
        y: 7,
        inputs: [code.r, code.B, code.C,] 
    },
    { 
        name: 'B.DASH',
        y: 7,
        inputs: [code.l, code.B, code.C,] 
    },
    { 
        name: 'HEADBUTT',
        y: 7,
        inputs: [code.d, code.dr, code.r, code.B],
    },
     { 
        name: 'K.LIFTUP',
        y: 7,
        inputs: [code.d, code.dr, code.r, code.D],
    },
    { 
        name: 'K.LIFTDOWN',
        y: 7,
        inputs: [code.d, code.dl, code.l, code.D],
    },
    { 
        name: 'SPECIAL SKILLS(1 S.POINT)',
        y: 13,
        inputs: [code.x], 
    },
    { 
        name: 'TAPOSKANA!',
        y: 15,
        inputs: [code.d, code.dr, code.r, code.A,code.B], 
    },
    { 
        name: 'SUNTUKANNA!',
        y: 15,
        inputs: [code.l,code.dl,code.d,code.dr,code.r, code.B,code.D], 
    },
     { 
        name: 'HYPER SKILLS(3 S.POINT)',
        y: 21,
        inputs: [code.x], 
    },
    { 
        name: 'WESHEWISHA!',
        y: 23,
        inputs: [code.r, code.dr, code.d, code.dl, code.l, code.A,code.C],
    },
    { 
        name: 'PATULANKITA!',
        y: 23,
        inputs: [code.d, code.u, code.A,code.D],
    },
];

export const GOLEM = [
   { 
        name: 'SPECIAL MOVES',
        y: 7,
        inputs: [code.x], 
    },
    { 
        name: 'F.DASH',
        y: 7,
        inputs: [code.r, code.B, code.C,] 
    },
    { 
        name: 'B.DASH',
        y: 7,
        inputs: [code.l, code.B, code.C,] 
    },
     { 
        name: 'KNEEDASH.L',
        y: 7,
        inputs: [code.d, code.dr, code.r, code.C],
    },
    { 
        name: 'KNEEDASH.H',
        y: 7,
        inputs: [code.d, code.dr, code.r, code.D],
    },
    { 
        name: 'TORNADO.D',
        y: 7,
        inputs: [code.d, code.dr, code.r, code.B],
    },
    { 
        name: 'SPECIAL SKILLS(1 S.POINT)',
        y: 13,
        inputs: [code.x], 
    },
    { 
        name: 'BUONGDAIGDIG!',
        y: 15,
        inputs: [code.d, code.dr, code.r, code.A,code.B], 
    },
    { 
        name: 'BAGSAKAN!',
        y: 15,
        inputs: [code.l,code.r,code.l,code.r, code.A,code.D], 
    },
     { 
        name: 'HYPER SKILLS(3 S.POINT)',
        y: 21,
        inputs: [code.x], 
    },
    { 
        name: 'NABIBIGATAN!',
        y: 23,
        inputs: [code.d, code.u, code.A,code.D],
    },
    { 
        name: 'TORNADOSPIN!',
        y: 23,
        inputs: [code.d,code.dr, code.r, code.ur, code.u,code.ul, code.l],
    },
];