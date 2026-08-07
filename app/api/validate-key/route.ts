import { NextRequest, NextResponse } from "next/server";
import { getProvider } from "@/lib/providers";
import { classifyErrorInfo } from "@/lib/router";
import { fetchWithTimeout } from "@/lib/fetchTimeout";

export const runtime = "nodejs";

interface Body {
  mode: "free" | "kodekey";
  providerKey: string;
  apiKey: string;
  extra?: Record<string, string>;
}

// Cheap "is this key alive" check — hits a models/list style endpoint
// instead of spending tokens on a full chat completion.
export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request." }, { status: 400 });
  }

  const { mode, providerKey, apiKey, extra } = body;
  const provider = getProvider(mode, providerKey);
  if (!provider) return NextResponse.json({ ok: false, message: "Unknown provider." }, { status: 400 });
  if (!apiKey || !apiKey.trim()) return NextResponse.json({ ok: false, message: "Enter a key first." }, { status: 400 });

  try {
    if (provider.adapter === "cloudflare") {
      const accountId = extra?.accountId;
      if (!accountId)
        return NextResponse.json({
          ok: false,
          message: "Needs an Account ID too.",
          issueType: "configuration",
          fixes: ["Enter your Cloudflare Account ID in the field below the key — find it in your Cloudflare dashboard URL."],
          docsUrl: provider.docsUrl,
        });
      // NOTE: token verification is a USER-scoped endpoint on Cloudflare's API
      // (/client/v4/user/tokens/verify), not account-scoped. The previous
      // version of this check called `${accounts-base-url}/{accountId}/tokens/verify`,
      // which is not a real Cloudflare route and always 404'd — that was the
      // actual cause of "Cloudflare not working" reports, independent of the
      // key itself. We verify the token here, then separately confirm the
      // account id is usable by listing that account's Workers AI models.
      const verifyRes = await fetchWithTimeout(`https://api.cloudflare.com/client/v4/user/tokens/verify`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      const verifyText = await verifyRes.text();
      if (!verifyRes.ok) {
        const info = classifyErrorInfo(verifyRes.status, verifyText, provider.key);
        return NextResponse.json({ ok: false, message: info.message, fixes: info.fixes, docsUrl: provider.docsUrl, issueType: info.issueType });
      }
      // Token is valid — now confirm the account id actually works for Workers AI
      // with this token (wrong/mistyped account id is the #2 Cloudflare failure).
      const modelsRes = await fetchWithTimeout(`${provider.baseUrl}/${accountId}/ai/models/search`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      if (!modelsRes.ok) {
        const modelsText = await modelsRes.text();
        return NextResponse.json({
          ok: false,
          message: "Your API token is valid, but this Account ID didn't work with it.",
          issueType: "configuration",
          fixes: [
            "Double-check the Account ID — it's the 32-character hex ID from your Cloudflare dashboard URL, not the token itself.",
            "Confirm the token has \"Workers AI: Read\" permission scoped to this account.",
          ],
          docsUrl: provider.docsUrl,
        });
      }
      return NextResponse.json({ ok: true, message: "Key works." });
    }

    if (provider.adapter === "replicate") {
      const res = await fetchWithTimeout(`${provider.baseUrl}/account`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      const text = await res.text();
      if (!res.ok) {
        const info = classifyErrorInfo(res.status, text, provider.key);
        return NextResponse.json({ ok: false, message: info.message, fixes: info.fixes, docsUrl: provider.docsUrl, issueType: info.issueType });
      }
      return NextResponse.json({ ok: true, message: "Key works." });
    }

    // openai-compatible + gemini_openai: try a models list, fall back to
    // a 1-token completion against each candidate chat model in order (not
    // just one guess) if the provider doesn't expose /models — a single
    // stale/renamed model id shouldn't produce a false "not working" when
    // the key itself is fine. Stop early on auth/rate-limit since retrying
    // other models won't change that outcome.
    const res = await fetchWithTimeout(`${provider.baseUrl}/models`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (res.ok) return NextResponse.json({ ok: true, message: "Key works." });

    const candidates = provider.models.filter((m) => !m.imageGen).map((m) => m.id);
    let lastFail: ReturnType<typeof classifyErrorInfo> | null = null;
    for (const modelId of candidates) {
      const res2 = await fetchWithTimeout(`${provider.baseUrl}/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ model: modelId, messages: [{ role: "user", content: "hi" }], max_tokens: 1 }),
      });
      if (res2.ok) return NextResponse.json({ ok: true, message: "Key works." });
      const text2 = await res2.text();
      lastFail = classifyErrorInfo(res2.status, text2, provider.key);
      if (lastFail.issueType === "auth" || lastFail.issueType === "invalid_key" || lastFail.issueType === "rate_limit") break;
    }
    return NextResponse.json({
      ok: false,
      message: lastFail?.message ?? "No response from the provider.",
      fixes: lastFail?.fixes,
      docsUrl: provider.docsUrl,
      issueType: lastFail?.issueType,
    });
  } catch (e: any) {
    const info = classifyErrorInfo(undefined, String(e?.message ?? e), provider.key);
    return NextResponse.json({ ok: false, message: info.message, fixes: info.fixes, docsUrl: provider.docsUrl, issueType: info.issueType });
  }
}
