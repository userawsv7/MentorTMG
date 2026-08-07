"use client";

import { FREE_PROVIDERS, KODEKEY_PROVIDER, PURPOSES, purposeLabel } from "@/lib/providers";
import { Mode, Purpose } from "@/lib/types";

export default function PurposeBar({
  mode,
  purpose,
  onPurposeChange,
  freeKeys,
  preferredProviderKey,
  preferredModelId,
  onPreferredChange,
}: {
  mode: Mode;
  purpose: Purpose;
  onPurposeChange: (p: Purpose) => void;
  freeKeys: Record<string, string>;
  preferredProviderKey?: string;
  preferredModelId?: string;
  onPreferredChange: (providerKey: string | undefined, modelId: string | undefined) => void;
}) {
  const modelOptions =
    mode === "kodekey"
      ? KODEKEY_PROVIDER.models.map((m) => ({ providerKey: "kodekey", providerLabel: KODEKEY_PROVIDER.label, model: m }))
      : FREE_PROVIDERS.filter((p) => freeKeys[p.key]?.trim()).flatMap((p) =>
          p.models.map((m) => ({ providerKey: p.key, providerLabel: p.label, model: m }))
        );

  return (
    <div className="flex flex-wrap items-center gap-2 px-4 py-2.5 border-b border-base-700 bg-base-900/60">
      <span className="text-xs uppercase tracking-wide text-base-500 font-mono mr-1">Purpose</span>
      <div className="flex flex-wrap gap-1.5">
        {PURPOSES.map((p) => (
          <button
            key={p}
            onClick={() => onPurposeChange(p)}
            className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
              purpose === p
                ? "bg-signal-500/15 border-signal-500/50 text-signal-400"
                : "border-base-700 text-base-400 hover:border-base-600 hover:text-base-200"
            }`}
          >
            {purposeLabel(p)}
          </button>
        ))}
      </div>

      <div className="ml-auto flex items-center gap-2">
        <span className="text-xs uppercase tracking-wide text-base-500 font-mono">Prefer model</span>
        <select
          value={preferredModelId ? `${preferredProviderKey}::${preferredModelId}` : ""}
          onChange={(e) => {
            if (!e.target.value) return onPreferredChange(undefined, undefined);
            const [pk, mid] = e.target.value.split("::");
            onPreferredChange(pk, mid);
          }}
          className="bg-base-950 border border-base-600 rounded-lg px-2.5 py-1.5 text-xs font-mono text-base-200 max-w-[220px]"
        >
          <option value="">Auto (best ranked)</option>
          {modelOptions.map((o) => (
            <option key={`${o.providerKey}::${o.model.id}`} value={`${o.providerKey}::${o.model.id}`}>
              {mode === "free" ? `${o.providerLabel} · ${o.model.label}` : o.model.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
