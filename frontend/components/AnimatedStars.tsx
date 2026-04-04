"use client";

import { motion } from "framer-motion";

const stars = Array.from({ length: 40 }, (_, index) => ({
  id: index,
  left: `${(index * 13) % 100}%`,
  top: `${(index * 19) % 100}%`,
  size: 2 + (index % 4),
  delay: (index % 7) * 0.35,
  driftX: (index % 2 === 0 ? 1 : -1) * (8 + (index % 5) * 4),
  driftY: (index % 3 === 0 ? 1 : -1) * (6 + (index % 4) * 3)
}));

export default function AnimatedStars() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute -left-16 top-0 h-64 w-64 rounded-full bg-nebula-500/15 blur-[110px]"
        animate={{
          x: [0, 36, -18, 0],
          y: [0, 18, 42, 0],
          scale: [1, 1.12, 0.96, 1]
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute right-[-4rem] top-12 h-72 w-72 rounded-full bg-ember/10 blur-[130px]"
        animate={{
          x: [0, -42, 16, 0],
          y: [0, 26, -10, 0],
          scale: [1, 0.94, 1.08, 1]
        }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[-6rem] left-1/3 h-80 w-80 rounded-full bg-aurora/10 blur-[140px]"
        animate={{
          x: [0, 24, -30, 0],
          y: [0, -28, -8, 0],
          scale: [1, 1.08, 0.92, 1]
        }}
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute inset-0 opacity-40"
        animate={{ backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 30%, rgba(255,255,255,0.08) 0, transparent 18%), radial-gradient(circle at 75% 20%, rgba(115,240,196,0.08) 0, transparent 16%), radial-gradient(circle at 60% 80%, rgba(255,153,102,0.08) 0, transparent 18%)",
          backgroundSize: "140% 140%"
        }}
      />

      {stars.map((star) => (
        <motion.span
          key={star.id}
          className="absolute rounded-full bg-white/80 shadow-[0_0_16px_rgba(255,255,255,0.6)]"
          style={{
            left: star.left,
            top: star.top,
            width: star.size,
            height: star.size
          }}
          animate={{
            opacity: [0.2, 1, 0.25],
            scale: [1, 1.6, 1],
            x: [0, star.driftX, 0],
            y: [0, star.driftY, 0]
          }}
          transition={{
            duration: 6 + (star.id % 5),
            delay: star.delay,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      ))}

      <motion.div
        className="absolute inset-y-0 -left-1/3 w-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent blur-3xl"
        animate={{ x: ["0%", "220%"] }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
      />
      
      {/* Cyberpunk scan lines */}
      <motion.div
        className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(255,255,255,0.02)_50%,transparent)] opacity-60"
        animate={{ y: ["0%", "100%"] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />
      
      {/* Holographic interference pattern */}
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(115,240,196,0.06),transparent_60%)] opacity-70"
        animate={{ rotate: "360deg" }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}
