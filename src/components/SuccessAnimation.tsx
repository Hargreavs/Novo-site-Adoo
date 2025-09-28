"use client";
import { useEffect, useMemo, useRef } from "react";
import Lottie, { LottieRefCurrentProps } from "lottie-react";
import raw from "../assets/animations/success-check.json";

type Props = {
  size?: number;
  onComplete?: () => void;
  playbackSpeed?: number; // 0.5 ~ 2
  className?: string;
};

/** Corrige qualquer stroke com opacidade baixa e garante stroke branco visível */
function fixJson(data: any) {
  const clone = JSON.parse(JSON.stringify(data));
  try {
    for (const layer of clone.layers ?? []) {
      // procure por grupos e dentro deles por itens de stroke
      const stack: any[] = [...(layer.shapes ?? [])];
      while (stack.length) {
        const it = stack.pop();
        if (!it) continue;
        if (Array.isArray(it.it)) stack.push(...it.it);

        if (it.ty === "st") {
          // força opacidade 100 e cor branca
          if (it.o?.k != null && it.o.k < 100) it.o.k = 100;
          if (it.c?.k && Array.isArray(it.c.k)) it.c.k = [1, 1, 1, 1];
          // aumenta um pouco a espessura (ajuda em telas retina/fundo escuro)
          if (it.w?.k != null && it.w.k < 6) it.w.k = 6;
        }
      }
    }
  } catch {
    /* ignore */
  }
  return clone;
}

export default function SuccessAnimation({
  size = 96,
  onComplete,
  playbackSpeed = 1,
  className = "",
}: Props) {
  const data = useMemo(() => fixJson(raw), []);
  const lottieRef = useRef<LottieRefCurrentProps>(null);

  useEffect(() => {
    // velocidade correta via API do player
    lottieRef.current?.setSpeed?.(playbackSpeed);
  }, [playbackSpeed]);

  useEffect(() => {
    const inst = lottieRef.current;
    const handle = () => {
      console.log('=== LOTTIE ANIMATION COMPLETE ===');
      console.log('Animation finished completely, calling onComplete callback');
      onComplete?.();
    };
    // use o listener do player (mais confiável que prop onComplete)
    if (inst && 'addEventListener' in inst) {
      (inst as any).addEventListener("complete", handle);
      return () => (inst as any).removeEventListener("complete", handle);
    }
  }, [onComplete]);

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Lottie
        lottieRef={lottieRef}
        animationData={data}
        loop={false}
        autoplay
        rendererSettings={{
          preserveAspectRatio: "xMidYMid meet",
          progressiveLoad: false,
        }}
        style={{
          width: size,
          height: size,
          filter: "drop-shadow(0 25px 25px rgba(0,0,0,.3))",
        }}
      />
    </div>
  );
}
