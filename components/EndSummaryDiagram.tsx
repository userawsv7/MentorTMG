"use client";

import { Box, Arrow, ArrowDefs } from "./Diagram";

export function EndSummaryDiagram({
  problem,
  rootCause,
  actionTaken,
  verification,
  finalResult
}: {
  problem: string;
  rootCause: string;
  actionTaken: string;
  verification: string;
  finalResult: string;
}) {
  return (
    <figure className="rounded-xl border border-base-700 bg-base-900/40 p-4 my-3">
      <svg viewBox="0 0 900 320" className="w-full h-auto">
        <ArrowDefs />

        {/* Title */}
        <text x="450" y="25" textAnchor="middle" className="fill-signal-400 text-[14px] font-semibold">
          SOLUTION SUMMARY
        </text>

        {/* Problem box */}
        <Box x={50} y={50} w={180} h={40} label={`Problem: ${problem.length > 20 ? problem.substring(0,17) + '...' : problem}`} tone="flare" />
        <Arrow x1={230} y1={70} x2={270} y2={70} />

        {/* Root Cause box */}
        <Box x={280} y={50} w={180} h={40} label={`Root Cause: ${rootCause.length > 20 ? rootCause.substring(0,17) + '...' : rootCause}`} tone="amber" />
        <Arrow x1={460} y1={70} x2={500} y2={70} />

        {/* Action Taken box */}
        <Box x={510} y={50} w={180} h={40} label={`Action: ${actionTaken.length > 20 ? actionTaken.substring(0,17) + '...' : actionTaken}`} tone="base" />
        <Arrow x1={690} y1={70} x2={730} y2={70} />

        {/* Verification box */}
        <Box x={740} y={50} w={130} h={40} label={`Verify: ${verification.length > 15 ? verification.substring(0,12) + '...' : verification}`} tone="signal" />

        {/* Vertical arrow down to Final Result */}
        <Arrow x1={805} y1={90} x2={805} y2={130} />

        {/* Final Result - centered below */}
        <Box x={355} y={140} w={190} h={45} label={`Final Result: ${finalResult.length > 25 ? finalResult.substring(0,22) + '...' : finalResult}`} tone="signal" />
      </svg>
      <figcaption className="mt-3 text-xs text-base-500 text-center">
        End-to-end solution summary: problem identification through final verified result.
      </figcaption>
    </figure>
  );
}