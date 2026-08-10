"use client";

import { useState } from "react";
import { Box, Arrow, ArrowDefs } from "./Diagram";

export function LearningFlowDiagram() {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <figure className="group relative rounded-xl border border-base-700 bg-base-900/40 p-3 my-2 not-prose">
      <p className="text-xs font-medium text-base-300 mb-1.5">Learning Architecture Flow</p>
      <svg viewBox="0 0 700 160" className="w-full h-auto">
        <ArrowDefs />
        <Box x={10} y={60} w={90} h={36} label="Topic" tone="base" />
        <Arrow x1={100} y1={78} x2={135} y2={78} label="Why" />
        <Box x={137} y={60} w={95} h={36} label="Why exists" tone="signal" />
        <Arrow x1={232} y1={78} x2={267} y2={78} label="How" />
        <Box x={269} y={40} w={95} h={36} label="Architecture" tone="signal" />
        <Box x={269} y={90} w={95} h={36} label="Components" tone="amber" />
        <Arrow x1={364} y1={58} x2={399} y2={58} />
        <Arrow x1={364} y1={108} x2={399} y2={108} />
        <Box x={401} y={40} w={90} h={36} label="Example" tone="signal" />
        <Box x={401} y={90} w={90} h={36} label="Commands" tone="amber" />
        <Arrow x1={491} y1={58} x2={526} y2={58} label="Tradeoffs" />
        <Arrow x1={491} y1={108} x2={526} y2={108} label="Mistakes" />
        <Box x={528} y={25} w={85} h={36} label="Expert" tone="flare" />
        <Box x={528} y={75} w={85} h={36} label="Intermediate" tone="amber" />
        <Box x={528} y={125} w={85} h={36} label="Beginner" tone="signal" />
        <Arrow x1={613} y1={43} x2={648} y2={43} />
        <Arrow x1={613} y1={93} x2={648} y2={93} />
        <Arrow x1={613} y1={143} x2={648} y2={143} />
        <Box x={650} y={25} w={45} h={36} label="Summary" tone="base" />
        <Box x={650} y={75} w={45} h={36} label="Tips" tone="base" />
        <Box x={650} y={125} w={45} h={36} label="Memory" tone="base" />
      </svg>
      <figcaption className="mt-2 text-xs text-base-500">
        Systematic learning flow from topic introduction through progressive expertise levels with memory aids
      </figcaption>
    </figure>
  );
}
