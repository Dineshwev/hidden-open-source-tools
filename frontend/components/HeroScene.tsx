"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, OrbitControls, Sphere, Torus } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

function FloatingCore() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.25;
      meshRef.current.rotation.y += delta * 0.45;
    }
  });

  return (
    <group>
      <Float speed={2.6} rotationIntensity={1.2} floatIntensity={1.8}>
        <Sphere ref={meshRef} args={[1.2, 96, 96]} scale={1.1}>
          <MeshDistortMaterial
            color="#7f96ff"
            emissive="#73f0c4"
            emissiveIntensity={1}
            roughness={0.08}
            metalness={0.45}
            clearcoat={1}
            clearcoatRoughness={0.1}
            distort={0.38}
            speed={2.4}
          />
        </Sphere>
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
  offset = 0
}: {
  radius: number;
  speed: number;
  color: string;
  offset?: number;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) {
      return;
    }

    const time = clock.getElapsedTime() * speed + offset;
    groupRef.current.position.x = Math.cos(time) * radius;
    groupRef.current.position.z = Math.sin(time) * radius;
    groupRef.current.position.y = Math.sin(time * 1.7) * 0.45;
    groupRef.current.rotation.x += 0.02;
    groupRef.current.rotation.y += 0.03;
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
  return (
    <>
      <mesh position={[0, 0, -3.4]} rotation={[0, 0, 0]}>
        <planeGeometry args={[12, 8]} />
        <meshBasicMaterial color="#09111d" transparent opacity={0.9} />
      </mesh>
      <mesh position={[0, -1.9, -0.8]} rotation={[-1.2, 0, 0]}>
        <circleGeometry args={[3.8, 64]} />
        <meshBasicMaterial color="#73f0c4" transparent opacity={0.08} />
      </mesh>
    </>
  );
}

export default function HeroScene() {
  return (
    <div className="depth-panel relative h-[420px] w-full overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(127,150,255,0.3),transparent_35%),linear-gradient(180deg,rgba(7,17,31,0.65),rgba(4,10,22,0.95))] shadow-glow">
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
        <FloatingCore />
        <OrbitingShard radius={2.7} speed={0.9} color="#73f0c4" />
        <OrbitingShard radius={2.2} speed={1.1} color="#ff9966" offset={1.4} />
        <OrbitingShard radius={3.1} speed={0.75} color="#7f96ff" offset={3.2} />
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.8} />
      </Canvas>
    </div>
  );
}
