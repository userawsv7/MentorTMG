"use client";

import { useRef, useState } from "react";
import { FREE_PROVIDERS, KODEKEY_PROVIDER } from "@/lib/providers";
import { IssueType, Mode } from "@/lib/types";
import { store } from "@/lib/store";
import { issueTypeLabel } from "@/lib/router";
import { ApiTestFlowDiagram } from "./Diagram";

type Status = "idle" | "checking" | "ok" | "fail";

export default function KeySettings({
  mode,
  freeKeys,
  kodeKey,
  extra,
  onFreeKeysChange,
  onKodeKeyChange,
  onExtraChange,
  onClose,
}: {
  mode: Mode;
  freeKeys: Record<string, string>;
  kodeKey: string;
  extra: Record<string, Record<string, string>>;
  onFreeKeysChange: (keys: Record<string, string>) => void;
  onKodeKeyChange: (key: string) => void;
  onExtraChange: (extra: Record<string, Record<string, string>>) => void;
  onClose: () => void;
}) {
  const [statuses, setStatuses] = useState<
    Record<string, { status: Status; message?: string; fixes?: string[]; docsUrl?: string; issueType?: IssueType }>
  >({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [restoreMsg, setRestoreMsg] = useState<string | null>(null);
  const [showDiagram, setShowDiagram] = useState(false);

  async function validate(providerKey: string, apiKey: string) {
    if (!apiKey.trim()) return;
    setStatuses((s) => ({ ...s, [providerKey]: { status: "checking" } }));
    try {
      const res = await fetch("/api/validate-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, providerKey, apiKey, extra: extra[providerKey] }),
      });
      const data = await res.json();
      const fallbackFixes = [
        "Double check the key was copied fully, with no extra spaces.",
        "Confirm your account on this provider is verified/active (some free tiers need email or billing verification).",
      ];
      setStatuses((s) => ({
        ...s,
        [providerKey]: {
          status: data.ok ? "ok" : "fail",
          message: data.message,
          fixes: data.ok ? undefined : data.fixes && data.fixes.length > 0 ? data.fixes : fallbackFixes,
          docsUrl: data.docsUrl,
          issueType: data.ok ? undefined : data.issueType,
        },
      }));
    } catch {
      setStatuses((s) => ({
        ...s,
        [providerKey]: {
          status: "fail",
          message: "Couldn't reach this app's own server to run the test.",
          fixes: [
            "If you're running locally, make sure `npm run dev` is still running in the terminal without errors.",
            "If you just changed code, do a hard refresh (Cmd/Ctrl+Shift+R) — a stale build can cause this.",
            "Check the browser console (F12) for a red error — that'll show exactly what failed.",
          ],
        },
      }));
    }
  }

  function downloadBackup() {
    const blob = new Blob([JSON.stringify(store.exportAll(), null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relay-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function uploadBackup(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result));
        store.importAll(data);
        setRestoreMsg("Backup restored. Reload the page to see your sessions and keys.");
      } catch {
        setRestoreMsg("That file didn't look like a valid Relay backup.");
      }
    };
    reader.readAsText(file);
  }

  function badge(providerKey: string) {
    const st = statuses[providerKey]?.status ?? "idle";
    if (st === "checking") return <span className="text-amber-500 text-xs font-mono">checking…</span>;
    if (st === "ok") return <span className="text-signal-400 text-xs font-mono">● working</span>;
    if (st === "fail") {
      const it = statuses[providerKey]?.issueType;
      return (
        <span className="flex items-center gap-1.5">
          <span className="text-flare-500 text-xs font-mono" title={statuses[providerKey]?.message}>● not working</span>
          {it && (
            <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded border border-flare-500/40 text-flare-500/90 font-mono">
              {issueTypeLabel(it)}
            </span>
          )}
        </span>
      );
    }
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start md:items-center justify-center bg-black/60 p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-base-900 border border-base-700 rounded-2xl shadow-glow my-8">
        <div className="flex items-center justify-between px-6 h-14 border-b border-base-700">
          <h2 className="font-display font-medium text-base-100">
            {mode === "free" ? "Free API keys" : "KodeKey"}
          </h2>
          <button onClick={onClose} className="text-base-400 hover:text-signal-400 text-sm" aria-label="Close">✕</button>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <p className="text-sm text-base-400">
            Keys are stored only in this browser's local storage and sent straight through to the provider you're
            calling — never saved to a database.
          </p>

          <button
            onClick={() => setShowDiagram((v) => !v)}
            className="text-xs text-signal-400 hover:underline"
          >
            {showDiagram ? "Hide" : "Show"} how "Test" diagnoses a failure ↓
          </button>
          {showDiagram && <ApiTestFlowDiagram />}

          {mode === "kodekey" ? (
            <div className="rounded-xl border border-base-700 bg-base-850 p-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-base-200">{KODEKEY_PROVIDER.label}</label>
                {badge("kodekey")}
              </div>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={kodeKey}
                  onChange={(e) => onKodeKeyChange(e.target.value)}
                  placeholder="Enter your KodeKey"
                  className="flex-1 bg-base-950 border border-base-600 rounded-lg px-3 py-2 text-sm font-mono text-base-100 placeholder:text-base-500"
                />
                <button
                  onClick={() => validate("kodekey", kodeKey)}
                  className="px-3 py-2 rounded-lg bg-signal-500/10 border border-signal-500/40 text-signal-400 text-sm hover:bg-signal-500/20 transition-colors"
                >
                  Test
                </button>
              </div>
              {statuses["kodekey"]?.status === "fail" && (
                <div className="mt-2 rounded-lg bg-flare-500/5 border border-flare-500/20 p-2.5">
                  <p className="text-xs text-flare-500 font-medium">{statuses["kodekey"]?.message}</p>
                  {statuses["kodekey"]?.fixes && statuses["kodekey"]!.fixes!.length > 0 && (
                    <ul className="mt-1.5 space-y-1 list-disc pl-4">
                      {statuses["kodekey"]!.fixes!.map((f, i) => (
                        <li key={i} className="text-xs text-base-400">{f}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          ) : (
            FREE_PROVIDERS.map((p) => (
              <div key={p.key} className="rounded-xl border border-base-700 bg-base-850 p-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-base-200">{p.label}</label>
                  {badge(p.key)}
                </div>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={freeKeys[p.key] ?? ""}
                    onChange={(e) => onFreeKeysChange({ ...freeKeys, [p.key]: e.target.value })}
                    placeholder={p.envVarHint}
                    className="flex-1 bg-base-950 border border-base-600 rounded-lg px-3 py-2 text-sm font-mono text-base-100 placeholder:text-base-500"
                  />
                  <button
                    onClick={() => validate(p.key, freeKeys[p.key] ?? "")}
                    className="px-3 py-2 rounded-lg bg-signal-500/10 border border-signal-500/40 text-signal-400 text-sm hover:bg-signal-500/20 transition-colors"
                  >
                    Test
                  </button>
                </div>
                {p.needsExtra?.map((f) => (
                  <input
                    key={f.field}
                    value={extra[p.key]?.[f.field] ?? ""}
                    onChange={(e) =>
                      onExtraChange({ ...extra, [p.key]: { ...extra[p.key], [f.field]: e.target.value } })
                    }
                    placeholder={f.placeholder}
                    className="mt-2 w-full bg-base-950 border border-base-600 rounded-lg px-3 py-2 text-sm font-mono text-base-100 placeholder:text-base-500"
                  />
                ))}
                {statuses[p.key]?.status === "fail" && (
                  <div className="mt-2 rounded-lg bg-flare-500/5 border border-flare-500/20 p-2.5">
                    <p className="text-xs text-flare-500 font-medium">{statuses[p.key]?.message}</p>
                    {statuses[p.key]?.fixes && statuses[p.key]!.fixes!.length > 0 && (
                      <ul className="mt-1.5 space-y-1 list-disc pl-4">
                        {statuses[p.key]!.fixes!.map((f, i) => (
                          <li key={i} className="text-xs text-base-400">{f}</li>
                        ))}
                      </ul>
                    )}
                    {(statuses[p.key]?.docsUrl || p.docsUrl) && (
                      <a
                        href={statuses[p.key]?.docsUrl ?? p.docsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1.5 inline-block text-xs text-signal-400 hover:underline"
                      >
                        Open {p.label} docs ↗
                      </a>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="px-6 h-14 border-t border-base-700 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={downloadBackup}
              className="px-3 py-2 rounded-lg border border-base-700 text-xs font-medium text-base-300 hover:border-signal-500/40 hover:text-signal-400 transition-colors"
              title="Download all sessions and keys as a JSON file"
            >
              Download backup
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-2 rounded-lg border border-base-700 text-xs font-medium text-base-300 hover:border-signal-500/40 hover:text-signal-400 transition-colors"
              title="Restore sessions and keys from a backup JSON file"
            >
              Upload backup
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) uploadBackup(f);
                e.target.value = "";
              }}
            />
            {restoreMsg && <span className="text-xs text-base-500">{restoreMsg}</span>}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-signal-500 text-base-950 text-sm font-medium hover:bg-signal-400 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
