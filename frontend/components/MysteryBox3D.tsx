"use client";

import { useRef, Suspense, memo, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  Float, 
  MeshDistortMaterial, 
  PerspectiveCamera, 
  Environment, 
  ContactShadows,
  OrbitControls,
  Stars,
  Preload,
  BakeShadows
} from '@react-three/drei';
import * as THREE from 'three';

const BoxContent = memo(function BoxContent({ isOpening, color = "#7f96ff" }: { isOpening: boolean; color?: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.2;
      meshRef.current.rotation.z = t * 0.1;
      
      const targetScale = isOpening ? 1.5 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
      
      if (isOpening) {
        meshRef.current.rotation.y += 0.5 * Math.sin(t * 10);
      }
    }
    
    if (glowRef.current) {
      glowRef.current.rotation.y = -t * 0.1;
      const pulse = Math.sin(t * 2) * 0.05 + 1;
      glowRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  return (
    <>
      <group>
        <mesh ref={meshRef}>
          <boxGeometry args={[2, 2, 2]} />
          <MeshDistortMaterial
            color={color}
            speed={2}
            distort={0.2}
            radius={1}
            emissive={color}
            emissiveIntensity={0.3}
            roughness={0.2}
            metalness={0.8}
            transparent
            opacity={0.9}
          />
        </mesh>

        <mesh ref={glowRef}>
          <sphereGeometry args={[2.5, 24, 24]} />
          <meshBasicMaterial 
            color={color} 
            transparent 
            opacity={0.05} 
            wireframe 
          />
        </mesh>
      </group>

      <Stars radius={50} depth={20} count={300} factor={4} saturation={0} fade speed={0.5} />
    </>
  );
});

export default function MysteryBox3D({ 
  isOpening, 
  color = "#7f96ff",
  onClick 
}: { 
  isOpening: boolean; 
  color?: string;
  onClick: () => void;
}) {
  return (
    <div className="w-full h-[300px] md:h-[400px] cursor-pointer outline-none" onClick={onClick}>
      <Canvas 
        shadows 
        dpr={[1, 1.5]} 
        camera={{ position: [0, 0, 8], fov: 35 }}
        gl={{ antialias: false, powerPreference: "high-performance" }}
      >
        <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={35} />
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1} color={color} />
        <spotLight position={[-10, 10, 10]} angle={0.2} penumbra={1} intensity={1} castShadow />
        
        <Suspense fallback={null}>
          <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
            <BoxContent isOpening={isOpening} color={color} />
          </Float>
          
          <ContactShadows 
            position={[0, -3.5, 0]} 
            opacity={0.3} 
            scale={8} 
            blur={2.5} 
            far={4} 
          />
          
          <Environment preset="night" />
          <Preload all />
          <BakeShadows />
        </Suspense>

        <OrbitControls 
          enableZoom={false} 
          enablePan={false}
          autoRotate={!isOpening}
          autoRotateSpeed={0.4}
          makeDefault
        />
      </Canvas>
      
      {!isOpening && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-white/40 text-[10px] font-bold tracking-[0.4em] uppercase animate-pulse mt-[260px] md:mt-[360px] bg-black/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/5">
            Click to Initiate Unlock
          </div>
        </div>
      )}
    </div>
  );
}
