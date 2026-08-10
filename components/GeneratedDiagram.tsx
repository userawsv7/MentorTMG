"use client";

import { useState } from "react";
import { Box, Arrow, ArrowDefs } from "./Diagram";

// Zoom and Copy functionality
const downloadDiagram = (svgElement: SVGSVGElement, title: string) => {
  const svgData = new XMLSerializer().serializeToString(svgElement);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  const img = new Image();

  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);

    const link = document.createElement("a");
    link.download = `${title || 'diagram'}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
};

const copyDiagramAsImage = async (svgElement: SVGSVGElement) => {
  const svgData = new XMLSerializer().serializeToString(svgElement);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  const img = new Image();

  return new Promise<void>((resolve, reject) => {
    img.onload = async () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      canvas.toBlob(async (blob) => {
        if (blob) {
          try {
            await navigator.clipboard.write([
              new ClipboardItem({ "image/png": blob })
            ]);
            resolve();
          } catch (err) {
            reject(err);
          }
        }
      });
    };

    img.onerror = reject;
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  });
};

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

  // Get the SVG element for copy/download functions
  const getSvgElement = () => {
    const figures = document.querySelectorAll('figure');
    for (const fig of figures) {
      const svg = fig.querySelector('svg');
      if (svg) return svg as SVGSVGElement;
    }
    return null;
  };

  const handleCopy = async () => {
    const svgEl = getSvgElement();
    if (svgEl) {
      try {
        await copyDiagramAsImage(svgEl);
        // Show success feedback
        const btn = event?.currentTarget as HTMLButtonElement;
        if (btn) {
          const origText = btn.innerHTML;
          btn.innerHTML = '✓';
          setTimeout(() => { btn.innerHTML = origText; }, 1000);
        }
      } catch (err) {
        console.error('Failed to copy diagram:', err);
      }
    }
  };

  const handleDownload = () => {
    const svgEl = getSvgElement();
    if (svgEl) {
      downloadDiagram(svgEl, spec.title || 'diagram');
    }
  };

  return (
    <>
      <figure className="group relative rounded-xl border border-base-700 bg-base-900/40 p-3 my-2 not-prose">
        {spec.title && <p className="text-xs font-medium text-base-300 mb-1.5">{spec.title}</p>}
        <div className="absolute top-2.5 right-2.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
          <button
            onClick={handleCopy}
            title="Copy diagram as image"
            aria-label="Copy diagram"
            className="h-7 w-7 rounded-md border border-base-600 bg-base-900/80 text-base-400 hover:text-signal-400 hover:border-signal-500/40 transition-all flex items-center justify-center text-xs"
          >
            📋
          </button>
          <button
            onClick={handleDownload}
            title="Download as PNG"
            aria-label="Download diagram"
            className="h-7 w-7 rounded-md border border-base-600 bg-base-900/80 text-base-400 hover:text-signal-400 hover:border-signal-500/40 transition-all flex items-center justify-center text-xs"
          >
            ⬇
          </button>
          <button
            onClick={() => setExpanded(true)}
            title="Expand diagram"
            aria-label="Expand diagram"
            className="h-7 w-7 rounded-md border border-base-600 bg-base-900/80 text-base-400 hover:text-signal-400 hover:border-signal-500/40 transition-all flex items-center justify-center text-xs"
          >
            ⤢
          </button>
        </div>
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
