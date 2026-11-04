// Mini-jeu du calmar : cliquer sur ce qui flotte pour l'attirer sous l'eau.

type Kind = 'duck' | 'turtle' | 'dolphin' | 'boat' | 'pirate' | 'galleon' | 'tanker' | 'bottle' | 'can' | 'bag';

interface Rule {
  points: number;
  bonus?: number;
  spill?: boolean;
  crossing: [number, number]; // secondes pour traverser l'écran
  halfWidth: number;
  top: number;
  bottom: number;
}

interface Item {
  kind: Kind;
  x: number;
  y: number;
  dir: 1 | -1;
  speed: number;
  lane: number;
  phase: number;
  angle: number;
  alpha: number;
  caught: boolean;
}

interface Tentacle {
  item: Item;
  baseX: number;
  bend: number;
  seed: number;
  stage: 'rise' | 'pull' | 'back';
  progress: number;
  tipX: number;
  tipY: number;
}

interface Drop {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
}

interface Pop {
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
}

interface Ripple {
  x: number;
  y: number;
  life: number;
}

interface Slick {
  x: number;
  life: number;
}

const DURATION = 30;
const RECORD_KEY = 'calmar-record';
const PIRATE_EVERY = 5;
const SLICK_DURATION = 5;
const TRASH_KINDS = ['bottle', 'can', 'bag'] as const;

const NAVY = '#0b162c';
const NAVY_SOFT = '#1c2942';
const SLATE = '#3b556d';
const TEAL = '#5fc2ba';
const PINK = '#f7789f';
const PINK_LIGHT = '#ffd3e0';

const ANIMAL = { points: 10, crossing: [7, 9] } as const;
const TRASH = { points: -15, crossing: [8, 10] } as const;

const RULES: Record<Kind, Rule> = {
  duck: { ...ANIMAL, crossing: [7, 9], halfWidth: 30, top: 44, bottom: 12 },
  turtle: { ...ANIMAL, crossing: [7, 9], halfWidth: 38, top: 30, bottom: 12 },
  dolphin: { ...ANIMAL, crossing: [7, 9], halfWidth: 44, top: 40, bottom: 12 },
  boat: { points: 20, crossing: [4.5, 6], halfWidth: 52, top: 76, bottom: 14 },
  pirate: { points: 0, bonus: 5, crossing: [1.5, 1.8], halfWidth: 56, top: 86, bottom: 14 },
  galleon: { points: 50, crossing: [5.5, 6.5], halfWidth: 76, top: 120, bottom: 16 },
  tanker: { points: 0, spill: true, crossing: [9, 11], halfWidth: 104, top: 58, bottom: 16 },
  bottle: { ...TRASH, crossing: [8, 10], halfWidth: 30, top: 24, bottom: 12 },
  can: { ...TRASH, crossing: [8, 10], halfWidth: 20, top: 34, bottom: 12 },
  bag: { ...TRASH, crossing: [8, 10], halfWidth: 26, top: 44, bottom: 12 },
};

const pick = <T,>(list: readonly T[]) => list[Math.floor(Math.random() * list.length)];
const between = (min: number, max: number) => min + Math.random() * (max - min);
const easeOut = (p: number) => 1 - (1 - p) ** 3;

function chooseKind(sinceGalleon: number, sinceTanker: number): Kind {
  const roll = Math.random();
  if (sinceGalleon > 10 && roll < 0.015) return 'galleon';
  if (sinceTanker > 8 && roll < 0.1) return 'tanker';
  if (roll < 0.34) return 'boat';
  if (roll < 0.66) return pick(TRASH_KINDS);
  return pick(['duck', 'turtle', 'dolphin'] as const);
}

/* Dessins, centrés sur la ligne de flottaison et orientés vers la droite */

function shape(ctx: CanvasRenderingContext2D, color: string, points: number[]) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(points[0], points[1]);
  for (let i = 2; i < points.length; i += 2) ctx.lineTo(points[i], points[i + 1]);
  ctx.closePath();
  ctx.fill();
}

function oval(ctx: CanvasRenderingContext2D, color: string, x: number, y: number, rx: number, ry: number) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

const DRAW: Record<Kind, (ctx: CanvasRenderingContext2D) => void> = {
  duck(ctx) {
    oval(ctx, '#ffd84d', -4, -10, 26, 16);
    shape(ctx, '#ffd84d', [-30, -22, -16, -14, -22, -4]);
    oval(ctx, '#ffd84d', 16, -30, 12, 12);
    shape(ctx, '#ff9a3c', [26, -33, 40, -28, 26, -24]);
    oval(ctx, NAVY, 19, -33, 2.4, 2.4);
  },
  turtle(ctx) {
    oval(ctx, '#8fd16b', 30, -12, 10, 8);
    oval(ctx, NAVY, 34, -14, 1.8, 1.8);
    ctx.fillStyle = '#3f8f5b';
    ctx.beginPath();
    ctx.ellipse(-2, -6, 32, 22, 0, Math.PI, 0);
    ctx.fill();
    oval(ctx, '#6fbf73', -12, -14, 7, 5);
    oval(ctx, '#6fbf73', 4, -18, 7, 5);
    oval(ctx, '#6fbf73', 16, -11, 5, 4);
  },
  dolphin(ctx) {
    ctx.fillStyle = '#7f9db8';
    ctx.beginPath();
    ctx.moveTo(-42, 0);
    ctx.quadraticCurveTo(-10, -44, 28, -20);
    ctx.lineTo(44, -14);
    ctx.lineTo(28, -8);
    ctx.quadraticCurveTo(0, -18, -42, 0);
    ctx.fill();
    shape(ctx, '#5f7f9c', [-6, -24, -18, -40, 6, -27]);
    oval(ctx, NAVY, 22, -19, 1.8, 1.8);
  },
  boat(ctx) {
    ctx.strokeStyle = '#d9c7a8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-4, -12);
    ctx.lineTo(-4, -76);
    ctx.stroke();
    shape(ctx, '#ffffff', [0, -74, 0, -20, 40, -20]);
    shape(ctx, PINK_LIGHT, [-8, -66, -8, -20, -34, -20]);
    shape(ctx, '#ffffff', [-52, -14, 52, -14, 36, 12, -40, 12]);
    shape(ctx, PINK, [-49, -10, 49, -10, 46, -5, -46, -5]);
  },
  pirate(ctx) {
    ctx.strokeStyle = '#4a2f20';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-2, -12);
    ctx.lineTo(-2, -86);
    ctx.stroke();
    shape(ctx, '#b3323a', [-36, -74, 34, -74, 40, -24, -42, -24]);
    oval(ctx, '#ffffff', -2, -54, 11, 10);
    ctx.fillRect(-8, -47, 12, 7);
    oval(ctx, '#b3323a', -6, -55, 2.6, 3);
    oval(ctx, '#b3323a', 2, -55, 2.6, 3);
    shape(ctx, NAVY, [-2, -86, -26, -80, -2, -74]);
    shape(ctx, '#5b3a29', [-56, -20, 56, -16, 40, 12, -44, 12]);
    shape(ctx, '#d9a441', [-52, -15, 52, -11, 50, -8, -50, -11]);
  },
  galleon(ctx) {
    ctx.strokeStyle = '#4a2f20';
    ctx.lineWidth = 4;
    for (const [x, top] of [[-38, -92], [6, -118], [46, -82]]) {
      ctx.beginPath();
      ctx.moveTo(x, -20);
      ctx.lineTo(x, top);
      ctx.stroke();
    }
    for (const [x, y, w, h] of [[-38, -86, 26, 26], [-38, -56, 32, 26], [6, -110, 30, 30], [6, -74, 38, 36], [46, -76, 22, 24], [46, -48, 28, 22]]) {
      ctx.fillStyle = '#f3ead6';
      ctx.beginPath();
      ctx.moveTo(x - w, y);
      ctx.quadraticCurveTo(x + w * 0.2, y + h / 2, x - w, y + h);
      ctx.lineTo(x + w, y + h);
      ctx.quadraticCurveTo(x + w * 1.4, y + h / 2, x + w, y);
      ctx.closePath();
      ctx.fill();
    }
    shape(ctx, NAVY, [6, -118, -20, -112, 6, -104]);
    shape(ctx, '#8a5a3c', [-76, -34, -44, -30, -38, -16, 54, -16, 76, -28, 58, 14, -60, 14]);
    shape(ctx, '#d9a441', [-64, -12, 62, -12, 60, -8, -62, -8]);
    for (let x = -44; x <= 44; x += 22) oval(ctx, NAVY, x, 1, 4, 4);
  },
  tanker(ctx) {
    shape(ctx, '#ffffff', [-96, -46, -56, -46, -56, -18, -96, -18]);
    shape(ctx, SLATE, [-90, -40, -62, -40, -62, -32, -90, -32]);
    shape(ctx, '#e8574a', [-86, -58, -68, -58, -68, -46, -86, -46]);
    for (const x of [-36, 4, 44]) oval(ctx, '#c7d0d9', x, -22, 16, 11);
    shape(ctx, '#20242c', [-104, -18, 104, -18, 90, 14, -96, 14]);
    shape(ctx, '#e8574a', [-101, -6, 99, -6, 94, 6, -97, 6]);
  },
  bottle(ctx) {
    ctx.save();
    ctx.rotate(-0.18);
    ctx.fillStyle = '#6fbf8f';
    ctx.beginPath();
    ctx.roundRect(-28, -18, 38, 18, 5);
    ctx.fill();
    ctx.fillRect(8, -13, 14, 8);
    ctx.fillStyle = '#e8574a';
    ctx.fillRect(22, -14, 6, 10);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-20, -15, 16, 12);
    ctx.restore();
  },
  can(ctx) {
    ctx.save();
    ctx.rotate(0.3);
    ctx.fillStyle = '#e8574a';
    ctx.fillRect(-14, -30, 28, 32);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-14, -18, 28, 7);
    oval(ctx, '#c7d0d9', 0, -30, 14, 4.5);
    oval(ctx, '#c7d0d9', 0, 2, 14, 4.5);
    ctx.restore();
  },
  bag(ctx) {
    ctx.fillStyle = '#c7d0d9';
    ctx.beginPath();
    ctx.moveTo(-24, 2);
    ctx.lineTo(-20, -28);
    ctx.lineTo(-12, -42);
    ctx.lineTo(-7, -30);
    ctx.lineTo(7, -30);
    ctx.lineTo(12, -42);
    ctx.lineTo(20, -28);
    ctx.lineTo(24, 2);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = SLATE;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-8, -16);
    ctx.lineTo(-11, -2);
    ctx.moveTo(9, -18);
    ctx.lineTo(7, -4);
    ctx.stroke();
  },
};

function drawLegend() {
  for (const canvas of document.querySelectorAll<HTMLCanvasElement>('canvas[data-kind]')) {
    const ctx = canvas.getContext('2d');
    if (!ctx) continue;
    const kind = canvas.dataset.kind as Kind;
    const scale = Math.min(canvas.width / (RULES[kind].halfWidth * 2.3), (canvas.height * 0.8) / (RULES[kind].top + RULES[kind].bottom));
    ctx.translate(canvas.width / 2, canvas.height - RULES[kind].bottom * scale - 4);
    ctx.scale(scale, scale);
    DRAW[kind](ctx);
  }
}

export function startGame() {
  const canvas = document.querySelector<HTMLCanvasElement>('#water')!;
  const ctx = canvas.getContext('2d')!;
  const hud = document.querySelector<HTMLElement>('#hud')!;
  const scoreOut = document.querySelector<HTMLElement>('#score')!;
  const timeOut = document.querySelector<HTMLElement>('#time')!;
  const recordOut = document.querySelector<HTMLElement>('#record')!;
  const startPanel = document.querySelector<HTMLElement>('#start')!;
  const endPanel = document.querySelector<HTMLElement>('#end')!;
  const finalOut = document.querySelector<HTMLElement>('#final')!;
  const verdictOut = document.querySelector<HTMLElement>('#verdict')!;

  let W = 900;
  let H = 540;
  let scale = 1;
  let waterY = 230;
  let clock = 0;

  let playing = false;
  let score = 0;
  let timeLeft = DURATION;
  let nextSpawn = 0;
  let sinceGalleon = 0;
  let sinceTanker = 0;
  let nextPirate = PIRATE_EVERY;
  let slick: Slick | null = null;
  let record = 0;

  let items: Item[] = [];
  let tentacles: Tentacle[] = [];
  let drops: Drop[] = [];
  let pops: Pop[] = [];
  let ripples: Ripple[] = [];

  const stars = Array.from({ length: 60 }, () => ({ x: Math.random(), y: Math.random(), r: between(0.6, 1.8) }));

  try {
    record = Number(localStorage.getItem(RECORD_KEY)) || 0;
  } catch {
    record = 0;
  }

  const wave = (x: number, speed = 1, shift = 0) =>
    waterY + Math.sin(x * 0.012 + clock * 1.1 * speed + shift) * 6 + Math.sin(x * 0.03 - clock * 0.8 * speed + shift) * 2.5;

  function resize() {
    const box = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(box.width * dpr);
    canvas.height = Math.round(box.height * dpr);
    scale = Math.max(0.55, Math.min(box.width / 900, box.height / 540, 1.6));
    W = box.width / scale;
    H = box.height / scale;
    waterY = H * 0.42;
    ctx.setTransform(scale * dpr, 0, 0, scale * dpr, 0, 0);
  }

  function spawn(kind: Kind = chooseKind(sinceGalleon, sinceTanker)) {
    if (kind === 'galleon') sinceGalleon = 0;
    if (kind === 'tanker') sinceTanker = 0;
    const rule = RULES[kind];
    const dir: 1 | -1 = Math.random() < 0.5 ? 1 : -1;
    const margin = rule.halfWidth + 30;
    items.push({
      kind,
      dir,
      x: dir > 0 ? -margin : W + margin,
      y: waterY,
      speed: (W + margin * 2) / between(...rule.crossing),
      lane: pick([0, 1, 2]),
      phase: Math.random() * Math.PI * 2,
      angle: 0,
      alpha: 1,
      caught: false,
    });
  }

  function splash(x: number, y: number) {
    for (let i = 0; i < 16; i++) {
      drops.push({ x, y, vx: between(-110, 110), vy: between(-230, -70), life: between(0.4, 0.8) });
    }
  }

  const slickReach = ({ x, life }: Slick) => Math.max(x, W - x) * (life / SLICK_DURATION) + 40;

  function toTrash(item: Item) {
    if (RULES[item.kind].points < 0) return;
    item.kind = pick(TRASH_KINDS);
    item.speed = (W + 120) / between(...RULES[item.kind].crossing);
  }

  function spill(tanker: Item) {
    slick = { x: tanker.x, life: SLICK_DURATION };
    for (const item of items) if (!item.caught) toTrash(item);
  }

  function grab(item: Item) {
    const rule = RULES[item.kind];
    item.caught = true;
    tentacles.push({
      item,
      baseX: item.x + between(-90, 90),
      bend: between(-70, 70),
      seed: Math.random() * 10,
      stage: 'rise',
      progress: 0,
      tipX: item.x,
      tipY: item.y,
    });

    if (rule.spill) {
      spill(item);
      pops.push({ x: item.x, y: item.y - rule.top, text: 'Marée noire !', color: '#ff8a7a', life: 1.4 });
    } else if (rule.bonus) {
      timeLeft += rule.bonus;
      pops.push({ x: item.x, y: item.y - rule.top, text: `+${rule.bonus} s`, color: '#ffd84d', life: 1.1 });
    } else {
      score += rule.points;
      const good = rule.points > 0;
      pops.push({
        x: item.x,
        y: item.y - rule.top,
        text: `${good ? '+' : '−'}${Math.abs(rule.points)}`,
        color: good ? '#ffffff' : '#ff8a7a',
        life: 1.1,
      });
    }
    updateHud();
  }

  function updateHud() {
    scoreOut.textContent = String(score);
    timeOut.textContent = String(Math.max(0, Math.ceil(timeLeft)));
    timeOut.classList.toggle('low', timeLeft <= 5);
    recordOut.textContent = String(record);
  }

  function begin() {
    items = [];
    tentacles = [];
    drops = [];
    pops = [];
    ripples = [];
    slick = null;
    score = 0;
    timeLeft = DURATION;
    nextSpawn = 0;
    nextPirate = PIRATE_EVERY;
    sinceGalleon = 0;
    sinceTanker = 4;
    playing = true;
    startPanel.hidden = true;
    endPanel.hidden = true;
    hud.hidden = false;
    updateHud();
  }

  function finish() {
    playing = false;
    timeLeft = 0;
    const beaten = score > record;
    if (beaten) {
      record = score;
      try {
        localStorage.setItem(RECORD_KEY, String(record));
      } catch {
        // Le record reste valable pour cette visite
      }
    }
    updateHud();
    finalOut.textContent = String(score);
    verdictOut.textContent = beaten ? 'Nouveau record !' : `Ton record : ${record}`;
    endPanel.hidden = false;
    endPanel.querySelector<HTMLElement>('button')?.focus();
  }

  function onPointer(event: PointerEvent) {
    if (!playing) return;
    const box = canvas.getBoundingClientRect();
    const x = (event.clientX - box.left) / scale;
    const y = (event.clientY - box.top) / scale;
    const reach = event.pointerType === 'mouse' ? 10 : 22;

    let target: Item | undefined;
    for (const item of items) {
      if (item.caught) continue;
      const rule = RULES[item.kind];
      const size = 0.8 + item.lane * 0.14;
      const inside =
        Math.abs(x - item.x) < rule.halfWidth * size + reach &&
        y > item.y - rule.top * size - reach &&
        y < item.y + rule.bottom * size + reach;
      // Les couloirs proches passent devant : à égalité on garde le dernier
      if (inside && (!target || item.lane >= target.lane)) target = item;
    }

    if (target) grab(target);
    else ripples.push({ x, y: Math.max(y, waterY), life: 0.6 });
  }

  function update(dt: number) {
    clock += dt;
    sinceGalleon += dt;
    sinceTanker += dt;

    if (slick) {
      slick.life -= dt;
      if (slick.life <= 0) slick = null;
    }

    nextSpawn -= dt;
    if (nextSpawn <= 0) {
      spawn();
      const elapsed = playing ? 1 - Math.max(0, timeLeft) / DURATION : 0;
      nextSpawn = playing ? 0.8 - 0.3 * Math.min(1, elapsed) : 1.4;
    }

    if (playing) {
      nextPirate -= dt;
      if (nextPirate <= 0) {
        spawn('pirate');
        nextPirate += PIRATE_EVERY;
      }
      timeLeft -= dt;
      if (timeLeft <= 0) finish();
      else updateHud();
    }

    for (const item of items) {
      if (item.caught) continue;
      item.x += item.dir * item.speed * dt;
      item.y = wave(item.x) + item.lane * 26;
      item.angle = Math.sin(clock * 2 + item.phase) * 0.05;
      if (slick && Math.abs(item.x - slick.x) < slickReach(slick)) toTrash(item);
    }
    items = items.filter((item) => {
      const margin = RULES[item.kind].halfWidth + 40;
      return item.caught || (item.x > -margin && item.x < W + margin);
    });

    for (const tentacle of tentacles) {
      const { item } = tentacle;
      if (tentacle.stage === 'rise') {
        tentacle.progress += dt / 0.2;
        if (tentacle.progress >= 1) {
          tentacle.stage = 'pull';
          tentacle.progress = 0;
          tentacle.tipY = item.y;
          splash(item.x, item.y);
        }
      } else if (tentacle.stage === 'pull') {
        tentacle.progress += dt / 0.5;
        const p = Math.min(1, tentacle.progress);
        item.y = tentacle.tipY + (p * p) * 230;
        item.angle += dt * 1.8 * item.dir;
        item.alpha = 1 - p * p;
        if (p >= 1) {
          tentacle.stage = 'back';
          tentacle.progress = 0;
          tentacle.tipX = item.x;
          tentacle.tipY = item.y;
          items = items.filter((other) => other !== item);
        }
      } else {
        tentacle.progress += dt / 0.22;
      }
    }
    tentacles = tentacles.filter((tentacle) => tentacle.stage !== 'back' || tentacle.progress < 1);

    for (const drop of drops) {
      drop.life -= dt;
      drop.vy += 620 * dt;
      drop.x += drop.vx * dt;
      drop.y += drop.vy * dt;
    }
    drops = drops.filter((drop) => drop.life > 0);

    for (const pop of pops) {
      pop.life -= dt;
      pop.y -= 42 * dt;
    }
    pops = pops.filter((pop) => pop.life > 0);

    for (const ripple of ripples) ripple.life -= dt;
    ripples = ripples.filter((ripple) => ripple.life > 0);
  }

  function drawScene() {
    const sky = ctx.createLinearGradient(0, 0, 0, waterY);
    sky.addColorStop(0, NAVY);
    sky.addColorStop(1, NAVY_SOFT);
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, waterY + 12);

    ctx.fillStyle = 'rgb(255 255 255 / 0.65)';
    for (const star of stars) {
      ctx.beginPath();
      ctx.arc(star.x * W, star.y * waterY * 0.85, star.r, 0, Math.PI * 2);
      ctx.fill();
    }
    oval(ctx, 'rgb(255 255 255 / 0.9)', W * 0.84, waterY * 0.34, 34, 34);
    oval(ctx, NAVY, W * 0.84 + 13, waterY * 0.34 - 6, 29, 29);

    const water = ctx.createLinearGradient(0, waterY, 0, H);
    water.addColorStop(0, TEAL);
    water.addColorStop(0.45, SLATE);
    water.addColorStop(1, NAVY_SOFT);
    ctx.fillStyle = water;
    fillWave(0.8, 2);
  }

  function fillWave(speed: number, shift: number, offset = 0) {
    ctx.beginPath();
    ctx.moveTo(0, H);
    for (let x = 0; x <= W + 16; x += 16) ctx.lineTo(x, wave(x, speed, shift) + offset);
    ctx.lineTo(W + 16, H);
    ctx.closePath();
    ctx.fill();
  }

  function drawSlick(current: Slick) {
    const { x } = current;
    const reach = slickReach(current);
    const left = Math.max(-16, x - reach);
    const right = Math.min(W + 16, x + reach);
    const taper = (at: number) => Math.min(1, (reach - Math.abs(at - x)) / 90);

    ctx.fillStyle = 'rgb(5 8 15 / 0.92)';
    ctx.beginPath();
    for (let at = left; at <= right; at += 12) ctx.lineTo(at, wave(at, 0.8, 2) - 3 * taper(at));
    for (let at = right; at >= left; at -= 12) {
      const depth = 92 + Math.sin(at * 0.022 + clock * 0.7) * 16 + Math.sin(at * 0.05 - clock) * 8;
      ctx.lineTo(at, wave(at, 0.8, 2) + depth * taper(at));
    }
    ctx.closePath();
    ctx.fill();
  }

  function drawItem(item: Item) {
    ctx.save();
    ctx.globalAlpha = item.alpha;
    ctx.translate(item.x, item.y);
    ctx.rotate(item.angle);
    const size = 0.8 + item.lane * 0.14;
    ctx.scale(size * item.dir, size);
    DRAW[item.kind](ctx);
    ctx.restore();
  }

  function drawTentacle(tentacle: Tentacle) {
    const { item, stage, progress, baseX, bend, seed } = tentacle;
    const tipX = stage === 'back' ? tentacle.tipX : item.x;
    const tipY = stage === 'back' ? tentacle.tipY : item.y;
    const hoop = Math.min(32, RULES[item.kind].halfWidth * 0.6);
    const baseY = H + 40;

    let extent = 1;
    if (stage === 'rise') extent = easeOut(Math.min(1, progress));
    if (stage === 'back') extent = 1 - Math.min(1, progress);

    const point = (s: number) => {
      if (s > 0.82) {
        const u = (s - 0.82) / 0.18;
        const angle = Math.PI + u * 5.6;
        const radius = hoop * (1 - u * 0.5);
        return { x: tipX + Math.cos(angle) * radius, y: tipY - 12 + Math.sin(angle) * radius };
      }
      const u = s / 0.82;
      const endX = tipX - hoop;
      const endY = tipY - 12;
      const ctrlX = (baseX + endX) / 2 + bend;
      const ctrlY = (baseY + endY) / 2;
      const sway = Math.sin(u * 8 + clock * 7 + seed) * 16 * u * (1 - u) * 2;
      return {
        x: (1 - u) ** 2 * baseX + 2 * u * (1 - u) * ctrlX + u * u * endX + sway,
        y: (1 - u) ** 2 * baseY + 2 * u * (1 - u) * ctrlY + u * u * endY,
      };
    };

    const steps = 110;
    const last = Math.floor(steps * extent);
    const thickness = (s: number) => 26 * (1 - s) ** 0.8 + 4;

    ctx.fillStyle = PINK;
    for (let i = 0; i <= last; i++) {
      const s = i / steps;
      const { x, y } = point(s);
      ctx.beginPath();
      ctx.arc(x, y, thickness(s) / 2 + 1, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = PINK_LIGHT;
    for (let i = 4; i <= last - 2; i += 7) {
      const s = i / steps;
      const { x, y } = point(s);
      const next = point((i + 1) / steps);
      const angle = Math.atan2(next.y - y, next.x - x) + Math.PI / 2;
      const offset = thickness(s) * 0.24;
      ctx.beginPath();
      ctx.arc(x + Math.cos(angle) * offset, y + Math.sin(angle) * offset, thickness(s) * 0.17, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function draw() {
    drawScene();
    if (slick) drawSlick(slick);

    for (const lane of [0, 1, 2]) {
      for (const item of items) if (item.lane === lane) drawItem(item);
    }
    for (const tentacle of tentacles) drawTentacle(tentacle);

    // Le voile d'eau s'efface pendant la marée noire pour qu'elle reste bien noire
    const veil = slick ? 0.04 + 0.26 * (1 - Math.min(1, slick.life)) : 0.3;
    ctx.fillStyle = `rgb(95 194 186 / ${veil})`;
    fillWave(1.2, 0, 16);

    ctx.strokeStyle = 'rgb(255 255 255 / 0.8)';
    ctx.lineWidth = 2;
    for (const ripple of ripples) {
      ctx.globalAlpha = ripple.life / 0.6;
      ctx.beginPath();
      ctx.ellipse(ripple.x, ripple.y, (0.6 - ripple.life) * 60 + 4, (0.6 - ripple.life) * 22 + 2, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    ctx.fillStyle = 'rgb(255 255 255 / 0.9)';
    for (const drop of drops) {
      ctx.beginPath();
      ctx.arc(drop.x, drop.y, 2.6, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.textAlign = 'center';
    ctx.font = "800 28px 'Archivo Variable', sans-serif";
    for (const pop of pops) {
      ctx.globalAlpha = Math.min(1, pop.life * 2);
      ctx.fillStyle = pop.color;
      ctx.fillText(pop.text, Math.max(120, Math.min(W - 120, pop.x)), pop.y);
    }
    ctx.globalAlpha = 1;
  }

  let last = performance.now();
  function frame(now: number) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    update(dt);
    draw();
    requestAnimationFrame(frame);
  }

  canvas.addEventListener('pointerdown', onPointer);
  window.addEventListener('resize', resize);
  for (const button of document.querySelectorAll('[data-play]')) button.addEventListener('click', begin);

  drawLegend();
  resize();
  updateHud();
  requestAnimationFrame(frame);
}
