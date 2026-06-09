const UNIT = 16; // pixels per game unit  (1 unit = player radius = 16 px)

function px(u)  { return u * UNIT; }      // units  → pixels
function spd(u) { return u * UNIT / 60; } // units/sec → px/frame

const CONFIG = {
  unit: UNIT,
  px, spd,

  characters: {

    player: {
      body: {
        hp:           130,
        hpRegen:      0,      // per frame
        stamina:      512,
        maxStamina:   512,
        staminaRegen: 0.5,    // per frame
        radiusHitBox: 1,      // units (= 16 px)
        speed:        6.75,   // units/sec (= 1.8 px/frame)
        emptySpdMult: 0.5,    // speed fraction when stamina is depleted
      },
      skill: {
        atk:             13,
        atkRange:        5,            // units (= 80 px)
        atkArc:          Math.PI / 3,  // radians (60°)
        atkCd:           30,           // frames
        atkAnimDur:      12,           // frames
        specRange:       6.875,        // units (= 110 px)
        specKnockback:   5.625,        // units (= 90 px)
        specCd:          300,          // frames (5 s)
        specHealPct:     0.08,         // fraction of maxHp
        buffDur:         240,          // frames (4 s)
        shieldEvery:     5,            // hits before proc
        shieldHealPct:   0.08,
        defendDmgMult:   0.25,         // damage taken while blocking
        defendSpdMult:   0.45,         // speed while blocking
        detectionRange:  0,            // units (0 = omniscient / player-controlled)
      },
      mind: {
        aggressionLevel: 1,     // 0–1  (player is fully intentional)
        fleeThreshold:   0,     // HP fraction to disengage (0 = never)
      },
    },

    goblin: {
      body: {
        hp:           25,
        hpRegen:      0,
        stamina:      0,
        maxStamina:   0,
        staminaRegen: 0,
        radiusHitBox: 0.625,  // units (= 10 px)
        speed:        6,      // units/sec (= 1.6 px/frame)
      },
      skill: {
        atk:            4,
        atkRange:       0,            // units (melee contact)
        atkArc:         Math.PI * 2,  // 360°
        atkCd:          50,           // frames
        detectionRange: 30,           // units — fast and alert
      },
      mind: {
        aggressionLevel: 0.9,   // eager but not suicidal
        fleeThreshold:   0.15,  // flees below 15% HP
      },
      color: '#3a8a3a',
      name:  'Goblin',
    },

    orc: {
      body: {
        hp:           65,
        hpRegen:      0,
        stamina:      0,
        maxStamina:   0,
        staminaRegen: 0,
        radiusHitBox: 0.9375,  // units (= 15 px)
        speed:        3.9375,  // units/sec (= 1.05 px/frame)
      },
      skill: {
        atk:            8,
        atkRange:       0,
        atkArc:         Math.PI * 2,
        atkCd:          70,
        detectionRange: 22,           // units — average awareness
      },
      mind: {
        aggressionLevel: 1.0,   // relentless
        fleeThreshold:   0,     // never flees
      },
      color: '#b06818',
      name:  'Orc',
    },

    troll: {
      body: {
        hp:           130,
        hpRegen:      0,
        stamina:      0,
        maxStamina:   0,
        staminaRegen: 0,
        radiusHitBox: 1.375,   // units (= 22 px)
        speed:        2.0625,  // units/sec (= 0.55 px/frame)
      },
      skill: {
        atk:            14,
        atkRange:       0,
        atkArc:         Math.PI * 2,
        atkCd:          90,
        detectionRange: 15,           // units — sluggish, short-sighted
      },
      mind: {
        aggressionLevel: 1.0,   // unstoppable once engaged
        fleeThreshold:   0,     // never flees
      },
      color: '#706048',
      name:  'Troll',
    },

  },

  // Player stamina costs per action
  staminaCosts: {
    move:    1,   // per frame while moving
    defend:  8,   // per frame while blocking
    attack:  16,  // per use
    special: 48,  // per use
  },

  waves: {
    duration:       120 * 60,  // frames (2 min)
    spawnStart:     90,        // frames before first wave
    spawnDecayBase: 240,       // interval = max(spawnMin, spawnDecayBase - wave*spawnDecay)
    spawnDecay:     12,        // frames removed per wave
    spawnMin:       80,        // minimum interval (frames)
    maxBatch:       5,         // enemies per spawn event
  },
};
