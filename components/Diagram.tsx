"use client";

import React, { useState } from "react";

/**
 * Small, dependency-free SVG diagrams used to visually explain how a flow
 * works (relay fallback, the KodeKey approval gate, API-test triage) instead
 * of relying purely on text. Kept intentionally simple: boxes + arrows +
 * a one-line caption per step, in the app's existing color tokens.
 */

interface ZoomControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onFit: () => void;
}

function ZoomControls({ zoom, onZoomIn, onZoomOut, onReset, onFit }: ZoomControlsProps) {
  return (
    <div className="absolute top-2 right-2 flex items-center gap-1 bg-base-950/90 rounded-lg border border-base-700 p-1">
      <button
        onClick={onZoomOut}
        className="px-2 py-1 text-xs text-base-400 hover:text-base-200 hover:bg-base-800 rounded"
        title="Zoom out"
      >
        −
      </button>
      <span className="px-2 py-1 text-xs text-base-400 tabular-nums min-w-[3ch] text-center">
        {Math.round(zoom * 100)}%
      </span>
      <button
        onClick={onZoomIn}
        className="px-2 py-1 text-xs text-base-400 hover:text-base-200 hover:bg-base-800 rounded"
        title="Zoom in"
      >
        +
      </button>
      <div className="w-px h-4 bg-base-700 mx-1" />
      <button
        onClick={onFit}
        className="px-2 py-1 text-xs text-base-400 hover:text-base-200 hover:bg-base-800 rounded"
        title="Fit to view"
      >
        Fit
      </button>
      <button
        onClick={onReset}
        className="px-2 py-1 text-xs text-base-400 hover:text-base-200 hover:bg-base-800 rounded"
        title="Reset zoom"
      >
        Reset
      </button>
    </div>
  );
}

interface ZoomableDiagramProps {
  children: React.ReactNode;
  viewBox: string;
  className?: string;
}

function ZoomableDiagram({ children, viewBox, className = "" }: ZoomableDiagramProps) {
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const minZoom = 0.5;
  const maxZoom = 3;

  const handleZoomIn = () => {
    setZoom(Math.min(maxZoom, zoom * 1.2));
  };

  const handleZoomOut = () => {
    setZoom(Math.max(minZoom, zoom / 1.2));
  };

  const handleReset = () => {
    setZoom(1);
    setPanX(0);
    setPanY(0);
  };

  const handleFit = () => {
    setZoom(1);
    setPanX(0);
    setPanY(0);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - panX, y: e.clientY - panY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setPanX(e.clientX - dragStart.x);
      setPanY(e.clientY - dragStart.y);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const cursor = zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default';

  return (
    <div className={`relative ${className}`}>
      <div
        className="overflow-hidden rounded-lg"
        style={{ cursor }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <svg
          viewBox={viewBox}
          className="w-full h-auto transition-transform duration-100"
          style={{
            transform: `scale(${zoom}) translate(${panX / zoom}px, ${panY / zoom}px)`,
            transformOrigin: 'top left'
          }}
        >
          {children}
        </svg>
      </div>
      <ZoomControls
        zoom={zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onReset={handleReset}
        onFit={handleFit}
      />
    </div>
  );
}

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
  // Calculate perpendicular offset for label positioning to avoid overlap
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.sqrt(dx * dx + dy * dy) || 1;
  const offsetX = (-dy / length) * 12; // Perpendicular offset
  const offsetY = (dx / length) * 12;

  return (
    <g className="stroke-base-500">
      <line x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth={1.5} markerEnd="url(#arrowhead)" />
      {label && (
        <text
          x={mx + offsetX}
          y={my + offsetY}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-base-400 text-[10px] font-medium"
          style={{
            paintOrder: "stroke",
            stroke: "var(--tw-color-base-950, #0a0e12)",
            strokeWidth: 4,
            strokeLinejoin: "round"
          }}
        >
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
      <ZoomableDiagram viewBox="0 0 720 160">
        <ArrowDefs />
        <Box x={20} y={55} w={130} h={50} label="Your message" tone="base" />
        <Arrow x1={150} y1={80} x2={190} y2={80} />
        <Box x={200} y={25} w={150} h={50} label="Try top-ranked model" tone="signal" />
        <Arrow x1={275} y1={75} x2={275} y2={100} />
        <Box x={200} y={105} w={150} h={50} label="Fails? try next in chain" tone="amber" />
        <Arrow x1={350} y1={50} x2={390} y2={50} />
        <Box x={400} y={25} w={150} h={50} label="First success answers you" tone="signal" />
        <Arrow x1={350} y1={130} x2={390} y2={130} />
        <Box x={400} y={105} w={150} h={50} label="All fail → clear error + fixes" tone="flare" />
        <Arrow x1={550} y1={50} x2={590} y2={50} />
        <Box x={600} y={25} w={100} h={50} label="Reply shown" tone="base" />
      </ZoomableDiagram>
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
      <ZoomableDiagram viewBox="0 0 720 160">
        <ArrowDefs />
        <Box x={20} y={55} w={130} h={50} label="Your task" tone="base" />
        <Arrow x1={150} y1={80} x2={190} y2={80} />
        <Box x={200} y={55} w={170} h={50} label="Free-key advisor: rank + improve prompt" tone="signal" />
        <Arrow x1={370} y1={80} x2={410} y2={80} />
        <Box x={420} y={55} w={130} h={50} label="You review & pick" tone="amber" />
        <Arrow x1={550} y1={80} x2={590} y2={80} />
        <Box x={600} y={55} w={100} h={50} label="KodeKey runs" tone="flare" />
      </ZoomableDiagram>
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
      <ZoomableDiagram viewBox="0 0 720 180">
        <ArrowDefs />
        <Box x={20} y={65} w={120} h={50} label="Test this key" tone="base" />
        <Arrow x1={140} y1={90} x2={180} y2={90} />
        <Box x={190} y={65} w={130} h={50} label="Call provider" tone="signal" />
        <Arrow x1={255} y1={115} x2={255} y2={140} />
        <Box x={180} y={145} w={150} h={30} label="Failed" tone="flare" />
        <Arrow x1={320} y1={90} x2={360} y2={90} />
        <Box x={370} y={20} w={150} h={40} label="Working ✓" tone="signal" />
        <Arrow x1={255} y1={175} x2={255} y2={175} />
        <Box x={370} y={125} w={150} h={40} label="Issue type identified" tone="amber" />
        <Arrow x1={520} y1={145} x2={560} y2={145} />
        <Box x={570} y={120} w={130} h={50} label="Fix suggested" tone="flare" />
      </ZoomableDiagram>
      <figcaption className="mt-2 text-xs text-base-500">
        A failed test doesn't just say "not working" — it's sorted into a category (auth, wrong endpoint, rate limit,
        etc.) so the suggested fix actually matches what went wrong.
      </figcaption>
    </figure>
  );
}
