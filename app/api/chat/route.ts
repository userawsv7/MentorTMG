import { NextRequest, NextResponse } from "next/server";
import { buildChain, routeChat } from "@/lib/router";
import { ChatMessage, Mode, Purpose } from "@/lib/types";
import { buildTeachingSystemPrompt, classifyIntent } from "@/lib/systemPrompts";

export const runtime = "nodejs";

interface Body {
  mode: Mode;
  purpose: Purpose;
  messages: ChatMessage[];
  keys: Record<string, string>;
  preferredProviderKey?: string;
  preferredModelId?: string;
  extra?: Record<string, Record<string, string>>;
  imageGen?: boolean;
}

// Stateless by design: nothing here is written to a database or disk.
// Keys arrive with the request (from the browser's local storage) and
// live only for the duration of this single call.
export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { mode, purpose, messages, keys, preferredProviderKey, preferredModelId, extra, imageGen } = body;

  if (!mode || !purpose || !Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "mode, purpose and messages are required." }, { status: 400 });
  }

  const availableProviderKeys = Object.entries(keys || {})
    .filter(([, v]) => typeof v === "string" && v.trim().length > 0)
    .map(([k]) => k);

  if (mode === "free" && availableProviderKeys.length === 0) {
    return NextResponse.json({ error: "Enter at least one free API key first." }, { status: 400 });
  }
  if (mode === "kodekey" && !keys?.kodekey) {
    return NextResponse.json({ error: "Enter your KodeKey first." }, { status: 400 });
  }

  const chain = buildChain({
    mode,
    purpose,
    availableProviderKeys,
    preferredProviderKey,
    preferredModelId,
    imageGen,
  });

  // System guidance covering three things at once: (1) the teaching style —
  // lead with the core idea, chunk explanations, diagram anything with
  // structure; (2) the diagram JSON schema the UI knows how to render as a
  // real inline SVG diagram (see components/GeneratedDiagram.tsx); and
  // (3) the incident-troubleshooting method (observe → show the picture →
  // root cause → fix → blast radius → rollback) for anything that sounds
  // like a live/production problem. Applies in both free and KodeKey mode.
  const hasAttachments = messages.some((m) => m.attachments && m.attachments.length > 0);
  const latestUserText = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";
  const intent = classifyIntent(latestUserText);
  const systemMessages: ChatMessage[] = imageGen ? [] : [{ role: "system", content: buildTeachingSystemPrompt({ hasAttachments, intent }) }];

  const result = await routeChat({ mode, chain, messages: [...systemMessages, ...messages], keys: keys || {}, extra });

  if (!result.content && !result.imageUrl) {
    return NextResponse.json(result, { status: 502 });
  }
  return NextResponse.json(result);
}
