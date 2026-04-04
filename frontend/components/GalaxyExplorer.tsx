"use client";

import { useRef, useState, useEffect, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { User, Star, Award } from 'lucide-react';

const CreatorNode = ({ position, name, color = '#7f96ff', id }: { position: [number, number, number]; name: string; color?: string; id: string }) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  const raycaster = useThree((state) => state.raycaster);
  const mouse = useThree((state) => state.mouse);

  const intersect = useCallback(() => {
    raycaster.setFromCamera(mouse, useThree((state) => state.camera));
    const intersects = raycaster.intersectObject(meshRef.current);
    return intersects.length > 0;
  }, [raycaster, mouse]);

  useFrame((state) => {
    if (!meshRef.current) return;
    
    // Rotation and floating
    meshRef.current.rotation.y += 0.02;
    meshRef.current.rotation.x += 0.01;
    meshRef.current.position.y += Math.sin(state.clock.elapsedTime * 2 + id) * 0.002;
    
    // Hover glow
    const isHover = intersect();
    setHovered(isHover);
    meshRef.current.scale.setScalar(isHover ? 1.3 : 1);
    
    meshRef.current.material.emissiveIntensity = isHover ? 1.5 : 0.5;
  });

  return (
    <>
      <mesh ref={meshRef} position={position}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial 
          color={color} 
          emissive={color} 
          emissiveIntensity={0.5}
          roughness={0.2}
          metalness={0.8}
        />
        <pointLight intensity={0.1} distance={1} />
      </mesh>
      {hovered && (
        <mesh position={position}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.3} />
        </mesh>
      )}
    </>
  );
};

const creators = [
  { name: 'Alex Rivera', position: [0, 0, 0], color: '#7f96ff' },
  { name: 'Luna Voss', position: [2, 1.5, -1], color: '#73f0c4' },
  { name: 'Kai Nova', position: [-1.5, -0.5, 2], color: '#ff9966' },
  { name: 'Zara Quill', position: [1.8, -1, -1.5], color: '#a855f7' },
  { name: 'Rex Holt', position: [-2, 0.8, 1], color: '#f59e0b' },
  { name: 'Nova Blake', position: [1, 2, 0.5], color: '#06b6d4' },
];

export default function GalaxyExplorer() {
  const [selectedCreator, setSelectedCreator] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedCreator(null);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a1a] via-[#0f0f2a] to-[#1a0a2a] overflow-hidden">
      {/* Header */}
      <motion.header className="sticky top-0 z-50 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#7f96ff] via-[#73f0c4] to-[#ff9966] bg-clip-text text-transparent">
            Galaxy Explorer
          </h1>
          <p className="text-white/70 mt-1">Discover creators across the universe</p>
        </div>
      </motion.header>

      {/* Canvas */}
      <div ref={canvasRef} className="w-full h-[80vh] md:h-screen">
        <Canvas camera={{ position: [0, 0, 5] }}>
          <color attach="background" args={['#000a1a']} />
          <ambientLight intensity={0.3} />
          <pointLight position={[10, 10, 10]} intensity={0.5} />
          
          {/* Stars */}
          <Stars />
          
          {/* Galaxy arms */}
          <GalaxyArms />
          
          {/* Creator nodes */}
          {creators.map((creator, index) => (
            <CreatorNode
              key={creator.name}
              {...creator}
              id={`${index}`}
              onClick={() => setSelectedCreator(creator.name)}
            />
          ))}
          
          <OrbitControls 
            enableZoom
            enablePan
            enableRotate
            zoomSpeed={0.8}
            panSpeed={0.5}
            rotateSpeed={0.8}
          />
        </Canvas>
      </div>

      {/* UI Controls */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-4 text-sm text-white/60">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#7f96ff] rounded-full shadow-glow animate-pulse" />
            Mouse: Hover to glow | Click to view
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#73f0c4] rounded-full shadow-glow animate-pulse" />
            Wheel: Zoom | Drag: Rotate/Pan
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#ff9966] rounded-full shadow-glow animate-pulse" />
            ESC: Close modal
          </div>
        </div>
      </div>

      {/* Portfolio Modal */}
      <AnimatePresence>
        {selectedCreator && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="max-w-2xl w-full max-h-[80vh] overflow-y-auto rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl p-8 shadow-2xl shadow-[#7f96ff]/25"
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
            >
              <button
                onClick={() => setSelectedCreator(null)}
                className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors"
              >
                <ChevronLeft className="h-6 w-6 rotate-180" />
              </button>
              
              <div className="text-center mb-8">
                <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#7f96ff] to-[#73f0c4] p-4 shadow-glow-lg animate-spin-slow">
                  <User className="h-12 w-12 mx-auto text-white drop-shadow-lg" />
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-white via-[#73f0c4] to-[#ff9966] bg-clip-text text-transparent mb-4">
                  {selectedCreator}
                </h2>
                <p className="text-lg text-white/80 max-w-md mx-auto">
                  Top creator with 247 uploads, 89% approval rate, Epic tier contributor.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-embe"></div>
                    <div>
                      <div className="font-semibold text-white">Uploads</div>
                      <div className="text-2xl font-bold text-[#73f0c4]">247</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-[#ff9966]"></div>
                    <div>
                      <div className="font-semibold text-white">Followers</div>
                      <div className="text-2xl font-bold text-[#ff9966]">1.2K</div>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-white/80 mb-4">Recent Work</div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                      <div className="w-12 h-8 rounded-lg bg-gradient-to-r from-nebula-400" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-white truncate">Neon UI Kit</div>
                        <div className="text-xs text-white/60">3D Assets</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                      <div className="w-12 h-8 rounded-lg bg-gradient-to-r from-aurora" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-white truncate">Cyberpunk HUD</div>
                        <div className="text-xs text-white/60">UI Components</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 pt-8 border-t border-white/10 flex gap-4 justify-center">
                <button className="px-8 py-3 rounded-2xl bg-gradient-to-r from-nebula-500 to-[#73f0c4] text-white font-semibold hover:shadow-glow-lg transition-all hover:scale-105">
                  View Full Portfolio
                </button>
                <button className="px-8 py-3 rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm text-white font-semibold hover:bg-white/10 transition-all hover:scale-105">
                  Follow Creator
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Stars() {
  const points = useRef<THREE.Points>(null!);
  const positions = useMemo(() => {
    const pos = new Float32Array(10000 * 3);
    for (let i = 0; i < 10000; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 100;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 100;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 100;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (!points.current) return;
    points.current.rotation.y = state.clock.elapsedTime * 0.1;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#ffffff"
        size={0.02}
        sizeAttenuation
        transparent
        opacity={0.8}
      />
    </points>
  );
}

function GalaxyArms() {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.z = state.clock.elapsedTime * 0.2;
  });

  return (
    <group ref={groupRef}>
      <TorusKnot args={[1.5, 0.3, 100, 16]} rotation={[0, 0, Math.PI / 4]}>
        <meshStandardMaterial 
          color="#4a5568" 
          emissive="#1a202c" 
          emissiveIntensity={0.3}
          wireframe
          transparent 
          opacity={0.6}
        />
      </TorusKnot>
      <TorusKnot args={[2.2, 0.2, 80, 12]} rotation={[0, 0, -Math.PI / 6]}>
        <meshStandardMaterial 
          color="#718096" 
          emissive="#2d3748" 
          emissiveIntensity={0.2}
          wireframe
          transparent 
          opacity={0.4}
        />
      </TorusKnot>
    </group>
  );
}

