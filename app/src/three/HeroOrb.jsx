import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei/core/PerformanceMonitor.js';
import * as THREE from 'three';
import { prefersReducedMotion } from '../lib/scroll.js';

/* The hero's centrepiece: a liquid-chrome orb in a dark studio.

   The orb is a sphere whose surface is pushed in and out by slow 3D noise, with the normals recomputed in the
   vertex shader so the reflections bend with it. It is lit only by reflections of a small studio built in
   code: a white key light above, an orange strip on one side and a teal one on the other. Two thin chrome
   rings orbit it. The canvas belongs to the hero alone and stops drawing as soon as the hero leaves the
   screen, so the rest of the page scrolls with nothing running behind it. */

const NOISE = /* glsl */ `
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
  uniform float uTime;
  uniform float uAmp;
  vec3 liquid(vec3 p) {
    vec3 dir = normalize(p);
    float n = snoise(dir * 0.95 + vec3(0.0, uTime * 0.16, uTime * 0.08));
    n += 0.22 * snoise(dir * 1.9 - vec3(uTime * 0.12, 0.0, uTime * 0.07));
    return p + dir * n * uAmp;
  }
`;

// A dark studio whose only light comes from a few glowing panels; the orb reflects it.
function studioEnvironment(gl) {
  const scene = new THREE.Scene();
  const room = new THREE.Mesh(new THREE.SphereGeometry(20, 32, 16), new THREE.MeshBasicMaterial({ color: '#0b0b0e', side: THREE.BackSide }));
  scene.add(room);
  const panel = (w, h, color, strength, position, lookAt = [0, 0, 0]) => {
    const material = new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(strength), side: THREE.DoubleSide });
    material.toneMapped = false;
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), material);
    mesh.position.set(...position);
    mesh.lookAt(...lookAt);
    scene.add(mesh);
  };
  panel(10, 1.4, '#ffffff', 3.2, [0, 6, 1]);
  // A broad, dim softbox in front gives the chrome its mid-tones instead of reflecting black everywhere.
  panel(9, 7, '#c9ccd6', 1.1, [-2, 2, 8]);
  panel(5, 6, '#8f96a8', 0.6, [5, -2, 6]);
  panel(1.2, 9, '#ff8a3d', 5, [-6.5, 0.5, 1]);
  panel(1.2, 9, '#56d8c9', 3.6, [6.5, -0.5, 1]);
  panel(6, 0.8, '#ffffff', 1.4, [0, -5, 3]);
  panel(4, 4, '#7a5cff', 0.7, [0, 1, -8]);
  const pmrem = new THREE.PMREMGenerator(gl);
  const texture = pmrem.fromScene(scene, 0.05).texture;
  pmrem.dispose();
  scene.traverse(object => {
    object.geometry?.dispose();
    object.material?.dispose();
  });
  return texture;
}

function Studio() {
  const gl = useThree(state => state.gl);
  const scene = useThree(state => state.scene);
  useEffect(() => {
    const texture = studioEnvironment(gl);
    scene.environment = texture;
    return () => {
      scene.environment = null;
      texture.dispose();
    };
  }, [gl, scene]);
  return null;
}

const pointer = { x: 0, y: 0, active: 0 };

function Orb({ still, compact }) {
  const mesh = useRef();
  const group = useRef();
  const uniforms = useMemo(() => ({ uTime: { value: 4 }, uAmp: { value: 0.13 } }), []);
  const material = useMemo(() => {
    const m = new THREE.MeshPhysicalMaterial({
      color: '#e9ebf0',
      metalness: 1,
      roughness: 0.09,
      iridescence: 1,
      iridescenceIOR: 1.3,
      envMapIntensity: 1.35
    });
    m.iridescenceThicknessRange = [160, 520];
    m.onBeforeCompile = shader => {
      shader.uniforms.uTime = uniforms.uTime;
      shader.uniforms.uAmp = uniforms.uAmp;
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', `#include <common>\n${NOISE}`)
        .replace(
          '#include <beginnormal_vertex>',
          `vec3 dispPos = liquid(position);
           vec3 baseNormal = normalize(position);
           vec3 tangent = normalize(abs(baseNormal.y) > 0.99 ? cross(baseNormal, vec3(1.0, 0.0, 0.0)) : cross(baseNormal, vec3(0.0, 1.0, 0.0)));
           vec3 bitangent = normalize(cross(baseNormal, tangent));
           float eps = 0.01;
           vec3 pa = liquid(position + tangent * eps);
           vec3 pb = liquid(position + bitangent * eps);
           vec3 objectNormal = normalize(cross(pa - dispPos, pb - dispPos));
           if (dot(objectNormal, baseNormal) < 0.0) objectNormal = -objectNormal;`
        )
        .replace('#include <begin_vertex>', 'vec3 transformed = dispPos;');
    };
    return m;
  }, [uniforms]);
  useEffect(() => () => material.dispose(), [material]);

  const spin = useRef({ x: 0, y: 0, amp: 0.16 });

  useFrame(({ clock }, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = still ? 4 : clock.elapsedTime;
    const s = spin.current;
    const k = 1 - Math.exp(-3 * dt);
    s.x += (pointer.y * 0.35 - s.x) * k;
    s.y += (pointer.x * 0.5 - s.y) * k;
    s.amp += ((0.13 + pointer.active * 0.07) - s.amp) * (1 - Math.exp(-2 * dt));
    uniforms.uTime.value = t;
    uniforms.uAmp.value = s.amp;
    mesh.current.rotation.set(s.x + t * 0.05, s.y + t * 0.09, 0);
    // As the hero scrolls away the orb sinks and turns, which keeps the exit from feeling static.
    const scroll = Math.min(1.5, window.scrollY / window.innerHeight);
    group.current.position.y = (compact ? 0.15 : 0) - scroll * 0.9 + Math.sin(t * 0.6) * 0.05;
    group.current.rotation.z = scroll * 0.4;
  });

  return (
    <group ref={group} scale={compact ? 0.9 : 1}>
      <mesh ref={mesh} material={material}>
        <icosahedronGeometry args={[1.25, compact ? 32 : 44]} />
      </mesh>
      <Rings still={still} />
    </group>
  );
}

function Rings({ still }) {
  const a = useRef();
  const b = useRef();
  const moonA = useRef();
  const moonB = useRef();
  const chrome = useMemo(() => new THREE.MeshStandardMaterial({ color: '#d9dce3', metalness: 1, roughness: 0.18, envMapIntensity: 1.2 }), []);
  useEffect(() => () => chrome.dispose(), [chrome]);
  useFrame(({ clock }) => {
    const t = still ? 2 : clock.elapsedTime;
    a.current.rotation.z = t * 0.12;
    b.current.rotation.z = -t * 0.08;
    moonA.current.position.set(Math.cos(t * 0.5) * 1.95, Math.sin(t * 0.5) * 1.95, 0);
    moonB.current.position.set(Math.cos(-t * 0.35 + 2) * 2.3, Math.sin(-t * 0.35 + 2) * 2.3, 0);
  });
  return (
    <>
      <group ref={a} rotation={[1.25, 0.35, 0]}>
        <mesh material={chrome}>
          <torusGeometry args={[1.95, 0.006, 8, 220]} />
        </mesh>
        <mesh ref={moonA} material={chrome}>
          <sphereGeometry args={[0.07, 24, 16]} />
        </mesh>
      </group>
      <group ref={b} rotation={[1.0, -0.6, 0.4]}>
        <mesh material={chrome}>
          <torusGeometry args={[2.3, 0.004, 8, 240]} />
        </mesh>
        <mesh ref={moonB} material={chrome}>
          <sphereGeometry args={[0.045, 20, 12]} />
        </mesh>
      </group>
    </>
  );
}

export default function HeroOrb({ compact = false }) {
  const holder = useRef(null);
  const [visible, setVisible] = useState(true);
  const [dpr, setDpr] = useState(() => Math.min(window.devicePixelRatio || 1, 1.5));
  const still = prefersReducedMotion();

  // Draw only while the hero is on screen.
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { rootMargin: '80px' });
    observer.observe(holder.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onMove = event => {
      if (event.pointerType === 'touch') return;
      pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (event.clientY / window.innerHeight) * 2 - 1;
    };
    const onDown = () => (pointer.active = 1);
    const onUp = () => (pointer.active = 0);
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });
    window.addEventListener('pointerup', onUp, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
    };
  }, []);

  return (
    <div ref={holder} className="absolute inset-0" aria-hidden="true">
      <Canvas
        dpr={dpr}
        frameloop={still ? 'demand' : visible ? 'always' : 'never'}
        camera={{ position: [0, 0, 6.2], fov: 35 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance', toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
        resize={{ scroll: false, debounce: { scroll: 0, resize: 150 } }}
        style={{ pointerEvents: 'none' }}
      >
        <PerformanceMonitor onDecline={() => setDpr(value => Math.max(1, value - 0.25))} />
        <Studio />
        <Orb still={still} compact={compact} />
      </Canvas>
    </div>
  );
}
