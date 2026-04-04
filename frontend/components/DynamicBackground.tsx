"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useRef, useMemo, useState } from "react";
import * as THREE from "three";
import { shaderMaterial } from "@react-three/drei";

const HologramMaterial = shaderMaterial(
  { uTime: 0, uResolution: new THREE.Vector2(), uMouse: new THREE.Vector2() },
  `
    uniform vec2 uResolution;
    uniform vec2 uMouse;
    uniform float uTime;
    varying vec2 vUv;

    void main() {
      vUv = uv;
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  `
    uniform vec2 uResolution;
    uniform vec2 uMouse;
    uniform float uTime;
    varying vec2 vUv;

    float noise(vec2 p) {
      return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
    }

    float fbm(vec2 p) {
      float value = 0.0;
      float amplitude = 0.5;
      float frequency = 1.0;
      
      for (int i = 0; i < 4; i++) {
        value += amplitude * noise(p * frequency);
        amplitude *= 0.5;
        frequency *= 2.0;
      }
      return value;
    }

    void main() {
      vec2 uv = vUv;
      vec2 mouse = uMouse / uResolution;
      
      // Animated grid
      float grid = abs(sin(uv.x * 20.0 + uTime * 2.0)) * abs(sin(uv.y * 20.0 + uTime * 2.0));
      grid = smoothstep(0.95, 1.0, grid);
      
      // Flowing noise pattern
      float noisePattern = fbm(uv * 8.0 + uTime * 0.5);
      noisePattern = smoothstep(0.4, 0.6, noisePattern);
      
      // Mouse interaction ripple
      float dist = distance(uv, mouse);
      float ripple = sin(dist * 50.0 - uTime * 10.0) * exp(-dist * 5.0);
      
      // Hologram colors
      vec3 color1 = vec3(0.47, 0.59, 1.0); // Blue
      vec3 color2 = vec3(0.45, 0.94, 0.78); // Teal
      vec3 color3 = vec3(1.0, 0.6, 0.4);    // Orange
      
      vec3 finalColor = mix(color1, color2, noisePattern);
      finalColor = mix(finalColor, color3, grid);
      
      // Add scanlines effect
      float scanlines = abs(sin(uv.y * 200.0 + uTime * 10.0));
      finalColor *= 1.0 - scanlines * 0.3;
      
      // Add ripple effect
      finalColor += vec3(ripple) * 0.5;
      
      // Fade edges
      float vignette = smoothstep(0.8, 0.2, length(uv - 0.5));
      
      gl_FragColor = vec4(finalColor * vignette, 0.15);
    }
  `
);

const ParticleMaterial = shaderMaterial(
  { uTime: 0, uResolution: new THREE.Vector2() },
  `
    uniform float uTime;
    uniform vec2 uResolution;
    attribute float aRandom;
    varying float vOpacity;
    
    void main() {
      vec3 pos = position;
      pos.y += sin(uTime * 0.5 + pos.x * 2.0) * 2.0;
      pos.x += cos(uTime * 0.3 + pos.y * 1.5) * 1.5;
      
      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      gl_Position = projectionMatrix * mvPosition;
      
      vOpacity = aRandom;
      gl_PointSize = (150.0 / -mvPosition.z) * aRandom;
    }
  `,
  `
    uniform float uTime;
    varying float vOpacity;
    
    void main() {
      vec2 coord = gl_PointCoord - vec2(0.5);
      float dist = length(coord);
      float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
      
      vec3 color = vec3(0.73, 0.94, 0.78);
      color += sin(uTime + gl_FragCoord.x * 0.01) * 0.1;
      
      gl_FragColor = vec4(color, alpha * vOpacity * 0.8);
    }
  `
);

function HologramPlane() {
  const materialRef = useRef<any>(null);
  const { size, pointer } = useThree();

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.getElapsedTime();
      materialRef.current.uniforms.uResolution.value.set(size.width, size.height);
      materialRef.current.uniforms.uMouse.value.set(pointer.x, pointer.y);
    }
  });

  return (
    <mesh>
      <planeGeometry args={[20, 20]} />
      <primitive
        ref={materialRef}
        object={new HologramMaterial()}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}

function FloatingParticles() {
  const materialRef = useRef<any>(null);
  const geometryRef = useRef<THREE.BufferGeometry>(null);
  const count = 1500;

  const positions = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const randoms = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
      randoms[i] = Math.random();
    }
    
    return { positions, randoms };
  }, []);

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.getElapsedTime();
    }
  });

  return (
    <points ref={geometryRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aRandom"
          count={count}
          array={positions.randoms}
          itemSize={1}
        />
      </bufferGeometry>
      <primitive
        ref={materialRef}
        object={new ParticleMaterial()}
        transparent
        depthWrite={false}
      />
    </points>
  );
}

function DataStream() {
  const groupRef = useRef<THREE.Group>(null);
  const meshRefs = useRef<THREE.Mesh[]>([]);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.1;
      groupRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.2) * 0.1;
    }
    
    meshRefs.current.forEach((mesh, i) => {
      if (mesh) {
        mesh.rotation.z = clock.getElapsedTime() * 0.5;
      }
    });
  });

  return (
    <group ref={groupRef}>
      {[...Array(8)].map((_, i) => (
        <mesh
          key={i}
          position={[Math.cos(i * 0.8) * 6, Math.sin(i * 0.8) * 6, Math.sin(i * 0.5) * 2]}
          ref={(el) => {
            if (el) meshRefs.current[i] = el;
          }}
        >
          <boxGeometry args={[0.8, 0.1, 0.1]} />
          <meshBasicMaterial color="#7f96ff" transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  );
}

function CyberGrid() {
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.opacity = 0.3 + Math.sin(clock.getElapsedTime() * 0.5) * 0.1;
    }
  });

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <gridHelper args={[40, 40, "#73f0c4", "#7f96ff"]} />
      <meshBasicMaterial ref={materialRef} transparent opacity={0.3} />
    </mesh>
  );
}

export default function DynamicBackground() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 60 }}
        onPointerMove={(e) => setMousePosition({ x: e.clientX, y: e.clientY })}
      >
        <color attach="background" args={["#060d17"]} />
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#7f96ff" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#73f0c4" />
        
        <HologramPlane />
        <FloatingParticles />
        <DataStream />
        <CyberGrid />
      </Canvas>
      
      {/* CSS-based overlay effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[rgba(115,240,196,0.05)] to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(127,150,255,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
      
      {/* Scanning line effect */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-scan" />
    </div>
  );
}