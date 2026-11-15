import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei/core/PerformanceMonitor.js';
import * as THREE from 'three';
import { sceneState } from '../lib/scene-state.js';
import { prefersReducedMotion } from '../lib/scroll.js';

/* The stage behind the whole page, drawn in one WebGL canvas on a near-black ground:

   1. Flow: a ribbon of a few hundred hair-thin threads of light that twists and breathes through space,
      with light running along the threads. Scrolling speeds the flow up and turns the ribbon to a new
      angle for every section, so the camera seems to travel around it.
   2. The stack: "full stack" drawn literally as four dark glass slabs, one per layer a request passes
      through. It sits beside the hero, pulls apart while the Stack section is pinned, steps aside for the
      project cards and returns for the contact section.
   3. Dust: a sparse field of motes for depth.

   Everything is cheap per pixel: thin additive lines and a few meshes, no full-screen shader. Every screen
   size gets the same choreography; only the positions differ between wide and tall screens. */

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

// Ribbon pose per section: [x, y, z, rotX, rotY, rotZ, brightness]
const FLOW = {
  wide: [
    [0.6, -0.4, -3, 0.35, -0.25, 0.38, 1],
    [0, 0.3, -4, 0.7, 0.3, -0.22, 0.85],
    [0, -1.2, -5, 1.0, -0.2, 0.12, 0.7],
    [1.4, -0.2, -3, 0.25, -0.5, 0.55, 1],
    [0, 0.6, -5, 0.8, 0.2, -0.3, 0.7],
    [0, 0.2, -6, 0.3, 0, -0.12, 0.62],
    [-0.8, 0.4, -4, 0.55, 0.45, -0.42, 0.85],
    [0.6, -0.5, -3, 0.35, -0.3, 0.4, 1.05]
  ],
  // Tall screens: a smaller ribbon that keeps to the space the text leaves free (around the stack).
  tall: [
    [0, 1.75, -4, 0.35, -0.2, 0.32, 1],
    [0, -2.3, -5, 0.7, 0.3, -0.3, 0.75],
    [0, 0, -6, 1.0, -0.2, 0.4, 0.55],
    [0, 1.85, -4, 0.3, -0.4, 0.3, 0.9],
    [0, 0, -6, 0.8, 0.2, -0.4, 0.55],
    [0, 0, -7, 0.3, 0, -0.5, 0.5],
    [0, 0.3, -5, 0.55, 0.4, -0.5, 0.7],
    [0, -2.4, -4, 0.35, -0.3, 0.3, 0.95]
  ]
};
const COOL = new THREE.Color('#a8efe6');
const WARM = new THREE.Color('#ff9a4d');

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

/* ---------- Flow ---------- */

const FLOW_VERTEX = /* glsl */ `
  attribute float aU;
  attribute float aSeed;
  uniform float uPhase;
  uniform float uGain;
  uniform float uSpread;
  uniform float uFocus;
  uniform float uWarmShare;
  uniform vec3 uCool;
  uniform vec3 uWarm;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    float u = aU;
    float s = aSeed;
    float t = uPhase;
    float h = fract(s * 91.7 + 0.13);
    float x = (u - 0.5) * 26.0;

    // The spine: one long, slow wave through space.
    vec3 spine = vec3(
      x,
      sin(x * 0.16 + t * 0.35) * 1.3 + sin(x * 0.07 - t * 0.21) * 1.6,
      cos(x * 0.12 + t * 0.27) * 1.8
    );

    // Threads fan out across the ribbon, which twists along its length and breathes in width.
    float across = s - 0.5;
    float width = uSpread * (0.5 + 0.5 * sin(x * 0.18 - t * 0.4 + 1.3));
    float angle = x * 0.13 + t * 0.12 + across * 1.4;
    vec3 offset = vec3(0.0, cos(angle), sin(angle)) * across * width;

    // Each thread wanders a little on its own, like loose silk.
    offset.y += sin(x * 0.9 + h * 40.0 + t * 0.8) * 0.05;
    offset.z += cos(x * 0.7 + h * 23.0 - t * 0.6) * 0.07;

    vec4 mv = modelViewMatrix * vec4(spine + offset, 1.0);
    gl_Position = projectionMatrix * mv;

    // Light running along the threads, brightest at the camera's focal depth; the ends fade out.
    float run = pow(0.5 + 0.5 * sin(u * 22.0 - t * 2.6 + h * 30.0), 22.0);
    float ends = smoothstep(0.0, 0.2, u) * smoothstep(1.0, 0.8, u);
    float focus = exp(-pow((-mv.z - uFocus) / 4.5, 2.0));
    // Where the ribbon turns edge-on, hundreds of threads overlap; a low base keeps those folds from
    // burning to white, while the sparse running lights stay bright.
    vAlpha = (0.012 + 0.028 * focus + run * (0.28 + 0.5 * focus)) * ends * uGain;
    vColor = mix(uCool, uWarm, step(1.0 - uWarmShare, h));
  }
`;

const FLOW_FRAGMENT = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    gl_FragColor = vec4(vColor, vAlpha);
  }
`;

function threadGeometry(threads, segments) {
  const count = threads * (segments + 1);
  const u = new Float32Array(count);
  const seed = new Float32Array(count);
  const index = new Uint32Array(threads * segments * 2);
  let k = 0;
  for (let i = 0; i < threads; i++) {
    for (let j = 0; j <= segments; j++) {
      const v = i * (segments + 1) + j;
      u[v] = j / segments;
      seed[v] = (i + 0.5) / threads;
      if (j < segments) {
        index[k++] = v;
        index[k++] = v + 1;
      }
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
  geometry.setAttribute('aU', new THREE.BufferAttribute(u, 1));
  geometry.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
  geometry.setIndex(new THREE.BufferAttribute(index, 1));
  return geometry;
}

function Ribbon({ threads, segments, spread, warmShare, gain, phaseShift = 0, flow, ...props }) {
  const geometry = useMemo(() => threadGeometry(threads, segments), [threads, segments]);
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: FLOW_VERTEX,
        fragmentShader: FLOW_FRAGMENT,
        uniforms: {
          uPhase: { value: 0 },
          uGain: { value: 0 },
          uSpread: { value: spread },
          uFocus: { value: 13 },
          uWarmShare: { value: warmShare },
          uCool: { value: COOL.clone() },
          uWarm: { value: WARM.clone() }
        },
        transparent: true,
        depthWrite: false,
        depthTest: false,
        blending: THREE.AdditiveBlending
      }),
    [spread, warmShare]
  );
  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material]
  );

  useFrame(() => {
    const u = material.uniforms;
    u.uPhase.value = flow.current.phase + phaseShift;
    u.uGain.value = flow.current.gain * gain;
    u.uFocus.value = flow.current.focus;
    u.uCool.value.copy(flow.current.cool);
    u.uWarm.value.copy(flow.current.warm);
  });

  return <lineSegments geometry={geometry} material={material} frustumCulled={false} renderOrder={-5} {...props} />;
}

function Flow({ still }) {
  const group = useRef();
  const { size } = useThree();
  const tall = size.width / size.height < 1;
  const target = useMemo(() => new Array(7).fill(0), []);
  const live = useRef(null);
  const flow = useRef({ phase: 3, gain: 0, focus: 13, cool: COOL.clone(), warm: WARM.clone() });
  const scroll = useRef({ last: window.scrollY, speed: 0 });
  const accent = useMemo(() => new THREE.Color(), []);

  useEffect(() => {
    live.current = null;
  }, [tall]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    mixInto(target, tall ? FLOW.tall : FLOW.wide);
    const values = live.current || (live.current = target.slice());
    for (let k = 0; k < values.length; k++) values[k] = damp(values[k], target[k], still ? 60 : 2.2, dt);
    const [x, y, z, rx, ry, rz, gain] = values;

    // Scrolling makes the light run faster along the threads.
    const s = scroll.current;
    const moved = Math.abs(window.scrollY - s.last) / Math.max(1, window.innerHeight);
    s.last = window.scrollY;
    s.speed = damp(s.speed, Math.min(3, moved / Math.max(dt, 0.001)), 4, dt);
    if (!still) flow.current.phase += dt * (0.45 + s.speed * 1.6);

    // In the work section the threads take on the colour of the project on top of the stack.
    const f = flow.current;
    if (sceneState.accent) accent.set(sceneState.accent).lerp(COOL, 0.35);
    else accent.copy(COOL);
    f.cool.lerp(accent, 1 - Math.exp(-3 * dt));
    f.gain = gain * (sceneState.paused ? 0 : 1);
    f.focus = 10 - z;

    group.current.position.set(x, y, z);
    group.current.rotation.set(rx + sceneState.pointerY * 0.05, ry + sceneState.pointerX * 0.08, rz);
    group.current.scale.setScalar(tall ? 0.6 : 1);
  });

  return (
    <group ref={group}>
      <Ribbon threads={tall ? 120 : 180} segments={tall ? 120 : 150} spread={2.6} warmShare={0.12} gain={tall ? 0.75 : 1} flow={flow} />
      {/* A fainter, wider echo further back gives the ribbon depth. */}
      <Ribbon threads={tall ? 50 : 80} segments={100} spread={4.2} warmShare={0.05} gain={0.55} phaseShift={7} flow={flow} position={[0, 1.6, -4]} rotation={[0.6, 0.2, -0.3]} />
    </group>
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
    body.current.opacity = damp(body.current.opacity, 0.94 * fade, 8, dt);
    body.current.emissiveIntensity = 0.05 + lift.current * 0.3;
    edge.current.opacity = damp(edge.current.opacity, (0.62 + lift.current * 0.38) * fade, 8, dt);
    label.current.opacity = damp(label.current.opacity, (0.82 + lift.current * 0.18) * fade, 8, dt);
    halo.current.opacity = damp(halo.current.opacity, lift.current * 0.3 * fade, 8, dt);
    halo.current.visible = halo.current.opacity > 0.01;
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
        <meshStandardMaterial ref={body} color="#0a161d" emissive={layer.color} emissiveIntensity={0.05} roughness={0.28} metalness={0.65} transparent opacity={0} />
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
  });

  return (
    <group ref={group}>
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
    const count = 650;
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
      <pointsMaterial size={0.042} sizeAttenuation vertexColors transparent opacity={0.6} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
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
  const [dpr, setDpr] = useState(() => Math.min(window.devicePixelRatio || 1, window.matchMedia('(pointer: coarse)').matches ? 1.35 : 1.5));
  // Multisampling is only worth its cost on low-density screens; on phones and retina displays the pixels
  // are small enough that thin lines look clean without it.
  const [antialias] = useState(() => (window.devicePixelRatio || 1) < 1.5);
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
      gl={{ antialias, alpha: false, powerPreference: 'high-performance' }}
      // The canvas is fixed, so it never needs re-measuring on scroll.
      resize={{ scroll: false, debounce: { scroll: 0, resize: 150 } }}
      onCreated={({ gl }) => gl.setClearColor('#04080b')}
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      aria-hidden="true"
    >
      {/* On a struggling device, step the resolution down, but never below one pixel per CSS pixel. */}
      <PerformanceMonitor onDecline={() => setDpr(value => Math.max(1, value - 0.25))} />
      <Pause />
      <Director />
      <Flow still={still} />
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 6, 5]} intensity={2.6} color="#ffe2c4" />
      <pointLight position={[-5, 1, 3]} intensity={34} color="#5fe3d4" />
      <pointLight position={[3, -3, 4]} intensity={24} color="#ff9a4d" />
      <Dust still={still} />
      <Stack still={still} />
    </Canvas>
  );
}
