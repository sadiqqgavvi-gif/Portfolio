import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei/core/PerformanceMonitor.js';
import * as THREE from 'three';
import { sceneState } from '../lib/scene-state.js';
import { prefersReducedMotion } from '../lib/scroll.js';

/* The stage: "full stack" drawn literally. Four slabs float in space, one per layer a request passes
   through. They sit assembled beside the hero, pull apart in the Stack section, step out of the way for
   the project cards and come back for the contact section. A slow particle field drifts behind it all. */

const LAYERS = [
  { letter: 'R', name: 'REACT', sub: 'interface', color: '#5fd3c7' },
  { letter: 'E', name: 'EXPRESS', sub: 'api routes', color: '#e8ece6' },
  { letter: 'N', name: 'NODE', sub: 'server runtime', color: '#ff9a4d' },
  { letter: 'M', name: 'MONGODB', sub: 'data', color: '#58c98a' }
];
const SLAB = [3.4, 0.14, 2.3];

// One pose per page section, in page order: [x, y, z, scale, rotX, rotY, gap, opacity]
const SECTIONS = ['top', 'about', 'services', 'stack', 'work', 'journey', 'contact'];
const POSES = {
  wide: [
    [2.75, -0.15, 0, 1, 0.5, -0.62, 0.42, 1],
    [3.9, 0.9, -3, 0.8, 0.95, -0.25, 0.3, 0.22],
    [-4.6, 1.4, -4, 0.6, 0.8, 0.5, 0.3, 0.08],
    [2.55, -0.05, 0, 0.9, 0.36, -0.72, 1.12, 1],
    [0, 0.4, -7, 0.5, 0.9, 0.2, 0.3, 0],
    [3.5, -0.3, -1.5, 0.74, 0.74, 0.55, 0.34, 0.3],
    [3.0, -0.1, 0, 0.92, 0.52, -0.5, 0.5, 0.85]
  ],
  narrow: [
    [0.55, -1.75, -1, 0.56, 0.55, -0.6, 0.42, 0.6],
    [0.8, 0.6, -3, 0.5, 0.95, -0.25, 0.3, 0.14],
    [-0.6, 1, -4, 0.45, 0.8, 0.5, 0.3, 0.06],
    [0.2, -0.3, -1, 0.56, 0.4, -0.7, 1.05, 0.26],
    [0, 0.4, -7, 0.4, 0.9, 0.2, 0.3, 0],
    [0.4, -0.6, -2, 0.5, 0.74, 0.55, 0.34, 0.14],
    [0.3, -1.5, -1, 0.56, 0.55, -0.5, 0.5, 0.5]
  ]
};

const smooth = t => {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
};
const damp = (current, target, lambda, dt) => current + (target - current) * (1 - Math.exp(-lambda * dt));

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
    ctx.globalAlpha = 0.1;
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
    ctx.globalAlpha = 0.75;
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

function Slab({ layer, index, rig }) {
  const group = useRef();
  const body = useRef();
  const edge = useRef();
  const label = useRef();
  const texture = useMemo(() => labelTexture(layer), [layer]);
  const edges = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(...SLAB)), []);
  const lift = useRef(0);

  useEffect(() => () => texture.dispose(), [texture]);

  useFrame((_, dt) => {
    const { gap, opacity } = rig.current;
    const active = sceneState.highlight === index;
    const dimmed = sceneState.highlight >= 0 && !active;
    lift.current = damp(lift.current, active ? 1 : 0, 7, dt);
    group.current.position.y = (1.5 - index) * gap;
    group.current.position.x = lift.current * 0.3;
    group.current.position.z = lift.current * 0.3;
    const fade = opacity * (dimmed ? 0.4 : 1);
    body.current.opacity = damp(body.current.opacity, 0.95 * fade, 8, dt);
    edge.current.opacity = damp(edge.current.opacity, (0.55 + lift.current * 0.45) * fade, 8, dt);
    label.current.opacity = damp(label.current.opacity, (0.78 + lift.current * 0.22) * fade, 8, dt);
    body.current.emissiveIntensity = 0.06 + lift.current * 0.12;
  });

  return (
    <group ref={group}>
      <mesh>
        <boxGeometry args={SLAB} />
        <meshPhysicalMaterial
          ref={body}
          color="#0c1d26"
          emissive={layer.color}
          emissiveIntensity={0.06}
          roughness={0.32}
          metalness={0.55}
          clearcoat={0.7}
          clearcoatRoughness={0.3}
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
  const count = 7;
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
    const spread = smooth((gap - 0.5) / 0.5);
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
      <boxGeometry args={[0.05, 0.22, 0.05]} />
      <meshBasicMaterial color={seed.up ? '#5fd3c7' : '#ff9a4d'} transparent opacity={0} toneMapped={false} />
    </mesh>
  ));
}

function Ring({ rig, radius, tilt, speed, color, still }) {
  const mesh = useRef();
  useFrame(({ clock }) => {
    if (!still) mesh.current.rotation.z = clock.elapsedTime * speed;
    mesh.current.material.opacity = 0.3 * rig.current.opacity;
  });
  return (
    <mesh ref={mesh} rotation={tilt}>
      <torusGeometry args={[radius, 0.007, 8, 160, Math.PI * 1.55]} />
      <meshBasicMaterial color={color} transparent opacity={0} toneMapped={false} />
    </mesh>
  );
}

function Stack({ still }) {
  const group = useRef();
  const { size } = useThree();
  const narrow = size.width < 900;
  // Live values the children read each frame, eased toward the pose for the current scroll position.
  const rig = useRef({ gap: 0.42, opacity: 0, values: null });
  const bounds = useRef([]);

  useEffect(() => {
    const measure = () => {
      bounds.current = SECTIONS.map(id => {
        const el = document.getElementById(id);
        return el ? el.getBoundingClientRect().top + window.scrollY : 0;
      });
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

  useFrame(({ clock }, delta) => {
    const dt = Math.min(delta, 0.05);
    const poses = narrow ? POSES.narrow : POSES.wide;
    const vh = window.innerHeight;
    const center = window.scrollY + vh * 0.5;

    // Blend from one section's pose to the next across the screen-height around their boundary.
    const target = poses[0].slice();
    for (let i = 1; i < poses.length; i++) {
      const t = smooth((center - (bounds.current[i] - vh * 0.05)) / (vh * 0.8));
      if (t <= 0) break;
      for (let k = 0; k < target.length; k++) target[k] += (poses[i][k] - target[k]) * t;
    }

    const values = rig.current.values || (rig.current.values = target.slice());
    const rate = still ? 60 : 4.2;
    for (let k = 0; k < values.length; k++) values[k] = damp(values[k], target[k], rate, dt);
    const [x, y, z, scale, rotX, rotY, gap, opacity] = values;
    const time = still ? 0 : clock.elapsedTime;

    rig.current.gap = gap;
    rig.current.opacity = opacity;
    group.current.visible = opacity > 0.01;
    group.current.position.set(x, y + Math.sin(time * 0.7) * 0.07, z);
    group.current.scale.setScalar(scale);
    group.current.rotation.x = rotX + sceneState.pointerY * 0.07 + Math.sin(time * 0.45) * 0.025;
    group.current.rotation.y = rotY + sceneState.pointerX * 0.16 + Math.sin(time * 0.3) * 0.1;
  });

  return (
    <group ref={group}>
      {LAYERS.map((layer, index) => (
        <Slab key={layer.letter} layer={layer} index={index} rig={rig} />
      ))}
      <Packets rig={rig} still={still} />
      <Ring rig={rig} radius={2.75} tilt={[Math.PI / 2.25, 0.2, 0]} speed={0.16} color="#5fd3c7" still={still} />
      <Ring rig={rig} radius={3.15} tilt={[Math.PI / 1.8, -0.35, 1]} speed={-0.11} color="#ff9a4d" still={still} />
    </group>
  );
}

function Dust({ still }) {
  const points = useRef();
  const geometry = useMemo(() => {
    const count = 1500;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const teal = new THREE.Color('#5fd3c7');
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
      const color = pick < 0.45 ? teal : pick < 0.7 ? sodium : bone;
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
      <pointsMaterial size={0.045} sizeAttenuation vertexColors transparent opacity={0.9} depthWrite={false} toneMapped={false} />
    </points>
  );
}

// Stops drawing while an overlay covers the stage or the tab is hidden.
function Pause() {
  const set = useThree(state => state.setFrameloop);
  useEffect(() => {
    const id = setInterval(() => set(sceneState.paused ? 'never' : 'always'), 250);
    return () => clearInterval(id);
  }, [set]);
  return null;
}

export default function Scene() {
  const [dpr, setDpr] = useState(() => Math.min(window.devicePixelRatio || 1, 1.75));
  const still = prefersReducedMotion();

  useEffect(() => {
    const onMove = event => {
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
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      style={{ position: 'fixed', inset: 0, pointerEvents: 'none' }}
      aria-hidden="true"
    >
      <PerformanceMonitor onDecline={() => setDpr(1)} />
      <Pause />
      <ambientLight intensity={0.7} />
      <directionalLight position={[4, 6, 5]} intensity={2.2} color="#ffd9b8" />
      <pointLight position={[-5, 1, 3]} intensity={30} color="#5fd3c7" />
      <pointLight position={[3, -3, 4]} intensity={18} color="#ff9a4d" />
      <Dust still={still} />
      <Stack still={still} />
    </Canvas>
  );
}
