"use client";

import { motion } from "framer-motion";

export default function Divider() {
  return (
    <div className="relative w-full h-16 flex items-center justify-center overflow-hidden bg-white">
      {/* Gradient Line */}
      <div className="absolute top-1/2 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-orange-500 to-transparent" />

      {/* Animated Floating Particles */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            background:
              i % 3 === 0
                ? "rgba(249,115,22,0.9)" // orange
                : i % 3 === 1
                ? "rgba(168,85,247,0.9)" // purple
                : "rgba(59,130,246,0.9)", // blue
            boxShadow: "0 0 10px rgba(0,0,0,0.2)",
          }}
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * 20 - 10, // slight vertical variation
            opacity: 0,
            scale: 0.6,
          }}
          animate={{
            x: [Math.random() * 50, Math.random() * window.innerWidth],
            opacity: [0, 1, 0],
            scale: [0.6, 1.2, 0.6],
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
