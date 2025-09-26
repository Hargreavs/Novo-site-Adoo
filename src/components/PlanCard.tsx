import React from "react";

type Props = React.PropsWithChildren<{ className?: string }>;

export default function PlanCard({ children, className = "" }: Props) {
  return (
    <div
      className={[
        "relative group isolate rounded-2xl bg-[#0f1623] text-slate-100 shadow-lg",
        "ring-1 ring-white/5", // borda base discreta
        "transition-transform duration-200 ease-out",
        className,
      ].join(" ")}
    >
      {/* HALO EXTERNO (atrás do card) */}
      <span
        aria-hidden
        className="pointer-events-none absolute -inset-2 rounded-[1.25rem] opacity-0
                   transition-opacity duration-200 ease-out
                   group-hover:opacity-40 group-focus-within:opacity-40"
        style={{
          // gradiente suave e amplo para o halo
          background:
            "conic-gradient(from var(--angle,0deg), rgba(56,189,248,.18), rgba(59,130,246,.18), rgba(99,102,241,.18), rgba(56,189,248,.18))",
          filter: "blur(14px) saturate(120%)",
          zIndex: 0,
        }}
      />

      {/* ANEL NA BORDA (só o contorno) */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0
                   transition-opacity duration-200 ease-out
                   group-hover:opacity-100 group-focus-within:opacity-100"
        style={{
          padding: "1px", // 1–2px
          background:
            "conic-gradient(from var(--angle,0deg), rgba(56,189,248,.25), rgba(59,130,246,.25), rgba(99,102,241,.25), rgba(56,189,248,.25))",
          WebkitMask:
            "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          borderRadius: "1rem",
          filter: "drop-shadow(0 0 8px rgba(56,189,248,.22))",
          willChange: "filter",
          zIndex: 1,
        }}
      />

      {/* CONTEÚDO */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
