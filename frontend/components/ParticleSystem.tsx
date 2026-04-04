"use client";

import { useEffect, useRef, useCallback } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  trail: Array<{x: number; y: number; alpha: number}>;
}

export default function ParticleSystem({ 
  className = "absolute inset-0 pointer-events-none", 
  particleCount = 120,
  colors = ["#73f0c4", "#7f96ff", "#ff9966", "#7cffae"]
}: { 
  className?: string; 
  particleCount?: number;
  colors?: string[];
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mousePosRef = useRef({ x: 0, y: 0 });
  const particlesRef = useRef<Particle[]>([]);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.globalCompositeOperation = 'saturation';
    ctx.fillStyle = 'rgba(6, 13, 23, 0.15)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    particlesRef.current.forEach((particle, i) => {
      // Mouse attraction
      const dx = mousePosRef.current.x - particle.x;
      const dy = mousePosRef.current.y - particle.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 150) {
        particle.vx += (dx / dist) * 0.08;
        particle.vy += (dy / dist) * 0.08;
      }

      // Physics
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vx *= 0.96;
      particle.vy *= 0.96;
      particle.alpha += (0.8 - particle.alpha) * 0.02;

      // Wraparound
      if (particle.x < 0) particle.x += canvas.width;
      if (particle.x > canvas.width) particle.x -= canvas.width;
      if (particle.y < 0) particle.y += canvas.height;
      if (particle.y > canvas.height) particle.y -= canvas.height;

      // Draw trail
      particle.trail.push({ x: particle.x, y: particle.y, alpha: particle.alpha * 0.3 });
      if (particle.trail.length > 12) particle.trail.shift();

      particle.trail.forEach((point, j) => {
        ctx.save();
        ctx.globalAlpha = point.alpha * (1 - j / particle.trail.length);
        const gradient = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, particle.radius);
        gradient.addColorStop(0, particle.color);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(point.x, point.y, particle.radius * (1 - j / particle.trail.length), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Draw particle
      ctx.save();
      ctx.globalAlpha = particle.alpha;
      const glowGradient = ctx.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, particle.radius * 2);
      glowGradient.addColorStop(0, particle.color);
      glowGradient.addColorStop(0.4, particle.color + '40');
      glowGradient.addColorStop(1, 'transparent');
      ctx.shadowBlur = 24;
      ctx.shadowColor = particle.color;
      ctx.fillStyle = glowGradient;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    ctx.restore();
    requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();

    window.addEventListener('resize', resize);
    canvas.addEventListener('mousemove', (e) => {
      mousePosRef.current.x = e.clientX;
      mousePosRef.current.y = e.clientY;
    });

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particlesRef.current.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: 2 + Math.random() * 3,
        color: colors[Math.floor(Math.random() * colors.length)]!,
        alpha: 0.3 + Math.random() * 0.4,
        trail: []
      });
    }

    animate();

    return () => {
      window.removeEventListener('resize', resize);
    };
  }, [animate, particleCount, colors]);

  return <canvas ref={canvasRef} className={className} />;
}
