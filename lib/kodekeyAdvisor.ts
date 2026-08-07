import { KODEKEY_PROVIDER } from "./providers";
import { Purpose } from "./types";

export interface ModelRanking {
  modelId: string;
  label: string;
  reason: string;
}

export interface AdvisorResult {
  improvedPrompt: string;
  ranking: ModelRanking[];
  source: "free-model" | "heuristic"; // heuristic = no working free key, or the free call failed
}

/**
 * Pure, local fallback: ranks KodeKey models for the given purpose using the
 * same rank/purposes metadata the router uses, with a generic templated
 * reason. Used whenever no free key is available (or the free-model advisor
 * call itself failed) so the user still gets *some* ranking before ever
 * touching a KodeKey model — never a silent auto-pick.
 */
export function heuristicRanking(purpose: Purpose): ModelRanking[] {
  const onPurpose = KODEKEY_PROVIDER.models
    .filter((m) => m.purposes.includes(purpose))
    .sort((a, b) => a.rank - b.rank);
  const rest = KODEKEY_PROVIDER.models
    .filter((m) => !m.purposes.includes(purpose))
    .sort((a, b) => a.rank - b.rank);

  const top = [...onPurpose, ...rest].slice(0, 5);
  return top.map((m, i) => ({
    modelId: m.id,
    label: m.label,
    reason:
      i === 0
        ? `Top-ranked KodeKey model for "${purpose}" purposes (static ranking — no free-tier advisor ran).`
        : `Ranked #${i + 1} for "${purpose}" among KodeKey models (static ranking).`,
  }));
}

/** System prompt sent to a free model asked to act as the pre-flight advisor. */
export function buildAdvisorSystemPrompt(purpose: Purpose): string {
  const catalogue = KODEKEY_PROVIDER.models
    .map((m) => `- id: "${m.id}", label: "${m.label}", good for: ${m.purposes.join(", ")}${m.vision ? ", vision" : ""}`)
    .join("\n");

  return [
    "You are a pre-flight advisor. You do NOT execute the user's task. Your only job is to:",
    "1. Slightly improve/clarify the user's prompt if it's ambiguous (or return it unchanged if it's already clear).",
    "2. Rank which of the following models would best handle it, most suitable first, with a one-sentence reason each.",
    "",
    "The user's stated purpose for this task is: " + purpose,
    "",
    "Available models (choose only from this exact list of ids):",
    catalogue,
    "",
    'Respond with ONLY a single JSON object, no markdown fences, no prose outside the JSON, in exactly this shape:',
    '{"improvedPrompt": "...", "ranking": [{"modelId": "...", "reason": "..."}]}',
    "Include 3 to 5 models in the ranking, ordered best-first.",
  ].join("\n");
}

/** Best-effort parse of the advisor model's JSON reply, tolerant of stray fencing. */
export function parseAdvisorReply(raw: string): { improvedPrompt: string; ranking: { modelId: string; reason: string }[] } | null {
  try {
    const cleaned = raw.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "");
    const parsed = JSON.parse(cleaned);
    if (!parsed || typeof parsed.improvedPrompt !== "string" || !Array.isArray(parsed.ranking)) return null;
    const ranking = parsed.ranking
      .filter((r: any) => r && typeof r.modelId === "string")
      .map((r: any) => ({ modelId: r.modelId, reason: typeof r.reason === "string" ? r.reason : "" }));
    if (ranking.length === 0) return null;
    return { improvedPrompt: parsed.improvedPrompt, ranking };
  } catch {
    return null;
  }
}
