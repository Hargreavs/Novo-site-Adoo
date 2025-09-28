"use client";
import { motion, useAnimation } from "framer-motion";
import { useEffect } from "react";

type Props = {
  size?: number;          // diâmetro do badge
  onComplete?: () => void; // chamado ao terminar a animação (~1.1s)
  className?: string;
};

export default function ErrorBadge({ size = 96, onComplete, className = "" }: Props) {
  const controls = useAnimation();
  const stroke = Math.max(6, Math.round(size * 0.08)); // espessura proporcional

  useEffect(() => {
    (async () => {
      await controls.start("enter");
      await controls.start("draw");
      await controls.start("shake");
      onComplete?.();
    })();
  }, [controls, onComplete]);

  return (
    <motion.div
      className={`flex items-center justify-center ${className}`}
      initial="initial"
      animate={controls}
      variants={{
        initial: { x: 0, y: 0 },
        shake: {
          x: [0, -3, 3, -2, 2, 0],
          transition: { duration: 0.35, ease: "easeInOut" },
        },
      }}
    >
      <svg width={size} height={size} viewBox="0 0 100 100" style={{
        filter: 'drop-shadow(0 25px 25px rgba(0, 0, 0, 0.3))'
      }}>
        {/* anel de glow */}
        <motion.circle
          cx="50"
          cy="50"
          r="40"
          fill="transparent"
          stroke="rgba(239,68,68,.35)" // red-500
          strokeWidth="6"
          variants={{
            initial: { opacity: 0, scale: 0.8 },
            enter: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
          }}
        />
        {/* círculo vermelho */}
        <motion.circle
          cx="50"
          cy="50"
          r="32"
          fill="#ef4444" // red-500
          variants={{
            initial: { scale: 0, opacity: 0 },
            enter: {
              scale: 1,
              opacity: 1,
              transition: { type: "spring", stiffness: 300, damping: 20 },
            },
          }}
        />
        {/* traços do X */}
        <motion.path
          d="M35 35 L65 65"
          fill="none"
          stroke="white"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={{
            initial: { pathLength: 0 },
            draw: {
              pathLength: 1,
              transition: { duration: 0.35, delay: 0.25, ease: "easeInOut" },
            },
          }}
        />
        <motion.path
          d="M65 35 L35 65"
          fill="none"
          stroke="white"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={{
            initial: { pathLength: 0 },
            draw: {
              pathLength: 1,
              transition: { duration: 0.35, delay: 0.45, ease: "easeInOut" },
            },
          }}
        />
      </svg>
    </motion.div>
  );
}
