"use strict";

const WIDTH = 480;
const HEIGHT = 270;
const UI_FONT = '"Desert UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans CJK SC", "Noto Sans SC", sans-serif';
const STEP = 1 / 60;
const GROUND_Y = 230;
const FALL_Y = 300;
const START_X = 108;
const MAX_HEARTS = 5;
const HURT_TIME = 0.75;
const HITSTOP = 0.04;
const HERO_WIDTH = 14;
const HERO_HEIGHT = 30;
const HERO_SCALE = 0.85;
const RISE_GRAVITY = 820;
const FALL_GRAVITY = 1120;
const APEX_GRAVITY = 400;
const APEX_SPEED = 46;
const MAX_FALL = 300;
const JUMP_SPEED = -330;
const JUMP_CUT = 0.45;
const RUN_SPEED = 120;
const ACCELERATION = 1200;
const DECELERATION = 1500;
const COYOTE_TIME = 0.1;
const JUMP_BUFFER = 0.12;
const CORNER_CORRECTION = 3;
const WALL_SLIDE = 46;
const WALL_KICK = 174;
const WALL_KICK_TIME = 0.12;
const BOUNCE_RADIUS = 53;
const BOUNCE_AIM_TIME = 0.24;
const BOUNCE_SPEED = 280;
const BOUNCE_TIME = 0.30;
const DASH_SPEED = 430;
const DASH_TIME = 0.18;
const GLIDE_FALL = 38;
const WIND_LIFT = 900;
const WIND_RISE = 120;
const WIND_FALL = 105;
const WIND_SCROLL = 40;
const CAMERA_LERP = 0.12;
const LOOK_AHEAD = 40;
const BOB_AMPLITUDE = 14;
const BOB_RATE = 2.1;
const FAR_ORIGIN = -75;
const NEAR_DUNES_Y = 208;
const COMPLETION_DELAY = 0.5;

const WIND = { x: 1260, y: 40, width: 70 };
const GATE_X = 40;
const HALF_HERO = HERO_WIDTH / 2;

const GROUND_RUNS = [
  groundRun(-44, 5), groundRun(560, 1), groundRun(800, 1), groundRun(1700, 9),
];

const LEDGES = [
  ledge(212, 176), ledge(264, 121), ledge(334, 31),
  ledge(600, 184), ledge(641, 68),
  ledge(846, 204, "ledge_s"), ledge(946, 183),
  ledge(2470, 180), ledge(2525, 123), ledge(2472, 73),
];

const GEARS = [
  { x: 1114, baseY: 190, phase: 0.4, shiftX: 0, shiftY: 155 },
  { x: 1420, baseY: 170, phase: 2.5, shiftX: -70, shiftY: 125 },
  { x: 1560, baseY: 200, phase: 4.4, shiftX: -10, shiftY: 95 },
].map(gear => ledge(gear.x, 0, "gear_platform", { ...gear, baseX: gear.x, previousY: 0, previousX: gear.x }));

// Opposing shutters make both gear changes part of the route.
const SHUTTERS = [
  { x: 1378, width: 24, closedGear: 1 },
  { x: 1810, width: 24, closedGear: 2 },
];
const TUFTS = [
  [20, 3], [180, 2], [331, 1],
  [599, 2], [719, 1], [811, 3], [884, 1],
  [1744, 2], [1848, 3], [2015, 1], [2192, 2],
];
const SPIRES = [
  [8, 229], [287, 230], [463, 232], [631, 231], [779, 231], [928, 231],
  [1788, 233], [1994, 232], [2179, 230],
];

const COIN_POSITIONS = [
  [349, 18], [364, 15], [380, 18], [395, 18],
  [655, 54], [672, 50], [687, 51], [702, 54],
  [524, 174], [544, 156], [567, 173],
  [769, 174], [793, 158], [833, 179],
  [995, 145], [1052, 128], [1128, 153], [1190, 145],
  [1290, 128], [1304, 94], [1311, 61],
  [1366, 62], [1380, 89], [1555, 58],
  [1602, 156], [1665, 137], [1725, 151],
];
const rooms = createRooms({
  id: "desert", zone: 1, name: "齿轮沙漠 / Gear Desert", width: 2600, wind: WIND,
  runs: GROUND_RUNS, ledges: LEDGES, gears: GEARS, shutters: SHUTTERS,
  solids: [shell(2268, 99, 170), shell(2390, 49, GROUND_Y)],
  pickups: [{ ability: "wall", x: 2180, y: 202 }],
  enemies: [enemy("bud", 643, 146)],
  saves: [{ x: 923, y: 230 }, { x: 1973, y: 230 }, { x: 2180, y: 230 }],
  coins: coinsAt(COIN_POSITIONS),
});

const ASSET_NAMES = [
  "bg_far", "bg_sky", "ground_left", "ground_mid", "ground_right",
  "ledge_s", "ledge_m", "gear_platform", "tuft1", "tuft2", "tuft3",
  "spire", "coin1", "coin2", "coin3", "gate", "shell_wall", "save", "wind",
];
const HERO_FRAMES = [...Array.from({ length: 10 }, (_, frame) => `hero/hero_0${frame}`),
  ...Array.from({ length: 4 }, (_, frame) => `hero/rotor_${frame}`)];
ASSET_NAMES.push(...HERO_FRAMES, ...ROOM_ART);

const KEY_ACTIONS = {
  ArrowLeft: "left", KeyA: "left", ArrowRight: "right", KeyD: "right",
  Space: "jump", ArrowUp: "up", ArrowDown: "down", KeyW: "up", KeyS: "down", KeyZ: "jump",
  ShiftLeft: "shift", ShiftRight: "shift", KeyK: "shift", KeyX: "bounce", KeyJ: "bounce",
  KeyC: "dash", KeyL: "dash",
  KeyM: "map",
};

const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d", { alpha: false });
ctx.imageSmoothingEnabled = false;
const viewport = document.querySelector("#viewport");
const scene = document.querySelector("#scene");
const titleScreen = document.querySelector("#title-screen");
const controls = document.querySelector("#touch-controls");
const touchButtons = [...controls.querySelectorAll("button")];
const completion = document.querySelector("#completion");
const replay = document.querySelector("#replay");
const moveHint = document.querySelector("#move-hint");
const glideHint = document.querySelector("#glide-hint");
const shiftHint = document.querySelector("#shift-hint");
const abilityHint = document.querySelector("#ability-hint");
const roomHint = document.querySelector("#room-hint");
const mapOverlay = document.querySelector("#map-overlay");
const mapRooms = document.querySelector("#map-rooms");
const mapClose = document.querySelector("#map-close");

const art = {};
const spriteBounds = {};
const tintedArt = {};
const keys = new Set();
const pointers = new Map();
const touchDevice = navigator.maxTouchPoints > 0 || matchMedia("(pointer: coarse)").matches;
const hero = {};
const abilities = new Set();
const visited = new Set();
const particles = [];
const afterimages = [];
const coinCount = rooms.reduce((sum, room) => sum + room.coins.length, 0);

let mode = "loading";
let room = rooms[0];
let roomTime = 0;
let abilityTime = 0;
let mapOpen = false;
let startRequested = false;
let inputDevice = "";
let jumpPressed = false;
let jumpReleased = false;
let bouncePressed = false;
let bounceAim = null;
let dashPressed = false;
let worldTime = 0;
let gearMode = 1;
let gearBlend = 0;
let windAlpha = 1;
let shiftCooldown = 0;
let shiftCount = 0;
let shakeTime = 0;
let hitstopTime = 0;
let runTime = 0;
let cameraX = 0;
let hearts = MAX_HEARTS;
let collected = 0;
let checkpoint;
let startTravel = 0;
let finishedAt = 0;
let lastFrame;
let elapsed = 0;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const wrap = (value, size) => ((value % size) + size) % size;

function fit() {
  const fitScale = Math.min(viewport.clientWidth / WIDTH, viewport.clientHeight / HEIGHT);
  scene.style.setProperty("--scale", Math.floor(fitScale) || fitScale);
}

function loadImage(name) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      art[name] = image;
      resolve();
    };
    image.onerror = () => reject(new Error(`Unable to load assets/${name}.png`));
    image.src = `assets/${name}.png`;
  });
}

function actionHeld(action) {
  for (const code of keys) {
    const held = KEY_ACTIONS[code];
    if (held === action || (action === "jump" && held === "up" && !bounceAim)) return true;
  }
  for (const held of pointers.values()) {
    if (held === action) return true;
  }
  return false;
}

function updateJumpEdges(wasHeld) {
  const held = actionHeld("jump");
  if (held && !wasHeld) jumpPressed = true;
  if (!held && wasHeld) jumpReleased = true;
}

function refreshControls() {
  controls.hidden = mode !== "playing" || mapOpen || !touchDevice || inputDevice === "keyboard";
  for (const button of touchButtons) {
    const pressed = [...pointers.values()].includes(button.dataset.action);
    button.classList.toggle("pressed", pressed);
    if (button.dataset.action === "bounce") button.hidden = !abilities.has("bounce");
    if (button.dataset.action === "dash") button.hidden = !abilities.has("dash");
    if (["up", "down"].includes(button.dataset.action)) {
      button.hidden = !abilities.has("bounce") && !abilities.has("dash");
    }
  }
}

function pressAction(action) {
  if (mode !== "playing") return;
  if (action === "shift") shiftGears();
  if (action === "bounce") bouncePressed = true;
  if (action === "dash") dashPressed = true;
  if (action === "map") toggleMap();
}

function toggleMap() {
  if (mode !== "playing") return;
  mapOpen = !mapOpen;
  mapOverlay.hidden = !mapOpen;
  clearInput();
  if (!mapOpen) return;

  const cells = rooms.map(area => {
    const cell = document.createElement("li");
    cell.className = "map-room";
    if (!visited.has(area)) {
      cell.dataset.unvisited = "";
      cell.setAttribute("aria-label", "未探索 / Unvisited");
      cell.textContent = "?";
      return cell;
    }
    for (const name of area.name.split(" / ")) {
      const label = document.createElement("span");
      label.textContent = name;
      cell.append(label);
    }
    if (area === room) {
      cell.dataset.current = "";
      cell.setAttribute("aria-current", "location");
    }
    if (area === checkpoint.room) {
      cell.dataset.save = "";
      cell.setAttribute("aria-label", `${area.name} · 存档 / Checkpoint`);
    }
    return cell;
  });
  mapRooms.replaceChildren(...cells);
  mapClose.focus({ preventScroll: true });
}

function clearInput() {
  const wasHeld = actionHeld("jump");
  keys.clear();
  pointers.clear();
  jumpPressed = false;
  bouncePressed = false;
  dashPressed = false;
  updateJumpEdges(wasHeld);
  refreshControls();
}

function requestStart() {
  if (mode === "loading") startRequested = true;
  if (mode === "title") begin();
}

window.addEventListener("keydown", event => {
  if (mode === "complete" || event.metaKey || event.ctrlKey || event.altKey) return;
  const action = KEY_ACTIONS[event.code];
  if (mapOpen) {
    if (action === "map" || event.code === "Escape") {
      event.preventDefault();
      if (!event.repeat) toggleMap();
    }
    return;
  }
  if (action) event.preventDefault();
  if (event.repeat) return;
  if (!inputDevice || action) inputDevice = "keyboard";
  const wasHeld = actionHeld("jump");
  if (action) {
    pointers.clear();
    keys.add(event.code);
    pressAction(action);
  }
  updateJumpEdges(wasHeld);
  requestStart();
  refreshControls();
});

window.addEventListener("keyup", event => {
  if (!KEY_ACTIONS[event.code]) return;
  if (mode === "playing") event.preventDefault();
  const wasHeld = actionHeld("jump");
  keys.delete(event.code);
  updateJumpEdges(wasHeld);
});

window.addEventListener("pointerdown", event => {
  if (mode === "playing" && touchDevice && event.pointerType === "touch") {
    inputDevice = "touch";
    refreshControls();
  }
  if (mode !== "loading" && mode !== "title") return;
  if (event.pointerType !== "mouse") inputDevice = "touch";
  requestStart();
});

document.querySelector("#start").addEventListener("click", requestStart);
replay.addEventListener("click", begin);
mapClose.addEventListener("click", toggleMap);

for (const button of touchButtons) {
  button.addEventListener("pointerdown", event => {
    if (mode !== "playing" || event.pointerType === "mouse") return;
    event.preventDefault();
    const wasHeld = actionHeld("jump");
    inputDevice = "touch";
    if (button.dataset.action === "map") {
      toggleMap();
      return;
    }
    pointers.set(event.pointerId, button.dataset.action);
    pressAction(button.dataset.action);
    button.setPointerCapture(event.pointerId);
    updateJumpEdges(wasHeld);
    refreshControls();
  });
  button.addEventListener("lostpointercapture", releasePointer);
}

function releasePointer(event) {
  if (!pointers.has(event.pointerId)) return;
  const wasHeld = actionHeld("jump");
  pointers.delete(event.pointerId);
  updateJumpEdges(wasHeld);
  refreshControls();
}

window.addEventListener("pointerup", releasePointer);
window.addEventListener("pointercancel", releasePointer);
window.addEventListener("blur", clearInput);
window.addEventListener("resize", fit);
window.visualViewport?.addEventListener("resize", fit);
document.addEventListener("visibilitychange", () => {
  if (document.hidden) clearInput();
});
document.addEventListener("gesturestart", event => event.preventDefault(), { passive: false });

function placeHero(x, ground, hurt = 0) {
  Object.assign(hero, {
    x, y: ground.y, vx: 0, vy: 0, facing: 1, ground,
    coyote: 0, buffer: 0, glide: false, windGlide: false, cuttable: false,
    hurt, wall: 0, wallSide: 0, wallTime: 0, kick: 0, bounce: 0, recoil: 0,
    dash: 0, dashReady: true,
    pose: "idle", poseTime: 0, puffTime: 0, squash: 0,
  });
}

function shiftGears() {
  if (shiftCooldown > 0 || mode !== "playing") return;
  gearMode = gearMode === 1 ? 2 : 1;
  shiftCooldown = 0.25;
  shiftCount += 1;
  shakeTime = 0.18;
  for (const gear of [...room.gears, ...room.ledges.filter(ledge => ledge.activeGear)]) {
    burst(gear.x + 32, gear.y, "spark", 8);
  }
  // A shutter can close around the player. Move them to the nearest side.
  for (const shutter of room.shutters) {
    if (shutter.closedGear !== gearMode) continue;
    if (hero.x + HERO_WIDTH / 2 > shutter.x && hero.x - HERO_WIDTH / 2 < shutter.x + shutter.width) {
      hero.x = hero.x < shutter.x + shutter.width / 2
        ? shutter.x - HERO_WIDTH / 2 : shutter.x + shutter.width + HERO_WIDTH / 2;
      hero.vx = 0;
    }
  }
  if (room.boss) releaseBossCrystal(room.boss);
}

function moveGears(reset = false, dt = STEP) {
  const target = gearMode === 2 ? 1 : 0;
  gearBlend = reset ? target : clamp(gearBlend + Math.sign(target - gearBlend) * dt / 0.35, 0, 1);
  windAlpha = reset ? 1 - target : clamp(windAlpha + (gearMode === 1 ? 1 : -1) * dt / 0.35, 0, 1);
  const eased = gearBlend * gearBlend * (3 - 2 * gearBlend);
  for (const gear of room.gears) {
    const bobY = gear.baseY + BOB_AMPLITUDE * Math.sin(worldTime * BOB_RATE + gear.phase);
    const x = gear.baseX + gear.shiftX * eased;
    const y = bobY + (gear.shiftY - bobY) * eased;
    gear.previousX = reset ? x : gear.x;
    gear.previousY = reset ? y : gear.y;
    gear.x = x;
    gear.y = y;
    gear.left = x + 5;
    gear.right = x + 60;
  }
}

function cameraTarget() {
  return clamp(hero.x - WIDTH / 2 + LOOK_AHEAD * hero.facing, 0, room.width - WIDTH);
}

function groundAt(x, y = GROUND_Y) {
  return [...room.runs, ...room.ledges, ...room.solids].find(surface => surface.y === y && overlapsX(x, surface));
}

function enterRoom(destination, x, y = GROUND_Y, hurt = 0) {
  if (room !== destination && room.boss) resetBoss(room.boss, room.boss.retryPhase);
  room = destination;
  visited.add(room);
  roomTime = 2.6;
  roomHint.textContent = room.name;
  abilityTime = 0;
  bounceAim = null;
  bouncePressed = false;
  dashPressed = false;
  jumpPressed = false;
  jumpReleased = false;
  particles.length = 0;
  afterimages.length = 0;
  moveGears(true);
  placeHero(x, groundAt(x, y) ?? { y }, hurt);
  cameraX = cameraTarget();
}

function resetLevel() {
  worldTime = 0;
  runTime = 0;
  gearMode = 1;
  gearBlend = 0;
  shiftCooldown = 0;
  shiftCount = 0;
  shakeTime = 0;
  hitstopTime = 0;
  hearts = MAX_HEARTS;
  collected = 0;
  startTravel = 0;
  mapOpen = false;
  mapOverlay.hidden = true;
  abilities.clear();
  visited.clear();
  abilities.add("rotor");
  for (const area of rooms) {
    for (const coin of area.coins) coin.taken = false;
    area.enemies.forEach(resetEnemy);
    if (area.boss) resetBoss(area.boss);
  }
  checkpoint = { room: rooms[0], x: START_X, y: GROUND_Y, gear: 1 };
  enterRoom(rooms[0], START_X);
  roomTime = 0;
}

function begin() {
  if (mode === "complete") {
    clearInput();
    jumpReleased = false;
  }
  resetLevel();
  titleScreen.hidden = true;
  completion.hidden = true;
  mode = "playing";
  showTip(ABILITIES.rotor.tip, 4);
  refreshControls();
}

function loseHeart(sourceX) {
  if (hero.hurt > 0) return;
  hearts -= 1;
  hero.hurt = HURT_TIME;
  hero.ground = null;
  hero.vx = (Math.sign(hero.x - sourceX) || -hero.facing) * 168;
  hero.vy = -142;
  hero.recoil = 0.17;
  hero.kick = 0;
  hero.bounce = 0;
  hero.dash = 0;
  hero.cuttable = false;
  hitstopTime = HITSTOP;
  shakeTime = 0.16;
  burst(hero.x, hero.y - HERO_HEIGHT / 2, "spark", 8);
}

function respawn() {
  gearMode = checkpoint.gear;
  checkpoint.room.enemies.forEach(resetEnemy);
  if (checkpoint.room.boss) resetBoss(checkpoint.room.boss, checkpoint.room.boss.retryPhase);
  enterRoom(checkpoint.room, checkpoint.x, checkpoint.y, HURT_TIME);
  hearts = MAX_HEARTS;
}

function finish() {
  burst(hero.x, hero.y - 24, "spark", 22);
  mode = "complete";
  finishedAt = worldTime;
  clearInput();
  const minutes = Math.floor(runTime / 60);
  const seconds = String(Math.floor(runTime) % 60).padStart(2, "0");
  document.querySelector("#result").textContent = `时间 / Time ${minutes}:${seconds} · 金币 / Coins ${collected} / ${coinCount} · 换挡 / Shifts ${shiftCount}`;
}

function showResult() {
  completion.hidden = false;
  if (inputDevice === "keyboard") replay.focus({ preventScroll: true });
}

function emit(x, y, vx, vy, life, kind) {
  particles.push({ x, y, vx, vy, life, duration: life, kind });
}

function burst(x, y, kind, count) {
  for (let i = 0; i < count; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 14 + Math.random() * (kind === "spark" ? 72 : 30);
    const vy = kind === "spark" ? Math.sin(angle) * speed : -8 - Math.random() * 26;
    emit(x, y, Math.cos(angle) * speed, vy, 0.25 + Math.random() * 0.55, kind);
  }
}

function moveParticles(dt) {
  for (let i = particles.length - 1; i >= 0; i -= 1) {
    const p = particles[i];
    p.life -= dt;
    if (p.life <= 0) {
      particles.splice(i, 1);
      continue;
    }
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += (p.kind === "dust" ? 60 : 14) * dt;
  }
  for (let i = afterimages.length - 1; i >= 0; i -= 1) {
    afterimages[i].life -= dt;
    if (afterimages[i].life <= 0) afterimages.splice(i, 1);
  }
}

function activeSurface(surface) {
  return !surface.activeGear || surface.activeGear === gearMode;
}

function resetEnemy(enemy) {
  Object.assign(enemy, { x: enemy.homeX, y: enemy.homeY, dx: 0, dy: 0, vx: 0, vy: 0, bounceLock: 0, burrow: 0 });
}

function moveEnemies(dt) {
  for (const enemy of room.enemies) {
    const time = worldTime + enemy.homeX * 0.021;
    const gait = [3.1, 0.85, 1.65, 2.9, 1.8, 2.4, 1.3, 1.4][enemy.kind] ?? 2;
    const x = enemy.homeX + enemy.range * Math.sin(time * gait);
    let y = enemy.homeY;
    if (enemy.kind === 0) y -= Math.max(0, Math.sin(time * gait)) * 28;
    if (enemy.kind === 3) y += Math.sin(time * 3.4) * 19;
    if (enemy.kind === 4) enemy.burrow = Math.max(0, Math.sin(time * 2.25)) * 0.8;
    if (enemy.kind === 7) y -= Math.abs(Math.sin(time * 9)) * 3;
    if (enemy.kind === 6 || enemy.kind === "bud") y += Math.sin(time * 2.2) * 5;
    if (enemy.range > 10) enemy.facing = Math.cos(time * gait) > 0 ? 1 : -1;
    enemy.vx += (-14 * enemy.dx - 7 * enemy.vx) * dt;
    enemy.vy += (-14 * enemy.dy - 7 * enemy.vy) * dt;
    enemy.dx += enemy.vx * dt;
    enemy.dy += enemy.vy * dt;
    enemy.x = x + enemy.dx;
    enemy.y = Math.min(enemy.homeY + 24, y + enemy.dy);
    enemy.bounceLock = Math.max(0, enemy.bounceLock - dt);
  }
}

function targetY(target) {
  return target.y - (target.centerOffset ?? 16);
}

function inputDirection() {
  return {
    x: Number(actionHeld("right")) - Number(actionHeld("left")),
    y: Number(actionHeld("down")) - Number(actionHeld("up")),
  };
}

function aimDirection(target) {
  let { x, y } = inputDirection();
  if (!x && !y) {
    x = Math.sign(hero.x - target.x) * 0.65;
    y = -1;
  }
  const length = Math.hypot(x, y);
  return { x: x / length, y: y / length };
}

function bounceTargets() {
  return room.boss ? [...room.enemies, ...room.boss.shots.filter(shot => !shot.bounced)] : room.enemies;
}

function startBounce() {
  if (bounceAim || !bouncePressed || !abilities.has("bounce") || hero.ground || hero.recoil > 0) return;
  let nearest = BOUNCE_RADIUS;
  let target;
  for (const candidate of bounceTargets()) {
    if (candidate.bounceLock > 0 || candidate.burrow > 0.48) continue;
    const distance = Math.hypot(hero.x - candidate.x, hero.y - HERO_HEIGHT / 2 - targetY(candidate));
    if (distance < nearest) {
      nearest = distance;
      target = candidate;
    }
  }
  if (target) {
    bounceAim = { target, time: BOUNCE_AIM_TIME };
    bouncePressed = false;
  }
}

function updateBounceAim(dt) {
  const { target } = bounceAim;
  bounceAim.time -= dt;
  if (bounceAim.time > 0 && !bouncePressed) return;
  const direction = aimDirection(target);
  hero.vx = direction.x * BOUNCE_SPEED;
  hero.vy = direction.y * BOUNCE_SPEED;
  hero.facing = Math.sign(hero.vx) || hero.facing;
  hero.bounce = BOUNCE_TIME;
  hero.dash = 0;
  hero.dashReady = true;
  hero.kick = 0;
  hero.ground = null;
  hero.cuttable = false;
  hero.windGlide = false;
  const impulse = target.sprite ? BOUNCE_SPEED : 165;
  target.vx = -direction.x * impulse;
  target.vy = -direction.y * impulse;
  if (target.sprite) {
    target.bounced = true;
    target.life = 3;
  }
  target.bounceLock = 0.62;
  burst(target.x, targetY(target), "spark", 11);
  bounceAim = null;
  bouncePressed = false;
  jumpPressed = false;
  jumpReleased = false;
}

function startDash() {
  const pressed = dashPressed;
  dashPressed = false;
  if (!pressed || !abilities.has("dash") || !hero.dashReady || hero.ground || hero.recoil > 0) return;
  let { x, y } = inputDirection();
  if (!x && !y) x = hero.facing;
  const length = Math.hypot(x, y);
  hero.vx = DASH_SPEED * x / length;
  hero.vy = DASH_SPEED * y / length;
  hero.facing = Math.sign(hero.vx) || hero.facing;
  hero.dash = DASH_TIME;
  hero.dashReady = false;
  hero.bounce = 0;
  hero.kick = 0;
  hero.wallTime = 0;
  hero.coyote = 0;
  hero.buffer = 0;
  hero.cuttable = false;
  hero.windGlide = false;
  hero.glide = false;
  hero.squash = 0;
  burst(hero.x, hero.y - HERO_HEIGHT / 2, "glide", 6);
}

function checkEnemyContact(previousY) {
  for (const enemy of room.enemies) {
    if (enemy.kind === "bud" || enemy.bounceLock > 0 || enemy.burrow > 0.48) continue;
    if (Math.abs(hero.x - enemy.x) >= 17 || hero.y <= enemy.y - 25
      || hero.y - HERO_HEIGHT >= enemy.y - 4) continue;
    if (enemy.kind === 1 && hero.vy > 0 && previousY <= enemy.y - 22) {
      hero.vy = -210;
      hero.y = enemy.y - 25;
      hero.ground = null;
      burst(hero.x, hero.y, "dust", 4);
    } else {
      loseHeart(enemy.x);
    }
  }
}

function moveSideways(dt, direction) {
  const steering = hero.kick <= 0 && hero.bounce <= 0 && hero.recoil <= 0 && hero.dash <= 0;
  if (steering && direction) {
    hero.facing = direction;
    hero.vx = clamp(hero.vx + direction * ACCELERATION * dt, -RUN_SPEED, RUN_SPEED);
  } else if (steering) {
    hero.vx = Math.sign(hero.vx) * Math.max(0, Math.abs(hero.vx) - DECELERATION * dt);
  }

  const oldX = hero.x;
  hero.x = clamp(oldX + hero.vx * dt, HALF_HERO, room.width - HALF_HERO);
  hero.wall = 0;
  for (const shutter of room.shutters) {
    if (shutter.closedGear === gearMode) {
      hero.wall ||= collideSides(oldX, shutter.x, shutter.x + shutter.width);
    }
  }

  for (const solid of room.solids) {
    if (hero.y > solid.y && hero.y - HERO_HEIGHT < solid.bottom) {
      hero.wall ||= collideSides(oldX, solid.left, solid.right);
    }
  }

  if (hero.y > GROUND_Y && hero.y - HERO_HEIGHT < FALL_Y) {
    for (const run of room.runs) collideSides(oldX, run.left, run.right);
  }
  if (hero.wall && abilities.has("wall") && hero.kick <= 0) {
    hero.wallSide = hero.wall;
    hero.wallTime = COYOTE_TIME;
    hero.dashReady = true;
  } else {
    hero.wallTime = Math.max(0, hero.wallTime - dt);
  }
}

function collideSides(oldX, left, right) {
  if (oldX + HALF_HERO <= left && hero.x + HALF_HERO > left) {
    hero.x = left - HALF_HERO;
    hero.vx = 0;
    return 1;
  }
  if (oldX - HALF_HERO >= right && hero.x - HALF_HERO < right) {
    hero.x = right + HALF_HERO;
    hero.vx = 0;
    return -1;
  }
  return 0;
}

function overlapsX(x, surface) {
  return x + HALF_HERO > surface.left && x - HALF_HERO < surface.right;
}

function collideCeilings(oldY, nextY, solids) {
  const ceiling = solids.find(solid => oldY - HERO_HEIGHT >= solid.bottom
    && nextY - HERO_HEIGHT < solid.bottom && overlapsX(hero.x, solid));
  if (!ceiling) return nextY;
  for (let nudge = 1; nudge <= CORNER_CORRECTION; nudge += 1) {
    for (const sign of [hero.facing, -hero.facing]) {
      const x = hero.x + nudge * sign;
      if (x < HALF_HERO || x > room.width - HALF_HERO) continue;
      if (solids.some(solid => overlapsX(x, solid) && nextY > solid.y
        && nextY - HERO_HEIGHT < solid.bottom)) continue;
      hero.x = x;
      return nextY;
    }
  }
  hero.vy = 0;
  return ceiling.bottom + HERO_HEIGHT;
}

function jump() {
  hero.vy = JUMP_SPEED;
  hero.coyote = 0;
  hero.buffer = 0;
  hero.cuttable = true;
  hero.squash = -0.15;
  burst(hero.x, hero.y - 1, "dust", 4);
}

function moveVertically(dt, holdingJump) {
  const previousGround = hero.ground;
  const dashing = hero.dash > 0;
  hero.buffer = jumpPressed ? JUMP_BUFFER : Math.max(0, hero.buffer - dt);
  hero.coyote = previousGround ? COYOTE_TIME : Math.max(0, hero.coyote - dt);
  if (hero.buffer > 0 && hero.recoil <= 0 && !dashing) {
    if (hero.coyote > 0) {
      jump();
    } else if (hero.wallTime > 0) {
      jump();
      hero.vx = -hero.wallSide * WALL_KICK;
      hero.facing = -hero.wallSide;
      hero.kick = WALL_KICK_TIME;
      hero.wallTime = 0;
      hero.wall = 0;
    }
  }
  if (hero.cuttable && (jumpReleased || !holdingJump)) {
    if (hero.vy < 0) hero.vy *= JUMP_CUT;
    hero.cuttable = false;
  }
  jumpPressed = false;
  jumpReleased = false;

  const centerY = hero.y - HERO_HEIGHT / 2;
  const wind = room.wind;
  const rotorHeld = holdingJump && abilities.has("rotor");
  const insideWind = wind && gearMode === 1 && hero.x >= wind.x && hero.x < wind.x + wind.width
    && centerY >= wind.y && centerY < FALL_Y;
  hero.windGlide = !dashing && rotorHeld && insideWind && (hero.windGlide || hero.vy >= 0);
  if (hero.windGlide) {
    hero.vy = Math.max(hero.vy - WIND_LIFT * dt, -WIND_RISE);
    hero.cuttable = false;
  } else if (!dashing) {
    const gravity = holdingJump && Math.abs(hero.vy) < APEX_SPEED
      ? APEX_GRAVITY : hero.vy < 0 ? RISE_GRAVITY : FALL_GRAVITY;
    hero.vy = Math.min(MAX_FALL, hero.vy + gravity * dt * (hero.bounce > 0 ? 0.46 : 1));
    if (hero.vy >= 0) {
      hero.cuttable = false;
      if (hero.wall && abilities.has("wall")) hero.vy = Math.min(hero.vy, WALL_SLIDE);
      else if (rotorHeld && hero.bounce <= 0) hero.vy = Math.min(hero.vy, GLIDE_FALL);
      else if (insideWind) hero.vy = Math.min(hero.vy, WIND_FALL);
    }
  }

  // Rising platforms catch a hero whose body they would otherwise intersect.
  for (const gear of room.gears) {
    if (gear === previousGround) continue;
    if (overlapsX(hero.x, gear) && hero.y > gear.y && hero.y <= gear.previousY
      && hero.y - HERO_HEIGHT < gear.y + 16) {
      hero.y = gear.y;
      hero.vy = Math.min(0, hero.vy);
      hero.ground = gear;
    }
  }
  const oldY = hero.y;
  let nextY = oldY + hero.vy * dt;
  if (hero.vy < 0) nextY = collideCeilings(oldY, nextY, room.solids);
  let landed = null;
  if (hero.vy >= 0) {
    for (const surface of [...room.runs, ...room.ledges, ...room.gears, ...room.solids]) {
      if (!activeSurface(surface)) continue;
      const lastY = surface === previousGround ? surface.y : surface.previousY ?? surface.y;
      if (!overlapsX(hero.x, surface)) continue;
      if (oldY <= lastY + 0.001 && nextY >= surface.y && (!landed || surface.y < landed.y)) {
        landed = surface;
      }
    }
  }

  hero.ground = landed;
  if (landed) {
    if (!previousGround && hero.vy > 22) {
      burst(hero.x, landed.y - 1, "dust", 5);
      hero.squash = 0.22;
    }
    hero.y = landed.y;
    hero.vy = 0;
    hero.glide = false;
    hero.windGlide = false;
    hero.cuttable = false;
    hero.bounce = 0;
    hero.dash = 0;
    hero.dashReady = true;
  } else {
    hero.y = nextY;
    hero.glide = hero.windGlide || (rotorHeld && hero.vy > 0 && hero.bounce <= 0 && !dashing);
  }
}

function updatePose(dt) {
  hero.squash *= Math.pow(0.001, dt);
  let pose = "idle";
  if (hero.dash > 0) {
    pose = "dash";
  } else if (hero.wall && !hero.ground && abilities.has("wall")) {
    pose = "wall";
    hero.facing = hero.wall;
  } else if (hero.glide) pose = "glide";
  else if (!hero.ground) pose = hero.vy < 0 ? "jump" : "fall";
  else if (Math.abs(hero.vx) > 6) pose = "run";

  if (hero.pose === pose) {
    hero.poseTime += dt;
  } else {
    hero.pose = pose;
    hero.poseTime = 0;
  }
}

function touches(x, y, radius = 14) {
  return Math.abs(x - hero.x) <= radius
    && y + 7 >= hero.y - HERO_HEIGHT && y - 7 <= hero.y;
}

function showTip(text, seconds = 5) {
  abilityTime = seconds;
  abilityHint.textContent = text;
}

function checkRoomItems() {
  for (const save of room.saves) {
    if (!touches(save.x, save.y - 14)) continue;
    hearts = MAX_HEARTS;
    if (checkpoint.room === room && checkpoint.x === save.x && checkpoint.gear === gearMode) continue;
    checkpoint = { ...save, room, gear: gearMode };
    burst(save.x, save.y - 15, "spark", 7);
  }
  for (const pickup of room.pickups) {
    if (abilities.has(pickup.ability) || !touches(pickup.x, pickup.y)) continue;
    abilities.add(pickup.ability);
    showTip(ABILITIES[pickup.ability].tip);
    burst(pickup.x, pickup.y, "spark", 16);
    refreshControls();
  }
  for (const coin of room.coins) {
    if (coin.taken || !touches(coin.x, coin.y)) continue;
    coin.taken = true;
    collected += 1;
    burst(coin.x, coin.y, "spark", 6);
  }
}

function checkRoomExit(direction) {
  if (!direction || !hero.ground) return;
  const atExit = direction > 0 ? hero.x >= room.width - HALF_HERO : hero.x <= HALF_HERO;
  if (!atExit) return;
  const current = rooms.indexOf(room);
  const destination = rooms[current + direction];
  if (destination) {
    enterRoom(destination, direction > 0 ? 22 : destination.width - 22);
    hero.facing = direction;
  }
}

function update(dt) {
  if (mapOpen) return;
  if (mode === "playing") runTime += dt;
  if (hitstopTime > 0) {
    hitstopTime = Math.max(0, hitstopTime - dt);
    return;
  }
  worldTime += bounceAim ? dt * 0.18 : dt;
  if (mode === "title") {
    hero.poseTime += dt;
    return;
  }

  moveParticles(dt);
  if (mode === "complete" && completion.hidden && worldTime - finishedAt >= COMPLETION_DELAY) {
    showResult();
  }
  if (mode !== "playing") return;

  if (hearts <= 0) {
    respawn();
    return;
  }
  roomTime = Math.max(0, roomTime - dt);
  abilityTime = Math.max(0, abilityTime - dt);
  shiftCooldown = Math.max(0, shiftCooldown - dt);
  shakeTime = Math.max(0, shakeTime - dt);

  startBounce();
  if (bounceAim) {
    moveEnemies(dt * 0.18);
    if (room.boss) {
      updateBoss(room.boss, dt * 0.18, true);
      if (bounceAim.target.sprite && !room.boss.shots.includes(bounceAim.target)) {
        bounceAim = null;
        bouncePressed = false;
        return;
      }
    }
    updateBounceAim(dt);
    return;
  }
  bouncePressed = false;

  hero.kick = Math.max(0, hero.kick - dt);
  hero.bounce = Math.max(0, hero.bounce - dt);
  hero.recoil = Math.max(0, hero.recoil - dt);
  if (hero.ground && !activeSurface(hero.ground)) hero.ground = null;
  startDash();
  moveGears(false, dt);
  if (hero.ground?.previousY !== undefined) {
    hero.y += hero.ground.y - hero.ground.previousY;
    hero.x += hero.ground.x - hero.ground.previousX;
  }
  const direction = inputDirection().x;
  const previousY = hero.y;
  moveSideways(dt, direction);
  moveVertically(dt, actionHeld("jump"));
  if (hero.dash > 0) {
    if (Math.floor(hero.dash / STEP) % 2 === 0) {
      afterimages.push({ x: hero.x, y: hero.y, facing: hero.facing, life: 0.18 });
    }
    hero.dash = hero.wall ? 0 : Math.max(0, hero.dash - dt);
    if (hero.dash === 0) hero.vy = clamp(hero.vy * 0.22, -100, 100);
  }

  if (hero.y > FALL_Y) {
    respawn();
    return;
  }

  moveEnemies(dt);
  hero.hurt = Math.max(0, hero.hurt - dt);
  checkEnemyContact(previousY);
  if (room.boss) updateBoss(room.boss, dt);
  if (mode !== "playing") return;
  if (hearts > 0) checkRoomItems();
  if (room === rooms[0]) startTravel = Math.max(startTravel, Math.abs(hero.x - START_X));

  hero.puffTime -= dt;
  if (hero.glide && hero.puffTime <= 0) {
    hero.puffTime = 0.08;
    emit(hero.x - hero.facing * 12, hero.y - 13, -hero.facing * 24, 6, 0.4, "glide");
  }
  updatePose(dt);
  cameraX += (cameraTarget() - cameraX) * CAMERA_LERP;
  checkRoomExit(direction);
}

function roomSprite(name) {
  const tint = name.startsWith("ground") ? room.groundTint : room.ledgeTint;
  if (!tint || !/^(ground|ledge|gear_platform)/.test(name)) return art[name];
  const key = `${name}:${tint}`;
  if (!tintedArt[key]) {
    const image = art[name];
    const tile = document.createElement("canvas");
    tile.width = image.width;
    tile.height = image.height;
    const context = tile.getContext("2d");
    context.drawImage(image, 0, 0);
    context.globalCompositeOperation = "multiply";
    context.fillStyle = tint;
    context.fillRect(0, 0, tile.width, tile.height);
    context.globalCompositeOperation = "destination-in";
    context.drawImage(image, 0, 0);
    tintedArt[key] = tile;
  }
  return tintedArt[key];
}

function drawSprite(name, x, y) {
  const sprite = roomSprite(name);
  if (x > -sprite.width && x < WIDTH && y > -sprite.height && y < HEIGHT) {
    ctx.drawImage(sprite, Math.round(x), Math.round(y));
  }
}

function drawParallax(image, sourceY, sourceHeight, width, height, y, factor, origin = 0) {
  const offset = Math.round(cameraX * factor) + origin;
  let tile = Math.floor(offset / width);
  for (let x = tile * width - offset; x < WIDTH; x += width, tile += 1) {
    ctx.save();
    if (tile % 2) {
      ctx.translate(x + width, 0);
      ctx.scale(-1, 1);
    } else {
      ctx.translate(x, 0);
    }
    ctx.drawImage(image, 0, sourceY, image.width, sourceHeight, 0, y, width, height);
    ctx.restore();
  }
}

function drawGround(run) {
  const left = Math.round(run.x - cameraX);
  if (left >= WIDTH || left + run.width <= 0) return;

  const y = run.y - 6;
  const middle = roomSprite("ground_mid");
  ctx.drawImage(roomSprite("ground_left"), 2, 0, 54, 49, left, y, 54, 49);
  for (let i = 0; i < run.tiles; i += 1) {
    ctx.drawImage(middle, 2, 0, 92, 49, left + 54 + i * 92, y, 92, 49);
  }
  ctx.drawImage(roomSprite("ground_right"), 2, 0, 50, 49, left + run.width - 50, y, 50, 49);

  for (let row = y + 47; row < HEIGHT; row += 30) {
    for (let col = 0; col < run.width; col += 92) {
      const width = Math.min(92, run.width - col);
      ctx.drawImage(middle, 2, 17, width, 30, left + col, row, width, 30);
    }
  }
}

function drawWind() {
  const wind = room.wind;
  if (!wind) return;
  const x = Math.round(wind.x - cameraX);
  if (x >= WIDTH || x + wind.width <= 0) return;
  const height = art.wind.height;
  const offset = Math.floor(wrap(-worldTime * WIND_SCROLL, height));

  ctx.save();
  ctx.beginPath();
  ctx.rect(x, wind.y, wind.width, HEIGHT - wind.y);
  ctx.clip();
  ctx.globalAlpha = 0.85 * windAlpha;
  for (let y = wind.y + offset - height; y < HEIGHT; y += height) {
    ctx.drawImage(art.wind, x, y);
  }
  ctx.restore();
}

function drawShutters() {
  for (const shutter of room.shutters) {
    if (shutter.closedGear !== gearMode) continue;
    const x = Math.round(shutter.x - cameraX);
    if (x < -shutter.width || x > WIDTH) continue;
    // A tall toothed shutter leaves no unseen route above the screen.
    ctx.fillStyle = "#35205f";
    ctx.fillRect(x, 0, shutter.width, HEIGHT);
    for (let y = 0; y < HEIGHT; y += 30) {
      ctx.drawImage(roomSprite("ground_mid"), 18, 0, 24, 30, x, y, shutter.width, 30);
    }
    ctx.fillStyle = "#fff1d1";
    ctx.font = `bold 10px ${UI_FONT}`;
    ctx.fillText(shutter.closedGear === 1 ? "2" : "1", x + 9, 105);
  }
}

function drawGlow(x, y, radius, color) {
  const glow = ctx.createRadialGradient(x, y, 1, x, y, radius);
  glow.addColorStop(0, color);
  glow.addColorStop(1, "#ffffff00");
  ctx.fillStyle = glow;
  ctx.fillRect(x - radius, y - radius, 2 * radius, 2 * radius);
}

function drawSaves() {
  const radius = 22 + Math.round(4 * Math.sin(worldTime * 3));
  for (const save of room.saves) {
    const x = Math.round(save.x - cameraX);
    if (x < -30 || x > WIDTH + 30) continue;
    drawGlow(x, save.y - 39, radius, checkpoint.room === room && checkpoint.x === save.x ? "#fff7ccbc" : "#a4fff488");
    drawSprite("save", x - 23, save.y - 60);
  }
}

function drawPickups() {
  for (const { ability, x, y } of room.pickups) {
    if (abilities.has(ability) || Math.abs(x - cameraX - WIDTH / 2) > WIDTH / 2 + 30) continue;
    const bob = Math.round(3 * Math.sin(worldTime * 4));
    const color = ABILITIES[ability].color;
    drawGlow(x - cameraX, y + bob, 20, color);
    drawSprite("coin3", x - cameraX - 7, y + bob - 7);
  }
}

function drawEnemies() {
  for (const enemy of room.enemies) {
    const x = Math.round(enemy.x - cameraX);
    if (x < -40 || x > WIDTH + 40) continue;
    if (enemy.kind === "bud") {
      drawGlow(x, targetY(enemy), 16, "#f8a7f7b8");
      drawSprite("tuft3", x - 14, enemy.y - 24);
      continue;
    }
    const sprite = art[`mon/mon_0${enemy.kind}`];
    ctx.save();
    ctx.translate(x, Math.round(enemy.y));
    ctx.scale(enemy.facing, 1);
    if (enemy.kind === 5) {
      ctx.translate(0, -18);
      ctx.rotate(worldTime * 7 * enemy.facing);
      ctx.drawImage(sprite, -Math.round(sprite.width / 2), -Math.round(sprite.height / 2));
    } else {
      const visible = Math.round(sprite.height * (1 - enemy.burrow));
      ctx.drawImage(sprite, 0, 0, sprite.width, visible,
        -Math.round(sprite.width / 2), 1 - visible, sprite.width, visible);
    }
    ctx.restore();
  }
}

function drawBounceAim() {
  if (!bounceAim) return;
  const target = bounceAim.target;
  const x = Math.round(target.x - cameraX);
  const y = Math.round(targetY(target));
  const direction = aimDirection(target);
  drawGlow(x, y, 27, "#fff4beec");
  ctx.save();
  ctx.translate(Math.round(hero.x - cameraX), Math.round(hero.y - HERO_HEIGHT / 2));
  ctx.rotate(Math.atan2(direction.y, direction.x));
  ctx.strokeStyle = "#fff0ba";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(10, 0);
  ctx.lineTo(39, 0);
  ctx.moveTo(29, -7);
  ctx.lineTo(39, 0);
  ctx.lineTo(29, 7);
  ctx.stroke();
  ctx.restore();
}

function drawCoins() {
  const frames = ["coin1", "coin2", "coin3", "coin2"];
  for (let i = 0; i < room.coins.length; i += 1) {
    const coin = room.coins[i];
    if (coin.taken) continue;
    const frame = frames[(Math.floor(worldTime * 8) + i) % frames.length];
    drawSprite(frame, coin.x - cameraX - 7, coin.y - 7);
  }
}

function drawHeroFrame(frame, x, y, facing, squash, alpha) {
  const name = HERO_FRAMES[frame];
  const { left, top, width, height } = spriteBounds[name];
  const scaleX = HERO_SCALE * (1 + squash);
  const drawWidth = Math.round(width * scaleX);
  const drawHeight = Math.round(height * HERO_SCALE * (1 - squash));
  // The wall in frame 07 starts at source column 32.
  const anchor = frame === 7 ? (32 - left) * scaleX - HALF_HERO : drawWidth / 2;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(Math.round(x - cameraX), Math.round(y));
  ctx.scale(facing, 1);
  ctx.drawImage(art[name], left, top, width, height, -Math.round(anchor), -drawHeight, drawWidth, drawHeight);
  ctx.restore();
}

function drawHero() {
  for (const trail of afterimages) {
    drawHeroFrame(8, trail.x, trail.y, trail.facing, 0, trail.life * 2.6);
  }
  const frames = { idle: 0, run: 1 + Math.floor(hero.poseTime * 9) % 4,
    jump: 5, fall: 6, wall: 7, dash: 8, glide: 10 + Math.floor(hero.poseTime * 16) % 4 };
  const frame = frames[hero.pose];
  const bob = frame >= 10 ? Math.floor(hero.poseTime * 10) % 2 : 0;
  const alpha = hero.hurt > 0 && Math.floor(hero.hurt * 16) % 2 ? 0.45 : 1;
  drawHeroFrame(frame, hero.x, hero.y - bob, hero.facing, hero.squash, alpha);
}

function drawParticles() {
  for (const p of particles) {
    const x = Math.round(p.x - cameraX);
    const y = Math.round(p.y);
    ctx.globalAlpha = Math.min(1, 2 * p.life / p.duration);
    if (p.kind === "spark") {
      ctx.fillStyle = "#ffd69f";
      ctx.fillRect(x - 1, y, 3, 1);
      ctx.fillRect(x, y - 1, 1, 3);
      ctx.fillStyle = "#fff8ef";
      ctx.fillRect(x, y, 1, 1);
    } else {
      ctx.fillStyle = p.kind === "dust" ? "#edb9ff" : "#a8faf6";
      ctx.fillRect(x - 1, y, 3, 2);
      ctx.fillStyle = p.kind === "dust" ? "#fff0ff" : "#e4ffff";
      ctx.fillRect(x, y - 1, 2, 2);
    }
  }
  ctx.globalAlpha = 1;
}

const HEART_PIXELS = [
  ".##...##.",
  "#hh#.#hh#",
  "#hpp#ppp#",
  "#ppppppp#",
  ".#ppppp#.",
  "..#ppp#..",
  "...#p#...",
  "....#....",
];
const DIGITS = [
  "111101101101111", "010110010010111", "111001111100111",
  "111001111001111", "101101111001001", "111100111001111",
  "111100111101111", "111001010010010", "111101111101111",
  "111101111001111",
];

function drawHud() {
  for (let heart = 0; heart < MAX_HEARTS; heart += 1) {
    for (let y = 0; y < HEART_PIXELS.length; y += 1) {
      for (let x = 0; x < HEART_PIXELS[y].length; x += 1) {
        const pixel = HEART_PIXELS[y][x];
        if (pixel === ".") continue;
        if (pixel === "#") ctx.fillStyle = "#21184f";
        else if (heart >= hearts) ctx.fillStyle = "#6d5f91";
        else ctx.fillStyle = pixel === "h" ? "#ffded9" : "#ff878e";
        ctx.fillRect(8 + heart * 12 + x, 8 + y, 1, 1);
      }
    }
  }

  ctx.save();
  ctx.translate(76, 12);
  ctx.rotate(worldTime * 1.8);
  ctx.drawImage(art.gear_platform, 0, 0, art.gear_platform.width, art.gear_platform.height, -7, -7, 14, 14);
  ctx.restore();
  ctx.font = `bold 10px ${UI_FONT}`;
  ctx.lineWidth = 3;
  ctx.strokeStyle = "#21184f";
  ctx.strokeText(`GEAR ${gearMode}`, 87, 16);
  ctx.fillStyle = "#fff8f2";
  ctx.fillText(`GEAR ${gearMode}`, 87, 16);

  let abilityX = 138;
  for (const [name, ability] of Object.entries(ABILITIES)) {
    if (!abilities.has(name)) continue;
    const frame = HERO_FRAMES[ability.frame];
    const { left, top, width, height } = spriteBounds[frame];
    const scale = 12 / Math.max(width, height);
    ctx.fillStyle = "#22174f";
    ctx.fillRect(abilityX, 4, 16, 16);
    ctx.strokeStyle = ability.color;
    ctx.lineWidth = 1;
    ctx.strokeRect(abilityX + 0.5, 4.5, 15, 15);
    ctx.drawImage(art[frame], left, top, width, height, abilityX + 2, 6, Math.round(width * scale), Math.round(height * scale));
    abilityX += 19;
  }

  const count = String(collected);
  const textX = WIDTH - 8 - (count.length * 8 - 2);
  drawSprite("coin1", textX - 19, 5);
  for (let i = 0; i < count.length; i += 1) {
    const glyph = DIGITS[Number(count[i])];
    for (let p = 0; p < 15; p += 1) {
      if (glyph[p] === "0") continue;
      const x = textX + i * 8 + (p % 3) * 2;
      const y = 8 + Math.floor(p / 3) * 2;
      ctx.fillStyle = "#2a2055";
      ctx.fillRect(x - 1, y - 1, 4, 4);
    }
    for (let p = 0; p < 15; p += 1) {
      if (glyph[p] === "0") continue;
      ctx.fillStyle = "#fff8f2";
      ctx.fillRect(textX + i * 8 + (p % 3) * 2, 8 + Math.floor(p / 3) * 2, 2, 2);
    }
  }
}

function setHint(element, visible, worldX, y, opacity = 1) {
  element.hidden = !visible;
  if (!visible) return;
  const width = element.offsetWidth;
  const x = clamp(Math.round(worldX - cameraX - width / 2), 6, WIDTH - width - 6);
  element.style.left = `${x}px`;
  element.style.top = `${y}px`;
  element.style.opacity = opacity;
}

function render() {
  ctx.save();
  if (shakeTime > 0) ctx.translate(Math.sin(worldTime * 100) > 0 ? 1 : -1, 0);
  const desert = room === rooms[0];
  if (desert) {
    ctx.drawImage(art.bg_sky, -Math.round(cameraX * 0.06), 0);
    drawParallax(art.bg_far, 270, 90, 527, 88, NEAR_DUNES_Y, 0.4);
    for (const [x, bottom] of SPIRES) {
      drawSprite("spire", x - cameraX * 0.96, bottom - 28);
    }
    drawSprite("gate", GATE_X - cameraX, GROUND_Y - 75);
  } else {
    const background = art[room.background];
    const width = Math.round(HEIGHT * background.width / background.height);
    drawParallax(background, 0, background.height, width, HEIGHT, 0, 0.21, room.backgroundOffset);
    if (room.backgroundShade) {
      ctx.fillStyle = room.backgroundShade;
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
    }
    if (room.skyTint) {
      const skyHeight = 148;
      const tint = ctx.createLinearGradient(0, 0, 0, skyHeight);
      tint.addColorStop(0, room.skyTint);
      tint.addColorStop(1, "transparent");
      ctx.fillStyle = tint;
      ctx.fillRect(0, 0, WIDTH, skyHeight);
    }
  }

  drawWind();
  for (const run of room.runs) drawGround(run);
  if (desert) {
    for (const [x, kind] of TUFTS) {
      const name = `tuft${kind}`;
      drawSprite(name, x - cameraX, GROUND_Y - art[name].height + 3);
    }
  }

  for (const surface of [...room.ledges, ...room.gears]) {
    ctx.globalAlpha = activeSurface(surface) ? 1 : 0.22;
    drawSprite(surface.art, surface.x - cameraX, surface.y - 4);
  }
  ctx.globalAlpha = 1;
  drawShutters();
  for (const solid of room.solids) {
    const x = Math.round(solid.left - cameraX);
    if (x < -80 || x > WIDTH) continue;
    ctx.drawImage(art.shell_wall, 3, 3, 76, 158, x, solid.y, solid.right - solid.left, solid.bottom - solid.y);
  }
  drawSaves();
  drawPickups();
  drawCoins();
  drawEnemies();
  if (room.boss) drawBoss(room.boss);
  drawParticles();
  drawHero();
  drawBounceAim();
  ctx.restore();

  if (mode !== "title") drawHud();
  if (room.boss) drawBossHud(room.boss);
  const playing = mode === "playing" && !mapOpen;
  setHint(moveHint, playing && desert && startTravel < 80, 108, 131, clamp((80 - startTravel) / 24, 0, 1));
  const firstGap = hero.x >= 350 && hero.x <= 540;
  setHint(glideHint, playing && desert && (firstGap || (hero.x >= 904 && hero.x <= 1130)), firstGap ? 446 : 969, 103);
  setHint(shiftHint, playing && desert && hero.x >= 1050 && hero.x <= 1370, 1190, 66);
  abilityHint.hidden = !playing || abilityTime <= 0;
  roomHint.hidden = !playing || roomTime <= 0 || !abilityHint.hidden;
}

function frame(now) {
  if (lastFrame !== undefined) elapsed += Math.min((now - lastFrame) / 1000, 0.1);
  lastFrame = now;
  while (elapsed >= STEP) {
    update(STEP);
    elapsed -= STEP;
  }
  render();
  requestAnimationFrame(frame);
}

fit();
Promise.all(ASSET_NAMES.map(loadImage)).then(() => {
  // Every supplied hero frame has a two-pixel transparent border.
  for (const name of HERO_FRAMES) {
    spriteBounds[name] = { left: 2, top: 2, width: art[name].width - 4, height: art[name].height - 4 };
  }
  resetLevel();
  mode = "title";
  titleScreen.hidden = false;
  if (startRequested) begin();
  requestAnimationFrame(frame);
}).catch(error => {
  mode = "error";
  document.querySelector("#load-error").hidden = false;
  console.error(error);
});

// Screenshot hook.
window.__qa = (x, y = 150, id = room.id) => {
  const destination = rooms.find(area => area.id === id) ?? room;
  const [save] = destination.saves;
  if (save) checkpoint = { ...save, room: destination, gear: gearMode };
  enterRoom(destination, x, y);
};
