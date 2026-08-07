"use client";

import { useState } from "react";
import { Box, Arrow, ArrowDefs } from "./Diagram";

type Tone = "base" | "signal" | "flare" | "amber";

export interface DiagramSpec {
  title?: string;
  /** Free-form flow, architecture, comparison, or troubleshooting diagram. */
  nodes: { id: string; label: string; tone?: Tone; layer?: number }[];
  edges?: { from: string; to: string; label?: string }[];
  caption?: string;
}

const NODE_W = 148;
const NODE_H = 46;
const COL_GAP = 56;
const ROW_GAP = 16;
const PAD = 24;

/**
 * Lays out nodes in columns by their `layer` (default 0), stacking nodes
 * within a column top-to-bottom, then draws edges as straight lines between
 * column-center connection points. Intentionally simple (no crossing
 * minimization) — it's built to render short, model-authored diagrams
 * (troubleshooting flows, architectures, comparisons), not arbitrary graphs.
 */
export default function GeneratedDiagram({ spec }: { spec: DiagramSpec }) {
  const [expanded, setExpanded] = useState(false);
  if (!spec || !Array.isArray(spec.nodes) || spec.nodes.length === 0) return null;

  const layers = new Map<number, DiagramSpec["nodes"]>();
  spec.nodes.forEach((n) => {
    const l = n.layer ?? 0;
    if (!layers.has(l)) layers.set(l, []);
    layers.get(l)!.push(n);
  });
  const layerKeys = [...layers.keys()].sort((a, b) => a - b);
  const maxRows = Math.max(...layerKeys.map((l) => layers.get(l)!.length));

  const positions = new Map<string, { x: number; y: number }>();
  layerKeys.forEach((l, colIdx) => {
    const nodesInLayer = layers.get(l)!;
    const colHeight = nodesInLayer.length * NODE_H + (nodesInLayer.length - 1) * ROW_GAP;
    const startY = PAD + (maxRows * NODE_H + (maxRows - 1) * ROW_GAP - colHeight) / 2;
    nodesInLayer.forEach((n, rowIdx) => {
      positions.set(n.id, {
        x: PAD + colIdx * (NODE_W + COL_GAP),
        y: startY + rowIdx * (NODE_H + ROW_GAP),
      });
    });
  });

  const width = PAD * 2 + layerKeys.length * NODE_W + (layerKeys.length - 1) * COL_GAP;
  const height = PAD * 2 + maxRows * NODE_H + (maxRows - 1) * ROW_GAP;

  const svg = (
    <svg viewBox={`0 0 ${width} ${Math.max(height, NODE_H + PAD * 2)}`} className="w-full h-auto">
      <ArrowDefs />
      {(spec.edges ?? []).map((e, i) => {
        const from = positions.get(e.from);
        const to = positions.get(e.to);
        if (!from || !to) return null;
        const x1 = from.x + NODE_W;
        const y1 = from.y + NODE_H / 2;
        const x2 = to.x;
        const y2 = to.y + NODE_H / 2;
        return <Arrow key={i} x1={x1} y1={y1} x2={x2} y2={y2} label={e.label} />;
      })}
      {spec.nodes.map((n) => {
        const pos = positions.get(n.id);
        if (!pos) return null;
        return <Box key={n.id} x={pos.x} y={pos.y} w={NODE_W} h={NODE_H} label={n.label} tone={n.tone ?? "base"} />;
      })}
    </svg>
  );

  return (
    <>
      <figure className="group relative rounded-xl border border-base-700 bg-base-900/40 p-3 my-2 not-prose">
        {spec.title && <p className="text-xs font-medium text-base-300 mb-1.5">{spec.title}</p>}
        <button
          onClick={() => setExpanded(true)}
          title="Expand diagram"
          aria-label="Expand diagram"
          className="absolute top-2.5 right-2.5 h-7 w-7 rounded-md border border-base-600 bg-base-900/80 text-base-400 opacity-0 group-hover:opacity-100 hover:text-signal-400 hover:border-signal-500/40 transition-all flex items-center justify-center text-xs"
        >
          ⤢
        </button>
        {svg}
        {spec.caption && <figcaption className="mt-2 text-xs text-base-500">{spec.caption}</figcaption>}
      </figure>

      {expanded && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-6"
          onClick={() => setExpanded(false)}
        >
          <div className="w-full max-w-4xl bg-base-900 border border-base-700 rounded-2xl shadow-glow p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              {spec.title && <p className="text-sm font-medium text-base-200">{spec.title}</p>}
              <button onClick={() => setExpanded(false)} className="ml-auto text-base-400 hover:text-signal-400 text-sm" aria-label="Close">
                ✕
              </button>
            </div>
            {svg}
            {spec.caption && <p className="mt-3 text-sm text-base-400">{spec.caption}</p>}
          </div>
        </div>
      )}
    </>
  );
}
