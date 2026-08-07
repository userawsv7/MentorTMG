"use client";

/**
 * Small, dependency-free SVG diagrams used to visually explain how a flow
 * works (relay fallback, the KodeKey approval gate, API-test triage) instead
 * of relying purely on text. Kept intentionally simple: boxes + arrows +
 * a one-line caption per step, in the app's existing color tokens.
 */

export function Box({ x, y, w, h, label, tone = "base" }: { x: number; y: number; w: number; h: number; label: string; tone?: "base" | "signal" | "flare" | "amber" }) {
  const toneClasses: Record<string, string> = {
    base: "fill-base-850 stroke-base-600",
    signal: "fill-signal-500/10 stroke-signal-500/60",
    flare: "fill-flare-500/10 stroke-flare-500/60",
    amber: "fill-amber-500/10 stroke-amber-500/60",
  };
  const textClasses: Record<string, string> = {
    base: "fill-base-200",
    signal: "fill-signal-400",
    flare: "fill-flare-500",
    amber: "fill-amber-500",
  };
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={10} className={toneClasses[tone]} strokeWidth={1.5} />
      <foreignObject x={x + 6} y={y} width={w - 12} height={h}>
        <div className={`h-full flex items-center justify-center text-center text-[11px] leading-tight font-medium ${textClasses[tone].replace("fill-", "text-")}`}>
          {label}
        </div>
      </foreignObject>
    </g>
  );
}

export function Arrow({ x1, y1, x2, y2, label }: { x1: number; y1: number; x2: number; y2: number; label?: string }) {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  return (
    <g className="stroke-base-500">
      <line x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth={1.5} markerEnd="url(#arrowhead)" />
      {label && (
        <text x={mx} y={my - 4} textAnchor="middle" className="fill-base-500 text-[9px]" style={{ paintOrder: "stroke", stroke: "var(--tw-color-base-950, #0a0e12)", strokeWidth: 3 }}>
          {label}
        </text>
      )}
    </g>
  );
}

export function ArrowDefs() {
  return (
    <defs>
      <marker id="arrowhead" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
        <path d="M0,0 L8,4 L0,8 z" className="fill-base-500" />
      </marker>
    </defs>
  );
}

export function RelayFlowDiagram() {
  return (
    <figure className="rounded-xl border border-base-700 bg-base-900/40 p-3">
      <svg viewBox="0 0 560 130" className="w-full h-auto">
        <ArrowDefs />
        <Box x={10} y={45} w={110} h={40} label="Your message" tone="base" />
        <Arrow x1={120} y1={65} x2={158} y2={65} />
        <Box x={160} y={20} w={130} h={40} label="Try top-ranked model" tone="signal" />
        <Arrow x1={225} y1={60} x2={225} y2={78} />
        <Box x={160} y={80} w={130} h={40} label="Fails? try next in chain" tone="amber" />
        <Arrow x1={292} y1={40} x2={330} y2={40} />
        <Box x={332} y={20} w={110} h={40} label="First success answers you" tone="signal" />
        <Arrow x1={292} y1={100} x2={330} y2={100} />
        <Box x={332} y={80} w={110} h={40} label="All fail → clear error + fixes" tone="flare" />
        <Arrow x1={442} y1={40} x2={480} y2={40} />
        <Box x={482} y={20} w={70} h={40} label="Reply shown" tone="base" />
      </svg>
      <figcaption className="mt-2 text-xs text-base-500">
        Relay tries models in ranked order for your chosen purpose. The moment one succeeds, that's your answer — a
        failure just quietly hops to the next one in the chain instead of stopping the conversation.
      </figcaption>
    </figure>
  );
}

export function KodeKeyApprovalDiagram() {
  return (
    <figure className="rounded-xl border border-base-700 bg-base-900/40 p-3">
      <svg viewBox="0 0 560 130" className="w-full h-auto">
        <ArrowDefs />
        <Box x={10} y={45} w={100} h={40} label="Your task" tone="base" />
        <Arrow x1={110} y1={65} x2={148} y2={65} />
        <Box x={150} y={45} w={130} h={40} label="Free-key advisor: rank + improve prompt" tone="signal" />
        <Arrow x1={280} y1={65} x2={318} y2={65} />
        <Box x={320} y={45} w={110} h={40} label="You review & pick" tone="amber" />
        <Arrow x1={430} y1={65} x2={468} y2={65} />
        <Box x={470} y={45} w={80} h={40} label="KodeKey runs" tone="flare" />
      </svg>
      <figcaption className="mt-2 text-xs text-base-500">
        Nothing reaches a KodeKey model automatically. A free key first ranks the best-fit KodeKey models and can
        tighten your prompt — you review that and manually approve one before it's ever called.
      </figcaption>
    </figure>
  );
}

export function ApiTestFlowDiagram() {
  return (
    <figure className="rounded-xl border border-base-700 bg-base-900/40 p-3">
      <svg viewBox="0 0 560 150" className="w-full h-auto">
        <ArrowDefs />
        <Box x={10} y={55} w={100} h={40} label="Test this key" tone="base" />
        <Arrow x1={110} y1={75} x2={148} y2={75} />
        <Box x={150} y={55} w={110} h={40} label="Call provider" tone="signal" />
        <Arrow x1={225} y1={94} x2={225} y2={112} />
        <Box x={150} y={115} w={110} h={30} label="Failed" tone="flare" />
        <Arrow x1={260} y1={75} x2={298} y2={75} />
        <Box x={300} y={20} w={120} h={30} label="Working ✓" tone="signal" />
        <Arrow x1={260} y1={130} x2={298} y2={130} />
        <Box x={300} y={100} w={120} h={30} label="Issue type identified" tone="amber" />
        <Arrow x1={420} y1={115} x2={458} y2={115} />
        <Box x={460} y={100} w={90} h={30} label="Fix suggested" tone="flare" />
      </svg>
      <figcaption className="mt-2 text-xs text-base-500">
        A failed test doesn't just say "not working" — it's sorted into a category (auth, wrong endpoint, rate limit,
        etc.) so the suggested fix actually matches what went wrong.
      </figcaption>
    </figure>
  );
}
