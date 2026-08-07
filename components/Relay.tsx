"use client";

import { AttemptLog } from "@/lib/types";

export default function Relay({ attempts }: { attempts: AttemptLog[] }) {
  if (attempts.length === 0) return null;

  return (
    <div className="px-4 py-2 border-b border-base-700 bg-base-900/40 overflow-x-auto">
      <div className="flex items-center gap-1.5 min-w-max">
        <span className="text-xs uppercase tracking-wide text-base-500 font-mono mr-1 shrink-0">Relay</span>
        {attempts.map((a, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div
              title={a.error ? [a.error, ...(a.fixes ?? [])].join("\n— ") : a.status}
              className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-mono transition-colors ${
                a.status === "ok"
                  ? "border-signal-500/50 bg-signal-500/10 text-signal-400"
                  : a.status === "error"
                  ? "border-flare-500/50 bg-flare-500/10 text-flare-500"
                  : a.status === "trying"
                  ? "border-amber-500/50 bg-amber-500/10 text-amber-500 relay-active"
                  : "border-base-700 bg-base-850 text-base-500"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${
                a.status === "ok" ? "bg-signal-400" : a.status === "error" ? "bg-flare-500" : a.status === "trying" ? "bg-amber-500" : "bg-base-500"
              }`} />
              {a.providerLabel || "—"}
              <span className="text-base-500">/</span>
              {a.model || "—"}
            </div>
            {i < attempts.length - 1 && <span className="text-base-600">→</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
