"use client";

import { Box, Arrow, ArrowDefs } from "./Diagram";

export function ProblemSolvingWorkflowDiagram() {
  return (
    <figure className="rounded-xl border border-base-700 bg-base-900/40 p-4 my-3">
      <svg viewBox="0 0 900 380" className="w-full h-auto">
        <ArrowDefs />

        {/* Title */}
        <text x="450" y="30" textAnchor="middle" className="fill-signal-400 text-[14px] font-semibold">
          WHAT IS THE PROBLEM?
        </text>

        {/* Step boxes - vertically stacked with proper spacing */}
        <Box x={350} y={50} w={200} h={35} label="Problem Identified" tone="flare" />
        <Arrow x1={450} y1={85} x2={450} y2={95} />

        <Box x={350} y={100} w={200} h={35} label="Expected vs Actual" tone="amber" />
        <Arrow x1={450} y1={135} x2={450} y2={145} />

        <Box x={350} y={150} w={200} h={35} label="Observe / Gather Evidence" tone="base" />
        <Arrow x1={450} y1={185} x2={450} y2={195} />

        <Box x={350} y={200} w={200} h={35} label="Identify Possible Causes" tone="base" />
        <Arrow x1={450} y1={235} x2={450} y2={245} />

        <Box x={350} y={250} w={200} h={35} label="Validate Root Cause" tone="signal" />
        <Arrow x1={450} y1={285} x2={450} y2={295} />

        <Box x={350} y={300} w={200} h={35} label="Blast Radius Analysis" tone="amber" />
        <Arrow x1={450} y1={335} x2={450} y2={345} />

        <Box x={350} y={350} w={200} h={35} label="Solution" tone="signal" />
        <Arrow x1={450} y1={385} x2={450} y2={395} />

        <Box x={350} y={400} w={200} h={35} label="Verification" tone="signal" />
      </svg>
      <figcaption className="mt-3 text-xs text-base-500 text-center">
        Disciplined technical problem-solving workflow: establish current state, observe thoroughly,
        validate root cause, analyze blast radius, then implement and verify the solution.
      </figcaption>
    </figure>
  );
}