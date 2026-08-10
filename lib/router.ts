import { ChatMessage, ModelSpec, ProviderSpec, Purpose, RouteResult, AttemptLog, ErrorInfo, IssueType } from "./types";
import { FREE_PROVIDERS, KODEKEY_PROVIDER, getProvider, PROVIDER_SETUP_HINTS } from "./providers";
import { estimateMessagesTokens, estimateTokens } from "./tokens";
import { fetchWithTimeout, isAbortError } from "./fetchTimeout";

export interface ChainLink {
  providerKey: string;
  provider: ProviderSpec;
  model: ModelSpec;
}

/**
 * Builds the ordered list of (provider, model) attempts.
 * - free mode: only providers the caller actually supplied a key for.
 * - kodekey mode: every model on the KodeKey gateway.
 * Models matching the requested purpose sort first (by their rank),
 * followed by everything else (also by rank), so an off-purpose model
 * is still a fallback rather than being dropped entirely.
 * If the caller picked a specific model, the chain is rotated so that
 * model goes first and the list wraps circularly back to the top —
 * "last ranked falls back to first ranked" per the spec.
 */
export function buildChain(opts: {
  mode: "free" | "kodekey";
  purpose: Purpose;
  availableProviderKeys: string[]; // free mode only
  preferredProviderKey?: string;
  preferredModelId?: string;
  imageGen?: boolean; // if true, restrict the chain to text-to-image models only
}): ChainLink[] {
  const { mode, purpose, availableProviderKeys, preferredProviderKey, preferredModelId, imageGen } = opts;

  const providers: ProviderSpec[] =
    mode === "kodekey"
      ? [KODEKEY_PROVIDER]
      : FREE_PROVIDERS.filter((p) => availableProviderKeys.includes(p.key));

  const all: ChainLink[] = [];
  for (const provider of providers) {
    for (const model of provider.models) {
      if (imageGen && !model.imageGen) continue;
      if (!imageGen && model.imageGen) continue; // don't let image-only models answer text chat
      all.push({ providerKey: provider.key, provider, model });
    }
  }

  const onPurpose = all.filter((l) => l.model.purposes.includes(purpose)).sort((a, b) => a.model.rank - b.model.rank);
  const offPurpose = all.filter((l) => !l.model.purposes.includes(purpose)).sort((a, b) => a.model.rank - b.model.rank);
  let ranked = [...onPurpose, ...offPurpose];

  if (preferredModelId) {
    const idx = ranked.findIndex(
      (l) => l.model.id === preferredModelId && (mode === "kodekey" || l.providerKey === preferredProviderKey)
    );
    if (idx > 0) {
      ranked = [...ranked.slice(idx), ...ranked.slice(0, idx)];
    }
  }

  return ranked;
}

/**
 * Turns a raw HTTP status + response body into a short human message plus
 * an ordered list of concrete fix steps. Provider-specific setup gotchas
 * (from PROVIDER_SETUP_HINTS) are appended when we know the provider.
 */
export function issueTypeLabel(t: IssueType | undefined): string {
  switch (t) {
    case "auth": return "Authentication issue";
    case "invalid_key": return "Invalid API key";
    case "wrong_endpoint": return "Wrong endpoint / model not found";
    case "configuration": return "Configuration issue";
    case "provider_issue": return "Provider issue";
    case "model_unavailable": return "Model unavailable";
    case "rate_limit": return "Rate limit / quota";
    default: return "Unknown issue";
  }
}

export function classifyErrorInfo(status: number | undefined, bodyText: string, providerKey?: string): ErrorInfo {
  const lower = bodyText.toLowerCase();
  const hints = (providerKey && PROVIDER_SETUP_HINTS[providerKey]) || [];
  let message: string;
  let fixes: string[];
  let issueType: IssueType;

  if (status === 401 || status === 403 || lower.includes("invalid api key") || lower.includes("unauthorized")) {
    const looksMalformed = lower.includes("invalid api key") || lower.includes("malformed") || lower.includes("incorrect api key");
    issueType = looksMalformed ? "invalid_key" : "auth";
    message = looksMalformed
      ? "That key looks malformed or wasn't recognized as a valid key for this provider."
      : "That key was rejected (invalid or unauthorized).";
    fixes = [
      "Re-copy the key from the provider's dashboard — a trailing space or missing character is the most common cause.",
      "Confirm the key hasn't been revoked or expired, and that it's from the right account/project.",
      "Check you're pasting it into the right field here (free-key mode vs KodeKey).",
    ];
  } else if (status === 429 || lower.includes("rate limit") || lower.includes("quota") || lower.includes("token limit")) {
    issueType = "rate_limit";
    message = "Rate limit or token quota was hit on this model.";
    fixes = [
      "Wait 30–60 seconds and try again — free tiers usually rate-limit per minute.",
      "Try a smaller/faster model for this purpose, or add a second provider's key so Relay can fall back automatically.",
      "Check the provider's dashboard for your remaining free-tier quota.",
    ];
  } else if (status === 404 || lower.includes("model_not_found") || lower.includes("does not exist")) {
    // A bare 404 with no model-specific wording usually means we hit the wrong
    // URL (bad path/base URL) rather than a genuinely retired model.
    const looksLikeBadRoute = status === 404 && !lower.includes("model");
    issueType = looksLikeBadRoute ? "wrong_endpoint" : "model_unavailable";
    message = looksLikeBadRoute
      ? "The request hit a URL this provider doesn't recognize (likely a wrong/outdated endpoint)."
      : "This model isn't available on your account right now.";
    fixes = looksLikeBadRoute
      ? [
          "This usually means the provider changed their API path — check their current API docs (link below) against what Relay is calling.",
          "If you're self-hosting Relay, this is a bug to report rather than something to fix on your account.",
        ]
      : [
          "The provider may have renamed or retired this free model — check their current model list (docs link below).",
          "Some free models require you to first accept a license/terms page for that specific model.",
        ];
  } else if (status === 400 && (lower.includes("account") || lower.includes("billing") || lower.includes("payment"))) {
    issueType = "configuration";
    message = "The provider rejected the request — likely a billing/account setup issue, not the key itself.";
    fixes = ["Check that your account on this provider has billing/verification completed, even for free-tier usage."];
  } else if (status === 400 || status === 422) {
    issueType = "configuration";
    message = "The provider rejected the request as malformed (HTTP 400/422) — likely a request/config mismatch, not the key.";
    fixes = [
      "This can happen when a required field (like an account ID) is missing, or the model expects a different request shape.",
      "Open the docs link below and compare the expected request body for this endpoint.",
    ];
  } else if (status && status >= 500) {
    issueType = "provider_issue";
    message = "The provider had a server error on their end.";
    fixes = ["This is usually temporary — wait a bit and try again.", "If it keeps happening, check the provider's status page."];
  } else if (!status) {
    issueType = "provider_issue";
    message = "Couldn't reach the provider (network error or timeout).";
    fixes = [
      "The provider took too long to respond (10s) or the connection dropped — this often means the network this app runs on can't reach that provider at all.",
      "Try again once — some providers cold-start slowly on the first request.",
      "If it keeps timing out for one specific provider, that provider may be blocked or unreachable from your hosting network/region; try a different provider or a different network.",
    ];
  } else {
    issueType = "unknown";
    message = `Request failed (HTTP ${status}).`;
    fixes = ["Open the docs link below for this provider and compare the error against their troubleshooting guide."];
  }

  return { message, fixes: [...fixes, ...hints], issueType };
}

/** Back-compat shim: old call sites that just want a one-line string. */
export function classifyError(status: number | undefined, bodyText: string, providerKey?: string): string {
  return classifyErrorInfo(status, bodyText, providerKey).message;
}

interface CallResult {
  ok: boolean;
  content?: string;
  imageUrl?: string; // set when this call generated an image (data URL or provider URL)
  errorInfo?: ErrorInfo;
  usage?: { promptTokens: number; completionTokens: number; totalTokens: number; estimated: boolean };
}

/**
 * Builds OpenAI-style `content`, either a plain string (no images, or the
 * target model can't see images) or a multimodal content array with
 * image_url parts so vision-capable models actually receive attached
 * images instead of silently ignoring them.
 */
function buildWireMessages(messages: ChatMessage[], modelSupportsVision: boolean) {
  return messages.map((m) => {
    const images = modelSupportsVision ? (m.attachments ?? []).filter((a) => a.kind === "image" && a.dataUrl) : [];
    if (images.length === 0) return { role: m.role, content: m.content };
    return {
      role: m.role,
      content: [
        ...(m.content ? [{ type: "text", text: m.content }] : []),
        ...images.map((a) => ({ type: "image_url", image_url: { url: a.dataUrl } })),
      ],
    };
  });
}

async function callOpenAICompatible(
  provider: ProviderSpec,
  providerKey: string,
  apiKey: string,
  modelId: string,
  messages: ChatMessage[],
  modelSupportsVision?: boolean
): Promise<CallResult> {
  try {
    const res = await fetchWithTimeout(`${provider.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ model: modelId, messages: buildWireMessages(messages, !!modelSupportsVision), max_tokens: 2000 }),
    });
    const text = await res.text();
    if (!res.ok) {
      return { ok: false, errorInfo: classifyErrorInfo(res.status, text, providerKey) };
    }
    const data = JSON.parse(text);
    const content = data?.choices?.[0]?.message?.content ?? "";
    const usage = data?.usage
      ? {
          promptTokens: data.usage.prompt_tokens ?? 0,
          completionTokens: data.usage.completion_tokens ?? 0,
          totalTokens: data.usage.total_tokens ?? 0,
          estimated: false,
        }
      : {
          promptTokens: estimateMessagesTokens(messages),
          completionTokens: estimateTokens(content),
          totalTokens: estimateMessagesTokens(messages) + estimateTokens(content),
          estimated: true,
        };
    return { ok: true, content, usage };
  } catch (e: any) {
    return { ok: false, errorInfo: classifyErrorInfo(undefined, String(e?.message ?? e), providerKey) };
  }
}

async function callCloudflare(
  provider: ProviderSpec,
  providerKey: string,
  apiKey: string,
  modelId: string,
  messages: ChatMessage[],
  isImageGen: boolean,
  accountId?: string
): Promise<CallResult> {
  if (!accountId) {
    return {
      ok: false,
      errorInfo: { message: "Cloudflare needs an Account ID to route requests.", fixes: PROVIDER_SETUP_HINTS.cloudflare },
    };
  }
  try {
    if (isImageGen) {
      const prompt = messages[messages.length - 1]?.content ?? "";
      const res = await fetchWithTimeout(`${provider.baseUrl}/${accountId}/ai/run/${modelId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ prompt }),
      });
      if (!res.ok) {
        const text = await res.text();
        return { ok: false, errorInfo: classifyErrorInfo(res.status, text, providerKey) };
      }
      const contentType = res.headers.get("content-type") ?? "";
      let imageUrl: string;
      if (contentType.includes("application/json")) {
        const data = await res.json();
        const b64 = data?.result?.image;
        imageUrl = b64 ? `data:image/png;base64,${b64}` : "";
      } else {
        const buf = await res.arrayBuffer();
        imageUrl = `data:image/png;base64,${Buffer.from(buf).toString("base64")}`;
      }
      if (!imageUrl) return { ok: false, errorInfo: { message: "Cloudflare returned no image data.", fixes: ["Try again, or try a different image model."] } };
      return { ok: true, imageUrl, content: `Generated an image from: "${prompt}"` };
    }

    const res = await fetchWithTimeout(`${provider.baseUrl}/${accountId}/ai/run/${modelId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ messages }),
    });
    const text = await res.text();
    if (!res.ok) return { ok: false, errorInfo: classifyErrorInfo(res.status, text, providerKey) };
    const data = JSON.parse(text);
    const content = data?.result?.response ?? "";
    return {
      ok: true,
      content,
      usage: {
        promptTokens: estimateMessagesTokens(messages),
        completionTokens: estimateTokens(content),
        totalTokens: estimateMessagesTokens(messages) + estimateTokens(content),
        estimated: true,
      },
    };
  } catch (e: any) {
    return { ok: false, errorInfo: classifyErrorInfo(undefined, String(e?.message ?? e), providerKey) };
  }
}

async function callReplicate(
  provider: ProviderSpec,
  providerKey: string,
  apiKey: string,
  modelId: string,
  messages: ChatMessage[],
  isImageGen: boolean
): Promise<CallResult> {
  try {
    const prompt = isImageGen ? messages[messages.length - 1]?.content ?? "" : messages.map((m) => `${m.role}: ${m.content}`).join("\n");
    const res = await fetchWithTimeout(`${provider.baseUrl}/models/${modelId}/predictions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        Prefer: "wait",
      },
      body: JSON.stringify({ input: isImageGen ? { prompt, num_outputs: 1 } : { prompt } }),
    });
    const text = await res.text();
    if (!res.ok) return { ok: false, errorInfo: classifyErrorInfo(res.status, text, providerKey) };
    const data = JSON.parse(text);
    const out = data?.output;

    if (isImageGen) {
      const url = Array.isArray(out) ? out[0] : typeof out === "string" ? out : undefined;
      if (!url) return { ok: false, errorInfo: { message: "Prediction didn't return an image in time.", fixes: ["Try again — Replicate cold-starts can be slow the first time."] } };
      return { ok: true, imageUrl: url, content: `Generated an image from: "${prompt}"` };
    }

    const content = Array.isArray(out) ? out.join("") : typeof out === "string" ? out : JSON.stringify(out ?? "");
    if (!content) return { ok: false, errorInfo: { message: "Prediction didn't finish in time.", fixes: ["Try again."] } };
    return {
      ok: true,
      content,
      usage: {
        promptTokens: estimateTokens(prompt),
        completionTokens: estimateTokens(content),
        totalTokens: estimateTokens(prompt) + estimateTokens(content),
        estimated: true,
      },
    };
  } catch (e: any) {
    return { ok: false, errorInfo: classifyErrorInfo(undefined, String(e?.message ?? e), providerKey) };
  }
}

/**
 * Walks the ranked chain, calling one model at a time, until one
 * succeeds or the whole chain (including the circular wrap) is
 * exhausted. Every attempt — success, failure, or skip — is logged so
 * the UI can render the relay/fallback trail.
 */
// Spiritual quotes to display during free API key routing (from commits)
const SPIRITUAL_QUOTES = [
  "The journey of a thousand miles begins with a single API call.",
  "In the silence between requests, wisdom emerges.",
  "Every timeout teaches patience; every success, gratitude.",
  "The API key you seek is already within your dashboard.",
  "When one provider fails, another path reveals itself.",
  "Rate limits are but gentle reminders to breathe.",
  "The best debugging happens in a state of flow.",
  "Your code and the universe share the same source.",
];

let currentQuoteIndex = 0;

export function getNextSpiritualQuote(): string {
  const quote = SPIRITUAL_QUOTES[currentQuoteIndex];
  currentQuoteIndex = (currentQuoteIndex + 1) % SPIRITUAL_QUOTES.length;
  return quote;
}

export async function routeChat(opts: {
  mode: "free" | "kodekey";
  chain: ChainLink[];
  messages: ChatMessage[];
  keys: Record<string, string>;
  extra?: Record<string, Record<string, string>>; // per-provider extra fields, e.g. cloudflare accountId
}): Promise<RouteResult> {
  const { chain, messages, keys, extra } = opts;
  const attempts: AttemptLog[] = [];

  if (chain.length === 0) {
    return {
      content: "",
      provider: "",
      providerLabel: "",
      model: "",
      attempts: [{ provider: "", providerLabel: "", model: "", status: "error", error: "No provider keys were supplied for this purpose." }],
    };
  }

  for (const link of chain) {
    const apiKey = keys[link.providerKey];
    if (!apiKey) {
      attempts.push({ provider: link.providerKey, providerLabel: link.provider.label, model: link.model.id, status: "skipped", error: "No key entered." });
      continue;
    }

    attempts.push({ provider: link.providerKey, providerLabel: link.provider.label, model: link.model.id, status: "trying" });

    let result: CallResult;
    const isImageGen = !!link.model.imageGen;
    if (link.provider.adapter === "cloudflare") {
      result = await callCloudflare(link.provider, link.providerKey, apiKey, link.model.id, messages, isImageGen, extra?.[link.providerKey]?.accountId);
    } else if (link.provider.adapter === "replicate") {
      result = await callReplicate(link.provider, link.providerKey, apiKey, link.model.id, messages, isImageGen);
    } else {
      result = await callOpenAICompatible(link.provider, link.providerKey, apiKey, link.model.id, messages, !!link.model.vision);
    }

    const last = attempts[attempts.length - 1];
    if (result.ok) {
      last.status = "ok";
      return {
        content: result.content ?? "",
        imageUrl: result.imageUrl,
        provider: link.providerKey,
        providerLabel: link.provider.label,
        model: link.model.id,
        attempts,
        usage: result.usage,
      } as RouteResult;
    }
    last.status = "error";
    last.error = result.errorInfo?.message ?? "Request failed.";
    last.fixes = result.errorInfo?.fixes;
    last.docsUrl = link.provider.docsUrl;
    last.issueType = result.errorInfo?.issueType;
  }

  return {
    content: "",
    provider: "",
    providerLabel: "",
    model: "",
    attempts,
  };
}
