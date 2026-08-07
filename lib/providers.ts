import { ProviderSpec, Purpose } from "./types";

/**
 * FREE-KEY PROVIDERS
 * Each provider is called through an OpenAI-compatible /chat/completions
 * endpoint where possible, which keeps the router logic in lib/router.ts
 * uniform. Providers with a genuinely different wire format get their own
 * adapter kind and are handled explicitly in app/api/chat/route.ts.
 *
 * Model ids and base URLs reflect each provider's documented defaults at
 * build time. Providers change free-tier model line-ups often, so this file
 * is intentionally the single place to update names, ids or add new ones.
 */
export const FREE_PROVIDERS: ProviderSpec[] = [
  {
    key: "groq",
    label: "Groq",
    envVarHint: "GROQ_API_KEY",
    baseUrl: "https://api.groq.com/openai/v1",
    adapter: "openai",
    docsUrl: "https://console.groq.com/docs/models",
    models: [
      { id: "llama-3.3-70b-versatile", label: "Llama 3.3 70B", purposes: ["general", "reasoning", "coding"], rank: 1, contextTokens: 128000 },
      { id: "llama-3.1-8b-instant", label: "Llama 3.1 8B Instant", purposes: ["fast", "general"], rank: 2, contextTokens: 128000 },
      { id: "gemma2-9b-it", label: "Gemma2 9B", purposes: ["fast", "general"], rank: 3, contextTokens: 8192 },
    ],
  },
  {
    key: "gemini",
    label: "Google Gemini",
    envVarHint: "GEMINI_API_KEY",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai",
    adapter: "gemini_openai",
    docsUrl: "https://ai.google.dev/gemini-api/docs/openai",
    models: [
      { id: "gemini-2.0-flash", label: "Gemini 2.0 Flash", purposes: ["general", "fast", "vision", "long_context"], rank: 1, contextTokens: 1000000, vision: true },
      { id: "gemini-1.5-flash", label: "Gemini 1.5 Flash", purposes: ["fast", "general", "vision"], rank: 2, contextTokens: 1000000, vision: true },
      { id: "gemini-1.5-pro", label: "Gemini 1.5 Pro", purposes: ["reasoning", "coding", "long_context"], rank: 3, contextTokens: 2000000, vision: true },
    ],
  },
  {
    key: "openrouter",
    label: "OpenRouter",
    envVarHint: "OPENROUTER_API_KEY",
    baseUrl: "https://openrouter.ai/api/v1",
    adapter: "openai",
    docsUrl: "https://openrouter.ai/docs",
    models: [
      { id: "meta-llama/llama-3.3-70b-instruct:free", label: "Llama 3.3 70B (free)", purposes: ["general", "reasoning"], rank: 1, contextTokens: 65000 },
      { id: "google/gemini-2.0-flash-exp:free", label: "Gemini 2.0 Flash (free)", purposes: ["general", "fast", "vision"], rank: 2, contextTokens: 1000000, vision: true },
      { id: "mistralai/mistral-7b-instruct:free", label: "Mistral 7B (free)", purposes: ["fast", "coding"], rank: 3, contextTokens: 32000 },
    ],
  },
  {
    key: "mistral",
    label: "Mistral",
    envVarHint: "MISTRAL_API_KEY",
    baseUrl: "https://api.mistral.ai/v1",
    adapter: "openai",
    docsUrl: "https://docs.mistral.ai/getting-started/models/",
    models: [
      { id: "mistral-large-latest", label: "Mistral Large", purposes: ["reasoning", "coding", "general"], rank: 1, contextTokens: 128000 },
      { id: "mistral-small-latest", label: "Mistral Small", purposes: ["fast", "general"], rank: 2, contextTokens: 128000 },
      { id: "open-mistral-nemo", label: "Mistral Nemo", purposes: ["fast"], rank: 3, contextTokens: 128000 },
    ],
  },
  {
    key: "cohere",
    label: "Cohere",
    envVarHint: "COHERE_API_KEY",
    baseUrl: "https://api.cohere.ai/compatibility/v1",
    adapter: "openai",
    docsUrl: "https://docs.cohere.com/docs/compatibility-api",
    models: [
      { id: "command-r-plus-08-2024", label: "Command R+", purposes: ["reasoning", "general"], rank: 1, contextTokens: 128000 },
      { id: "command-r-08-2024", label: "Command R", purposes: ["general", "fast"], rank: 2, contextTokens: 128000 },
    ],
  },
  {
    key: "deepinfra",
    label: "DeepInfra",
    envVarHint: "DEEPINFRA_API_KEY",
    baseUrl: "https://api.deepinfra.com/v1/openai",
    adapter: "openai",
    docsUrl: "https://deepinfra.com/docs",
    models: [
      { id: "meta-llama/Meta-Llama-3.1-70B-Instruct", label: "Llama 3.1 70B", purposes: ["general", "reasoning"], rank: 1, contextTokens: 128000 },
      { id: "mistralai/Mistral-7B-Instruct-v0.3", label: "Mistral 7B", purposes: ["fast"], rank: 2, contextTokens: 32000 },
    ],
  },
  {
    key: "cerebras",
    label: "Cerebras",
    envVarHint: "CEREBRAS_API_KEY",
    baseUrl: "https://api.cerebras.ai/v1",
    adapter: "openai",
    docsUrl: "https://inference-docs.cerebras.ai/",
    models: [
      { id: "llama-3.3-70b", label: "Llama 3.3 70B (fastest)", purposes: ["fast", "general"], rank: 1, contextTokens: 128000 },
      { id: "llama3.1-8b", label: "Llama 3.1 8B", purposes: ["fast"], rank: 2, contextTokens: 128000 },
    ],
  },
  {
    key: "sambanova",
    label: "SambaNova",
    envVarHint: "SAMBANOVA_API_KEY",
    baseUrl: "https://api.sambanova.ai/v1",
    adapter: "openai",
    docsUrl: "https://docs.sambanova.ai/",
    models: [
      { id: "Meta-Llama-3.3-70B-Instruct", label: "Llama 3.3 70B", purposes: ["general", "reasoning"], rank: 1, contextTokens: 128000 },
      { id: "Meta-Llama-3.1-8B-Instruct", label: "Llama 3.1 8B", purposes: ["fast"], rank: 2, contextTokens: 16000 },
    ],
  },
  {
    key: "fireworks",
    label: "Fireworks AI",
    envVarHint: "FIREWORKS_API_KEY",
    baseUrl: "https://api.fireworks.ai/inference/v1",
    adapter: "openai",
    docsUrl: "https://docs.fireworks.ai/",
    models: [
      { id: "accounts/fireworks/models/llama-v3p3-70b-instruct", label: "Llama 3.3 70B", purposes: ["general", "reasoning"], rank: 1, contextTokens: 128000 },
      { id: "accounts/fireworks/models/llama-v3p1-8b-instruct", label: "Llama 3.1 8B", purposes: ["fast", "general"], rank: 2, contextTokens: 128000 },
      { id: "accounts/fireworks/models/mixtral-8x7b-instruct", label: "Mixtral 8x7B", purposes: ["coding", "general"], rank: 3, contextTokens: 32000 },
    ],
  },
  {
    key: "huggingface",
    label: "Hugging Face",
    envVarHint: "HF_API_KEY",
    baseUrl: "https://router.huggingface.co/v1",
    adapter: "openai",
    docsUrl: "https://huggingface.co/docs/inference-providers",
    models: [
      { id: "meta-llama/Llama-3.3-70B-Instruct", label: "Llama 3.3 70B", purposes: ["general", "reasoning"], rank: 1, contextTokens: 128000 },
      { id: "Qwen/Qwen2.5-7B-Instruct", label: "Qwen2.5 7B", purposes: ["fast", "coding"], rank: 2, contextTokens: 32000 },
    ],
  },
  {
    key: "replicate",
    label: "Replicate",
    envVarHint: "REPLICATE_API_KEY",
    baseUrl: "https://api.replicate.com/v1",
    adapter: "replicate",
    docsUrl: "https://replicate.com/docs",
    models: [
      { id: "meta/meta-llama-3-70b-instruct", label: "Llama 3 70B", purposes: ["general"], rank: 1 },
      { id: "black-forest-labs/flux-schnell", label: "FLUX Schnell (image gen)", purposes: ["general"], rank: 2, imageGen: true },
    ],
  },
  {
    key: "cloudflare",
    label: "Cloudflare Workers AI",
    envVarHint: "CLOUDFLARE_API_KEY",
    baseUrl: "https://api.cloudflare.com/client/v4/accounts",
    adapter: "cloudflare",
    docsUrl: "https://developers.cloudflare.com/workers-ai/",
    needsExtra: [{ field: "accountId", label: "Cloudflare Account ID", placeholder: "e.g. 9f2c1b..." }],
    models: [
      { id: "@cf/meta/llama-3.3-70b-instruct-fp8-fast", label: "Llama 3.3 70B (fast)", purposes: ["fast", "general"], rank: 1 },
      { id: "@cf/meta/llama-3.1-8b-instruct", label: "Llama 3.1 8B", purposes: ["fast"], rank: 2 },
      { id: "@cf/stabilityai/stable-diffusion-xl-base-1.0", label: "SDXL (image gen)", purposes: ["general"], rank: 3, imageGen: true },
    ],
  },
];

/**
 * KODEKEY — single provider, many models, routed through KodeKloud's
 * OpenAI-compatible gateway. Ranking below is derived from the plan
 * table the user supplied: bigger context + "flagship/frontier" copy
 * ranks higher for reasoning/coding, small+fast models rank higher for
 * the "fast" purpose.
 */
export const KODEKEY_PROVIDER: ProviderSpec = {
  key: "kodekey",
  label: "KodeKey (KodeKloud)",
  envVarHint: "KODEKEY_API_KEY",
  baseUrl: "https://api.ai.kodekloud.com/v1",
  adapter: "openai",
  docsUrl: "https://kodekloud.com",
  // Full catalog as returned by the KodeKey /v1/models endpoint — ids must
  // match exactly (e.g. "google/gemini-3.1-pro-preview", not a shortened
  // alias) since these are sent verbatim in the chat completion request.
  models: [
    { id: "claude-opus-5", label: "Claude Opus 5", purposes: ["reasoning", "coding", "general"], rank: 1, contextTokens: 1000000 },
    { id: "claude-opus-4-8", label: "Claude Opus 4.8", purposes: ["reasoning", "coding", "general"], rank: 2, contextTokens: 1000000 },
    { id: "gpt-5.6-sol", label: "GPT 5.6 Sol", purposes: ["reasoning", "general"], rank: 3 },
    { id: "gpt-5.2", label: "GPT 5.2", purposes: ["reasoning", "general"], rank: 4 },
    { id: "gpt-5", label: "GPT 5", purposes: ["reasoning", "general"], rank: 5 },
    { id: "xai/grok-4.3", label: "Grok 4.3", purposes: ["reasoning", "long_context"], rank: 6, contextTokens: 1000000 },
    { id: "google/gemini-3.1-pro-preview", label: "Gemini 3.1 Pro Preview", purposes: ["reasoning", "vision", "long_context"], rank: 7, vision: true },
    { id: "deepseek/deepseek-v4-pro", label: "DeepSeek V4 Pro", purposes: ["coding", "reasoning"], rank: 8, contextTokens: 1000000 },
    { id: "claude-sonnet-5", label: "Claude Sonnet 5", purposes: ["general", "coding", "reasoning"], rank: 9, contextTokens: 1000000 },
    { id: "claude-sonnet-4-6", label: "Claude Sonnet 4.6", purposes: ["general", "coding", "reasoning"], rank: 10, contextTokens: 1000000 },
    { id: "gpt-5.4", label: "GPT 5.4", purposes: ["reasoning", "general"], rank: 11 },
    { id: "gpt-5.5", label: "GPT 5.5", purposes: ["reasoning", "general"], rank: 12 },
    { id: "gpt-4.1", label: "GPT 4.1", purposes: ["general", "coding"], rank: 13 },
    { id: "deepseek/deepseek-V3.2", label: "DeepSeek V3.2", purposes: ["coding", "reasoning"], rank: 14 },
    { id: "alibaba/qwen3-coder-plus", label: "Qwen3 Coder Plus", purposes: ["coding"], rank: 15 },
    { id: "zai/glm-5.1", label: "GLM-5.1", purposes: ["coding", "long_context"], rank: 16, contextTokens: 200000 },
    { id: "moonshot/kimi-k3", label: "Kimi K3", purposes: ["coding", "long_context"], rank: 17 },
    { id: "moonshot/kimi-k2.5", label: "Kimi K2.5", purposes: ["coding", "long_context"], rank: 18, contextTokens: 262144 },
    { id: "moonshot/kimi-k2", label: "Kimi K2", purposes: ["coding", "long_context"], rank: 19 },
    { id: "xai/grok-code-fast-1", label: "Grok Code Fast 1", purposes: ["coding", "fast"], rank: 20, contextTokens: 256000 },
    { id: "qwen/qwen3.7-plus", label: "Qwen3.7 Plus", purposes: ["general", "coding"], rank: 21 },
    { id: "gpt-oss-120b", label: "GPT-OSS 120B", purposes: ["coding", "general"], rank: 22 },
    { id: "claude-fable-5", label: "Claude Fable 5", purposes: ["general", "reasoning", "coding"], rank: 23, contextTokens: 1000000 },
    { id: "google/gemini-2.5-pro", label: "Gemini 2.5 Pro", purposes: ["reasoning", "vision", "long_context"], rank: 24, vision: true },
    { id: "google/gemini-2.5-flash-image", label: "Gemini 2.5 Flash Image", purposes: ["vision"], rank: 25, vision: true, imageGen: true },
    { id: "google/gemini-2.5-flash", label: "Gemini 2.5 Flash", purposes: ["fast", "vision"], rank: 26, vision: true },
    { id: "google/gemini-3.5-flash", label: "Gemini 3.5 Flash", purposes: ["fast", "vision"], rank: 27, vision: true },
    { id: "google/gemini-3-flash-preview", label: "Gemini 3 Flash Preview", purposes: ["fast", "vision"], rank: 28, vision: true },
    { id: "google/gemini-3.1-flash-lite", label: "Gemini 3.1 Flash Lite", purposes: ["fast", "long_context"], rank: 29 },
    { id: "xiaomi/MiMo-V2.5-Pro", label: "MiMo V2.5 Pro", purposes: ["reasoning", "vision"], rank: 30, vision: true },
    { id: "xiaomi/MiMo-V2.5", label: "MiMo V2.5", purposes: ["fast", "vision"], rank: 31, vision: true },
    { id: "minimax/MiniMax-M2.5", label: "MiniMax M2.5", purposes: ["vision", "fast"], rank: 32, vision: true },
    { id: "minimax/minimax-m3", label: "MiniMax M3", purposes: ["fast", "general"], rank: 33 },
    { id: "deepseek/deepseek-v4-flash", label: "DeepSeek V4 Flash", purposes: ["fast", "long_context"], rank: 34, contextTokens: 1000000 },
    { id: "claude-haiku-4-5", label: "Claude Haiku 4.5", purposes: ["fast", "general"], rank: 35, contextTokens: 200000 },
    { id: "gpt-5-mini", label: "GPT-5 Mini", purposes: ["fast"], rank: 36 },
    { id: "gpt-5.4-mini", label: "GPT 5.4 Mini", purposes: ["fast"], rank: 37 },
    { id: "gpt-5.4-nano", label: "GPT 5.4 Nano", purposes: ["fast"], rank: 38 },
    { id: "o4-mini", label: "o4-mini", purposes: ["reasoning", "fast"], rank: 39 },
  ],
};

export function allFreeProviderKeys(): string[] {
  return FREE_PROVIDERS.map((p) => p.key);
}

export function hasImageGenModel(mode: "free" | "kodekey", availableProviderKeys: string[]): boolean {
  const providers = mode === "kodekey" ? [KODEKEY_PROVIDER] : FREE_PROVIDERS.filter((p) => availableProviderKeys.includes(p.key));
  return providers.some((p) => p.models.some((m) => m.imageGen));
}

/**
 * Provider-specific setup gotchas, shown as part of the "how to fix" list
 * whenever a key test or chat call fails for that provider — on top of the
 * generic status-code based fixes in classifyError.
 */
export const PROVIDER_SETUP_HINTS: Record<string, string[]> = {
  sambanova: [
    "Free-tier keys are created at cloud.sambanova.ai — make sure you copied the key from there, not from a different SambaNova product.",
    "SambaNova's free tier is a limited preview and can be region- or waitlist-gated; check your account dashboard for access status.",
  ],
  fireworks: [
    "Create the key at fireworks.ai/account/api-keys — keys copied from elsewhere (e.g. a shared team key with restricted scopes) can fail.",
    "Fireworks' free trial credits expire; check your billing page — some models need a payment method on file even to use trial credits.",
  ],
  replicate: [
    "Replicate keys start with \"r8_\" — double check you pasted the whole token with no leading/trailing spaces.",
    "Replicate requires billing set up on your account (even free/cheap models) before predictions will run.",
  ],
  cloudflare: [
    "Use a scoped API Token (My Profile → API Tokens → Create Token) with \"Workers AI: Read/Edit\" permission — the legacy Global API Key will not work here.",
    "Double-check the Account ID field: it's the 32-character hex ID from your Cloudflare dashboard URL, not the token itself.",
  ],
  huggingface: [
    "Use a token with \"Inference\" permissions from huggingface.co/settings/tokens.",
    "Some models require you to accept a license on the model page before your token can call it.",
  ],
  groq: ["Create keys at console.groq.com/keys — free tier has per-minute rate limits, so retry after a short wait if you hit 429s."],
  gemini: ["Create keys at aistudio.google.com/apikey — make sure the Gemini API is enabled for the associated Google Cloud project."],
  openrouter: ["Some \"(free)\" models on OpenRouter are rate-limited per day across all users; try again later or pick a different free model."],
  mistral: ["Free \"la Plateforme\" keys need email verification and occasionally a phone-verified account before first use."],
  cohere: ["Trial keys from dashboard.cohere.com are rate-limited (calls/minute); wait a few seconds and retry on 429s."],
  deepinfra: ["Requires a small credit balance on your DeepInfra account even to use cheap models — check Billing."],
  cerebras: ["Free tier is invite/waitlist based at cloud.cerebras.ai; confirm your account has been granted API access."],
};

export function getProvider(mode: "free" | "kodekey", key: string): ProviderSpec | undefined {
  if (mode === "kodekey") return key === "kodekey" ? KODEKEY_PROVIDER : undefined;
  return FREE_PROVIDERS.find((p) => p.key === key);
}

export function purposeLabel(p: Purpose): string {
  switch (p) {
    case "general": return "General chat";
    case "coding": return "Code";
    case "reasoning": return "Deep reasoning";
    case "fast": return "Fast & cheap";
    case "long_context": return "Long context";
    case "vision": return "Images / vision";
  }
}

export const PURPOSES: Purpose[] = ["general", "coding", "reasoning", "fast", "long_context", "vision"];
