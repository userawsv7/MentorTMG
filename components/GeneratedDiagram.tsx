"use client";

import { useState } from "react";
import { Box, Arrow, ArrowDefs } from "./Diagram";

type Tone = "base" | "signal" | "flare" | "amber";

export interface DiagramSpec {
  title?: string;
  /** Free-form flow, architecture, comparison, or troubleshooting diagram. */
  nodes: {
    id: string;
    label: string;
    tone?: Tone;
    layer?: number;
    description?: string;
    // Learning enhancements
    definition?: string;
    beginnerTip?: string;
    intermediateNote?: string;
    expertInsight?: string;
  }[];
  edges?: {
    from: string;
    to: string;
    label?: string;
    description?: string;
    // Learning enhancements
    explanation?: string;
  }[];
  caption?: string;
  // Learning architecture metadata
  learningContext?: {
    topic: string;
    level: "beginner" | "intermediate" | "expert";
    prerequisites?: string[];
  };
}

/**
 * Runtime validation for AI-generated diagram JSON
 * Prevents crashes from malformed JSON (truncated strings, invalid syntax, etc.)
 * Provides graceful error handling with user-friendly messages
 */
interface ValidatedDiagramSpec extends DiagramSpec {
  isValid: boolean;
  errors: string[];
}

const VALID_TONES: Tone[] = ["base", "signal", "flare", "amber"];

function validateDiagramSpec(spec: any): ValidatedDiagramSpec {
  const errors: string[] = [];

  if (!spec || typeof spec !== 'object') {
    return { isValid: false, errors: ["Spec is not a valid object"], nodes: [], edges: [] };
  }

  if (!Array.isArray(spec.nodes) || spec.nodes.length === 0) {
    errors.push("Nodes array is required and must not be empty");
  }

  // Validate each node structure and values
  spec.nodes?.forEach((node: any, index: number) => {
    if (!node.id || typeof node.id !== 'string') {
      errors.push(`Node ${index}: Missing or invalid 'id' property`);
    }
    if (!node.label || typeof node.label !== 'string') {
      errors.push(`Node ${index}: Missing or invalid 'label' property`);
    }
    if (!node.tone || !VALID_TONES.includes(node.tone)) {
      errors.push(`Node ${index}: Invalid 'tone' value '${node.tone}'. Must be one of: ${VALID_TONES.join(', ')}`);
    }
    if (typeof node.layer !== 'number' || node.layer < 0 || !Number.isInteger(node.layer)) {
      errors.push(`Node ${index}: Invalid 'layer' value '${node.layer}'. Must be non-negative integer`);
    }
  });

  // Validate edges reference existing nodes
  if (spec.edges && Array.isArray(spec.edges)) {
    const nodeIds = new Set(spec.nodes?.map((n: any) => n.id).filter(Boolean) || []);
    spec.edges.forEach((edge: any, index: number) => {
      if (!edge.from || typeof edge.from !== 'string' || !nodeIds.has(edge.from)) {
        errors.push(`Edge ${index}: Invalid 'from' reference '${edge.from}' - node does not exist`);
      }
      if (!edge.to || typeof edge.to !== 'string' || !nodeIds.has(edge.to)) {
        errors.push(`Edge ${index}: Invalid 'to' reference '${edge.to}' - node does not exist`);
      }
    });
  }

  return {
    ...spec,
    isValid: errors.length === 0,
    errors
  };
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

  // Validate the diagram spec before any processing to prevent crashes from AI-generated invalid JSON
  const validatedSpec = validateDiagramSpec(spec);

  if (!validatedSpec.isValid) {
    return (
      <div className="rounded-xl border border-flare-500/50 bg-flare-500/10 p-4 my-2 not-prose">
        <p className="text-flare-400 text-sm font-medium">⚠️ Diagram Generation Error</p>
        <p className="text-flare-300 text-xs mt-1">Invalid diagram structure detected. Visual information unavailable.</p>
        {process.env.NODE_ENV === 'development' && validatedSpec.errors.length > 0 && (
          <details className="mt-2">
            <summary className="text-xs text-flare-400 cursor-pointer hover:text-flare-300">Debug: Validation Errors</summary>
            <div className="mt-1 text-xs text-flare-300 font-mono bg-flare-900/20 p-2 rounded overflow-auto max-h-32">
              {validatedSpec.errors.map((error, i) => (
                <div key={i}>• {error}</div>
              ))}
            </div>
          </details>
        )}
      </div>
    );
  }

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
        // Point arrows to center of boxes with proper offset
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
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-6 overflow-auto"
          onClick={() => setExpanded(false)}
        >
          <div className="w-full max-w-6xl bg-base-900 border border-base-700 rounded-2xl shadow-glow p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              {spec.title && <p className="text-sm font-medium text-base-200">{spec.title}</p>}
              <button onClick={() => setExpanded(false)} className="ml-auto text-base-400 hover:text-signal-400 text-sm" aria-label="Close">
                ✕
              </button>
            </div>

            {/* Enhanced Learning View */}
            <div className="mb-6">
              {spec.learningContext && (
                <div className="mb-4 p-3 bg-base-800/50 rounded-lg border border-base-700">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium text-signal-400">LEARNING CONTEXT</span>
                    <span className="text-xs px-2 py-0.5 bg-signal-500/20 text-signal-400 rounded">
                      {spec.learningContext.level}
                    </span>
                  </div>
                  <p className="text-sm text-base-300">{spec.learningContext.topic}</p>
                  {spec.learningContext.prerequisites && spec.learningContext.prerequisites.length > 0 && (
                    <div className="mt-2">
                      <span className="text-xs text-base-400">Prerequisites: </span>
                      <span className="text-xs text-base-300">{spec.learningContext.prerequisites.join(", ")}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Node Learning Details */}
              {spec.nodes.some(n => n.definition || n.beginnerTip || n.intermediateNote || n.expertInsight) && (
                <div className="mb-4 space-y-3">
                  <h4 className="text-sm font-medium text-base-300">Component Learning Guide</h4>
                  {spec.nodes.map((node, idx) => (
                    (node.definition || node.beginnerTip || node.intermediateNote || node.expertInsight) && (
                      <details key={idx} className="bg-base-800/30 rounded-lg border border-base-700">
                        <summary className="cursor-pointer p-3 text-sm text-base-200 hover:text-signal-400">
                          {node.label}
                        </summary>
                        <div className="px-3 pb-3 space-y-2 text-xs">
                          {node.definition && (
                            <div>
                              <span className="text-amber-400">Definition: </span>
                              <span className="text-base-300">{node.definition}</span>
                            </div>
                          )}
                          {node.beginnerTip && (
                            <div>
                              <span className="text-signal-400">Beginner: </span>
                              <span className="text-base-300">{node.beginnerTip}</span>
                            </div>
                          )}
                          {node.intermediateNote && (
                            <div>
                              <span className="text-amber-400">Intermediate: </span>
                              <span className="text-base-300">{node.intermediateNote}</span>
                            </div>
                          )}
                          {node.expertInsight && (
                            <div>
                              <span className="text-flare-400">Expert: </span>
                              <span className="text-base-300">{node.expertInsight}</span>
                            </div>
                          )}
                        </div>
                      </details>
                    )
                  ))}
                </div>
              )}

              {/* Edge Explanations */}
              {spec.edges?.some(e => e.explanation) && (
                <div className="mb-4 space-y-2">
                  <h4 className="text-sm font-medium text-base-300">Relationship Explanations</h4>
                  {spec.edges.filter(e => e.explanation).map((edge, idx) => (
                    <div key={idx} className="text-xs bg-base-800/30 p-2 rounded border border-base-700">
                      <span className="text-signal-400">{edge.from} → {edge.to}: </span>
                      <span className="text-base-300">{edge.explanation}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {svg}
            {spec.caption && <p className="mt-3 text-sm text-base-400">{spec.caption}</p>}
          </div>
        </div>
      )}
    </>
  );
}
