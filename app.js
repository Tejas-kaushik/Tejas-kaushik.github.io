import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const gsap = window.gsap;
gsap.ticker.lagSmoothing(0);
const $ = (s) => document.querySelector(s);

/* ======================================================================
   Content
   ====================================================================== */
const PROJECTS = [
  {
    id: 'zero-hour', name: 'Zero Hour', chip: 'ZERO HOUR', sub: 'NODE.JS · SSE', year: 2026, gold: true,
    badge: '2nd place · StrathHack26', x: -8, z: -3.8, w: 3.0, d: 2.1,
    kind: 'Multiplayer cyber-security game',
    lede: 'Teams defend a fictional energy company through an overnight cyber attack, answering timed security questions on their phones. 2nd place at StrathHack26 (ScottishPower challenge).',
    image: 'assets/img/zero-hour.png',
    bullets: [
      'Every game rule lives in one pure reducer, so two phones buying at the same moment can never overspend a team\'s budget.',
      'Real-time sync over Server-Sent Events with server-clock countdowns; phones that drop out rejoin where they left off.',
      '360+ node --test tests, including the shared-budget race and path-traversal hardening. Zero dependencies.',
    ],
    tags: ['Node.js', 'Server-Sent Events', 'node:test', 'Zero dependencies'],
    links: [{ label: 'Live demo', href: 'https://team-20-1.onrender.com/' }, { label: 'Code', href: 'https://github.com/Tejas-kaushik/zero-hour', alt: true }],
  },
  {
    id: 'duck-run', name: 'Duck Run', chip: 'DUCK RUN', sub: 'SUPABASE · CANVAS', year: 2026,
    x: -8, z: 0.2, w: 3.0, d: 2.1,
    kind: 'Two-button party game · GUTS hackathon',
    lede: 'Built with a team of five for the JPMC "two buttons max" challenge. Bill the duck races Don Crumbs, a mafia pigeon, and every control is A or D, or the two halves of a phone screen.',
    image: 'assets/img/duck-run.png',
    bullets: [
      'Phones join a room by QR code; rooms sync live through Supabase, with a big-screen spectator mode and a podium.',
      'Story and race start are decided from room history, so every phone in a room starts together.',
      '155 tests and a production build run in GitHub Actions on every push.',
    ],
    tags: ['JavaScript', 'Supabase realtime', 'Vite', 'GitHub Actions'],
    links: [{ label: 'Play it', href: 'https://duck-run-lac.vercel.app/' }, { label: 'Code', href: 'https://github.com/Tejas-kaushik/duck-run', alt: true }],
  },
  {
    id: 'mini-redis', name: 'mini-redis', chip: 'MINI-REDIS', sub: 'C17 · EPOLL', year: 2026,
    x: 8, z: -3.8, w: 3.0, d: 2.1,
    kind: 'Redis-compatible key-value server in C',
    lede: 'Built from scratch on Linux system calls, no third-party libraries. The stock redis-cli and redis-benchmark work against it unmodified.',
    code: '$ redis-benchmark -t get,set -c 10000\n\ninstructions / request\n  before   2,788\n  after    1,668   (perf + callgrind,\n                    seven measured changes)',
    bullets: [
      'Single-threaded epoll event loop, zero-copy RESP2 parser, incrementally rehashed hash table, key expiry, and an append-only file that survives kill -9.',
      'Matches Redis 8 throughput on GET, SET and INCR with 10,000 concurrent clients (persistence off).',
      '39 unit and 72 integration tests, parser fuzzing, a 3M-operation stress test, CI under ASan, UBSan and valgrind.',
    ],
    tags: ['C17', 'Linux', 'epoll', 'perf', 'valgrind', 'ASan / UBSan'],
    links: [],
  },
  {
    id: 'esp32', name: 'ESP32 line follower', chip: 'ESP32-LF', sub: 'FREERTOS · PID', year: 2026,
    x: 8, z: 0.2, w: 3.0, d: 2.1,
    kind: 'Autonomous robot · dual-core real-time firmware',
    lede: 'Built from discrete components, not a kit, with dual-core FreeRTOS firmware and a live Wi-Fi tuning dashboard.',
    fig: ['200 Hz', 'PID loop, held flat under sustained Wi-Fi load'],
    bullets: [
      'The PID loop runs as a hard-real-time task pinned to its own core, with mutex-guarded shared state, so network traffic cannot jitter it.',
      'An async WebSocket server on the ESP32 streams sensor, PID and motor metrics; gains change live, so a rebuild-and-reflash cycle became an instant update.',
      'Measured and linearised motor dead-band, adaptive corner slowdown, sensor autocalibration persisted to flash.',
    ],
    tags: ['C++', 'FreeRTOS', 'ESP32', 'WebSocket', 'PID control'],
    links: [{ label: 'Code', href: 'https://github.com/Tejas-kaushik/esp32-line-follower' }],
  },
  {
    id: 'friday', name: 'F.R.I.D.A.Y.', chip: 'F.R.I.D.A.Y.', sub: 'PYTHON · MCP', year: 2026,
    x: -4, z: -4.6, w: 2.4, d: 1.6,
    kind: 'Local voice assistant',
    lede: 'A voice assistant engineered around one latency budget: the first sound back within a second of you finishing your sentence.',
    fig: ['< 1 s', 'from the end of your sentence to the first sound back'],
    bullets: [
      'Fully local voice loop: WebRTC VAD, faster-whisper speech to text, an LLM, then Piper text to speech, with every stage measured.',
      'Tools served over the Model Context Protocol (weather, news, web search, system state), plus an async deep-analysis job so it keeps talking while it thinks.',
      '17 of 17 on its own evaluation harness.',
    ],
    tags: ['Python', 'faster-whisper', 'Piper TTS', 'MCP'],
    links: [{ label: 'Code', href: 'https://github.com/Tejas-kaushik/Friday-AI-Assistant-' }],
  },
  {
    id: 'trace', name: 'Transient Trace Analyzer', chip: 'TRACE-AN', sub: 'PYTHON · PYTEST', year: 2025,
    x: 4, z: -4.6, w: 2.4, d: 1.6,
    kind: 'Oscilloscope measurement tool',
    lede: 'A CLI that turns oscilloscope time and voltage CSVs into RC time constants and RLC damping and frequency, by automated peak detection. It replaced a manual measurement workflow.',
    image: 'assets/img/tta-rlc-plot.png',
    bullets: [
      'An installable package (io, models, signals, report) with a pytest suite and GitHub Actions CI on every push and pull request.',
      'Writes annotated plots, a markdown report and machine-readable metrics. The scope on this board runs the same maths.',
    ],
    tags: ['Python', 'NumPy', 'pytest', 'GitHub Actions'],
    links: [{ label: 'Code', href: 'https://github.com/Tejas-kaushik/transient-trace-analyzer' }],
  },
  {
    id: 'ppg', name: 'Heart-rate monitor', chip: 'PPG-HRM', sub: 'ORCAD · FIRMWARE', year: 2025,
    x: 4, z: 4.6, w: 2.4, d: 1.6,
    kind: 'Embedded firmware with a custom PCB',
    lede: 'The full photoplethysmography chain, end to end: analogue acquisition, filtering, beat detection and live BPM on an LCD and an LED matrix.',
    fig: ['BPM', 'from the analogue front end to an LED matrix'],
    bullets: [
      'Schematic capture and PCB layout in OrCAD, then board bring-up.',
      'Validated against a DAC-generated reference waveform on an oscilloscope.',
    ],
    tags: ['Embedded C', 'OrCAD', 'Analogue filtering', 'PCB bring-up'],
    links: [],
  },
  {
    id: 'recipes', name: 'Find My Recipes', chip: 'RECIPES', sub: 'DJANGO · TEAM OF 4', year: 2026,
    x: -8, z: 4.2, w: 2.4, d: 1.6,
    kind: 'Django web app, team of four',
    lede: 'Recipe discovery and creation, including a "Surprise Me" ingredient matcher with a Bootstrap and AJAX front end.',
    fig: ['4', 'people, and the test suite was mine'],
    bullets: [
      'Wrote the team\'s automated tests: model, view and smoke tests.',
      'Delivered through feature branches, pull requests and peer code review.',
    ],
    tags: ['Django', 'Python', 'Bootstrap', 'AJAX'],
    links: [{ label: 'Code', href: 'https://github.com/HibaBaig/find_my_recipe_team_3A' }],
  },
  {
    id: 'stramont', name: 'The Stramont', chip: 'STRAMONT', sub: 'CLIENT · WEB', year: 2026,
    x: -4, z: 4.6, w: 2.4, d: 1.6,
    kind: 'Café website, freelance client work',
    lede: 'Commissioned by a Glasgow café owner: a multi-page HTML, CSS and JavaScript site built to their brief, with an embedded OpenStreetMap location view.',
    fig: ['1', 'real client, in Glasgow'],
    bullets: ['Took a brief from a real business owner to a finished, multi-page site.'],
    tags: ['HTML', 'CSS', 'JavaScript', 'OpenStreetMap'],
    links: [],
  },
];

const ABOUT = {
  lede: 'Third-year BEng Electronics and Software Engineering at the University of Glasgow. I build the whole path a signal takes: the analogue front end and the board, the firmware that samples it, the server it reaches and the tools that check every step.',
  facts: [['Based in', 'Glasgow, UK'], ['Studying', 'BEng (Hons) ESE, 2024 to 2028'], ['Looking for', 'Summer 2027 placement'], ['Work', 'Right to work in the UK']],
  record: [
    ['2nd place, StrathHack26', '2026'],
    ['Summer Engineering Intern, Technology Business Incubator, GEHU', '2026'],
    ['Brand Ambassador, Domino\'s: 5,000+ sign-ups in a day', '2025'],
    ['Creative Director, GU Indian Society', '2025'],
    ['Events Coordinator, INSA Society', '2024'],
    ['Gold, National Volleyball Championship', '2022'],
  ],
  layers: [
    ['Signal and board', 'OrCAD schematic and PCB layout, PSpice, oscilloscope and logic analyser'],
    ['Firmware', 'FreeRTOS on ESP32, ARM Cortex-M, PWM, ADC, interrupts, UART, SPI, I²C'],
    ['Systems', 'C17 on Linux, epoll and syscalls, gdb, valgrind, perf, ASan, UBSan'],
    ['Network', 'TCP/IP, WebSocket and HTTP servers, Server-Sent Events, realtime rooms'],
    ['Application and tooling', 'Python, pytest, Node.js, React, Django, Git, GitHub Actions'],
  ],
  intern: 'At the incubator (summer 2026) I built a networked air-quality monitor with a live web dashboard, from breadboard to working demonstrator, and prototyped a 3D-printed 4-DOF robotic arm with its control firmware.',
};
const CONTACT = {
  email: 'tejaskaushik04@gmail.com',
  linkedin: 'https://www.linkedin.com/in/tejas-kaushik-62435b405',
  github: 'https://github.com/Tejas-kaushik',
};

/* ======================================================================
   Preferences: motion and sound
   ====================================================================== */
const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { /* private mode */ } },
};
const forced = /[?&]motion=full\b/.test(location.search);
// Full motion by default; the Motion button switches to a calm version and remembers it.
let motionFull = forced ? true : store.get('motion') ? store.get('motion') === 'full' : true;
let soundOn = store.get('sound') !== 'off';
const dur = (s) => (motionFull ? s : Math.min(s, 0.35));

const audio = {
  ctx: null,
  ensure() {
    if (!this.ctx) { try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch { /* none */ } }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  },
  tone(freq, len = 0.06, type = 'sine', gain = 0.04, slideTo) {
    if (!soundOn || !this.ctx) return;
    const t = this.ctx.currentTime, o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + len);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + len);
    o.connect(g).connect(this.ctx.destination); o.start(t); o.stop(t + len + 0.02);
  },
  hover() { this.tone(1320, 0.05, 'sine', 0.025); },
  click() { this.tone(660, 0.07, 'square', 0.03); setTimeout(() => this.tone(990, 0.08, 'square', 0.025), 60); },
  tick() { this.tone(2400, 0.02, 'square', 0.012); },
  power() { this.tone(55, 1.1, 'sawtooth', 0.05, 220); setTimeout(() => this.tone(880, 0.25, 'sine', 0.04, 1760), 700); },
  key() { this.tone(1800 + Math.random() * 400, 0.015, 'square', 0.008); },
};

/* ======================================================================
   Renderer, scene, camera
   ====================================================================== */
const canvas = $('#scene');
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
} catch (e) {
  location.replace('classic.html');
  throw e;
}
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.9;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const BG = new THREE.Color('#050607');
const scene = new THREE.Scene();
scene.background = BG;
scene.fog = new THREE.Fog(BG, 48, 95);
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

const camera = new THREE.PerspectiveCamera(34, innerWidth / innerHeight, 0.1, 200);
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.07;
controls.enablePan = false;
controls.rotateSpeed = 0.55;
controls.zoomSpeed = 0.7;
controls.minPolarAngle = 0.12;
controls.maxPolarAngle = 1.12;
controls.minAzimuthAngle = -0.75;
controls.maxAzimuthAngle = 0.75;
controls.enabled = false;

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth / 2, innerHeight / 2), 0.7, 0.45, 1.0);
composer.addPass(bloom);
composer.addPass(new OutputPass());

// Lights: a warm key with shadows, a cool rim, and a pool of light on the desk
scene.add(new THREE.HemisphereLight('#9fb8ad', '#050607', 0.3));
const key = new THREE.DirectionalLight('#fff4e6', 1.5);
key.position.set(7, 16, 9);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
Object.assign(key.shadow.camera, { left: -15, right: 15, top: 10, bottom: -10, near: 1, far: 50 });
key.shadow.bias = -0.0004;
key.shadow.radius = 4;
scene.add(key);
const rim = new THREE.DirectionalLight('#7fe9ff', 0.9);
rim.position.set(-10, 6, -12);
scene.add(rim);
const pool = new THREE.SpotLight('#cfe9dc', 0.9, 0, 0.62, 0.9, 0);
pool.position.set(0, 26, 4);
pool.target.position.set(0, 0, 0);
scene.add(pool, pool.target);

/* ======================================================================
   Helpers: canvas textures and routing
   ====================================================================== */
const MAX_ANISO = renderer.capabilities.getMaxAnisotropy();
function canvasTexture(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d');
  draw(ctx, w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = MAX_ANISO;
  return t;
}
function fitFont(ctx, text, maxW, size, weight, family) {
  let s = size;
  do { ctx.font = `${weight} ${s}px ${family}`; s -= 2; } while (ctx.measureText(text).width > maxW && s > 8);
}
const SANS = '"Space Grotesk", system-ui, sans-serif';
const MONO = '"JetBrains Mono", ui-monospace, monospace';

function route(A, B, axis = 'x') {
  const sw = (p) => ({ x: p.z, z: p.x });
  if (axis === 'z') return route(sw(A), sw(B), 'x').map(sw);
  const dx = B.x - A.x, dz = B.z - A.z, s = Math.sign(dx) || 1, sz = Math.sign(dz) || 1;
  const adx = Math.abs(dx), adz = Math.abs(dz);
  if (adz < 1e-4) return [A, B];
  if (adz <= adx) {
    const L1 = (adx - adz) / 2;
    return [A, { x: A.x + s * L1, z: A.z }, { x: A.x + s * (L1 + adz), z: B.z }, B];
  }
  const h = Math.min(0.3, adx / 4), diag = adx - 2 * h;
  return [A, { x: A.x + s * h, z: A.z }, { x: A.x + s * h, z: B.z - sz * diag }, { x: B.x - s * h, z: B.z }, B];
}
function offsetLine(pts, off) {
  const n = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const dx = pts[i + 1].x - pts[i].x, dz = pts[i + 1].z - pts[i].z, l = Math.hypot(dx, dz) || 1;
    n.push({ x: -dz / l, z: dx / l });
  }
  return pts.map((p, i) => {
    if (i === 0) return { x: p.x + n[0].x * off, z: p.z + n[0].z * off };
    if (i === pts.length - 1) return { x: p.x + n[i - 1].x * off, z: p.z + n[i - 1].z * off };
    let mx = n[i - 1].x + n[i].x, mz = n[i - 1].z + n[i].z;
    const ml = Math.hypot(mx, mz) || 1; mx /= ml; mz /= ml;
    const k = off / Math.max(0.3, mx * n[i].x + mz * n[i].z);
    return { x: p.x + mx * k, z: p.z + mz * k };
  });
}
function measure(pts) {
  const acc = [0];
  for (let i = 1; i < pts.length; i++) acc.push(acc[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].z - pts[i - 1].z));
  return acc;
}
function pointAt(pts, acc, d, out) {
  const L = acc[acc.length - 1];
  d = Math.max(0, Math.min(L, d));
  let i = 1;
  while (i < acc.length - 1 && acc[i] < d) i++;
  const t = (d - acc[i - 1]) / ((acc[i] - acc[i - 1]) || 1);
  out.x = pts[i - 1].x + (pts[i].x - pts[i - 1].x) * t;
  out.z = pts[i - 1].z + (pts[i].z - pts[i - 1].z) * t;
  return out;
}
let seed = 26;
const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

/* ======================================================================
   The board
   ====================================================================== */
const BOARD = { w: 24, d: 14, t: 0.24 };
// On a portrait screen the board is laid out transposed (tall), so chip labels stay upright.
const PORTRAIT = innerWidth / innerHeight < 0.95;
if (PORTRAIT) { BOARD.w = 14; BOARD.d = 24; }
const T = (x, z) => (PORTRAIT ? { x: z, z: x } : { x, z });
const AX = (a) => (PORTRAIT ? (a === 'x' ? 'z' : 'x') : a);
PROJECTS.forEach((p) => { const t = T(p.x, p.z); p.bx = t.x; p.bz = t.z; });
const HOLES = [[-11.3, -6.3], [11.3, -6.3], [-11.3, 6.3], [11.3, 6.3]].map(([x, z]) => T(x, z));
const world = new THREE.Group();   // portrait rotation lives here
const tilt = new THREE.Group();    // pointer parallax lives here
world.add(tilt);
scene.add(world);

const M = {
  chip: new THREE.MeshStandardMaterial({ color: '#141617', roughness: 0.42, metalness: 0.2, envMapIntensity: 0.5 }),
  pin: new THREE.MeshStandardMaterial({ color: '#d8dcdc', roughness: 0.25, metalness: 1 }),
  copper: new THREE.MeshStandardMaterial({ color: '#b9853a', roughness: 0.45, metalness: 1, envMapIntensity: 0.55 }),
  gold: new THREE.MeshStandardMaterial({ color: '#d5a650', roughness: 0.3, metalness: 1, envMapIntensity: 0.7 }),
  steel: new THREE.MeshStandardMaterial({ color: '#b9bec2', roughness: 0.32, metalness: 1, envMapIntensity: 0.7 }),
  black: new THREE.MeshStandardMaterial({ color: '#0d0f10', roughness: 0.6 }),
  glow: () => new THREE.MeshBasicMaterial({ color: new THREE.Color(0.55, 2.4, 1.4), transparent: true, opacity: 0, depthWrite: false }),
};

const items = [];      // everything the pointer can hit
const leds = [];
const glowSets = {};   // per project: trace glow mesh + pad
const paths = [];      // every pulse path
const occupied = [];   // rects for scattering parts

function boardTexture() {
  const S = 100;
  return canvasTexture(BOARD.w * S, BOARD.d * S, (c, W, H) => {
    c.fillStyle = '#0c4430'; c.fillRect(0, 0, W, H);
    // copper pour shimmer under the mask
    for (let i = 0; i < 2600; i++) {
      c.fillStyle = `rgba(30, 110, 76, ${0.05 + rand() * 0.08})`;
      c.fillRect(rand() * W, rand() * H, 2 + rand() * 3, 2 + rand() * 3);
    }
    // via grid
    c.fillStyle = 'rgba(160, 220, 190, 0.10)';
    for (let x = 25; x < W; x += 50) for (let y = 25; y < H; y += 50) { c.beginPath(); c.arc(x, y, 2.2, 0, 7); c.fill(); }
    const toPx = (x, z) => [(x + BOARD.w / 2) * S, (z + BOARD.d / 2) * S];
    c.strokeStyle = 'rgba(235, 245, 238, 0.75)'; c.fillStyle = 'rgba(235, 245, 238, 0.82)'; c.lineWidth = 3;
    // silkscreen outlines and designators
    PROJECTS.forEach((p, i) => {
      const [x, y] = toPx(p.bx - p.w / 2 - 0.28, p.bz - p.d / 2 - 0.28);
      c.strokeRect(x, y, (p.w + 0.56) * S, (p.d + 0.56) * S);
      c.font = `700 30px ${MONO}`;
      c.fillText(`U${i + 2}`, x, y - 10);
    });
    let [cx, cy] = toPx(-2.25, -2.25);
    c.strokeRect(cx, cy, 4.5 * S, 4.5 * S);
    c.font = `700 30px ${MONO}`; c.fillText('U1  CPU', cx, cy - 10);
    // edge text
    c.font = `700 44px ${MONO}`;
    c.fillText('TK-01 · PCB TO SERVER · REV 2026', 70, H - 60);
    c.font = `400 30px ${MONO}`;
    c.fillText('DESIGNED IN GLASGOW · UNIVERSITY OF GLASGOW · BENG ESE', 70, H - 22);
    c.textAlign = 'right';
    c.fillText('OPEN TO SUMMER 2027 PLACEMENTS', W - 70, 60);
    // connector labels
    const label = (t, x, z) => { const q = T(x, z); const [px, py] = toPx(q.x, q.z); c.textAlign = 'center'; c.font = `700 30px ${MONO}`; c.fillText(t, px, py); };
    label('GITHUB', 7.4, 4.75); label('LINKEDIN', 10.0, 5.6); label('EMAIL', 7.6, 2.95); label('CLK', -0.9, -5.95); label('16 MHz', 1.0, -5.75);
    label('SCOPE  CH1', 0, 3.45);
    // mounting hole rings
    c.strokeStyle = 'rgba(235,245,238,0.6)'; c.lineWidth = 4;
    HOLES.forEach(({ x, z }) => { const [px, py] = toPx(x, z); c.beginPath(); c.arc(px, py, 34, 0, 7); c.stroke(); });
  });
}

function chipTop(p, wPx, hPx) {
  return canvasTexture(wPx, hPx, (c, W, H) => {
    if (p.gold) {
      c.fillStyle = '#b48536'; c.fillRect(0, 0, W, H);
      c.fillStyle = 'rgba(255,240,200,0.18)'; c.fillRect(0, 0, W, H * 0.5);
    } else {
      c.fillStyle = '#16191a'; c.fillRect(0, 0, W, H);
      for (let i = 0; i < 900; i++) { c.fillStyle = `rgba(255,255,255,${rand() * 0.025})`; c.fillRect(rand() * W, rand() * H, 2, 2); }
    }
    const ink = p.gold ? '#2a1a05' : '#c9d0cc', soft = p.gold ? 'rgba(42,26,5,0.7)' : 'rgba(223,229,225,0.55)';
    c.fillStyle = p.gold ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.12)';
    c.beginPath(); c.arc(H * 0.13, H * 0.14, H * 0.055, 0, 7); c.fill();
    const pad = W * 0.08;
    c.fillStyle = ink; c.textBaseline = 'alphabetic';
    fitFont(c, p.chip, W - pad * 2, Math.round(H * 0.3), 700, SANS);
    c.fillText(p.chip, pad, H * 0.55);
    c.fillStyle = soft;
    fitFont(c, p.sub, W - pad * 2, Math.round(H * 0.11), 400, MONO);
    c.fillText(p.sub, pad, H * 0.75);
    c.textAlign = 'right';
    c.font = `400 ${Math.round(H * 0.1)}px ${MONO}`;
    c.fillText(p.badge ? '2ND · ' + p.year : String(p.year), W - pad, H * 0.9);
  });
}

function addPins(group, w, d, h) {
  const spacing = 0.2, pinGeo = new THREE.BoxGeometry(0.07, 0.04, 0.22);
  const nx = Math.max(2, Math.floor((w - 0.3) / spacing)), nz = Math.max(2, Math.floor((d - 0.3) / spacing));
  const mesh = new THREE.InstancedMesh(pinGeo, M.pin, 2 * nx + 2 * nz);
  const o = new THREE.Object3D(); let k = 0;
  for (let i = 0; i < nx; i++) {
    const x = -((nx - 1) * spacing) / 2 + i * spacing;
    for (const sz of [-1, 1]) { o.position.set(x, 0.02, sz * (d / 2 + 0.09)); o.rotation.set(0, 0, 0); o.updateMatrix(); mesh.setMatrixAt(k++, o.matrix); }
  }
  for (let i = 0; i < nz; i++) {
    const z = -((nz - 1) * spacing) / 2 + i * spacing;
    for (const sx of [-1, 1]) { o.position.set(sx * (w / 2 + 0.09), 0.02, z); o.rotation.set(0, Math.PI / 2, 0); o.updateMatrix(); mesh.setMatrixAt(k++, o.matrix); }
  }
  mesh.castShadow = true;
  group.add(mesh);
}

function makeChip(p, h = 0.34) {
  const g = new THREE.Group();
  g.position.set(p.bx ?? p.x, 0, p.bz ?? p.z);
  const S = 240;
  const top = new THREE.MeshStandardMaterial({ map: chipTop(p, Math.round(p.w * S), Math.round(p.d * S)), roughness: p.gold ? 0.3 : 0.5, metalness: p.gold ? 0.9 : 0.15 });
  const side = p.gold ? M.gold : M.chip;
  const body = new THREE.Mesh(new THREE.BoxGeometry(p.w, h, p.d), [side, side, top, side, side, side]);
  body.position.y = h / 2 + 0.03;
  body.castShadow = true; body.receiveShadow = true;
  const lift = new THREE.Group();
  lift.add(body);
  addPins(lift, p.w, p.d, h);
  g.add(lift);
  const pad = new THREE.Mesh(new THREE.PlaneGeometry(p.w + 0.9, p.d + 0.9), M.glow());
  pad.rotation.x = -Math.PI / 2; pad.position.y = 0.012;
  g.add(pad);
  tilt.add(g);
  occupied.push({ x: p.bx ?? p.x, z: p.bz ?? p.z, w: p.w + 1.2, d: p.d + 1.2 });
  return { group: g, lift, body, pad };
}

function buildBoard() {
  // the board itself, on four brass standoffs above a dark desk
  const tex = boardTexture();
  const edge = new THREE.MeshStandardMaterial({ color: '#0a3524', roughness: 0.7 });
  const top = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.62, metalness: 0.05, envMapIntensity: 0.35 });
  const board = new THREE.Mesh(new THREE.BoxGeometry(BOARD.w, BOARD.t, BOARD.d), [edge, edge, top, edge, edge, edge]);
  board.position.y = -BOARD.t / 2;
  board.receiveShadow = true; board.castShadow = true;
  tilt.add(board);
  HOLES.forEach(({ x, z }) => {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.07, 10, 28), M.gold);
    ring.rotation.x = Math.PI / 2; ring.position.set(x, 0.01, z); tilt.add(ring);
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 1.1, 12), M.gold);
    leg.position.set(x, -0.8, z); leg.castShadow = true; tilt.add(leg);
  });
  const desk = new THREE.Mesh(new THREE.PlaneGeometry(160, 160), new THREE.MeshStandardMaterial({ color: '#0b0d0d', roughness: 0.92 }));
  desk.rotation.x = -Math.PI / 2; desk.position.y = -1.35; desk.receiveShadow = true;
  world.add(desk);

  // CPU: the identity chip
  const cpu = { id: 'about', chip: 'TEJAS KAUSHIK', x: 0, z: 0, w: 3.8, d: 3.8 };
  const cpuTex = canvasTexture(960, 960, (c, W, H) => {
    c.fillStyle = '#16191a'; c.fillRect(0, 0, W, H);
    const lid = c.createLinearGradient(0, 0, W, H);
    lid.addColorStop(0, '#d9dde0'); lid.addColorStop(0.5, '#a9b0b4'); lid.addColorStop(1, '#cfd4d7');
    c.fillStyle = lid; c.fillRect(W * 0.1, H * 0.1, W * 0.8, H * 0.8);
    c.fillStyle = '#1b1f21';
    c.font = `700 92px ${SANS}`; c.fillText('TEJAS', W * 0.17, H * 0.36);
    c.fillText('KAUSHIK', W * 0.17, H * 0.47);
    c.font = `400 36px ${MONO}`; c.fillStyle = '#3a4246';
    c.fillText('PCB → SERVER', W * 0.17, H * 0.6);
    c.fillText('BENG ESE · GLASGOW', W * 0.17, H * 0.67);
    c.fillText('YEAR 3 · 2026/27', W * 0.17, H * 0.74);
    c.font = `700 30px ${MONO}`; c.fillStyle = '#0d6b46';
    c.fillText('● OPEN TO SUMMER 2027', W * 0.17, H * 0.84);
  });
  const cpuChip = makeChip({ ...cpu, sub: '', year: '' }, 0.42);
  cpuChip.body.material[2] = new THREE.MeshStandardMaterial({ map: cpuTex, roughness: 0.35, metalness: 0.55 });
  items.push({ ...cpuChip, kind: 'about', title: 'Tejas Kaushik', note: 'About me, my record and my stack' });

  // project chips and their buses back to the CPU.
  // Routes are drawn in landscape space and mapped through T(), so portrait gets the same wiring, transposed.
  const TP = (pts) => pts.map((q) => T(q.x, q.z));
  const copperSegs = [];
  PROJECTS.forEach((p) => {
    const chip = makeChip(p);
    const left = p.x < 0, sx = left ? -1 : 1;
    const half = PORTRAIT ? p.d / 2 : p.w / 2;   // the chip's extent along the route
    const A = { x: sx * 1.9, z: Math.max(-1.3, Math.min(1.3, p.z * 0.3)) };
    const B = { x: p.x - sx * (half + 0.2), z: p.z };
    const centre = TP(route(A, B, 'x'));
    const segs = [];
    [-0.24, 0, 0.24].forEach((off, k) => {
      const pts = offsetLine(centre, off);
      segs.push(pts);
      copperSegs.push(pts);
      paths.push({ pts, acc: measure(pts), project: p.id, speed: 2.4 + k * 0.35, phase: rand(), count: 1 });
    });
    const glowMesh = traceMesh(segs, null, 0.13, 0.03);
    tilt.add(glowMesh);
    glowSets[p.id] = { trace: glowMesh, pad: chip.pad, lift: chip.lift };
    items.push({ ...chip, kind: 'project', project: p, title: p.name, note: p.kind });

    // short escape traces off the far side to vias
    for (const off of [-0.45, 0, 0.45]) {
      const s0 = { x: p.x + sx * (half + 0.2), z: p.z + off };
      const len = 0.7 + rand() * 0.8, bend = (rand() > 0.5 ? 1 : -1) * 0.35;
      const raw = [s0, { x: s0.x + sx * len, z: s0.z }, { x: s0.x + sx * (len + Math.abs(bend)), z: s0.z + bend }];
      const pts = TP(raw);
      if (Math.abs(raw[2].x) < 11.6) { copperSegs.push(pts); vias.push(pts[2]); if (rand() > 0.4) paths.push({ pts, acc: measure(pts), speed: 1.4, phase: rand(), count: 1 }); }
    }
  });

  // system traces: CPU to the CLK knob, the crystal and the scope
  const sys = [
    route({ x: -0.6, z: -1.9 }, { x: -0.9, z: -4.45 }, 'z'),
    route({ x: 0.6, z: -1.9 }, { x: 1.0, z: -4.65 }, 'z'),
    route({ x: 0, z: 1.9 }, { x: 0, z: 3.7 }, 'z'),
    route({ x: 1.2, z: 1.9 }, { x: 1.5, z: 3.7 }, 'z'),
    route({ x: -1.2, z: 1.9 }, { x: -1.5, z: 3.7 }, 'z'),
  ].map(TP);
  sys.forEach((pts) => { copperSegs.push(pts); paths.push({ pts, acc: measure(pts), speed: 2, phase: rand(), count: 1 }); });

  // perimeter buses with traffic
  for (const off of [-0.18, 0, 0.18]) {
    const pts = TP([{ x: -10.4, z: -6.55 + off }, { x: 10.4, z: -6.55 + off }]);
    copperSegs.push(pts);
    paths.push({ pts, acc: measure(pts), speed: 3 + rand(), phase: rand(), count: 2 });
  }
  for (const off of [-0.18, 0, 0.18]) {
    const pts = TP([{ x: 11.2 + off, z: -5.6 }, { x: 11.2 + off, z: 2.4 }]);
    copperSegs.push(pts);
    paths.push({ pts, acc: measure(pts), speed: 3 + rand(), phase: rand(), count: 2 });
  }

  tilt.add(traceMesh(copperSegs, M.copper, 0.075, 0.018));
  addVias();
  addParts();
  addConnectors();
  addKnob();
  addCrystal();
  addScope();
  addLeds();
  addPulses();
}

const vias = [];
function traceMesh(lines, material, width, y) {
  let n = 0; lines.forEach((l) => (n += l.length - 1));
  const mat = material || M.glow();
  const mesh = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 0.02, width), mat, n);
  const o = new THREE.Object3D(); let k = 0;
  lines.forEach((pts) => {
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i], b = pts[i + 1], len = Math.hypot(b.x - a.x, b.z - a.z);
      o.position.set((a.x + b.x) / 2, y, (a.z + b.z) / 2);
      o.rotation.set(0, -Math.atan2(b.z - a.z, b.x - a.x), 0);
      o.scale.set(len + width, 1, 1);
      o.updateMatrix(); mesh.setMatrixAt(k++, o.matrix);
    }
  });
  mesh.receiveShadow = !!material;
  return mesh;
}

function addVias() {
  const geo = new THREE.CylinderGeometry(0.085, 0.085, 0.03, 14);
  const mesh = new THREE.InstancedMesh(geo, M.gold, vias.length);
  const o = new THREE.Object3D();
  vias.forEach((v, i) => { o.position.set(v.x, 0.02, v.z); o.updateMatrix(); mesh.setMatrixAt(i, o.matrix); });
  tilt.add(mesh);
}

function free(x, z, r) {
  if (Math.abs(x) > BOARD.w / 2 - 0.8 || Math.abs(z) > BOARD.d / 2 - 0.9) return false;
  if (Math.abs(x) < 2.6 && Math.abs(z) < 2.6) return false;
  for (const o of occupied) if (Math.abs(x - o.x) < o.w / 2 + r && Math.abs(z - o.z) < o.d / 2 + r) return false;
  for (const p of paths) for (let i = 0; i < p.pts.length - 1; i++) {
    const a = p.pts[i], b = p.pts[i + 1], dx = b.x - a.x, dz = b.z - a.z, L = dx * dx + dz * dz || 1;
    const t = Math.max(0, Math.min(1, ((x - a.x) * dx + (z - a.z) * dz) / L));
    if (Math.hypot(x - (a.x + dx * t), z - (a.z + dz * t)) < r + 0.12) return false;
  }
  return true;
}
function addParts() {
  const res = new THREE.InstancedMesh(new THREE.BoxGeometry(0.34, 0.1, 0.17), new THREE.MeshStandardMaterial({ color: '#1c1c1c', roughness: 0.5 }), 90);
  const cap = new THREE.InstancedMesh(new THREE.BoxGeometry(0.3, 0.14, 0.16), new THREE.MeshStandardMaterial({ color: '#a4834f', roughness: 0.6 }), 70);
  const ends = new THREE.InstancedMesh(new THREE.BoxGeometry(0.08, 0.11, 0.18), M.steel, 320);
  const o = new THREE.Object3D(); let r = 0, c = 0, e = 0, guard = 0;
  while ((r < 90 || c < 70) && guard++ < 6000) {
    const x = (rand() - 0.5) * (BOARD.w - 1.6), z = (rand() - 0.5) * (BOARD.d - 1.6);
    if (!free(x, z, 0.25)) continue;
    const rot = rand() > 0.5 ? 0 : Math.PI / 2;
    o.position.set(x, 0.06, z); o.rotation.set(0, rot, 0); o.scale.set(1, 1, 1); o.updateMatrix();
    const isRes = r < 90 && (c >= 70 || rand() > 0.45);
    if (isRes) res.setMatrixAt(r++, o.matrix); else cap.setMatrixAt(c++, o.matrix);
    for (const s of [-1, 1]) {
      if (e >= 320) break;
      const half = isRes ? 0.17 : 0.15;
      o.position.set(x + Math.cos(rot) * s * half, 0.06, z - Math.sin(rot) * s * half); o.updateMatrix(); ends.setMatrixAt(e++, o.matrix);
    }
    occupied.push({ x, z, w: 0.5, d: 0.5 });
  }
  res.count = r; cap.count = c; ends.count = e;
  [res, cap, ends].forEach((m) => { m.castShadow = true; tilt.add(m); });
  // a few electrolytic caps for silhouette
  const can = new THREE.MeshStandardMaterial({ color: '#1d2c52', roughness: 0.4, metalness: 0.3 });
  let placed = 0; guard = 0;
  while (placed < 7 && guard++ < 3000) {
    const x = (rand() - 0.5) * (BOARD.w - 3), z = (rand() - 0.5) * (BOARD.d - 2.5);
    if (!free(x, z, 0.45)) continue;
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.7, 28), can); body.position.y = 0.35;
    const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.02, 28), M.steel); lid.position.y = 0.71;
    body.castShadow = true; g.add(body, lid); g.position.set(x, 0, z); tilt.add(g);
    occupied.push({ x, z, w: 1, d: 1 }); placed++;
  }
}

function addConnectors() {
  // RJ45 for GitHub
  const rj = new THREE.Group(); const qr = T(7.4, 5.85); rj.position.set(qr.x, 0, qr.z);
  const shell = new THREE.Mesh(new RoundedBoxGeometry(1.6, 1.25, 1.7, 3, 0.06), M.steel);
  shell.position.y = 0.63; shell.castShadow = true;
  const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.75, 0.05), M.black); mouth.position.set(0, 0.55, 0.86);
  const ledA = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.12, 0.04), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.4, 2.6, 0.9) }));
  ledA.position.set(-0.55, 1.05, 0.86);
  const lift = new THREE.Group(); lift.add(shell, mouth, ledA); rj.add(lift);
  leds.push({ mesh: ledA, base: new THREE.Color(0.4, 2.6, 0.9), rate: 7, phase: 0.3 });
  tilt.add(rj);
  items.push({ group: rj, lift, body: shell, kind: 'link', href: CONTACT.github, title: 'GitHub', note: 'github.com/Tejas-kaushik' });
  occupied.push({ x: qr.x, z: qr.z, w: 2.2, d: 2.2 });

  // USB-C for LinkedIn
  const usb = new THREE.Group(); const qu = T(10.0, 6.45); usb.position.set(qu.x, 0, qu.z);
  const u = new THREE.Mesh(new RoundedBoxGeometry(1.0, 0.36, 0.85, 4, 0.15), M.steel); u.position.y = 0.2; u.castShadow = true;
  const ul = new THREE.Group(); ul.add(u); usb.add(ul); tilt.add(usb);
  items.push({ group: usb, lift: ul, body: u, kind: 'link', href: CONTACT.linkedin, title: 'LinkedIn', note: 'Connect with me' });
  occupied.push({ x: qu.x, z: qu.z, w: 1.6, d: 1.4 });

  // pin header for email
  const hdr = new THREE.Group(); const qh = T(7.6, 3.5); hdr.position.set(qh.x, 0, qh.z);
  const base = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.22, 0.52), M.black); base.position.y = 0.11; base.castShadow = true;
  const hl = new THREE.Group(); hl.add(base);
  const pins = new THREE.InstancedMesh(new THREE.BoxGeometry(0.06, 0.6, 0.06), M.gold, 12);
  const o = new THREE.Object3D();
  for (let i = 0; i < 12; i++) { o.position.set(-0.625 + (i % 6) * 0.25, 0.4, i < 6 ? -0.12 : 0.12); o.updateMatrix(); pins.setMatrixAt(i, o.matrix); }
  hl.add(pins); hdr.add(hl); tilt.add(hdr);
  items.push({ group: hdr, lift: hl, body: base, kind: 'contact', title: 'Email', note: CONTACT.email });
  occupied.push({ x: qh.x, z: qh.z, w: 2, d: 2 });
}

// CLK knob: a potentiometer you can turn
const knob = { angle: 0, value: 1, mesh: null };
function addKnob() {
  const g = new THREE.Group(); const qk = T(-0.9, -5.0); g.position.set(qk.x, 0, qk.z);
  const base = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.3, 1.1), new THREE.MeshStandardMaterial({ color: '#1f4fa0', roughness: 0.45 }));
  base.position.y = 0.15; base.castShadow = true;
  const turn = new THREE.Group(); turn.position.y = 0.3;
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.46, 0.5, 40), M.steel); cap.position.y = 0.25; cap.castShadow = true;
  const ridges = new THREE.InstancedMesh(new THREE.BoxGeometry(0.05, 0.46, 0.06), M.steel, 24);
  const o = new THREE.Object3D();
  for (let i = 0; i < 24; i++) { const a = (i / 24) * Math.PI * 2; o.position.set(Math.cos(a) * 0.45, 0.25, Math.sin(a) * 0.45); o.rotation.set(0, -a, 0); o.updateMatrix(); ridges.setMatrixAt(i, o.matrix); }
  const mark = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.02, 0.32), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.6, 2.6, 1.5) }));
  mark.position.set(0, 0.51, -0.2);
  turn.add(cap, ridges, mark);
  const lift = new THREE.Group(); lift.add(base, turn); g.add(lift); tilt.add(g);
  knob.mesh = turn;
  items.push({ group: g, lift, body: cap, kind: 'knob', title: 'CLK', note: 'Drag sideways or scroll to change the clock' });
  occupied.push({ x: qk.x, z: qk.z, w: 1.6, d: 1.6 });
}
function setClock(v, fromUser) {
  const prev = knob.value;
  knob.value = Math.max(0.25, Math.min(3, v));
  knob.angle = ((knob.value - 0.25) / 2.75) * Math.PI * 1.6 - Math.PI * 0.8;
  if (knob.mesh) knob.mesh.rotation.y = -knob.angle;
  $('#clk-read').innerHTML = `CLK <b>${(knob.value * 16).toFixed(1)}</b> MHz`;
  if (fromUser && Math.floor(prev * 10) !== Math.floor(knob.value * 10)) audio.tick();
}

function addCrystal() {
  const g = new THREE.Group(); const qc = T(1.0, -5.0); g.position.set(qc.x, 0, qc.z);
  const can = new THREE.Mesh(new RoundedBoxGeometry(1.1, 0.3, 0.45, 4, 0.14), M.steel); can.position.y = 0.17; can.castShadow = true;
  g.add(can); tilt.add(g);
  occupied.push({ x: qc.x, z: qc.z, w: 1.5, d: 1.5 });
}

// The scope: a little screen that draws a live step response
const scope = { zeta: 0.058, tex: null, ctx: null, t: 0 };
function addScope() {
  const g = new THREE.Group(); const qs = T(0, 4.75); g.position.set(qs.x, 0, qs.z);
  const frame = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.22, 2.05), M.black); frame.position.y = 0.11; frame.castShadow = true;
  const c = document.createElement('canvas'); c.width = 640; c.height = 360;
  scope.ctx = c.getContext('2d');
  scope.tex = new THREE.CanvasTexture(c); scope.tex.colorSpace = THREE.SRGBColorSpace;
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(3.3, 1.86), new THREE.MeshBasicMaterial({ map: scope.tex, color: new THREE.Color(1.6, 1.6, 1.6) }));
  screen.rotation.x = -Math.PI / 2; screen.position.y = 0.225;
  const lift = new THREE.Group(); lift.add(frame, screen); g.add(lift); tilt.add(g);
  items.push({ group: g, lift, body: frame, extra: screen, kind: 'scope', title: 'Scope', note: 'Click to change the damping' });
  occupied.push({ x: qs.x, z: qs.z, w: 4, d: 2.6 });
}
function drawScope(dt) {
  const c = scope.ctx, W = 640, H = 360, w0 = 2 * Math.PI * 1.93, z = scope.zeta;
  scope.t = (scope.t + dt * 0.55 * knob.value) % 1.25;
  const p = Math.min(1, scope.t);
  c.fillStyle = '#021208'; c.fillRect(0, 0, W, H);
  c.strokeStyle = 'rgba(161,255,203,0.12)'; c.lineWidth = 1; c.beginPath();
  for (let i = 1; i < 10; i++) { c.moveTo((W * i) / 10, 0); c.lineTo((W * i) / 10, H); }
  for (let i = 1; i < 6; i++) { c.moveTo(0, (H * i) / 6); c.lineTo(W, (H * i) / 6); }
  c.stroke();
  const resp = (t) => {
    if (t <= 0) return 0;
    if (z < 1) { const wd = w0 * Math.sqrt(1 - z * z); return 1 - Math.exp(-z * w0 * t) * (Math.cos(wd * t) + (z / Math.sqrt(1 - z * z)) * Math.sin(wd * t)); }
    const r = Math.sqrt(z * z - 1), s1 = -w0 * (z - r), s2 = -w0 * (z + r);
    return 1 + (s2 * Math.exp(s1 * t) - s1 * Math.exp(s2 * t)) / (s1 - s2);
  };
  const y = (v) => H * 0.82 - v * H * 0.36;
  c.strokeStyle = '#b8ffd9'; c.lineWidth = 4; c.shadowColor = '#a1ffcb'; c.shadowBlur = 14; c.beginPath();
  const N = 220;
  for (let i = 0; i <= N * p; i++) { const f = i / N, t = f * 4 - 0.3; const X = f * W, Y = y(resp(t)); i ? c.lineTo(X, Y) : c.moveTo(X, Y); }
  c.stroke(); c.shadowBlur = 0;
  c.fillStyle = '#a1ffcb'; c.font = `700 26px ${MONO}`;
  c.fillText(`ζ ${z.toFixed(3)}`, 18, 36);
  c.font = `400 20px ${MONO}`; c.fillStyle = 'rgba(161,255,203,0.6)';
  c.fillText(`RLC STEP · CLK ${(knob.value * 16).toFixed(1)} MHz`, 18, 62);
  scope.tex.needsUpdate = true;
}

function addLeds() {
  const spots = [[2.4, -2.3, 'g'], [-2.4, 2.3, 'r'], [5.6, -6.0, 'g'], [-5.6, 6.0, 'b'], [10.6, -1.5, 'r'], [-10.6, 1.5, 'g'], [3.0, 2.6, 'b'], [-3.0, -2.6, 'g']];
  const colors = { g: new THREE.Color(0.5, 3.2, 1.2), r: new THREE.Color(3.2, 0.4, 0.3), b: new THREE.Color(0.5, 1.4, 3.4) };
  spots.forEach(([lx, lz, k], i) => {
    const { x, z } = T(lx, lz);
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.12, 18, 12, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshBasicMaterial({ color: colors[k].clone() }));
    m.position.set(x, 0.02, z);
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.06, 0.22), new THREE.MeshStandardMaterial({ color: '#e8e8e0', roughness: 0.4 }));
    base.position.set(x, 0.03, z);
    tilt.add(base, m);
    leds.push({ mesh: m, base: colors[k], rate: 0.6 + (i % 4) * 0.45, phase: i * 0.37 });
  });
}

let pulseMesh, pulseList = [];
function addPulses() {
  paths.forEach((p) => { for (let i = 0; i < p.count; i++) pulseList.push({ path: p, offset: (p.phase + i / p.count) % 1 }); });
  pulseMesh = new THREE.InstancedMesh(new THREE.SphereGeometry(0.075, 12, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.7, 3.2, 1.9) }), pulseList.length);
  pulseMesh.frustumCulled = false;
  tilt.add(pulseMesh);
}

/* ======================================================================
   Layout and camera
   ====================================================================== */
const home = { pos: new THREE.Vector3(), target: new THREE.Vector3() };
let portrait = false;
function layout() {
  const w = innerWidth, h = innerHeight;
  camera.aspect = w / h; camera.updateProjectionMatrix();
  renderer.setSize(w, h); composer.setSize(w, h);
  bloom.resolution.set(w / 2, h / 2);
  portrait = PORTRAIT;
  const narrowW = w < 860;
  // fitD leaves room behind the board for the floating software windows
  const fitW = portrait ? 15.5 : narrowW ? 26.5 : 27 * w / Math.max(600, w - 360), fitD = portrait ? 34 : 20;
  const vfov = THREE.MathUtils.degToRad(camera.fov);
  const hfov = 2 * Math.atan(Math.tan(vfov / 2) * camera.aspect);
  const narrow = w < 860;
  const dist = Math.max((fitW / 2) / Math.tan(hfov / 2), (fitD / 2) / Math.tan(vfov / 2) * 0.82) * (narrow ? 1.02 : 1.0);
  const dir = new THREE.Vector3(0, 1.25, 0.95).normalize();
  home.target.set(narrow ? 0 : -(125 / w) * fitW, portrait ? 0.6 : 0.8, portrait ? -3.6 : -1.6);
  home.pos.copy(home.target).addScaledVector(dir, dist);
  controls.minDistance = dist * 0.32;
  controls.maxDistance = dist * 1.3;
}

let focused = null;
function flyTo(pos, target, d = 1.4) {
  controls.enabled = false;
  gsap.to(camera.position, { x: pos.x, y: pos.y, z: pos.z, duration: dur(d), ease: 'power3.inOut' });
  gsap.to(controls.target, { x: target.x, y: target.y, z: target.z, duration: dur(d), ease: 'power3.inOut', onComplete: () => (controls.enabled = true) });
}
function focusItem(it) {
  const p = new THREE.Vector3();
  it.group.getWorldPosition(p);
  const panelOpen = innerWidth >= 860;
  const right = new THREE.Vector3(1, 0, 0);
  const target = p.clone();
  if (panelOpen) target.addScaledVector(right, 1.6);
  else target.z += 2.2;
  const view = it.win ? new THREE.Vector3(0, 2.6, 10) : new THREE.Vector3(0, 10.5, 8.6);
  const pos = target.clone().add(view.multiplyScalar(innerWidth < 860 ? 1.3 : 1));
  flyTo(pos, target);
}
function goHome() { flyTo(home.pos, home.target, 1.2); }

/* ======================================================================
   The software layer: live windows floating above the board,
   each wired to its chip by a data beam
   ====================================================================== */
const softWins = [];
const zeroImg = new Image();
zeroImg.src = 'assets/img/zero-hour.png';

function winChrome(c, W, H, title) {
  c.clearRect(0, 0, W, H);
  c.fillStyle = '#0a100f';
  c.beginPath(); c.roundRect(0, 0, W, H, 26); c.fill();
  c.fillStyle = '#131c1a';
  c.beginPath(); c.roundRect(0, 0, W, 64, [26, 26, 0, 0]); c.fill();
  ['#ff6b5f', '#ffc24b', '#3ddc84'].forEach((col, i) => { c.fillStyle = col; c.beginPath(); c.arc(36 + i * 30, 32, 9, 0, 7); c.fill(); });
  c.fillStyle = '#8f9c96'; c.font = `500 24px ${MONO}`; c.textAlign = 'center';
  c.fillText(title, W / 2, 40); c.textAlign = 'left';
  return 64;
}

const WINDOWS = [
  {
    key: 'browser', title: 'team-20-1.onrender.com', link: 'zero-hour', note: 'Zero Hour, live in the browser',
    at: { x: -9.3, z: -8.9 }, portraitAt: { x: -3.4, z: -14.4 },
    draw(c, W, H, top) {
      c.fillStyle = '#131c1a'; c.beginPath(); c.roundRect(24, top + 14, W - 48, 44, 22); c.fill();
      c.fillStyle = '#a1ffcb'; c.font = `400 22px ${MONO}`; c.fillText('https://team-20-1.onrender.com', 48, top + 44);
      const y0 = top + 74, h = H - y0 - 20;
      if (zeroImg.complete && zeroImg.naturalWidth) {
        const s = Math.max((W - 48) / zeroImg.naturalWidth, h / zeroImg.naturalHeight);
        c.save(); c.beginPath(); c.roundRect(24, y0, W - 48, h, 12); c.clip();
        c.drawImage(zeroImg, 24, y0, zeroImg.naturalWidth * s, zeroImg.naturalHeight * s);
        c.restore();
      }
      c.fillStyle = '#d9a654'; c.beginPath(); c.roundRect(44, H - 82, 330, 44, 22); c.fill();
      c.fillStyle = '#1a1006'; c.font = `700 22px ${MONO}`; c.fillText('★ 2nd · StrathHack26', 64, H - 52);
    },
  },
  {
    key: 'voice', title: 'friday — voice loop', link: 'friday', note: 'F.R.I.D.A.Y. voice pipeline',
    at: { x: -3.1, z: -9.4 }, live: true,
    draw(c, W, H, top, t) {
      const stages = [['VAD', 'WebRTC'], ['STT', 'faster-whisper'], ['LLM', 'tools via MCP'], ['TTS', 'Piper']];
      const bw = 190, gap = (W - 48 - bw * 4) / 3, y = top + 60, hot = Math.floor(t * 1.6) % 4;
      stages.forEach(([a, b], i) => {
        const x = 24 + i * (bw + gap);
        c.fillStyle = i === hot ? '#a1ffcb' : '#131c1a';
        c.beginPath(); c.roundRect(x, y, bw, 120, 18); c.fill();
        c.fillStyle = i === hot ? '#04160d' : '#e9f1ec'; c.font = `700 40px ${SANS}`; c.fillText(a, x + 22, y + 60);
        c.fillStyle = i === hot ? '#04160d' : '#8f9c96'; c.font = `400 19px ${MONO}`; c.fillText(b, x + 22, y + 96);
        if (i < 3) { c.fillStyle = '#4f7d66'; c.fillText('→', x + bw + gap / 2 - 8, y + 66); }
      });
      // a live waveform: you speak, then it answers
      const wy = y + 250;
      c.strokeStyle = '#a1ffcb'; c.lineWidth = 4; c.beginPath();
      for (let x = 24; x < W - 24; x += 4) {
        const u = x / W, env = Math.max(0, Math.sin((u * 2.2 - t * 0.35) * Math.PI));
        const v = Math.sin(x * 0.09 + t * 9) * Math.sin(x * 0.023 + t * 3) * 70 * env;
        x === 24 ? c.moveTo(x, wy + v) : c.lineTo(x, wy + v);
      }
      c.stroke();
      c.fillStyle = '#e9f1ec'; c.font = `700 34px ${SANS}`; c.fillText('first sound back < 1 s', 24, H - 40);
      c.fillStyle = '#8f9c96'; c.font = `400 20px ${MONO}`; c.textAlign = 'right'; c.fillText('17/17 evals', W - 28, H - 44); c.textAlign = 'left';
    },
  },
  {
    key: 'ci', title: 'github actions — all checks', link: 'about', note: 'CI on every push, across projects',
    at: { x: 3.1, z: -9.4 }, live: true,
    draw(c, W, H, top, t) {
      const rows = [
        ['zero-hour', 'node --test', '360+ tests'],
        ['duck-run', 'tests + build', '155 tests'],
        ['mini-redis', 'ASan · UBSan · valgrind', '111 tests'],
        ['trace-analyzer', 'pytest', 'every push'],
        ['find-my-recipes', 'Django tests', 'model · view'],
      ];
      const cycle = t % 7;
      rows.forEach(([repo, job, n], i) => {
        const y = top + 34 + i * 82, done = cycle > 0.6 + i * 0.8;
        c.fillStyle = '#131c1a'; c.beginPath(); c.roundRect(24, y, W - 48, 66, 14); c.fill();
        if (done) {
          c.fillStyle = '#3ddc84'; c.beginPath(); c.arc(62, y + 33, 16, 0, 7); c.fill();
          c.strokeStyle = '#04160d'; c.lineWidth = 4; c.beginPath(); c.moveTo(54, y + 33); c.lineTo(60, y + 40); c.lineTo(71, y + 26); c.stroke();
        } else {
          c.strokeStyle = '#ffc24b'; c.lineWidth = 4; c.beginPath(); c.arc(62, y + 33, 14, t * 6, t * 6 + 4.2); c.stroke();
        }
        c.fillStyle = '#e9f1ec'; c.font = `700 25px ${MONO}`; c.fillText(repo, 96, y + 30);
        c.fillStyle = '#8f9c96'; c.font = `400 19px ${MONO}`; c.fillText(job, 96, y + 54);
        c.textAlign = 'right'; c.fillStyle = done ? '#a1ffcb' : '#ffc24b'; c.font = `400 21px ${MONO}`;
        c.fillText(done ? n : 'running…', W - 44, y + 42); c.textAlign = 'left';
      });
    },
  },
  {
    key: 'term', title: 'tejas@linux: ~/mini-redis', link: 'mini-redis', note: 'mini-redis, benchmarked in the terminal',
    at: { x: 9.3, z: -8.9 }, portraitAt: { x: 3.4, z: -14.4 }, live: true,
    lines: [
      ['$ ', 'redis-benchmark -t get,set -c 10000 -q'],
      ['', 'SET  ≈ Redis 8 throughput'],
      ['', 'GET  ≈ Redis 8 throughput'],
      ['$ ', 'perf stat -e instructions ./mini-redis'],
      ['', 'instr/request   2,788 → 1,668'],
      ['$ ', 'make test ASAN=1'],
      ['', '39 unit · 72 integration · fuzz ok'],
      ['$ ', 'kill -9 $(pidof mini-redis) && ./mini-redis'],
      ['', 'AOF replayed · 0 keys lost'],
    ],
    draw(c, W, H, top, t) {
      const total = this.lines.reduce((s, [a, b]) => s + a.length + b.length, 0);
      let budget = Math.floor(t * 34) % (total + 90);
      c.font = `400 25px ${MONO}`;
      let y = top + 50, lastX = 28;
      for (const [p, txt] of this.lines) {
        if (budget <= 0) break;
        const full = p + txt, shown = full.slice(0, budget); budget -= full.length;
        c.fillStyle = p ? '#a1ffcb' : '#c9d0cc';
        c.fillText(shown, 28, y);
        lastX = 28 + c.measureText(shown).width;
        if (budget > 0) y += 40;
      }
      if (Math.floor(t * 2) % 2) { c.fillStyle = '#a1ffcb'; c.fillRect(lastX + 4, y - 24, 14, 30); }
    },
  },
];

function addSoftware() {
  const list = PORTRAIT ? WINDOWS.filter((w) => w.portraitAt) : WINDOWS;
  list.forEach((def, i) => {
    const w = PORTRAIT ? 6.4 : 6.0, h = w * 0.62, CW = 1060, CH = 660;
    const cv = document.createElement('canvas'); cv.width = CW; cv.height = CH;
    const ctx = cv.getContext('2d');
    const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = MAX_ANISO;
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false, fog: false }));
    const halo = new THREE.Mesh(new THREE.PlaneGeometry(w + 0.35, h + 0.35), M.glow());
    halo.position.z = -0.02;
    const lift = new THREE.Group(); lift.add(halo, screen);
    const bob = new THREE.Group(); bob.add(lift);
    const g = new THREE.Group(); g.add(bob);
    const at = PORTRAIT ? def.portraitAt : def.at;
    g.position.set(at.x, 3.3, at.z);
    tilt.add(g);
    g.lookAt(home.pos.x * 0.15 + at.x * 0.85, home.pos.y, home.pos.z);   // face the viewer, a little splayed

    // the data beam down to its chip (or the CPU)
    const chipIt = def.link === 'about' ? items.find((x) => x.kind === 'about') : items.find((x) => x.project?.id === def.link);
    const to = chipIt.group.position.clone().setY(0.5);
    const from = new THREE.Vector3(0, -h / 2, 0).applyQuaternion(g.quaternion).add(g.position);
    const mid = from.clone().lerp(to, 0.5).add(new THREE.Vector3(0, 1.2, 0));
    const curve = new THREE.QuadraticBezierCurve3(to, mid, from);
    const beam = new THREE.Mesh(new THREE.TubeGeometry(curve, 40, 0.025, 6, false), M.glow());
    beam.material.opacity = 0.35;
    tilt.add(beam);
    const packets = [0, 1, 2].map(() => {
      const m = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.7, 3.2, 1.9) }));
      tilt.add(m); return m;
    });

    const win = { def, ctx, tex, CW, CH, g, bob, curve, packets, beam, phase: i * 1.3, dirty: true };
    softWins.push(win);
    renderWin(win, 0);
    const project = PROJECTS.find((p) => p.id === def.link);
    items.push({
      group: g, lift, body: screen, pad: halo, win: true,
      kind: project ? 'project' : 'about', project, title: project ? project.name : 'Tejas Kaushik', note: def.note,
    });
  });
  zeroImg.onload = () => softWins.forEach((w) => renderWin(w, 0));
}
function renderWin(win, t) {
  const top = winChrome(win.ctx, win.CW, win.CH, win.def.title);
  win.def.draw.call(win.def, win.ctx, win.CW, win.CH, top, t);
  win.tex.needsUpdate = true;
}
let softClock = 0;
function softwareTick(dt, now) {
  softClock += dt;
  const redraw = softClock > 1 / 15;
  softWins.forEach((w, i) => {
    w.bob.position.y = motionFull ? Math.sin(now / 1000 * 0.9 + w.phase) * 0.12 : 0;
    if (redraw && w.def.live) renderWin(w, now / 1000 * knob.value);
    w.packets.forEach((p, k) => {
      const u = ((now / 1000) * 0.35 * knob.value + k / 3 + i * 0.17) % 1;
      w.curve.getPoint(u, p.position);
      p.visible = booted;
    });
    const hot = hovered?.win && hovered.group === w.g || focused?.group === w.g;
    w.beam.material.opacity += ((hot ? 1 : 0.3) - w.beam.material.opacity) * 0.1;
  });
  if (redraw) softClock = 0;
}

/* ======================================================================
   Pointer: hover, click, knob drag, parallax
   ====================================================================== */
const ray = new THREE.Raycaster();
const ndc = new THREE.Vector2(9, 9);
const pointer = { x: 0, y: 0, down: null, knob: false, lastX: 0 };
let hovered = null;
const tip = $('#tip');

function hitTest() {
  ray.setFromCamera(ndc, camera);
  const targets = [];
  items.forEach((it) => { targets.push(it.body); if (it.extra) targets.push(it.extra); });
  const hit = ray.intersectObjects(targets, false)[0];
  if (!hit) return null;
  return items.find((it) => it.body === hit.object || it.extra === hit.object) || null;
}
function setHover(it) {
  if (hovered === it) return;
  if (hovered) unhighlight(hovered);
  hovered = it;
  canvas.style.cursor = it ? 'pointer' : '';
  if (it) {
    highlight(it);
    audio.hover();
    tip.innerHTML = `<b>${it.title}</b><span>${it.note || ''}</span>${it.project?.badge ? `<br><em>${it.project.badge}</em>` : ''}`;
    tip.classList.add('is-on');
    railHot(it.project?.id);
  } else { tip.classList.remove('is-on'); railHot(null); }
}
function highlight(it) {
  gsap.to(it.lift.position, { y: it.kind === 'project' || it.kind === 'about' ? 0.32 : 0.18, duration: 0.5, ease: motionFull ? 'elastic.out(1, 0.5)' : 'power2.out' });
  const set = it.project ? glowSets[it.project.id] : null;
  const pad = it.pad || set?.pad;
  if (pad) gsap.to(pad.material, { opacity: 0.55, duration: 0.3 });
  if (set) gsap.to(set.trace.material, { opacity: 1, duration: 0.3 });
}
function unhighlight(it) {
  if (focused === it) return;
  gsap.to(it.lift.position, { y: 0, duration: 0.45, ease: 'power3.out' });
  const set = it.project ? glowSets[it.project.id] : null;
  const pad = it.pad || set?.pad;
  if (pad) gsap.to(pad.material, { opacity: 0, duration: 0.4 });
  if (set) gsap.to(set.trace.material, { opacity: 0, duration: 0.4 });
}
function railHot(id) { document.querySelectorAll('#rail-list button').forEach((b) => b.classList.toggle('is-hot', b.dataset.id === id)); }

canvas.addEventListener('pointermove', (e) => {
  pointer.x = (e.clientX / innerWidth) * 2 - 1;
  pointer.y = (e.clientY / innerHeight) * 2 - 1;
  ndc.set(pointer.x, -pointer.y);
  tip.style.left = `${e.clientX}px`; tip.style.top = `${e.clientY}px`;
  if (pointer.knob) {
    const dx = e.clientX - pointer.lastX; pointer.lastX = e.clientX;
    setClock(knob.value + dx * 0.012, true);
    return;
  }
  if (!booted) return;
  if (e.pointerType === 'mouse') setHover(hitTest());
});
canvas.addEventListener('pointerdown', (e) => {
  pointer.down = { x: e.clientX, y: e.clientY };
  if (!booted) return;
  ndc.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  const it = hitTest();
  if (it && it.kind === 'knob') {
    pointer.knob = true; pointer.lastX = e.clientX; controls.enabled = false;
    canvas.setPointerCapture(e.pointerId);
  }
});
canvas.addEventListener('pointerup', (e) => {
  const d = pointer.down; pointer.down = null;
  if (pointer.knob) { pointer.knob = false; controls.enabled = true; return; }
  if (!booted || !d || Math.hypot(e.clientX - d.x, e.clientY - d.y) > 6) return;
  ndc.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  const it = hitTest();
  if (e.pointerType !== 'mouse' && it) setHover(it);
  if (it) activate(it); else if (e.pointerType !== 'mouse') setHover(null);
});
canvas.addEventListener('pointerleave', () => setHover(null));
canvas.addEventListener('wheel', (e) => {
  if (hovered && hovered.kind === 'knob') { e.preventDefault(); e.stopImmediatePropagation(); setClock(knob.value - Math.sign(e.deltaY) * 0.1, true); }
}, { capture: true, passive: false });

function activate(it) {
  audio.click();
  tip.classList.remove('is-on');
  if (it.kind === 'project') openProject(it.project.id);
  else if (it.kind === 'about') openPanel('about');
  else if (it.kind === 'contact') openPanel('contact');
  else if (it.kind === 'link') window.open(it.href, '_blank', 'noopener');
  else if (it.kind === 'scope') { const zs = [0.058, 0.2, 0.45, 1.3]; scope.zeta = zs[(zs.indexOf(scope.zeta) + 1) % zs.length]; scope.t = 0; }
  else if (it.kind === 'knob') setClock(knob.value >= 2.9 ? 0.25 : knob.value + 0.5, true);
}

/* ======================================================================
   Panels
   ====================================================================== */
const panel = $('#panel'), body = $('#panel-body');
let current = null;
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

function projectHTML(p, i) {
  const media = p.image
    ? `<figure class="p-media"><img src="${p.image}" alt="${esc(p.name)} screenshot"></figure>`
    : p.code ? `<pre class="p-code">${esc(p.code)}</pre>`
    : p.fig ? `<div class="p-fig"><b>${esc(p.fig[0])}</b><span>${esc(p.fig[1])}</span></div>` : '';
  return `
    <p class="p-kicker">${String(i + 1).padStart(2, '0')} / ${PROJECTS.length} · ${p.year}${p.badge ? `<span class="p-badge">${esc(p.badge)}</span>` : ''}</p>
    <h2 class="p-title">${esc(p.name)}</h2>
    <p class="p-lede">${esc(p.lede)}</p>
    ${media}
    <ul class="p-list">${p.bullets.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>
    <ul class="p-tags">${p.tags.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
    ${p.links.length ? `<div class="p-links">${p.links.map((l) => `<a class="${l.alt ? 'alt' : ''}" href="${l.href}" target="_blank" rel="noopener">${esc(l.label)} ↗</a>`).join('')}</div>` : ''}`;
}
function aboutHTML() {
  return `
    <p class="p-kicker">U1 · CPU</p>
    <h2 class="p-title">Tejas Kaushik</h2>
    <p class="p-lede">${esc(ABOUT.lede)}</p>
    <ul class="p-rows" style="margin-top:22px">${ABOUT.facts.map(([a, b]) => `<li><span>${esc(a)}</span><span>${esc(b)}</span></li>`).join('')}</ul>
    <p class="p-h">From the PCB up</p>
    <div class="p-layers">${ABOUT.layers.map(([a, b]) => `<div><b>${esc(a)}</b><span>${esc(b)}</span></div>`).join('')}</div>
    <p class="p-h">Record</p>
    <ul class="p-rows">${ABOUT.record.map(([a, b]) => `<li><span>${esc(a)}</span><span>${esc(b)}</span></li>`).join('')}</ul>
    <p class="p-lede" style="font-size:16px">${esc(ABOUT.intern)}</p>
    <div class="p-links"><button type="button" data-open="contact">Get in touch</button></div>`;
}
function contactHTML() {
  return `
    <p class="p-kicker">J1 · I/O</p>
    <h2 class="p-title">Let's build something.</h2>
    <p class="p-lede">Hiring a summer engineer for embedded, systems or networks in 2027? I'd like to hear about it. Based in Glasgow, with the right to work in the UK.</p>
    <div class="p-fig"><b style="font-size:clamp(22px,3vw,30px);letter-spacing:-0.01em">${CONTACT.email}</b><span>Email is the fastest way to reach me.</span></div>
    <div class="p-links">
      <a href="mailto:${CONTACT.email}?subject=Summer%202027%20placement">Email me ↗</a>
      <button type="button" class="alt" id="copy-email">Copy address</button>
      <a class="alt" href="${CONTACT.linkedin}" target="_blank" rel="noopener">LinkedIn ↗</a>
      <a class="alt" href="${CONTACT.github}" target="_blank" rel="noopener">GitHub ↗</a>
    </div>`;
}

function openPanel(kind, html) {
  current = kind;
  body.innerHTML = html || (kind === 'about' ? aboutHTML() : contactHTML());
  body.scrollTop = 0;
  panel.classList.remove('is-open'); void panel.offsetWidth; panel.classList.add('is-open');
  panel.setAttribute('aria-hidden', 'false');
  document.body.classList.add('has-panel');
  $('#prev').hidden = $('#next').hidden = !kind.startsWith('p:');
  const it = kind === 'about' ? items.find((i) => i.kind === 'about') : kind === 'contact' ? items.find((i) => i.kind === 'contact') : null;
  if (it) { setFocused(it); focusItem(it); }
  panel.focus({ preventScroll: true });
}
function openProject(id) {
  const i = PROJECTS.findIndex((p) => p.id === id);
  if (i < 0) return;
  openPanel('p:' + id, projectHTML(PROJECTS[i], i));
  const it = items.find((x) => x.project?.id === id);
  setFocused(it); focusItem(it);
}
function setFocused(it) {
  const prev = focused; focused = it;
  if (prev && prev !== it) unhighlight(prev);
  if (it) highlight(it);
}
function closePanel() {
  if (!current) return;
  current = null;
  panel.classList.remove('is-open'); panel.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('has-panel');
  const f = focused; focused = null; if (f) unhighlight(f);
  goHome();
}
function step(dir) {
  if (!current?.startsWith('p:')) return;
  const i = PROJECTS.findIndex((p) => 'p:' + p.id === current);
  openProject(PROJECTS[(i + dir + PROJECTS.length) % PROJECTS.length].id);
  audio.click();
}
$('#close').addEventListener('click', closePanel);
$('#prev').addEventListener('click', () => step(-1));
$('#next').addEventListener('click', () => step(1));
$('#home').addEventListener('click', closePanel);
document.addEventListener('click', (e) => {
  const o = e.target.closest('[data-open]');
  if (o) { audio.click(); openPanel(o.dataset.open); }
  if (e.target.closest('[data-term]')) toggleTerm(true);
  if (e.target.id === 'copy-email') {
    navigator.clipboard?.writeText(CONTACT.email).then(() => { e.target.textContent = 'Copied ✓'; }, () => { e.target.textContent = CONTACT.email; });
  }
});

// project rail
const rail = $('#rail-list');
$('#rail-count').textContent = `· ${PROJECTS.length}`;
rail.innerHTML = PROJECTS.map((p) => `<li><button type="button" data-id="${p.id}" class="${p.gold ? 'is-gold' : ''}"><i></i><span>${esc(p.name)}</span><small>${p.year}</small></button></li>`).join('');
rail.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) { audio.click(); openProject(b.dataset.id); } });
rail.addEventListener('pointerover', (e) => {
  const b = e.target.closest('button'); if (!b || !booted) return;
  const it = items.find((x) => x.project?.id === b.dataset.id); if (it && hovered !== it) setHover(it);
  tip.classList.remove('is-on');
});
rail.addEventListener('pointerleave', () => setHover(null));

/* ======================================================================
   Terminal
   ====================================================================== */
const term = $('#term'), out = $('#term-out'), input = $('#term-in');
const history = []; let hIdx = 0;
function print(html, cls) { const d = document.createElement('div'); if (cls) d.className = cls; d.innerHTML = html; out.appendChild(d); out.scrollTop = out.scrollHeight; }
function toggleTerm(open = !term.classList.contains('is-open')) {
  term.classList.toggle('is-open', open);
  term.setAttribute('aria-hidden', String(!open));
  if (open) {
    if (!out.childElementCount) print('tejas-os 2026 · type <b>help</b> to see what this board can do', 'dim');
    setTimeout(() => input.focus(), 50);
  } else input.blur();
}
const COMMANDS = {
  help: () => print(['help            this list', 'ls              list the projects', 'open &lt;name|n&gt;   open a project (try: open 1, open redis)', 'about           who I am', 'skills          the stack, from the PCB up', 'contact         how to reach me', 'clk &lt;0.25-3&gt;    set the board clock', 'scope &lt;zeta&gt;    set the scope damping', 'github · linkedin · cv · whoami · clear · exit', 'sudo hire tejas'].join('\n')),
  ls: () => print(PROJECTS.map((p, i) => `${String(i + 1).padStart(2)}  ${p.id.padEnd(10)} ${p.name}${p.badge ? '  ★ ' + p.badge : ''}`).join('\n')),
  projects: () => COMMANDS.ls(),
  open: (arg) => {
    if (!arg) return print('usage: open &lt;name or number&gt;', 'dim');
    const n = parseInt(arg, 10);
    const p = !isNaN(n) ? PROJECTS[n - 1] : PROJECTS.find((x) => x.id.includes(arg.toLowerCase()) || x.name.toLowerCase().includes(arg.toLowerCase()));
    if (!p) return print(`no project matches "${esc(arg)}". try ls`, 'dim');
    print(`opening ${p.name}…`); openProject(p.id);
  },
  about: () => { print('opening U1 (that is me)…'); openPanel('about'); },
  whoami: () => print('Tejas Kaushik · third-year BEng Electronics and Software Engineering, University of Glasgow.\nFirmware, systems C and the networks between them. Open to Summer 2027 placements.'),
  skills: () => print(ABOUT.layers.map(([a, b]) => `<b>${a}</b>\n  ${b}`).join('\n')),
  contact: () => { print(`email     <a href="mailto:${CONTACT.email}">${CONTACT.email}</a>\nlinkedin  <a href="${CONTACT.linkedin}" target="_blank" rel="noopener">tejas-kaushik</a>\ngithub    <a href="${CONTACT.github}" target="_blank" rel="noopener">Tejas-kaushik</a>`); openPanel('contact'); },
  github: () => { window.open(CONTACT.github, '_blank', 'noopener'); print('opening GitHub ↗'); },
  linkedin: () => { window.open(CONTACT.linkedin, '_blank', 'noopener'); print('opening LinkedIn ↗'); },
  cv: () => print(`my CV is a quick email away: <a href="mailto:${CONTACT.email}?subject=CV%20request">${CONTACT.email}</a>`),
  clk: (arg) => { const v = parseFloat(arg); if (isNaN(v)) return print(`clk is ${(knob.value * 16).toFixed(1)} MHz. usage: clk 0.25-3`, 'dim'); setClock(v); print(`clock set to ${(knob.value * 16).toFixed(1)} MHz`); },
  scope: (arg) => { const v = parseFloat(arg); if (isNaN(v) || v <= 0) return print('usage: scope 0.05 (underdamped) … 2 (overdamped)', 'dim'); scope.zeta = Math.min(3, v); scope.t = 0; print(`scope damping ζ = ${scope.zeta}`); },
  clear: () => (out.innerHTML = ''),
  exit: () => toggleTerm(false),
  sudo: (arg) => {
    if (/hire\s+tejas/i.test(arg)) { print('[sudo] permission granted. all rails to full power…'); party(); setTimeout(() => openPanel('contact'), 1400); }
    else print('tejas is not in the sudoers file. this incident will be reported.', 'dim');
  },
};
$('#term-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const line = input.value.trim(); input.value = '';
  if (!line) return;
  history.push(line); hIdx = history.length;
  print(`<span class="me">$ ${esc(line)}</span>`);
  const [cmd, ...rest] = line.split(/\s+/);
  const fn = COMMANDS[cmd.toLowerCase()];
  fn ? fn(rest.join(' ')) : print(`command not found: ${esc(cmd)}. type help`, 'dim');
});
input.addEventListener('keydown', (e) => {
  audio.key();
  if (e.key === 'ArrowUp') { hIdx = Math.max(0, hIdx - 1); input.value = history[hIdx] || ''; e.preventDefault(); }
  if (e.key === 'ArrowDown') { hIdx = Math.min(history.length, hIdx + 1); input.value = history[hIdx] || ''; e.preventDefault(); }
  if (e.key === 'Tab') {
    e.preventDefault();
    const [c, a = ''] = input.value.split(/\s+/);
    if (c === 'open') { const m = PROJECTS.find((p) => p.id.startsWith(a.toLowerCase())); if (m) input.value = 'open ' + m.id; }
    else { const m = Object.keys(COMMANDS).find((k) => k.startsWith(c)); if (m) input.value = m + ' '; }
  }
  if (e.key === 'Escape') toggleTerm(false);
});
$('#term-btn').addEventListener('click', () => toggleTerm());
$('#term-close').addEventListener('click', () => toggleTerm(false));

let partyUntil = 0;
function party() { partyUntil = performance.now() + 2600; audio.power(); Object.values(glowSets).forEach((s, i) => { gsap.to(s.trace.material, { opacity: 1, duration: 0.2, delay: i * 0.08, yoyo: true, repeat: 3 }); }); }

/* ======================================================================
   Keyboard and HUD toggles
   ====================================================================== */
document.addEventListener('keydown', (e) => {
  if (e.target === input) return;
  if (!booted) { if (e.key === 'Enter' && !$('#power').disabled) powerOn(); return; }
  if (e.key === '`' || e.key === '~') { e.preventDefault(); toggleTerm(); }
  else if (e.key === 'Escape') { if (term.classList.contains('is-open')) toggleTerm(false); else closePanel(); }
  else if (current?.startsWith('p:') && e.key === 'ArrowRight') step(1);
  else if (current?.startsWith('p:') && e.key === 'ArrowLeft') step(-1);
  else if (/^[1-9]$/.test(e.key) && !e.metaKey && !e.ctrlKey) openProject(PROJECTS[+e.key - 1].id);
});
const soundBtn = $('#sound-btn'), motionBtn = $('#motion-btn');
function syncToggles() {
  soundBtn.textContent = soundOn ? 'Sound on' : 'Sound off'; soundBtn.setAttribute('aria-pressed', String(soundOn));
  motionBtn.textContent = motionFull ? 'Motion full' : 'Motion calm'; motionBtn.setAttribute('aria-pressed', String(motionFull));
}
soundBtn.addEventListener('click', () => { soundOn = !soundOn; store.set('sound', soundOn ? 'on' : 'off'); audio.ensure(); audio.click(); syncToggles(); });
motionBtn.addEventListener('click', () => { motionFull = !motionFull; store.set('motion', motionFull ? 'full' : 'calm'); syncToggles(); });
syncToggles();

/* ======================================================================
   Boot and power-on
   ====================================================================== */
let booted = false;
const LOG = [
  ['$ tejas-os --boot --target recruiter', ''],
  ['[ ok ] 3V3 rail ................... stable', 'ok'],
  ['[ ok ] firmware (FreeRTOS) ........ 2 cores up', 'ok'],
  ['[ ok ] PID loop ................... 200 Hz', 'ok'],
  ['[ ok ] mini-redis ................. 1,668 instr/req', 'ok'],
  ['[ ok ] test suites ................ 360+ passing', 'ok'],
  ['[ ok ] network .................... TCP/IP · WebSocket · SSE', 'ok'],
  [`[ .. ] mounting ${PROJECTS.length} projects on the board`, 'dim'],
  ['ready. hello, recruiter.', ''],
];
async function typeLog() {
  const el = $('#boot-log');
  for (const [line, cls] of LOG) {
    const span = document.createElement('span'); if (cls) span.className = cls; el.appendChild(span);
    if (!motionFull) { span.textContent = line + '\n'; continue; }
    for (let i = 0; i <= line.length; i += 3) { span.textContent = line.slice(0, i); await new Promise((r) => setTimeout(r, 8)); }
    span.textContent = line + '\n';
    await new Promise((r) => setTimeout(r, 70));
  }
}

function powerOn() {
  if (booted) return;
  booted = true;
  audio.ensure(); audio.power();
  $('#boot').classList.add('is-off');
  const start = home.pos.clone().add(new THREE.Vector3(0, 30, -6));
  camera.position.copy(start);
  controls.target.copy(home.target);
  camera.lookAt(home.target);
  flyTo(home.pos, home.target, motionFull ? 2.6 : 0.6);
  // chips drop onto the board, springing as they land
  items.forEach((it, i) => {
    gsap.from(it.group.position, { y: motionFull ? 5 + rand() * 3 : 0.6, duration: motionFull ? 1.5 : 0.4, delay: dur(0.5 + i * 0.07), ease: motionFull ? 'elastic.out(1, 0.6)' : 'power2.out' });
  });
  // then the buses light up one after another
  Object.values(glowSets).forEach((s, i) => {
    gsap.fromTo(s.trace.material, { opacity: 0 }, { opacity: 1, duration: 0.25, delay: dur(1.4 + i * 0.12), yoyo: true, repeat: 1 });
  });
  powerT0 = performance.now() + (motionFull ? 1400 : 0);
  setTimeout(() => $('#hint').animate?.([{ opacity: 0 }, { opacity: 1 }], { duration: 800, fill: 'both' }), 1800);
}
let powerT0 = Infinity;

/* ======================================================================
   Loop
   ====================================================================== */
const clock = new THREE.Clock();
const o = new THREE.Object3D(), tmp = { x: 0, z: 0 };
let travel = 0, scopeTick = 0;
function frame() {
  const dt = Math.min(0.05, clock.getDelta()), now = performance.now();
  const partying = now < partyUntil;
  const live = Math.min(1, Math.max(0, (now - powerT0) / 900));
  travel += dt * knob.value * (partying ? 4 : 1);

  // pulses
  if (pulseMesh) {
    pulseList.forEach((pl, i) => {
      const L = pl.path.acc[pl.path.acc.length - 1];
      const d = (((travel * pl.path.speed) / L + pl.offset) % 1) * L;
      pointAt(pl.path.pts, pl.path.acc, d, tmp);
      const hot = hovered?.project?.id === pl.path.project || focused?.project?.id === pl.path.project;
      const s = live * (hot ? 1.7 : 1) * (partying ? 1.5 : 1);
      o.position.set(tmp.x, 0.05, tmp.z); o.scale.setScalar(s || 0.0001); o.updateMatrix();
      pulseMesh.setMatrixAt(i, o.matrix);
    });
    pulseMesh.instanceMatrix.needsUpdate = true;
  }
  // LEDs
  leds.forEach((l) => {
    const on = partying ? (Math.sin(now * 0.03 + l.phase * 9) > 0) : Math.sin((now / 1000) * l.rate * knob.value * Math.PI * 2 + l.phase * 6) > -0.2;
    l.mesh.material.color.copy(l.base).multiplyScalar(on && live > 0 ? 1 : 0.08);
  });
  // scope screen at ~30 fps
  scopeTick += dt;
  if (scope.ctx && scopeTick > 1 / 30) { drawScope(scopeTick); scopeTick = 0; }

  // parallax: the board leans toward the pointer
  const k = motionFull && booted ? 1 : 0;
  tilt.rotation.x += ((pointer.y * 0.045 * k) - tilt.rotation.x) * 0.06;
  tilt.rotation.z += ((-pointer.x * 0.045 * k) - tilt.rotation.z) * 0.06;
  // idle drift of the camera when nobody touches it
  if (motionFull && booted && !current && controls.enabled) controls.target.x += Math.sin(now / 4000) * 0.0008;

  softwareTick(dt, now);
  controls.update();
  composer.render();
  requestAnimationFrame(frame);
}

/* ======================================================================
   Start
   ====================================================================== */
async function start() {
  await Promise.all([
    document.fonts.load(`700 40px ${SANS}`), document.fonts.load(`400 20px ${MONO}`), document.fonts.load(`700 20px ${MONO}`),
  ]).catch(() => {});
  buildBoard();
  setClock(1);
  layout();
  addSoftware();
  camera.position.copy(home.pos).add(new THREE.Vector3(0, 30, -6));
  controls.target.copy(home.target);
  camera.lookAt(home.target);
  frame();
  window.__boardReady = true;
  // where a chip is on screen (used by the automated checks)
  window.__tk = {
    ys: () => items.map((it) => `${it.title}:${it.group.position.y.toFixed(2)}`).join(' '),
    screenOf(id) {
      const it = items.find((x) => x.project?.id === id || x.kind === id);
      const v = new THREE.Vector3(); it.body.getWorldPosition(v); v.project(camera);
      return { x: Math.round((v.x + 1) / 2 * innerWidth), y: Math.round((1 - v.y) / 2 * innerHeight) };
    },
  };
}
addEventListener('resize', () => { if ((innerWidth / innerHeight < 0.95) !== PORTRAIT) { location.reload(); return; } layout(); if (!current && booted) { camera.position.copy(home.pos); controls.target.copy(home.target); } });

const power = $('#power');
Promise.all([typeLog(), start()]).then(() => {
  power.disabled = false;
  $('#power-label').textContent = 'Power on';
  power.focus({ preventScroll: true });
  if (/[?&]skipboot\b/.test(location.search)) powerOn();
});
power.addEventListener('click', powerOn);
