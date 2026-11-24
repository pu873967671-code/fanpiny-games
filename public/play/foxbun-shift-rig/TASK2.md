# TASK2: Foxbun Shift -> 3-zone Ori-like metroidvania slice (Game Off 2026, theme SHIFT)

Keep vanilla JS canvas, 480x270 internal, integer scaling, imageSmoothingEnabled=false, no libraries, works on desktop + touch. Keep the existing GEAR SHIFT mechanic (Gear 1/2 moves gear platforms, wind on/off, shutters) — it is the jam theme and must stay central. Keep bilingual UI (zh/en). Draw ONLY with provided assets (do not draw characters/monsters with canvas shapes); simple rect fallbacks only for debug.

## New hero (replace old hero.png)
assets/hero/hero_XX.png (transparent, pixel art, facing RIGHT; flip for left). Anchor by bottom-center of opaque pixels:
- 00 idle, 01-04 run cycle (8-10 fps), 05 jump (rising), 06 fall, 07 wall cling (frame includes a small wall stub on its right side — draw it flush against the wall), 08 dash, 09 ear-rotor fly (ears twisted into a shaft, spinning; add a 2-frame shimmer by alternating flipX of only nothing—just bob 1px).
Collision box stays small (~14x30). Sprite may be larger than hitbox.

## Movement feel (study Celeste/Ori; implement properly)
Fixed 60Hz step with accumulator. Coyote time 0.1s, jump buffer 0.12s, variable jump height (jump cut), apex hang (lower gravity near apex while jump held), asymmetric gravity (heavier fall), max fall speed, corner correction (nudge 3px around ledge corners when jumping), squash/stretch on land/jump, dust particles, small screen shake, 40ms hitstop on hits.

## Abilities = keys (Ori-style progression; each picked up as a glowing orb with a short bilingual tip, taught in a safe spot, then combined)
1. EAR ROTOR (start with it): hold jump in air -> slow fall/hover; inside updraft -> rise (existing wind).
2. WALL CLING + WALL JUMP (pickup in zone 1 end): slide slowly on walls, jump off.
3. TAIL BOUNCE (Ori "Bash"-lite, pickup in zone 2): press X/J near an enemy or a bounce-bud in the air -> brief slow-mo aim (direction = held arrows, default up-away), launch the hero in that direction and knock the enemy the opposite way. Refreshes air dash.
4. DASH (pickup in zone 3 entrance): C/L, one air dash, 8-direction, refreshed on landing/wall/bounce, after-images.
Show acquired abilities as small icons in HUD.

## World: 3 connected zones, camera-follow, room-based (each room = a few screens), save points respawn, fall = respawn at last save (no game over)
- Zone 1 Gear Desert: the existing level (keep its art: bg_sky, ground_*, ledge_*, gear_platform, gate, wind, save, coins). Extend slightly: ends with Wall Cling pickup and a vertical shaft that needs it.
- Zone 2 Monster Planet: bg assets/bg/zone2_monster_planet.png (parallax far). Platforms: reuse ledge/ground sprites tinted via an offscreen-canvas colour multiply to teal/lavender. Enemies: mon_00 fire bird-ball (hops), mon_01 water snail (crawls, safe to bounce on), mon_02 leaf beetle (patrol), mon_03 spark bug (flies sine), mon_06 cloud puff (floats, ideal bash target over pits). Gear shift here flips which "jaw" platforms are open. Tail Bounce pickup mid-zone; a pit sequence chaining bounces off cloud puffs.
- Zone 3 Crystal Nest: bg assets/bg/zone3_nest.png; mon_04 ice mole, mon_05 crystal armadillo (rolls), mon_07 tin walker. Dash pickup at start; dash gaps + gear-shift crystal bridges. Ends in boss room (bg zone3_boss.png) vs boss_03 crystal nest mother: 3 phases; she is hurt only by tail-bouncing her own eggs/spark projectiles back into her (Ori Bash style) and by shifting gears to drop crystal stalactites. 3 hits per phase, telegraphed attacks, fair checkpoints. Win screen with time, coins, shifts.
- Backtracking reward: at least 3 secret coin caches in earlier zones reachable only with later abilities. Mini-map overlay (M key / touch button) showing visited rooms as cells.
- Contact with enemy: knockback + 1 of 5 hearts; hearts refill at save points.

## Level design rules
Every ability: teach safely -> test -> combine -> twist. Breathing room between challenges. Design jumps from movement constants; write a tiny reachability check in tools/check.js (node) that verifies key gaps are crossable only with the intended ability.

## Process
Work incrementally, keep game playable after each step, `node --check game.js`. Write PROGRESS.md section "## TASK2" with what is done / next, and commit with git after each logical part. If running out of time, prioritise: feel + new hero sprites -> zone 2 + bounce -> zone 3 + dash -> boss -> minimap.
