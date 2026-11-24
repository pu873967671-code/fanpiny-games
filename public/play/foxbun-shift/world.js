"use strict";

const ABILITIES = {
  rotor: { frame: 18, color: "#a8fff0", tip: "耳旋翼 · 按住跳跃滑翔 / Ear Rotor · Hold jump to glide" },
  wall: { frame: 16, color: "#ffdc9a", tip: "扒墙 · 朝墙移动，再跳离墙面 / Wall Jump · Hold toward a wall, then jump" },
  bounce: { frame: 13, color: "#f8a7f7", tip: "尾弹 · 空中近身按 X/J，再用方向键瞄准 / Tail Bounce · X/J in air, then aim" },
  dash: { frame: 17, color: "#91d8ff", tip: "冲刺 · 空中按 C/L 和方向键 / Dash · C/L and a direction in the air" },
};

const ROOM_ART = [
  "bg/zone2_monster_planet",
  "mon/mon_00", "mon/mon_01", "mon/mon_02", "mon/mon_03", "mon/mon_06",
  "bg/zone3_nest", "mon/mon_04", "mon/mon_05", "mon/mon_07",
  "mon/boss_03",
];

function groundRun(x, tiles, y = 230) {
  const width = 54 + tiles * 92 + 50;
  return { x, tiles, width, left: Math.max(0, x + 13), right: x + width - 10, y };
}

function ledge(x, y, art = "ledge_m", extra = {}) {
  const width = art === "ledge_s" ? 39 : art === "gear_platform" ? 64 : 65;
  return { x, y, art, width, left: x + 4, right: x + width - 4, ...extra };
}

function shell(x, y, bottom) {
  return { x, y, bottom, left: x + 3, right: x + 79 };
}

function enemy(kind, x, y, range = 0) {
  return { kind, x, y, homeX: x, homeY: y, range, dx: 0, dy: 0, vx: 0, vy: 0, facing: 1 };
}

function coinsAt(positions) {
  return positions.map(([x, y]) => ({ x, y, taken: false }));
}

function createRooms(desert) {
  const shore = {
    id: "shore", zone: 2, name: "怪兽星球 / Monster Planet", width: 1120,
    background: "bg/zone2_monster_planet", groundTint: "#77dabc", ledgeTint: "#d2adff",
    runs: [groundRun(-42, 4), groundRun(523, 2), groundRun(866, 3)],
    ledges: [
      ledge(450, 213, "gear_platform", { activeGear: 2 }),
      ledge(810, 204, "gear_platform", { activeGear: 1 }),
      ledge(122, 175), ledge(176, 121), ledge(235, 32),
    ],
    shutters: [{ x: 300, width: 24, closedGear: 1 }, { x: 712, width: 24, closedGear: 2 }],
    saves: [{ x: 88, y: 230 }, { x: 1014, y: 230 }],
    pickups: [{ ability: "bounce", x: 964, y: 203 }],
    enemies: [enemy(1, 201, 230, 44), enemy(0, 365, 230, 19),
      enemy(2, 625, 230, 46), enemy(3, 911, 150, 25), enemy("bud", 1054, 163)],
    coins: coinsAt([[465, 187], [492, 181], [826, 176], [854, 174],
      [247, 19], [264, 16], [281, 19], [297, 19]]),
  };
  const clouds = {
    id: "clouds", zone: 2, name: "浮云裂谷 / Cloudrift", width: 1000,
    background: shore.background, backgroundOffset: 128, skyTint: "rgba(66, 53, 161, 0.45)",
    groundTint: shore.groundTint, ledgeTint: shore.ledgeTint,
    runs: [groundRun(-40, 2), groundRun(650, 4)],
    saves: [{ x: 116, y: 230 }, { x: 735, y: 230 }],
    enemies: [enemy(6, 321, 172, 3), enemy(6, 450, 163, 4), enemy(6, 575, 175, 5)],
    coins: coinsAt([[322, 114], [451, 106], [575, 117], [696, 194]]),
  };
  const threshold = {
    id: "threshold", zone: 3, name: "水晶巢穴 / Crystal Nest", width: 1090,
    background: "bg/zone3_nest", groundTint: "#9fbaff", ledgeTint: "#d7bdff",
    runs: [groundRun(-44, 3), groundRun(625, 4)],
    saves: [{ x: 96, y: 230 }, { x: 823, y: 230 }],
    pickups: [{ ability: "dash", x: 133, y: 204 }],
    enemies: [enemy(4, 762, 230, 26), enemy(7, 964, 230, 42)],
    coins: coinsAt([[188, 181], [264, 170], [312, 164], [653, 182], [686, 188]]),
  };
  const bridges = {
    id: "bridges", zone: 3, name: "晶桥 / Crystal Bridges", width: 1280,
    background: threshold.background, groundTint: threshold.groundTint, ledgeTint: threshold.ledgeTint,
    runs: [groundRun(-40, 2), groundRun(425, 1), groundRun(1008, 3)],
    ledges: [
      ledge(327, 181, "gear_platform", { activeGear: 2 }),
      ledge(735, 182, "gear_platform", { activeGear: 1 }),
      ledge(866, 150, "gear_platform", { activeGear: 1 }),
    ],
    shutters: [{ x: 543, width: 24, closedGear: 1 }, { x: 1115, width: 24, closedGear: 2 }],
    saves: [{ x: 80, y: 230 }, { x: 587, y: 230 }, { x: 1211, y: 230 }],
    enemies: [enemy(5, 135, 230, 44), enemy(6, 832, 120, 4), enemy(7, 1171, 230, 18)],
    coins: coinsAt([[333, 154], [363, 151], [758, 146], [831, 91], [889, 113], [1004, 168]]),
  };
  const nest = {
    id: "nest", zone: 3, name: "巢母之庭 / Nest Mother's Court", width: 770,
    background: threshold.background, backgroundOffset: 84, backgroundShade: "rgba(0, 0, 0, 0.15)",
    groundTint: threshold.groundTint, ledgeTint: threshold.ledgeTint,
    runs: [groundRun(-42, 8)],
    saves: [{ x: 94, y: 230 }],
    boss: createBoss(606, 230),
  };
  return [desert, shore, clouds, threshold, bridges, nest].map(room => ({
    ledges: [], gears: [], shutters: [], solids: [], saves: [], pickups: [], enemies: [], coins: [],
    ...room,
  }));
}
