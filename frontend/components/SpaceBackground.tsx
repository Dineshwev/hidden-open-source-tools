"use client";

import { useRef, useEffect } from 'react';

interface SpaceBackgroundProps {
  className?: string;
  starCount?: number;
  particleCount?: number;
}

export default function SpaceBackground({ 
  className = '',
  starCount = 300, 
  particleCount = 50 
}: SpaceBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let mouseX = 0;
    let mouseY = 0;
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    // Stars
    const stars: { x: number; y: number; size: number; speed: number; brightness: number }[] = [];
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 1.5 + 0.5,
        speed: Math.random() * 0.5 + 0.1,
        brightness: Math.random() * 0.5 + 0.5,
      });
    }

    // Particles (nebula glows)
    const particles: { x: number; y: number; vx: number; vy: number; size: number; brightness: number; life: number }[] = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        size: Math.random() * 3 + 1,
        brightness: Math.random() * 0.3 + 0.1,
        life: Math.random(),
      });
    }

    const animate = () => {
      ctx.fillStyle = 'rgba(7, 17, 31, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      time += 0.016;

      // Update and draw stars
      stars.forEach((star) => {
        star.x -= star.speed + (mouseX * 0.001);
        star.y += Math.sin(time + star.y * 0.01) * 0.2;
        
        if (star.x < 0) star.x = canvas.width;

        const gradient = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.size * 2);
        gradient.addColorStop(0, `rgba(255, 255, 255, ${star.brightness})`);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size * 2, 0, Math.PI * 2);
        ctx.fill();
      });

      // Update and draw particles
      particles.forEach((particle, index) => {
        particle.x += particle.vx + (mouseX * 0.002 - 0.5);
        particle.y += particle.vy + Math.sin(time * 0.5 + particle.x * 0.01) * 0.1;
        particle.life -= 0.001;
        
        if (particle.life < 0) {
          particle.x = Math.random() * canvas.width;
          particle.y = Math.random() * canvas.height;
          particle.life = 1;
        }

        const gradient = ctx.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, particle.size);
        gradient.addColorStop(0, `rgba(127, 150, 255, ${particle.brightness * particle.life})`);
        gradient.addColorStop(0.5, `rgba(115, 240, 196, ${particle.brightness * particle.life * 0.6})`);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Mouse trail effect
      const gradient = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 80);
      gradient.addColorStop(0, 'rgba(127, 150, 255, 0.1)');
      gradient.addColorStop(1, 'rgba(127, 150, 255, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(mouseX, mouseY, 80, 0, Math.PI * 2);
      ctx.fill();

      animationId = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, [starCount, particleCount]);

  return (
    <canvas 
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-0 ${className}`}
    />
  );
}

