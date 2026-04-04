"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, OrbitControls, Torus, shaderMaterial } from "@react-three/drei";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";

const GridMaterial = shaderMaterial(
  { uTime: 0, uColor: new THREE.Color("#73f0c4") },
  `
    varying vec2 vUv;

    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  `
    uniform float uTime;
    uniform vec3 uColor;
    varying vec2 vUv;

    float gridLine(vec2 uv, float scale) {
      vec2 grid = abs(fract(uv * scale - 0.5) - 0.5) / fwidth(uv * scale);
      float line = min(grid.x, grid.y);
      return 1.0 - min(line, 1.0);
    }

    void main() {
      vec2 uv = vUv;
      uv.y += uTime * 0.045;
      float major = gridLine(uv, 12.0);
      float minor = gridLine(uv + vec2(0.13, 0.0), 28.0) * 0.45;
      float pulse = 0.55 + 0.45 * sin(uTime * 1.6 + uv.y * 12.0);
      float fade = smoothstep(1.1, 0.12, distance(vUv, vec2(0.5, 0.48)));
      vec3 color = uColor * (major + minor) * pulse;
      gl_FragColor = vec4(color, (major * 0.3 + minor * 0.18) * fade);
    }
  `
);

function FloatingCore({ intensity }: { intensity: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const shellRef = useRef<THREE.Mesh>(null);
  const wireRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (!groupRef.current || !shellRef.current || !wireRef.current) {
      return;
    }

    const rotationBoost = 0.38 + intensity * 1.15;
    const pulse = 1 + intensity * 0.18 + Math.sin(performance.now() * 0.0045) * 0.04 * (0.4 + intensity);

    groupRef.current.rotation.x += delta * (0.18 + rotationBoost * 0.42);
    groupRef.current.rotation.y += delta * (0.32 + rotationBoost * 0.66);
    groupRef.current.rotation.z += delta * (0.1 + intensity * 0.22);
    groupRef.current.scale.setScalar(THREE.MathUtils.lerp(groupRef.current.scale.x, pulse, 0.08));

    const shellMaterial = shellRef.current.material as THREE.MeshPhysicalMaterial;
    const wireMaterial = wireRef.current.material as THREE.MeshBasicMaterial;
    shellMaterial.emissiveIntensity = THREE.MathUtils.lerp(shellMaterial.emissiveIntensity, 1.05 + intensity * 1.8, 0.08);
    wireMaterial.opacity = THREE.MathUtils.lerp(wireMaterial.opacity, 0.45 + intensity * 0.5, 0.12);
  });

  return (
    <group ref={groupRef}>
      <Float speed={2.6} rotationIntensity={1.2} floatIntensity={1.8}>
        <mesh ref={shellRef}>
          <icosahedronGeometry args={[1.35, 3]} />
          <meshPhysicalMaterial
            color="#7f96ff"
            emissive="#73f0c4"
            emissiveIntensity={1.05}
            roughness={0.16}
            metalness={0.78}
            clearcoat={1}
            clearcoatRoughness={0.12}
            transparent
            opacity={0.92}
          />
        </mesh>
      </Float>

      <Float speed={2.1} rotationIntensity={1} floatIntensity={1.5}>
        <mesh ref={wireRef} scale={1.08}>
          <icosahedronGeometry args={[1.35, 1]} />
          <meshBasicMaterial color="#73f0c4" wireframe transparent opacity={0.48} />
        </mesh>
      </Float>

      <Float speed={1.8} rotationIntensity={0.8} floatIntensity={1.2}>
        <Torus args={[1.85, 0.05, 32, 180]} rotation={[1.1, 0.3, 0.5]}>
          <meshStandardMaterial color="#73f0c4" emissive="#73f0c4" emissiveIntensity={1.2} />
        </Torus>
      </Float>

      <Float speed={1.4} rotationIntensity={0.5} floatIntensity={0.9}>
        <Torus args={[2.35, 0.04, 32, 180]} rotation={[-0.8, 0.2, -0.4]}>
          <meshStandardMaterial color="#ff9966" emissive="#ff9966" emissiveIntensity={0.9} transparent opacity={0.85} />
        </Torus>
      </Float>
    </group>
  );
}

function OrbitingShard({
  radius,
  speed,
  color,
  intensity,
  offset = 0
}: {
  radius: number;
  speed: number;
  color: string;
  intensity: number;
  offset?: number;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) {
      return;
    }

    const time = clock.getElapsedTime() * (speed + intensity * 0.8) + offset;
    groupRef.current.position.x = Math.cos(time) * radius;
    groupRef.current.position.z = Math.sin(time) * radius;
    groupRef.current.position.y = Math.sin(time * 1.7) * (0.45 + intensity * 0.18);
    groupRef.current.rotation.x += 0.02 + intensity * 0.025;
    groupRef.current.rotation.y += 0.03 + intensity * 0.03;
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <octahedronGeometry args={[0.18, 0]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.6} roughness={0.18} metalness={0.35} />
      </mesh>
    </group>
  );
}

function SceneBackdrop() {
  const material = useMemo(() => new GridMaterial(), []);

  useFrame(({ clock }) => {
    material.uniforms.uTime.value = clock.getElapsedTime();
  });

  return (
    <>
      <mesh position={[0, 0, -3.4]}>
        <planeGeometry args={[12, 8]} />
        <meshBasicMaterial color="#09111d" transparent opacity={0.9} />
      </mesh>
      <mesh position={[0, -0.05, -2.9]} rotation={[-0.22, 0, 0]}>
        <planeGeometry args={[10.5, 6.4]} />
        <primitive object={material} attach="material" transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh position={[0, -1.9, -0.8]} rotation={[-1.2, 0, 0]}>
        <circleGeometry args={[3.8, 64]} />
        <meshBasicMaterial color="#73f0c4" transparent opacity={0.08} />
      </mesh>
      
      {/* Holographic floor */}
      <mesh position={[0, -2.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[14, 10]} />
        <meshBasicMaterial 
          color="#7f96ff" 
          transparent 
          opacity={0.06} 
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      
      {/* Energy field */}
      <mesh position={[0, 0, -1.5]}>
        <sphereGeometry args={[2.8, 32, 32]} />
        <meshBasicMaterial 
          color="#73f0c4" 
          transparent 
          opacity={0.04} 
          wireframe 
        />
      </mesh>
    </>
  );
}

function Starfield() {
  const pointsRef = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const data = new Float32Array(180 * 3);
    for (let index = 0; index < 180; index += 1) {
      const offset = index * 3;
      data[offset] = (Math.random() - 0.5) * 11;
      data[offset + 1] = (Math.random() - 0.5) * 7;
      data[offset + 2] = -1.5 - Math.random() * 4.8;
    }
    return data;
  }, []);

  useFrame(({ clock }) => {
    if (!pointsRef.current) {
      return;
    }

    pointsRef.current.rotation.z = clock.getElapsedTime() * 0.025;
    pointsRef.current.position.y = Math.sin(clock.getElapsedTime() * 0.35) * 0.08;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color="#d7e2ff" size={0.035} sizeAttenuation transparent opacity={0.75} />
    </points>
  );
}

export default function HeroScene() {
  const [hoverPower, setHoverPower] = useState(0);

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    const distance = Math.sqrt(x * x + y * y);
    setHoverPower(Math.max(0, 1 - distance * 2.15));
  }

  return (
    <div
      className="depth-panel relative h-[420px] w-full overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(127,150,255,0.3),transparent_35%),linear-gradient(180deg,rgba(7,17,31,0.65),rgba(4,10,22,0.95))] shadow-glow"
      onPointerMove={handlePointerMove}
      onPointerLeave={() => setHoverPower(0)}
    >
      <div className="absolute inset-x-12 top-6 h-20 rounded-full bg-aurora/10 blur-3xl" />
      <div className="absolute inset-x-16 bottom-4 h-16 rounded-full bg-ember/10 blur-3xl" />
      <Canvas camera={{ position: [0, 0.2, 6], fov: 42 }}>
        <color attach="background" args={["#060d17"]} />
        <fog attach="fog" args={["#060d17", 6, 11]} />
        <ambientLight intensity={0.8} />
        <directionalLight position={[2, 3, 4]} intensity={2.4} color="#ffffff" />
        <pointLight position={[3, 4, 5]} intensity={30} color="#73f0c4" />
        <pointLight position={[-3, -2, 3]} intensity={18} color="#ff9966" />
        <spotLight position={[0, 4, 2]} intensity={28} angle={0.45} penumbra={1} color="#7f96ff" />
        <SceneBackdrop />
        <Starfield />
        <FloatingCore intensity={hoverPower} />
        <OrbitingShard radius={2.7} speed={0.9} color="#73f0c4" intensity={hoverPower} />
        <OrbitingShard radius={2.2} speed={1.1} color="#ff9966" intensity={hoverPower} offset={1.4} />
        <OrbitingShard radius={3.1} speed={0.75} color="#7f96ff" intensity={hoverPower} offset={3.2} />
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.8} />
      </Canvas>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_42%,rgba(6,13,23,0.32)_100%)]" />
    </div>
  );
}
