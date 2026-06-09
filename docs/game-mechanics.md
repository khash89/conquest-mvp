# Conquest MVP — Game Mechanics

## Units & Measurements

All gameplay values in `src/config.js` are expressed in **game units**, not pixels.

| Concept | Formula | Example |
|---|---|---|
| Size / distance | `1 unit = 16 px` (`UNIT = 16`) | player radius = 1 unit = 16 px |
| Speed | `units/sec × UNIT / 60 = px/frame` | 6.75 u/s → 1.8 px/frame at 60 fps |

Helper functions in config:
- `CONFIG.px(u)` — converts units → pixels (use for sizes and ranges)
- `CONFIG.spd(u)` — converts units/sec → px/frame (use for speeds)

The game loop runs at **60 fps** via `requestAnimationFrame`.

---

## Core Attribute System

Every character (player and enemies) has three core attribute blocks.

### body — Physical Capacity
What the character *is* physically. Raw biological limits.

| Attribute | Unit | Description |
|---|---|---|
| `hp` | points | Current / maximum health |
| `hpRegen` | points/frame | Passive health recovery |
| `stamina` | points | Current / maximum stamina pool |
| `maxStamina` | points | Stamina ceiling |
| `staminaRegen` | points/frame | Passive stamina recovery |
| `radiusHitBox` | units | Physical size (collision and rendering radius) |
| `speed` | units/sec | Maximum movement speed |
| `emptySpdMult` | 0–1 fraction | Speed multiplier when stamina is fully depleted |

### skill — Effectiveness with Body & Tools
How well the character applies their physical capacity. Technique, training, weapon mastery.

| Attribute | Unit | Description |
|---|---|---|
| `atk` | points | Base damage per hit |
| `atkRange` | units | Reach of an attack |
| `atkArc` | radians | Angular sweep of an attack (player: 60°, enemies: 360°) |
| `atkCd` | frames | Frames between allowed attacks |
| `detectionRange` | units | Physical perception radius (sight/hearing) |
| `defendDmgMult` | 0–1 fraction | Damage multiplier while blocking (lower = better defence) |
| `defendSpdMult` | 0–1 fraction | Speed multiplier while blocking |

Player-only skill attributes:
| Attribute | Description |
|---|---|
| `atkAnimDur` | Frames the attack arc is visible |
| `specRange` | Radius of the shockwave special |
| `specKnockback` | Distance enemies are thrown (units) |
| `specCd` | Cooldown frames for the special |
| `specHealPct` | Fraction of maxHp restored by special |
| `shieldEvery` | Every Nth hit absorbed triggers shield proc |
| `shieldHealPct` | Fraction of maxHp restored by shield proc |
| `buffDur` | Frames the damage buff lasts after proc |

### mind — Behaviour & Learning Capacity
How the character decides and adapts. Drives AI logic.

| Attribute | Unit | Description |
|---|---|---|
| `aggressionLevel` | 0–1 | Tendency to pursue; 1 = always chase, 0 = passive |
| `fleeThreshold` | 0–1 fraction | HP fraction below which the character disengages |

> **Player mind** is always `aggressionLevel: 1, fleeThreshold: 0` — behaviour is player-driven, not AI.

---

## Player Actions & Stamina

Stamina is a shared resource that gates all player actions. It regenerates passively each frame.

| Action | Key | Stamina Cost | Notes |
|---|---|---|---|
| Move | Arrow keys | 1 / frame | No cost when stamina is empty (but speed halved) |
| Attack | Z | 16 / use | 60° arc, 5-unit range, 0.5 s cooldown |
| Block | C (hold) | 8 / frame | Reduces incoming damage to 25%; slows movement |
| Special | X | 48 / use | Shockwave + knockback + 8% HP heal; 5 s cooldown |

**Stamina regen:** 0.5 / frame (30 / sec) — passive, always on.

### Testudo Guard (passive trait)
Every 5th hit absorbed triggers a shield proc:
- Restores 8% max HP
- Grants a 4-second damage buff (+15% atk)

---

## Enemies

| Enemy | HP | ATK | Speed | Radius | CD | Detection | Aggression | Flee |
|---|---|---|---|---|---|---|---|---|
| Goblin | 25 | 4 | 6 u/s | 0.625 u | 50 fr | 30 u | 0.9 | 15% HP |
| Orc | 65 | 8 | ~4 u/s | 0.9375 u | 70 fr | 22 u | 1.0 | never |
| Troll | 130 | 14 | ~2 u/s | 1.375 u | 90 fr | 15 u | 1.0 | never |

All enemies use melee contact attacks (atkRange = 0 — attack triggers when circles overlap).

### Wave System
- Waves spawn every `max(80, 240 − wave × 12)` frames, approaching 80-frame minimum.
- Each wave spawns `min(1 + floor(wave / 2), 5)` enemies.
- Wave 0–3: Goblins only. Wave 4+: Goblins and Orcs. Wave 8+: all three types.

---

## Collision System

Circle–circle collision is resolved every frame after all entities have moved:
1. For every alive enemy pair — push apart by half the overlap along the contact normal.
2. For every enemy vs. player — same push-apart.
3. Clamp all entities to screen bounds.

All bodies are circles defined by `radiusHitBox` (in pixels at runtime).

---

## Win / Lose Conditions

- **Win:** Survive 2 minutes (7,200 frames).
- **Lose:** Player HP reaches 0.
