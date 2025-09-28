"use client";
import { motion } from "framer-motion";
import { useEffect } from "react";

export default function SuccessBadge({
  size = 96,
  onComplete,
  className = "",
}: { 
  size?: number; 
  onComplete?: () => void;
  className?: string;
}) {
  useEffect(() => {
    const t = setTimeout(() => {
      console.log('=== SUCCESS BADGE ANIMATION COMPLETE ===');
      console.log('Animation finished completely, calling onComplete callback');
      onComplete?.();
    }, 1100); // chama após a animação
    return () => clearTimeout(t);
  }, [onComplete]);

  const stroke = Math.max(6, Math.round(size * 0.08));
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <svg width={size} height={size} viewBox="0 0 100 100" style={{
        filter: 'drop-shadow(0 25px 25px rgba(0, 0, 0, 0.3))'
      }}>
        {/* glow ring */}
        <motion.circle
          cx="50" cy="50" r="40"
          fill="transparent" stroke="rgba(34,197,94,.35)" strokeWidth="6"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        />
        {/* green dot */}
        <motion.circle
          cx="50" cy="50" r="32"
          fill="#22c55e"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        />
        {/* check */}
        <motion.path
          d="M35 50 L45 60 L65 40"
          fill="none"
          stroke="white"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 0.25, ease: "easeInOut" }}
        />
      </svg>
    </div>
  );
}
