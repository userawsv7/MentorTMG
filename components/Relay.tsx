"use client";

import { AttemptLog } from "@/lib/types";
import { useState } from "react";

export default function Relay({ attempts }: { attempts: AttemptLog[] }) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  if (attempts.length === 0) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ok": return "✅";
      case "error": return "❌";
      case "trying": return "⏳";
      default: return "⭕";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "ok": return "SUCCESS";
      case "error": return "FAILED";
      case "trying": return "TRYING";
      default: return "SKIPPED";
    }
  };

  return (
    <div className="px-4 py-3 border-b border-base-700 bg-base-900/60">
      <div className="mb-2">
        <span className="text-sm font-semibold text-base-400">🔄 ROUTING RELAY CHAIN</span>
        <span className="text-xs text-base-500 ml-2">(Click any item for details)</span>
      </div>

      <div className="space-y-2">
        {attempts.map((attempt, index) => (
          <div key={index} className="border border-base-700 rounded-lg overflow-hidden">
            {/* Main Row - Always Visible */}
            <div
              onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
              className={`flex items-center justify-between p-3 cursor-pointer transition-all hover:bg-base-800/50 ${
                attempt.status === "ok"
                  ? "bg-signal-500/5 border-signal-500/30"
                  : attempt.status === "error"
                  ? "bg-flare-500/5 border-flare-500/30"
                  : attempt.status === "trying"
                  ? "bg-amber-500/5 border-amber-500/30"
                  : "bg-base-800/30"
              }`}
            >
              <div className="flex items-center gap-4 flex-1">
                {/* Status Badge */}
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                  attempt.status === "ok" ? "bg-signal-500/20 text-signal-400"
                  : attempt.status === "error" ? "bg-flare-500/20 text-flare-500"
                  : attempt.status === "trying" ? "bg-amber-500/20 text-amber-500"
                  : "bg-base-700 text-base-500"
                }`}>
                  <span className="text-lg">{getStatusIcon(attempt.status)}</span>
                  <span>{getStatusLabel(attempt.status)}</span>
                </div>

                {/* Provider Info */}
                <div className="flex items-center gap-3">
                  <div>
                    <div className="font-semibold text-base-200">{attempt.providerLabel || "Unknown Provider"}</div>
                    <div className="text-xs text-base-500 font-mono">{attempt.provider}</div>
                  </div>
                  <div className="text-base-600">→</div>
                  <div>
                    <div className="font-mono text-sm text-base-300">{attempt.model}</div>
                  </div>
                </div>
              </div>

              {/* Expand Indicator */}
              <div className="text-base-500 text-xl">
                {expandedIndex === index ? "−" : "+"}
              </div>
            </div>

            {/* Expanded Details */}
            {expandedIndex === index && (
              <div className="bg-base-900/80 p-4 border-t border-base-700 space-y-4">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-base-500">Provider Key:</span>
                    <div className="font-mono text-base-300 mt-1">{attempt.provider}</div>
                  </div>
                  <div>
                    <span className="text-base-500">Model ID:</span>
                    <div className="font-mono text-base-300 mt-1">{attempt.model}</div>
                  </div>
                </div>

                {/* Error Details */}
                {attempt.error && (
                  <div className="bg-flare-500/10 border border-flare-500/30 rounded-lg p-4">
                    <div className="font-semibold text-flare-400 mb-2">❌ ERROR DETAILS</div>
                    <div className="text-sm text-base-300 mb-3">{attempt.error}</div>

                    {attempt.fixes && attempt.fixes.length > 0 && (
                      <div>
                        <div className="font-semibold text-amber-400 mb-2">💡 SUGGESTED FIXES:</div>
                        <ul className="space-y-1 text-sm text-base-300">
                          {attempt.fixes.map((fix, fixIndex) => (
                            <li key={fixIndex} className="flex items-start gap-2">
                              <span className="text-amber-500 mt-0.5">→</span>
                              <span>{fix}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {attempt.docsUrl && (
                      <div className="mt-3 pt-3 border-t border-base-700">
                        <a
                          href={attempt.docsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-400 hover:text-blue-300 underline"
                        >
                          📖 View Provider Documentation →
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {/* Success Info */}
                {attempt.status === "ok" && (
                  <div className="bg-signal-500/10 border border-signal-500/30 rounded-lg p-4">
                    <div className="font-semibold text-signal-400">✅ SUCCESSFULLY COMPLETED</div>
                    <div className="text-sm text-base-300 mt-1">This provider successfully generated a response.</div>
                  </div>
                )}

                {/* Status Info */}
                {attempt.status === "trying" && (
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                    <div className="font-semibold text-amber-400">⏳ CURRENTLY ATTEMPTING</div>
                    <div className="text-sm text-base-300 mt-1">Making API call to this provider...</div>
                  </div>
                )}

                {attempt.status === "skipped" && (
                  <div className="bg-base-700/50 border border-base-600 rounded-lg p-4">
                    <div className="font-semibold text-base-400">⭕ SKIPPED</div>
                    <div className="text-sm text-base-300 mt-1">No API key was provided for this provider.</div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-3 pt-3 border-t border-base-700 text-xs text-base-500">
        Total Attempts: {attempts.length} |
        Successful: {attempts.filter(a => a.status === "ok").length} |
        Failed: {attempts.filter(a => a.status === "error").length} |
        Skipped: {attempts.filter(a => a.status === "skipped").length}
      </div>
    </div>
  );
}
