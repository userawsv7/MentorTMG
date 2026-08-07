export type Mode = "free" | "kodekey";

export type Purpose =
  | "general"
  | "coding"
  | "reasoning"
  | "fast"
  | "long_context"
  | "vision";

export type AdapterKind = "openai" | "gemini_openai" | "cloudflare" | "replicate";

export interface ModelSpec {
  id: string; // model id passed to the API
  label: string; // human label
  purposes: Purpose[]; // purposes this model ranks well for
  rank: number; // lower = tried first within its provider, for the default purpose ordering
  contextTokens?: number; // approx context window, for token-budget display
  vision?: boolean; // model can SEE/understand images passed in
  imageGen?: boolean; // model GENERATES images (text-to-image)
}

export interface ProviderSpec {
  key: string; // internal id, e.g. "groq"
  label: string; // display name, e.g. "Groq"
  envVarHint: string; // e.g. "GROQ_API_KEY"
  baseUrl: string;
  adapter: AdapterKind;
  authHeader?: string; // defaults to Authorization: Bearer
  models: ModelSpec[];
  docsUrl?: string;
  needsExtra?: { field: string; label: string; placeholder: string }[]; // e.g. Cloudflare account id
}

export interface Attachment {
  name: string;
  mimeType: string;
  size: number;
  // Text files: raw text inlined into the prompt.
  // Images: data URL (base64), used for vision-capable models.
  dataUrl: string;
  kind: "image" | "text" | "other";
}

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  attachments?: Attachment[];
  // Present when this message *is* a generated image (assistant image-gen reply).
  generatedImageUrl?: string;
}

/** Coarse bucket for *why* a call failed, shown as a short badge next to the error. */
export type IssueType =
  | "auth" // key rejected / unauthorized
  | "invalid_key" // key malformed, missing, or clearly not a real key for this provider
  | "wrong_endpoint" // 404 / not-found style response, or our own routing hit a bad URL
  | "configuration" // missing required extra field (e.g. Cloudflare account id), billing/account setup
  | "provider_issue" // 5xx, timeout, network-level failure — provider's side, not the user's
  | "model_unavailable" // model id retired/renamed/not entitled
  | "rate_limit" // 429 / quota
  | "unknown";

/** Structured, actionable failure info — shown instead of a bare error string. */
export interface ErrorInfo {
  message: string; // short "what happened"
  fixes: string[]; // ordered list of concrete steps to try
  docsUrl?: string;
  issueType?: IssueType;
}

export interface AttemptLog {
  provider: string;
  providerLabel: string;
  model: string;
  status: "trying" | "ok" | "error" | "skipped";
  error?: string;
  fixes?: string[];
  docsUrl?: string;
  issueType?: IssueType;
}

export interface RouteResult {
  content: string;
  imageUrl?: string;
  provider: string;
  providerLabel: string;
  model: string;
  attempts: AttemptLog[];
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    estimated: boolean;
  };
}

export interface SessionMeta {
  id: string;
  name: string;
  mode: Mode;
  createdAt: number;
  updatedAt: number;
}
