"use strict";

const BOSS_HITS = 3;
const BOSS_PHASES = [
  { pause: 1.15, warning: 0.78, speed: 145, volleys: [[192]] },
  { pause: 0.9, warning: 0.65, speed: 165, volleys: [[174], [160, 201]] },
  { pause: 0.67, warning: 0.55, speed: 193, volleys: [[156, 192], [177, 211]] },
];
const BOSS_EGG = { image: "bg/zone3_nest", source: [265, 87, 51, 52], oval: true };
const BOSS_SPARK = { image: "mon/mon_03", source: [22, 0, 9, 11] };

function createBoss(x, y) {
  return { x, y, shots: [] };
}

function resetBoss(boss, phase = 0) {
  Object.assign(boss, {
    phase, retryPhase: phase, hits: 0, active: false, stage: "rest",
    timer: 1.25, volley: 0, invulnerable: 0, crystal: null,
  });
  boss.shots.length = 0;
}

function hurtBoss(boss) {
  if (boss.invulnerable > 0 || mode !== "playing") return;
  boss.hits += 1;
  boss.invulnerable = 0.42;
  hitstopTime = HITSTOP;
  shakeTime = 0.22;
  burst(boss.x - 25, boss.y - 53, "spark", 22);
  if (boss.hits < BOSS_HITS) return;
  if (boss.phase === BOSS_PHASES.length - 1) {
    boss.stage = "defeated";
    boss.shots.length = 0;
    boss.crystal = null;
    finish();
    return;
  }
  boss.phase += 1;
  boss.retryPhase = boss.phase;
  boss.hits = 0;
  boss.invulnerable = 1.25;
  boss.timer = 1.4;
  boss.stage = "rest";
  boss.volley = 0;
  boss.crystal = null;
  boss.shots.length = 0;
}

function bossVolley(boss) {
  const phase = BOSS_PHASES[boss.phase];
  const heights = phase.volleys[boss.volley % phase.volleys.length];
  for (const [index, y] of heights.entries()) {
    boss.shots.push({
      x: boss.x - 60 + index * 19, y, centerOffset: 0, vx: -phase.speed,
      vy: index ? -7 : 0, life: 5, bounced: false, bounceLock: 0,
      sprite: boss.phase === 0 ? BOSS_EGG : BOSS_SPARK,
    });
  }
  boss.volley += 1;
  if (!boss.crystal && boss.volley % 2 === 1) {
    boss.crystal = { gear: gearMode, x: boss.x - 9 + boss.phase * 12, y: 33, speed: 0, time: 1.75 };
  }
}

function releaseBossCrystal(boss) {
  const crystal = boss.crystal;
  if (!crystal || crystal.speed || crystal.gear === gearMode) return;
  crystal.speed = 40;
  burst(crystal.x, crystal.y, "glide", 8);
}

function updateBoss(boss, dt, aiming = false) {
  if (boss.stage === "defeated") return;
  if (!boss.active) {
    if (hero.x < boss.x - 294) return;
    boss.active = true;
    showTip("朝巢母反方向尾弹 · 换挡落晶 / Bounce away to reflect · Shift to drop crystals", 7);
  }
  const phase = BOSS_PHASES[boss.phase];
  boss.timer -= dt;
  boss.invulnerable = Math.max(0, boss.invulnerable - dt);
  if (boss.timer <= 0) {
    if (boss.stage === "rest") {
      boss.stage = "warning";
      boss.timer = phase.warning;
      burst(boss.x - 51, boss.y - 45, "spark", 8);
    } else {
      bossVolley(boss);
      boss.stage = "rest";
      boss.timer = phase.pause;
    }
  }

  if (!aiming && Math.abs(hero.x - boss.x) < 53 && hero.y > boss.y - 73) loseHeart(boss.x);
  const crystal = boss.crystal;
  if (crystal) {
    if (crystal.speed) {
      crystal.speed += 720 * dt;
      crystal.y += crystal.speed * dt;
      if (crystal.y >= boss.y - 67) {
        boss.crystal = null;
        burst(crystal.x, crystal.y, "spark", 17);
        hurtBoss(boss);
      }
    } else {
      crystal.time -= dt;
      if (crystal.time <= 0) boss.crystal = null;
    }
  }

  for (let i = boss.shots.length - 1; i >= 0; i -= 1) {
    const shot = boss.shots[i];
    // Keep the selected projectile attached to its aim marker until launch.
    if (bounceAim?.target === shot) continue;
    shot.x += shot.vx * dt;
    shot.y += shot.vy * dt;
    shot.life -= dt;
    if (shot.life <= 0 || shot.x < -24 || shot.x > room.width + 24 || shot.y < -24 || shot.y > FALL_Y) {
      boss.shots.splice(i, 1);
    } else if (shot.bounced && Math.abs(shot.x - boss.x) < 56
      && shot.y > boss.y - 87 && shot.y < boss.y - 3) {
      boss.shots.splice(i, 1);
      hurtBoss(boss);
      if (boss.shots.length <= i) break;
    } else if (!aiming && !shot.bounced && hero.hurt <= 0
      && Math.abs(shot.x - hero.x) < 15 && Math.abs(shot.y - (hero.y - HERO_HEIGHT / 2)) < 21) {
      boss.shots.splice(i, 1);
      loseHeart(shot.x);
    }
  }
}

function drawBoss(boss) {
  const x = Math.round(boss.x - cameraX);
  const y = boss.y;
  const pulse = Math.sin(worldTime * 5);
  if (boss.stage === "warning") drawGlow(x - 48, y - 42, 28 + pulse * 8, "#ffa285ef");
  if (boss.invulnerable > 0 && Math.floor(worldTime * 15) % 2) ctx.globalAlpha = 0.62;
  if (boss.stage === "defeated") ctx.globalAlpha = 0.42;
  const bossStep = Math.floor(worldTime * 6) % 4;
  const bossArt = ASSET_NAMES.includes(`mon/boss_03_${bossStep}`) ? `mon/boss_03_${bossStep}` : "mon/boss_03";
  const bossImg = roomSprite(bossArt);
  drawSprite(bossArt, x - Math.round(bossImg.width / 2), y - bossImg.height + 1 + Math.round(pulse));
  ctx.globalAlpha = 1;

  const crystal = boss.crystal;
  if (crystal) {
    const crystalX = Math.round(crystal.x - cameraX);
    if (!crystal.speed) {
      drawGlow(crystalX, crystal.y + 9, 26 + pulse * 5, "#a5fff6ed");
      ctx.fillStyle = "#a5fff655";
      ctx.fillRect(crystalX, crystal.y + 13, 1, y - crystal.y - 79);
    }
    ctx.save();
    ctx.translate(crystalX, Math.round(crystal.y));
    ctx.rotate(Math.PI);
    ctx.drawImage(roomSprite("ledge_s"), -9, -11, 18, 31);
    ctx.restore();
  }

  for (const shot of boss.shots) {
    const shotX = Math.round(shot.x - cameraX);
    const shotY = Math.round(shot.y);
    drawGlow(shotX, shotY, 14, shot.bounced ? "#a4fff4df" : "#ffc498cf");
    const { image, source, oval } = shot.sprite;
    ctx.save();
    if (oval) {
      // Isolate an egg from the Crystal Nest backdrop.
      ctx.beginPath();
      ctx.ellipse(shotX, shotY, 8, 9, 0, 0, Math.PI * 2);
      ctx.clip();
    }
    ctx.drawImage(art[image], ...source, shotX - 9, shotY - 9, 18, 18);
    ctx.restore();
  }
}

function drawBossHud(boss) {
  if (!boss.active || boss.stage === "defeated") return;
  ctx.fillStyle = "#241747d9";
  ctx.fillRect(172, 59, 136, 28);
  ctx.fillStyle = "#fff5ef";
  ctx.font = `bold 9px ${UI_FONT}`;
  ctx.textAlign = "center";
  ctx.fillText("水晶巢母 / Crystal Nest Mother", WIDTH / 2, 70);
  ctx.textAlign = "start";
  for (let phase = 0; phase < BOSS_PHASES.length; phase += 1) {
    for (let hit = 0; hit < BOSS_HITS; hit += 1) {
      ctx.fillStyle = phase < boss.phase || (phase === boss.phase && hit < boss.hits)
        ? "#4a416d" : phase === boss.phase ? "#fcb3eb" : "#8b88c4";
      ctx.fillRect(182 + phase * 40 + hit * 12, 76, 10, 5);
    }
  }
}
