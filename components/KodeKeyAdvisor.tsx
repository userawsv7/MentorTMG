"use client";

import { useState } from "react";
import { Purpose } from "@/lib/types";
import { KodeKeyApprovalDiagram } from "./Diagram";

interface Ranking {
  modelId: string;
  label: string;
  reason: string;
}

export default function KodeKeyAdvisor({
  purpose,
  initialPrompt,
  freeKeys,
  onApprove,
  onCancel,
}: {
  purpose: Purpose;
  initialPrompt: string;
  freeKeys: Record<string, string>;
  onApprove: (modelId: string, finalPrompt: string) => void;
  onCancel: () => void;
}) {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [loading, setLoading] = useState(false);
  const [ranking, setRanking] = useState<Ranking[] | null>(null);
  const [improvedPrompt, setImprovedPrompt] = useState<string | null>(null);
  const [source, setSource] = useState<"free-model" | "heuristic" | null>(null);
  const [advisedBy, setAdvisedBy] = useState<string | undefined>();
  const [note, setNote] = useState<string | undefined>();
  const [selected, setSelected] = useState<string | null>(null);
  const [useImproved, setUseImproved] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const hasFreeKeys = Object.values(freeKeys).some((v) => v?.trim());

  async function analyze() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/kodekey-advise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ purpose, prompt, freeKeys }),
      });
      const data = await res.json();
      setRanking(data.ranking ?? []);
      setImprovedPrompt(data.improvedPrompt ?? prompt);
      setSource(data.source ?? "heuristic");
      setAdvisedBy(data.advisedBy);
      setNote(data.note);
      setSelected(data.ranking?.[0]?.modelId ?? null);
    } catch {
      setError("Couldn't reach the advisor endpoint. You can still pick a model manually below.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start md:items-center justify-center bg-black/60 p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-base-900 border border-base-700 rounded-2xl shadow-glow my-8">
        <div className="flex items-center justify-between px-6 h-14 border-b border-base-700">
          <h2 className="font-display font-medium text-base-100">Switch to KodeKey</h2>
          <button onClick={onCancel} className="text-base-400 hover:text-signal-400 text-sm" aria-label="Close">✕</button>
        </div>

        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <KodeKeyApprovalDiagram />

          <div>
            <label className="text-xs uppercase tracking-wide text-base-500 font-mono">What do you want to do?</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              placeholder="Describe your task — the advisor will suggest which KodeKey model fits best."
              className="mt-1 w-full resize-none bg-base-950 border border-base-600 focus:border-signal-500/50 rounded-lg px-3 py-2 text-sm text-base-100 placeholder:text-base-500"
            />
          </div>

          {!hasFreeKeys && (
            <p className="text-xs text-amber-500">
              No free API key is configured, so ranking will use a static fallback instead of a live free-model
              analysis. Add a free key in "Manage keys" first for a smarter recommendation.
            </p>
          )}

          <button
            onClick={analyze}
            disabled={loading || !prompt.trim()}
            className="w-full rounded-lg border border-signal-500/40 bg-signal-500/10 text-signal-400 hover:bg-signal-500/20 transition-colors text-sm font-medium py-2.5 disabled:opacity-40"
          >
            {loading ? "Asking a free model to rank KodeKey models…" : "Analyze & rank KodeKey models"}
          </button>

          {error && <p className="text-xs text-flare-500">{error}</p>}

          {ranking && ranking.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs text-base-500">
                <span className={`px-2 py-0.5 rounded-full border ${source === "free-model" ? "border-signal-500/40 text-signal-400" : "border-amber-500/40 text-amber-500"}`}>
                  {source === "free-model" ? `Ranked by ${advisedBy ?? "a free model"}` : "Static fallback ranking"}
                </span>
              </div>
              {note && <p className="text-xs text-base-500">{note}</p>}

              {improvedPrompt && improvedPrompt !== prompt && (
                <div className="rounded-lg border border-base-700 bg-base-850 p-3">
                  <label className="flex items-start gap-2 text-xs text-base-300">
                    <input type="checkbox" checked={useImproved} onChange={(e) => setUseImproved(e.target.checked)} className="mt-0.5" />
                    <span>
                      Use this improved prompt instead:
                      <span className="block mt-1 text-base-100 font-mono text-xs whitespace-pre-wrap">{improvedPrompt}</span>
                    </span>
                  </label>
                </div>
              )}

              <div className="space-y-2">
                {ranking.map((r, i) => (
                  <label
                    key={r.modelId}
                    className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                      selected === r.modelId ? "border-signal-500/50 bg-signal-500/5" : "border-base-700 hover:border-base-600"
                    }`}
                  >
                    <input
                      type="radio"
                      name="kodekey-model"
                      checked={selected === r.modelId}
                      onChange={() => setSelected(r.modelId)}
                      className="mt-1"
                    />
                    <div className="min-w-0">
                      <p className="text-sm text-base-100">
                        <span className="text-base-500 font-mono text-xs mr-1.5">#{i + 1}</span>
                        {r.label}
                      </p>
                      <p className="text-xs text-base-400 mt-0.5">{r.reason}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="px-6 h-16 border-t border-base-700 flex items-center justify-between gap-2">
          <p className="text-xs text-base-500">Nothing runs on KodeKey until you approve a model here.</p>
          <div className="flex gap-2">
            <button onClick={onCancel} className="px-3 py-2 rounded-lg border border-base-700 text-xs font-medium text-base-300 hover:border-base-600 transition-colors">
              Cancel
            </button>
            <button
              onClick={() => {
                if (!selected) return;
                const shouldUseImproved = useImproved && !!improvedPrompt && improvedPrompt !== prompt;
                onApprove(selected, shouldUseImproved ? improvedPrompt! : prompt);
              }}
              disabled={!selected}
              className="px-4 py-2 rounded-lg bg-signal-500 text-base-950 text-sm font-medium hover:bg-signal-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Approve & use this model
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
