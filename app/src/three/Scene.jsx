import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei/core/PerformanceMonitor.js';
import * as THREE from 'three';
import { sceneState } from '../lib/scene-state.js';
import { prefersReducedMotion } from '../lib/scroll.js';

/* The stage behind the whole page, drawn in one WebGL canvas:

   1. Backdrop: a field of slow, glowing light with fine contour lines running through it, like strata.
      Its colours belong to the section on screen and, in the work section, to the project being shown.
   2. The stack: "full stack" drawn literally as four glass slabs, one per layer a request passes through.
      It sits beside the hero, pulls apart while the Stack section is pinned, steps aside for the project
      cards and returns for the contact section.
   3. Dust: a sparse particle field in front, which gives the scroll its sense of travel.

   Every screen size gets the same choreography; only the positions differ between wide and tall screens. */

const LAYERS = [
  { letter: 'R', name: 'REACT', sub: 'interface', color: '#5fe3d4' },
  { letter: 'E', name: 'EXPRESS', sub: 'api routes', color: '#f2f0ea' },
  { letter: 'N', name: 'NODE', sub: 'server runtime', color: '#ff9a4d' },
  { letter: 'M', name: 'MONGODB', sub: 'data', color: '#5ee08f' }
];
const SLAB = [3.4, 0.16, 2.3];

// Page sections in order. Each has a pose for the stack and a palette for the backdrop.
const SECTIONS = ['top', 'about', 'services', 'stack-pin', 'skills', 'work', 'journey', 'contact'];
// Sections whose change starts early (in screen heights), so the stack is out of the way before they arrive.
const LEAD = { skills: 0.5 };

// Stack pose per section: [x, y, z, scale, rotX, rotY, gap, opacity]
const POSES = {
  wide: [
    [2.75, -0.15, 0, 1, 0.5, -0.62, 0.44, 1],
    [3.9, 0.9, -3, 0.8, 0.95, -0.25, 0.3, 0.3],
    [-4.6, 1.4, -4, 0.6, 0.8, 0.5, 0.3, 0.1],
    [2.6, -0.1, 0, 0.9, 0.36, -0.72, 1.12, 1],
    [5.4, 1.7, -3, 0.7, 0.7, -0.4, 0.4, 0.16],
    [0, 0.4, -7, 0.5, 0.9, 0.2, 0.3, 0],
    [3.5, -0.3, -1.5, 0.74, 0.74, 0.55, 0.34, 0.4],
    [3.0, -0.1, 0, 0.92, 0.52, -0.5, 0.5, 0.95]
  ],
  // Tall screens: the stack takes the upper part of the hero and of the pinned Stack scene.
  tall: [
    [0.12, 1.78, 0, 0.46, 0.56, -0.6, 0.44, 1],
    [0.7, 1.2, -3, 0.42, 0.95, -0.25, 0.3, 0.22],
    [-0.7, 1.4, -4, 0.38, 0.8, 0.5, 0.3, 0.08],
    [0.05, 1.42, 0, 0.5, 0.38, -0.72, 0.86, 1],
    [0.6, 1.5, -3, 0.4, 0.7, -0.4, 0.4, 0.14],
    [0, 0.4, -7, 0.4, 0.9, 0.2, 0.3, 0],
    [0.55, -1.4, -2, 0.45, 0.74, 0.55, 0.34, 0.2],
    [0.3, -1.55, -1, 0.5, 0.55, -0.5, 0.5, 0.6]
  ]
};

// Backdrop palette per section: three light colours and an overall strength.
const hex = value => {
  const n = parseInt(value.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};
const PALETTES = [
  { a: hex('#1fd8c2'), b: hex('#ff7a2f'), c: hex('#6d5cff'), power: 1 },
  { a: hex('#7b68ff'), b: hex('#1fd8c2'), c: hex('#ff5fa2'), power: 0.85 },
  { a: hex('#ff7a2f'), b: hex('#e64d9c'), c: hex('#6d5cff'), power: 0.8 },
  { a: hex('#1fd8c2'), b: hex('#45d98a'), c: hex('#3b9bff'), power: 0.95 },
  { a: hex('#1fd8c2'), b: hex('#3b9bff'), c: hex('#6d5cff'), power: 0.7 },
  { a: hex('#5f8bff'), b: hex('#6d5cff'), c: hex('#1fd8c2'), power: 0.85 },
  { a: hex('#4f8dff'), b: hex('#8a6bff'), c: hex('#1fd8c2'), power: 0.85 },
  { a: hex('#6d5cff'), b: hex('#ff7a2f'), c: hex('#1fd8c2'), power: 0.9 }
];
const WORK = SECTIONS.indexOf('work');

const smooth = t => {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
};
const damp = (current, target, lambda, dt) => current + (target - current) * (1 - Math.exp(-lambda * dt));

// How far the page has blended from each section into the next, shared by everything on the stage.
const director = { blend: SECTIONS.map(() => 0) };

// On tall screens the stack lives in the gap above the text: above the hero copy, and above the pinned
// list in the Stack scene. The gap is measured from the page so the stack always fits it exactly.
const VIEW_HEIGHT = 2 * 10 * Math.tan((35 * Math.PI) / 360); // world units visible at the stack's depth
const tallPoses = POSES.tall.map(pose => pose.slice());
function fitTallPoses() {
  const vh = window.innerHeight;
  const unit = VIEW_HEIGHT / vh;
  const nav = 72;
  const widthCap = (0.9 * VIEW_HEIGHT * (window.innerWidth / vh)) / 4.3;
  const place = (row, edge, extent) => {
    if (!(edge > nav + 40)) return;
    const height = (edge - nav) * unit;
    tallPoses[row][1] = (vh / 2 - (nav + edge) / 2) * unit;
    tallPoses[row][3] = Math.max(0.26, Math.min(0.66, widthCap, (height * 0.9) / extent));
  };
  const hero = document.querySelector('[data-stage-edge="hero"]');
  const list = document.querySelector('[data-stage-edge="pin"]');
  if (hero) place(0, hero.getBoundingClientRect().top + window.scrollY, 2.7);
  if (list) place(3, list.getBoundingClientRect().top - list.parentElement.getBoundingClientRect().top, 3.9);
}

function Director() {
  const bounds = useRef([]);

  useEffect(() => {
    const measure = () => {
      bounds.current = SECTIONS.map(id => {
        const el = document.getElementById(id);
        return el ? el.getBoundingClientRect().top + window.scrollY - (LEAD[id] ?? 0) * window.innerHeight : Infinity;
      });
      fitTallPoses();
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(document.body);
    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  // Runs before the other frame callbacks so they all read the same blend.
  useFrame(() => {
    const vh = window.innerHeight;
    const center = window.scrollY + vh * 0.5;
    for (let i = 1; i < SECTIONS.length; i++) {
      director.blend[i] = smooth((center - (bounds.current[i] - vh * 0.05)) / (vh * 0.8));
    }
  }, -1);

  return null;
}

// Walks a per-section table and returns the value for the current scroll position.
function mixInto(out, table) {
  for (let k = 0; k < out.length; k++) out[k] = table[0][k];
  for (let i = 1; i < table.length; i++) {
    const t = director.blend[i];
    if (t <= 0) break;
    for (let k = 0; k < out.length; k++) out[k] += (table[i][k] - out[k]) * t;
  }
  return out;
}

/* ---------- Backdrop ---------- */

const BACKDROP_VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 1.0, 1.0);
  }
`;

const BACKDROP_FRAGMENT = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform float uScroll;
  uniform float uAspect;
  uniform float uPower;
  uniform vec2 uPointer;
  uniform vec3 uA;
  uniform vec3 uB;
  uniform vec3 uC;

  // Simplex noise, Ian McEwan / Ashima Arts (MIT).
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
  float snoise(vec3 v) {
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
  }
  float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

  void main() {
    vec2 p = (vUv - 0.5) * vec2(uAspect, 1.0);
    float t = uTime * 0.04;

    // The whole field slides upward as the page scrolls.
    vec2 q = p * 0.82 + vec2(0.0, -uScroll * 0.42);

    // Two slow warps bend the field so nothing in it moves in a straight line.
    float w1 = snoise(vec3(q * 0.62, t));
    float w2 = snoise(vec3(q * 0.62 + 7.3, t * 1.15 + 2.0));
    vec2 wq = q + 0.42 * vec2(w1, w2);
    float f = snoise(vec3(wq * 0.95, t * 0.7));

    // Light: three broad lobes, one per palette colour, each leaning toward its own part of the screen.
    float la = smoothstep(-0.45, 0.85, f + p.x * 0.25);
    float lb = smoothstep(-0.35, 0.95, w1 * 0.9 + p.x * 0.3 - p.y * 0.35);
    float lc = smoothstep(-0.3, 1.0, w2 * 0.95 - p.x * 0.4 + p.y * 0.25);
    vec3 col = vec3(0.014, 0.030, 0.046);
    col += uA * pow(la, 1.7) * 0.50 * uPower;
    col += uB * pow(lb, 2.0) * 0.44 * uPower;
    col += uC * pow(lc, 2.0) * 0.40 * uPower;

    // Strata: contour lines of the same field, brighter where the light is and near the pointer.
    float level = f * 6.0 + w1 * 1.4;
    float width = fwidth(level);
    float line = 1.0 - smoothstep(0.0, width * 1.5, abs(fract(level) - 0.5));
    float bold = 1.0 - smoothstep(0.0, width * 2.4, abs(fract(level * 0.25) - 0.5) * 4.0);
    vec2 toPointer = p - uPointer * vec2(uAspect, 1.0) * 0.5;
    float torch = exp(-dot(toPointer, toPointer) * 5.0);
    vec3 lineColour = mix(uA, uB, smoothstep(-0.5, 0.6, w1)) + 0.25;
    float lineStrength = 0.06 + 0.20 * la + 0.10 * bold + 0.36 * torch;
    col += lineColour * line * lineStrength * uPower;

    // Hold the edges down so type stays readable, then dither away any banding.
    float edge = smoothstep(0.3, 1.1, length(p * vec2(0.72, 1.0)));
    col *= 1.0 - 0.46 * edge;
    col += (hash(gl_FragCoord.xy + uTime) - 0.5) / 160.0;
    gl_FragColor = vec4(col, 1.0);
  }
`;

function Backdrop({ still }) {
  const material = useRef();
  const { size } = useThree();
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uScroll: { value: 0 },
      uAspect: { value: 1 },
      uPower: { value: 1 },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uA: { value: new THREE.Vector3(...PALETTES[0].a) },
      uB: { value: new THREE.Vector3(...PALETTES[0].b) },
      uC: { value: new THREE.Vector3(...PALETTES[0].c) }
    }),
    []
  );
  // Flattened palette table: a(3) b(3) c(3) power(1). The work row is rewritten with the live project colour.
  const table = useMemo(() => PALETTES.map(p => [...p.a, ...p.b, ...p.c, p.power]), []);
  const target = useMemo(() => new Array(10).fill(0), []);
  const live = useRef(null);
  const accent = useRef(PALETTES[WORK].a.slice());

  useFrame(({ clock }, delta) => {
    const dt = Math.min(delta, 0.05);
    const u = material.current.uniforms;

    // In the work section the backdrop takes the colour of the project on screen.
    const wanted = sceneState.accent ? hex(sceneState.accent) : PALETTES[WORK].a;
    for (let k = 0; k < 3; k++) {
      accent.current[k] = damp(accent.current[k], wanted[k], 3, dt);
      table[WORK][k] = accent.current[k];
      table[WORK][3 + k] = accent.current[k] * 0.55 + PALETTES[WORK].b[k] * 0.45;
    }

    mixInto(target, table);
    const values = live.current || (live.current = target.slice());
    for (let k = 0; k < values.length; k++) values[k] = damp(values[k], target[k], still ? 60 : 2.6, dt);
    u.uA.value.set(values[0], values[1], values[2]);
    u.uB.value.set(values[3], values[4], values[5]);
    u.uC.value.set(values[6], values[7], values[8]);
    u.uPower.value = values[9];
    u.uTime.value = still ? 12 : clock.elapsedTime + 12;
    u.uScroll.value = window.scrollY / window.innerHeight;
    u.uAspect.value = size.width / size.height;
    u.uPointer.value.x = damp(u.uPointer.value.x, sceneState.pointerX, 4, dt);
    u.uPointer.value.y = damp(u.uPointer.value.y, -sceneState.pointerY, 4, dt);
  });

  return (
    <mesh frustumCulled={false} renderOrder={-1000}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial ref={material} vertexShader={BACKDROP_VERTEX} fragmentShader={BACKDROP_FRAGMENT} uniforms={uniforms} depthTest={false} depthWrite={false} />
    </mesh>
  );
}

/* ---------- Stack ---------- */

function labelTexture(layer) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 692;
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;

  const draw = () => {
    const ctx = canvas.getContext('2d');
    const { width: w, height: h } = canvas;
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = layer.color;
    ctx.globalAlpha = 0.12;
    ctx.lineWidth = 2;
    for (let x = 64; x < w; x += 64) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 58; y < h; y += 58) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = layer.color;
    ctx.textBaseline = 'alphabetic';
    ctx.font = '800 470px "Big Shoulders Display Variable", "Arial Narrow", sans-serif';
    ctx.fillText(layer.letter, 56, 520);
    ctx.textAlign = 'right';
    ctx.font = '700 104px "Big Shoulders Display Variable", "Arial Narrow", sans-serif';
    ctx.fillText(layer.name, w - 60, 560);
    ctx.globalAlpha = 0.8;
    ctx.font = '500 34px "JetBrains Mono Variable", ui-monospace, monospace';
    ctx.fillText(`// ${layer.sub}`, w - 62, 622);
    ctx.textAlign = 'left';
    ctx.globalAlpha = 1;
    texture.needsUpdate = true;
  };

  draw();
  // The display face is self-hosted and may land after first paint; redraw once it is ready.
  document.fonts?.load('800 100px "Big Shoulders Display Variable"').then(draw, () => {});
  document.fonts?.ready.then(draw, () => {});
  return texture;
}

// A soft round glow, used as light pooling under and around the stack.
function glowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 256;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.35, 'rgba(255,255,255,0.32)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(canvas);
}

function Slab({ layer, index, rig, glow }) {
  const group = useRef();
  const body = useRef();
  const edge = useRef();
  const label = useRef();
  const halo = useRef();
  const texture = useMemo(() => labelTexture(layer), [layer]);
  const edges = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(...SLAB)), []);
  const tint = useMemo(() => new THREE.Color(layer.color).multiplyScalar(0.2).add(new THREE.Color('#06141b')), [layer]);
  const lift = useRef(0);

  useEffect(() => () => texture.dispose(), [texture]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const { gap, opacity } = rig.current;
    const active = sceneState.highlight === index;
    const dimmed = sceneState.highlight >= 0 && !active;
    lift.current = damp(lift.current, active ? 1 : 0, 7, dt);
    group.current.position.y = (1.5 - index) * gap;
    group.current.position.x = lift.current * 0.32;
    group.current.position.z = lift.current * 0.32;
    const fade = opacity * (dimmed ? 0.35 : 1);
    body.current.opacity = damp(body.current.opacity, 0.9 * fade, 8, dt);
    body.current.emissiveIntensity = 0.16 + lift.current * 0.22;
    edge.current.opacity = damp(edge.current.opacity, (0.75 + lift.current * 0.25) * fade, 8, dt);
    label.current.opacity = damp(label.current.opacity, (0.9 + lift.current * 0.1) * fade, 8, dt);
    halo.current.opacity = damp(halo.current.opacity, (0.1 + lift.current * 0.3) * fade, 8, dt);
  });

  return (
    <group ref={group}>
      {/* Light spilling out from under the slab. */}
      <mesh rotation-x={-Math.PI / 2} position-y={-SLAB[1] / 2 - 0.02} scale={[SLAB[0] * 1.55, SLAB[2] * 1.7, 1]}>
        <planeGeometry />
        <meshBasicMaterial ref={halo} map={glow} color={layer.color} transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
      <mesh>
        <boxGeometry args={SLAB} />
        <meshPhysicalMaterial
          ref={body}
          color={tint}
          emissive={layer.color}
          emissiveIntensity={0.16}
          roughness={0.22}
          metalness={0.35}
          clearcoat={1}
          clearcoatRoughness={0.18}
          transparent
          opacity={0}
        />
      </mesh>
      <lineSegments geometry={edges}>
        <lineBasicMaterial ref={edge} color={layer.color} transparent opacity={0} toneMapped={false} />
      </lineSegments>
      <mesh rotation-x={-Math.PI / 2} position-y={SLAB[1] / 2 + 0.004}>
        <planeGeometry args={[SLAB[0], SLAB[2]]} />
        <meshBasicMaterial ref={label} map={texture} transparent opacity={0} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  );
}

// Small lights that travel down through the layers and back: a request and its response.
function Packets({ rig, still }) {
  const count = 8;
  const refs = useRef([]);
  const seeds = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        x: (((i * 37) % 11) / 11 - 0.5) * (SLAB[0] - 0.7),
        z: (((i * 53) % 13) / 13 - 0.5) * (SLAB[2] - 0.6),
        offset: i / count,
        speed: 0.1 + ((i * 17) % 5) * 0.012,
        up: i % 3 === 0
      })),
    []
  );

  useFrame(({ clock }) => {
    const { gap, opacity } = rig.current;
    const spread = smooth((gap - 0.5) / 0.4);
    const span = 1.5 * gap + 0.2;
    seeds.forEach((seed, i) => {
      const mesh = refs.current[i];
      if (!mesh) return;
      const t = still ? seed.offset : (clock.elapsedTime * seed.speed + seed.offset) % 1;
      const along = seed.up ? t : 1 - t;
      mesh.position.set(seed.x, -span + along * span * 2, seed.z);
      mesh.material.opacity = Math.sin(t * Math.PI) * spread * opacity;
      mesh.visible = mesh.material.opacity > 0.01;
    });
  });

  return seeds.map((seed, i) => (
    <mesh key={i} ref={el => (refs.current[i] = el)}>
      <boxGeometry args={[0.05, 0.24, 0.05]} />
      <meshBasicMaterial color={seed.up ? '#5fe3d4' : '#ff9a4d'} transparent opacity={0} toneMapped={false} />
    </mesh>
  ));
}

function Ring({ rig, radius, tilt, speed, color, still }) {
  const mesh = useRef();
  useFrame(({ clock }) => {
    if (!still) mesh.current.rotation.z = clock.elapsedTime * speed;
    mesh.current.material.opacity = 0.42 * rig.current.opacity;
  });
  return (
    <mesh ref={mesh} rotation={tilt}>
      <torusGeometry args={[radius, 0.008, 8, 160, Math.PI * 1.55]} />
      <meshBasicMaterial color={color} transparent opacity={0} toneMapped={false} />
    </mesh>
  );
}

function Stack({ still }) {
  const group = useRef();
  const aura = useRef();
  const { size } = useThree();
  const aspect = size.width / size.height;
  const tall = aspect < 1;
  const glow = useMemo(() => glowTexture(), []);
  // Live values the children read each frame, eased toward the pose for the current scroll position.
  const rig = useRef({ gap: 0.44, opacity: 0 });
  const target = useMemo(() => new Array(8).fill(0), []);
  const live = useRef(null);

  useEffect(() => () => glow.dispose(), [glow]);
  useEffect(() => {
    live.current = null;
  }, [tall]);

  useFrame(({ clock }, delta) => {
    const dt = Math.min(delta, 0.05);
    mixInto(target, tall ? tallPoses : POSES.wide);
    const values = live.current || (live.current = target.slice());
    const rate = still ? 60 : 4.2;
    for (let k = 0; k < values.length; k++) values[k] = damp(values[k], target[k], rate, dt);
    const [x, y, z, scale, rotX, rotY, gap, opacity] = values;
    const time = still ? 0 : clock.elapsedTime;
    // Wide poses assume a 16:10 window; narrower landscape windows pull the stack in and shrink it a little.
    const fit = tall ? 1 : Math.min(1, Math.max(0.72, aspect / 1.55));

    rig.current.gap = gap;
    rig.current.opacity = opacity;
    group.current.visible = opacity > 0.01;
    group.current.position.set(tall ? x : x * fit, y + Math.sin(time * 0.7) * 0.07, z);
    group.current.scale.setScalar(scale * fit);
    group.current.rotation.x = rotX + sceneState.pointerY * 0.07 + Math.sin(time * 0.45) * 0.025;
    group.current.rotation.y = rotY + sceneState.pointerX * 0.16 + Math.sin(time * 0.3) * 0.1;
    aura.current.material.opacity = 0.2 * opacity;
  });

  return (
    <group ref={group}>
      <sprite ref={aura} scale={[9, 9, 1]} renderOrder={-10}>
        <spriteMaterial map={glow} color="#3fd8c8" transparent opacity={0} depthWrite={false} depthTest={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </sprite>
      {LAYERS.map((layer, index) => (
        <Slab key={layer.letter} layer={layer} index={index} rig={rig} glow={glow} />
      ))}
      <Packets rig={rig} still={still} />
      <Ring rig={rig} radius={2.75} tilt={[Math.PI / 2.25, 0.2, 0]} speed={0.16} color="#5fe3d4" still={still} />
      <Ring rig={rig} radius={3.15} tilt={[Math.PI / 1.8, -0.35, 1]} speed={-0.11} color="#ff9a4d" still={still} />
    </group>
  );
}

/* ---------- Dust ---------- */

function Dust({ still }) {
  const points = useRef();
  const geometry = useMemo(() => {
    const count = 900;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const teal = new THREE.Color('#5fe3d4');
    const sodium = new THREE.Color('#ff9a4d');
    const bone = new THREE.Color('#e8ece6');
    // Deterministic pseudo-random spread so the field looks the same on every load.
    let seed = 7;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };
    for (let i = 0; i < count; i++) {
      const radius = 5 + rand() * 13;
      const theta = rand() * Math.PI * 2;
      const phi = Math.acos(2 * rand() - 1);
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.cos(phi) * 1.4;
      positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta) - 6;
      const pick = rand();
      const color = pick < 0.4 ? teal : pick < 0.62 ? sodium : bone;
      const dim = 0.35 + rand() * 0.65;
      colors[i * 3] = color.r * dim;
      colors[i * 3 + 1] = color.g * dim;
      colors[i * 3 + 2] = color.b * dim;
    }
    const buffer = new THREE.BufferGeometry();
    buffer.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    buffer.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return buffer;
  }, []);

  useFrame(({ clock }, delta) => {
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const progress = window.scrollY / max;
    const time = still ? 0 : clock.elapsedTime;
    // Scrolling lifts and turns the whole field, so the page feels like it travels through it.
    points.current.position.y = damp(points.current.position.y, progress * 9, 3, Math.min(delta, 0.05));
    points.current.rotation.y = time * 0.012 + progress * 1.1 + sceneState.pointerX * 0.04;
    points.current.rotation.x = sceneState.pointerY * 0.03;
  });

  return (
    <points ref={points} geometry={geometry}>
      <pointsMaterial size={0.05} sizeAttenuation vertexColors transparent opacity={0.85} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
    </points>
  );
}

// Stops drawing while an overlay covers the stage.
function Pause() {
  const set = useThree(state => state.setFrameloop);
  useEffect(() => {
    const id = setInterval(() => set(sceneState.paused ? 'never' : 'always'), 250);
    return () => clearInterval(id);
  }, [set]);
  return null;
}

export default function Scene() {
  const [dpr, setDpr] = useState(() => Math.min(window.devicePixelRatio || 1, 1.6));
  const still = prefersReducedMotion();

  useEffect(() => {
    const onMove = event => {
      if (event.pointerType === 'touch') return;
      sceneState.pointerX = (event.clientX / window.innerWidth) * 2 - 1;
      sceneState.pointerY = (event.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  return (
    <Canvas
      dpr={dpr}
      camera={{ position: [0, 0, 10], fov: 35, near: 0.1, far: 60 }}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      style={{ position: 'fixed', inset: 0, pointerEvents: 'none' }}
      aria-hidden="true"
    >
      <PerformanceMonitor onDecline={() => setDpr(value => Math.max(0.7, value - 0.35))} />
      <Pause />
      <Director />
      <Backdrop still={still} />
      <ambientLight intensity={0.9} />
      <directionalLight position={[4, 6, 5]} intensity={2.6} color="#ffe2c4" />
      <pointLight position={[-5, 1, 3]} intensity={40} color="#5fe3d4" />
      <pointLight position={[3, -3, 4]} intensity={24} color="#ff9a4d" />
      <Dust still={still} />
      <Stack still={still} />
    </Canvas>
  );
}
