'use client';

import React, { useLayoutEffect, useState } from "react";
import "../styles/hero-lines.css";

const HeroSection = () => {
  const [hoveredLine, setHoveredLine] = useState<string | null>(null);

  // Normalize paths and set dash properties
  useLayoutEffect(() => {
    const idList = ["contour-main", "contour-left", "contour-top", "contour-right"];
    idList.forEach((id) => {
      const path = document.getElementById(id);
      const glint = document.getElementById(`${id}-glint`);
      if (!path || !glint) return;

      const len = path.getTotalLength();
      console.log(`Length of ${id}: ${len}`); // Para depuração
      const windowLen = Math.max(120, Math.floor(len * 0.18)); // Comprimento do feixe
      const bigGap = len * 1000; // Garante one-shot
      const start = bigGap + len; // Começa fora da linha
      const end = bigGap - windowLen; // Termina após atravessar

      glint.style.strokeDasharray = `${windowLen} ${bigGap}`;
      glint.style.setProperty("--glintOffsetStart", `${start}`);
      glint.style.setProperty("--glintOffsetEnd", `${end}`);
      glint.style.strokeDashoffset = `${start}`;
      glint.style.opacity = "0";
    });
  }, []);

  // Trigger animation on load with stagger
  useLayoutEffect(() => {
    const idList = ["contour-main", "contour-left", "contour-top", "contour-right"];
    const cleanups: (() => void)[] = [];

    idList.forEach((id, i) => {
      const glint = document.getElementById(`${id}-glint`);
      if (!glint) return;

      const startSweep = () => {
        if (glint.getAttribute("data-started") === "1") return;
        glint.setAttribute("data-started", "1");
        glint.style.opacity = "1";
        glint.classList.add("play");
      };

      const timeoutId = setTimeout(startSweep, i * 400); // Stagger de 400ms
      cleanups.push(() => clearTimeout(timeoutId));

      const onAnimationEnd = (e: AnimationEvent) => {
        if (e.animationName === "shimmer-sweep") {
          glint.classList.remove("play");
          glint.style.opacity = "0";
        }
      };

      glint.addEventListener("animationend", onAnimationEnd);
      cleanups.push(() => glint.removeEventListener("animationend", onAnimationEnd));
    });

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return (
    <div className="hero-container">
      <svg
        className="hero-svg"
        viewBox="0 0 1920 1080"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(59, 130, 246, 0)" />
            <stop offset="20%" stopColor="rgba(59, 130, 246, 0.15)" />
            <stop offset="50%" stopColor="rgba(139, 92, 246, 0.25)" />
            <stop offset="80%" stopColor="rgba(59, 130, 246, 0.15)" />
            <stop offset="100%" stopColor="rgba(59, 130, 246, 0)" />
          </linearGradient>
          <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(139, 92, 246, 0)" />
            <stop offset="30%" stopColor="rgba(139, 92, 246, 0.1)" />
            <stop offset="60%" stopColor="rgba(59, 130, 246, 0.2)" />
            <stop offset="100%" stopColor="rgba(139, 92, 246, 0)" />
          </linearGradient>
          <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(236, 72, 153, 0)" />
            <stop offset="25%" stopColor="rgba(236, 72, 153, 0.1)" />
            <stop offset="75%" stopColor="rgba(139, 92, 246, 0.15)" />
            <stop offset="100%" stopColor="rgba(236, 72, 153, 0)" />
          </linearGradient>
          <linearGradient id="heroShimmer" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(59, 130, 246, 0)" />
            <stop offset="45%" stopColor="rgba(59, 130, 246, 0)" />
            <stop offset="50%" stopColor="rgba(99, 102, 241, 1)" />
            <stop offset="55%" stopColor="rgba(168, 85, 247, 1)" />
            <stop offset="60%" stopColor="rgba(99, 102, 241, 1)" />
            <stop offset="100%" stopColor="rgba(59, 130, 246, 0)" />
          </linearGradient>
          <filter id="heroGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="12" result="b1" />
            <feGaussianBlur stdDeviation="16" result="b2" />
            <feMerge>
              <feMergeNode in="b2" />
              <feMergeNode in="b1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <g style={{ mixBlendMode: "screen", opacity: 0.8 }}>
          <path
            id="contour-main"
            className={`hero-line ${hoveredLine === "contour-main" ? "is-hot" : ""}`}
            d="M220,560 L1505,360 L1855,1040 L140,1040 Z"
            fill="none"
            transform="translate(0, 10)"
            stroke="url(#gradient1)"
            strokeWidth={hoveredLine === "contour-main" ? 2.5 : 1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              pointerEvents: "stroke",
              vectorEffect: "non-scaling-stroke",
              opacity: hoveredLine === "contour-main" ? 0.95 : 0.65,
            }}
            onMouseEnter={() => setHoveredLine("contour-main")}
            onMouseLeave={() => setHoveredLine(null)}
          />
          <use
            id="contour-main-glint"
            xlinkHref="#contour-main"
            className="hero-glint"
          />
          <path
            id="contour-left"
            className={`hero-line ${hoveredLine === "contour-left" ? "is-hot" : ""}`}
            d="M0,140 L700,10 L630,170 L120,380 Z"
            fill="none"
            transform="translate(-10, -10)"
            stroke="url(#gradient2)"
            strokeWidth={hoveredLine === "contour-left" ? 2.5 : 1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              pointerEvents: "stroke",
              vectorEffect: "non-scaling-stroke",
              opacity: hoveredLine === "contour-left" ? 0.95 : 0.6,
            }}
            onMouseEnter={() => setHoveredLine("contour-left")}
            onMouseLeave={() => setHoveredLine(null)}
          />
          <use
            id="contour-left-glint"
            xlinkHref="#contour-left"
            className="hero-glint"
          />
          <path
            id="contour-top"
            className={`hero-line ${hoveredLine === "contour-top" ? "is-hot" : ""}`}
            d="M1040,10 L1910,150 L1760,320 L900,250 Z"
            fill="none"
            transform="translate(0, -18)"
            stroke="url(#gradient3)"
            strokeWidth={hoveredLine === "contour-top" ? 2.5 : 1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              pointerEvents: "stroke",
              vectorEffect: "non-scaling-stroke",
              opacity: hoveredLine === "contour-top" ? 0.95 : 0.6,
            }}
            onMouseEnter={() => setHoveredLine("contour-top")}
            onMouseLeave={() => setHoveredLine(null)}
          />
          <use
            id="contour-top-glint"
            xlinkHref="#contour-top"
            className="hero-glint"
          />
          <path
            id="contour-right"
            className={`hero-line ${hoveredLine === "contour-right" ? "is-hot" : ""}`}
            d="M1290,440 L1635,380 L1918,1080 L1490,1080 Z"
            fill="none"
            transform="translate(-8, 0)"
            stroke="url(#gradient2)"
            strokeWidth={hoveredLine === "contour-right" ? 2.5 : 1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              pointerEvents: "stroke",
              vectorEffect: "non-scaling-stroke",
              opacity: hoveredLine === "contour-right" ? 0.95 : 0.6,
            }}
            onMouseEnter={() => setHoveredLine("contour-right")}
            onMouseLeave={() => setHoveredLine(null)}
          />
          <use
            id="contour-right-glint"
            xlinkHref="#contour-right"
            className="hero-glint"
          />
        </g>
      </svg>
    </div>
  );
};

export default HeroSection;
