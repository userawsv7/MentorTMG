import { ChatMessage } from "./types";

/**
 * Dependency-free token estimator. Real BPE tokenizers vary per model
 * family, so instead of bundling one (and quietly being wrong for models
 * it wasn't built for) this uses a calibrated heuristic that stays close
 * across English/code text: ~4 characters per token, with a small
 * per-word correction for punctuation-heavy or code-like text.
 * Every number this produces is surfaced in the UI as "~" to make clear
 * it's an estimate, never a billed/exact count.
 */
export function estimateTokens(text: string): number {
  if (!text) return 0;
  const chars = text.length;
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  // Blend char-based and word-based estimates; code/symbol-heavy text
  // skews toward more tokens per word than prose.
  const byChars = chars / 4;
  const byWords = words * 1.3;
  return Math.max(1, Math.round((byChars + byWords) / 2));
}

export function estimateMessagesTokens(messages: ChatMessage[]): number {
  return messages.reduce((sum, m) => sum + estimateTokens(m.content) + 4, 0);
}

export function formatTokenCount(n: number): string {
  if (n < 1000) return `${n}`;
  if (n < 1_000_000) return `${(n / 1000).toFixed(1)}k`;
  return `${(n / 1_000_000).toFixed(2)}M`;
}
