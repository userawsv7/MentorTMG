import { NextRequest, NextResponse } from "next/server";
import { buildChain, routeChat } from "@/lib/router";
import { buildAdvisorSystemPrompt, heuristicRanking, parseAdvisorReply } from "@/lib/kodekeyAdvisor";
import { KODEKEY_PROVIDER } from "@/lib/providers";
import { Purpose } from "@/lib/types";

export const runtime = "nodejs";

interface Body {
  purpose: Purpose;
  prompt: string;
  freeKeys: Record<string, string>;
}

/**
 * KodeKey advisor endpoint. This route NEVER touches the KodeKey provider —
 * it only ever calls free-tier providers (mode: "free") to (a) suggest a
 * clearer version of the user's prompt and (b) rank which KodeKey models
 * would suit it best. The actual KodeKey call only happens later, from the
 * normal /api/chat route, and only once the user has approved a specific
 * model in the advisor UI.
 */
export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request." }, { status: 400 });
  }

  const { purpose, prompt, freeKeys } = body;
  const availableProviderKeys = Object.entries(freeKeys || {})
    .filter(([, v]) => typeof v === "string" && v.trim().length > 0)
    .map(([k]) => k);

  const validModelIds = new Set(KODEKEY_PROVIDER.models.map((m) => m.id));
  const modelLabel = (id: string) => KODEKEY_PROVIDER.models.find((m) => m.id === id)?.label ?? id;

  if (availableProviderKeys.length === 0 || !prompt?.trim()) {
    // No free key configured (or nothing to analyze yet) — fall back to a
    // static ranking so the user still gets *something* before ever seeing
    // a KodeKey model, but never a live model call.
    const ranking = heuristicRanking(purpose).map((r) => ({ ...r, label: modelLabel(r.modelId) }));
    return NextResponse.json({
      ok: true,
      source: "heuristic",
      improvedPrompt: prompt ?? "",
      ranking,
      note: availableProviderKeys.length === 0 ? "No free API key is configured, so this is a static ranking, not a model-generated one." : undefined,
    });
  }

  try {
    const chain = buildChain({ mode: "free", purpose: "reasoning", availableProviderKeys });
    const result = await routeChat({
      mode: "free",
      chain,
      keys: freeKeys,
      messages: [
        { role: "system", content: buildAdvisorSystemPrompt(purpose) },
        { role: "user", content: prompt },
      ],
    });

    const parsed = result.content ? parseAdvisorReply(result.content) : null;
    if (!parsed) {
      const ranking = heuristicRanking(purpose).map((r) => ({ ...r, label: modelLabel(r.modelId) }));
      return NextResponse.json({
        ok: true,
        source: "heuristic",
        improvedPrompt: prompt,
        ranking,
        note: "The free-tier advisor call didn't return a usable ranking, so this is a static fallback ranking instead.",
      });
    }

    const ranking = parsed.ranking
      .filter((r) => validModelIds.has(r.modelId))
      .map((r) => ({ modelId: r.modelId, label: modelLabel(r.modelId), reason: r.reason || "Suggested by the free-tier advisor model." }));

    if (ranking.length === 0) {
      const fallback = heuristicRanking(purpose).map((r) => ({ ...r, label: modelLabel(r.modelId) }));
      return NextResponse.json({
        ok: true,
        source: "heuristic",
        improvedPrompt: parsed.improvedPrompt || prompt,
        ranking: fallback,
        note: "The advisor model's ranking didn't match any real KodeKey model id, so this is a static fallback ranking instead.",
      });
    }

    return NextResponse.json({
      ok: true,
      source: "free-model",
      advisedBy: `${result.providerLabel} · ${result.model}`,
      improvedPrompt: parsed.improvedPrompt || prompt,
      ranking,
    });
  } catch (e: any) {
    const ranking = heuristicRanking(purpose).map((r) => ({ ...r, label: modelLabel(r.modelId) }));
    return NextResponse.json({
      ok: true,
      source: "heuristic",
      improvedPrompt: prompt,
      ranking,
      note: "The free-tier advisor call failed, so this is a static fallback ranking instead.",
    });
  }
}
