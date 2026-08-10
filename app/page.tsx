"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import KeySettings from "@/components/KeySettings";
import PurposeBar from "@/components/PurposeBar";
import Relay from "@/components/Relay";
import ChatWindow from "@/components/ChatWindow";
import KodeKeyAdvisor from "@/components/KodeKeyAdvisor";
import SpiritualRouter from "@/components/SpiritualRouter";
import { store } from "@/lib/store";
import { AttemptLog, Attachment, ChatMessage, Mode, Purpose, SessionMeta } from "@/lib/types";
import { hasImageGenModel } from "@/lib/providers";
import { buildChain, issueTypeLabel } from "@/lib/router";
import { generateContentBasedSessionName } from "@/lib/sessionNames";

export default function Page() {
  const [ready, setReady] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [keysOpen, setKeysOpen] = useState(false);

  const [sessions, setSessions] = useState<SessionMeta[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [mode, setMode] = useState<Mode>("free");
  const [purpose, setPurpose] = useState<Purpose>("general");
  const [preferredProviderKey, setPreferredProviderKey] = useState<string | undefined>();
  const [preferredModelId, setPreferredModelId] = useState<string | undefined>();

  const [freeKeys, setFreeKeys] = useState<Record<string, string>>({});
  const [kodeKey, setKodeKey] = useState("");
  const [extra, setExtra] = useState<Record<string, Record<string, string>>>({});

  const [attempts, setAttempts] = useState<AttemptLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUsage, setLastUsage] = useState<any>(undefined);
  const [lastAnsweredBy, setLastAnsweredBy] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [errorFixes, setErrorFixes] = useState<string[] | undefined>();
  const [errorDocsUrl, setErrorDocsUrl] = useState<string | undefined>();
  const [errorIssueType, setErrorIssueType] = useState<string | undefined>();
  const [advisorOpen, setAdvisorOpen] = useState(false);

  useEffect(() => {
    const existing = store.listSessions();
    setFreeKeys(store.getFreeKeys());
    setKodeKey(store.getKodeKey());
    setExtra(store.getExtra());
    if (existing.length > 0) {
      selectSession(existing[0].id, existing);
    } else {
      const s = store.createSession("free");
      setSessions([s]);
      selectSession(s.id, [s]);
    }
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function selectSession(id: string, list?: SessionMeta[]) {
    const all = list ?? store.listSessions();
    setSessions(all);
    setActiveId(id);
    setMessages(store.getMessages(id));
    const s = store.getSettings(id);
    setMode(s.mode);
    setPurpose(s.purpose);
    setPreferredProviderKey(s.preferredProviderKey);
    setPreferredModelId(s.preferredModelId);
    setAttempts([]);
    setLastUsage(undefined);
    setLastAnsweredBy(undefined);
    setError(null);
    setErrorFixes(undefined);
    setErrorDocsUrl(undefined);
    setErrorIssueType(undefined);
  }

  function newSession() {
    const s = store.createSession(mode);
    selectSession(s.id);
    setSidebarOpen(false);
  }

  function renameSession(id: string, name: string) {
    store.renameSession(id, name);
    setSessions(store.listSessions());
  }

  function deleteSession(id: string) {
    store.deleteSession(id);
    const remaining = store.listSessions();
    if (remaining.length === 0) {
      const s = store.createSession("free");
      selectSession(s.id, [s]);
    } else if (id === activeId) {
      selectSession(remaining[0].id, remaining);
    } else {
      setSessions(remaining);
    }
  }

  function updateSettings(patch: Partial<{ mode: Mode; purpose: Purpose; preferredProviderKey?: string; preferredModelId?: string }>) {
    if (!activeId) return;
    const next = {
      mode: patch.mode ?? mode,
      purpose: patch.purpose ?? purpose,
      preferredProviderKey: "preferredProviderKey" in patch ? patch.preferredProviderKey : preferredProviderKey,
      preferredModelId: "preferredModelId" in patch ? patch.preferredModelId : preferredModelId,
    };
    if (patch.mode) setMode(patch.mode);
    if (patch.purpose) setPurpose(patch.purpose);
    if ("preferredProviderKey" in patch) setPreferredProviderKey(patch.preferredProviderKey);
    if ("preferredModelId" in patch) setPreferredModelId(patch.preferredModelId);
    store.setSettings(activeId, next);
  }

  async function sendMessage(
    text: string,
    attachments?: Attachment[],
    imageGen?: boolean,
    overrides?: { mode: Mode; preferredProviderKey?: string; preferredModelId?: string }
  ) {
    if (!activeId) return;
    setError(null);
    setErrorFixes(undefined);
    setErrorDocsUrl(undefined);
    setErrorIssueType(undefined);

    const effectiveMode = overrides?.mode ?? mode;
    const effectivePreferredProviderKey = overrides ? overrides.preferredProviderKey : preferredProviderKey;
    const effectivePreferredModelId = overrides ? overrides.preferredModelId : preferredModelId;

    // Fold text-attachment contents into the message so any model can read them;
    // image attachments ride along separately for vision-capable models.
    const textAttachments = (attachments ?? []).filter((a) => a.kind === "text");
    const composedText =
      textAttachments.length > 0
        ? `${text}\n\n${textAttachments.map((a) => `--- ${a.name} ---\n${a.dataUrl}`).join("\n\n")}`
        : text;

    const userMessage: ChatMessage = { role: "user", content: composedText, attachments };
    const nextMessages: ChatMessage[] = [...messages, userMessage];
    setMessages(nextMessages);
    store.setMessages(activeId, nextMessages);
    setSessions(store.listSessions());
    setLoading(true);
    setAttempts([]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: effectiveMode,
          purpose,
          messages: nextMessages,
          keys: effectiveMode === "free" ? freeKeys : { kodekey: kodeKey },
          preferredProviderKey: effectivePreferredProviderKey,
          preferredModelId: effectivePreferredModelId,
          extra,
          imageGen: !!imageGen,
        }),
      });
      const data = await res.json();
      setAttempts(data.attempts ?? []);
      if (!res.ok || (!data.content && !data.imageUrl)) {
        const lastAttempt = data.attempts?.[data.attempts.length - 1];
        setError(
          lastAttempt?.error ?? data.error ?? "Every ranked model in the chain failed. Check your keys or try another purpose."
        );
        setErrorFixes(lastAttempt?.fixes ?? (imageGen ? ["Make sure at least one key with an image-generation model (Replicate or Cloudflare Workers AI) is entered and Cloudflare has its Account ID set."] : undefined));
        setErrorDocsUrl(lastAttempt?.docsUrl);
        setErrorIssueType(lastAttempt?.issueType);
        setLoading(false);
        return;
      }
      const withReply: ChatMessage[] = [
        ...nextMessages,
        {
          role: "assistant",
          content: data.imageUrl
            ? `${data.content ?? "Here's the image I generated."}\n\n![generated image](${data.imageUrl})`
            : data.content,
          generatedImageUrl: data.imageUrl,
        },
      ];
      setMessages(withReply);
      store.setMessages(activeId, withReply);
      setSessions(store.listSessions());
      setLastUsage(data.usage);
      setLastAnsweredBy(effectiveMode === "free" ? `${data.providerLabel} · ${data.model}` : data.model);
    } catch (e: any) {
      setError("Couldn't reach the router. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  /**
   * The only place a KodeKey model may be selected. The header "KodeKey"
   * button opens this advisor instead of switching mode directly — free
   * keys rank/advise, and only this explicit approval callback ever moves
   * the session onto a KodeKey model or sends a message to one.
   */
  function approveKodeKey(modelId: string, finalPrompt: string) {
    setAdvisorOpen(false);
    updateSettings({ mode: "kodekey", preferredProviderKey: "kodekey", preferredModelId: modelId });
    if (finalPrompt.trim()) {
      sendMessage(finalPrompt.trim(), undefined, false, { mode: "kodekey", preferredProviderKey: "kodekey", preferredModelId: modelId });
    }
  }

  if (!ready) {
    return (
      <div className="h-screen flex items-center justify-center text-base-500 font-mono text-sm">
        booting relay…
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        sessions={sessions}
        activeId={activeId}
        onSelect={(id) => {
          selectSession(id);
          setSidebarOpen(false);
        }}
        onNew={newSession}
        onRename={renameSession}
        onDelete={deleteSession}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 shrink-0 flex items-center gap-3 px-4 border-b border-base-700 bg-base-900/60">
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-base-400 hover:text-signal-400 text-sm px-2 py-1 rounded"
              aria-label="Open sidebar"
            >
              ☰
            </button>
          )}
          <span className="font-display font-medium text-base-100 tracking-tight">Relay</span>
          <span className="text-base-600">/</span>
          <span className="text-sm text-base-400 truncate">
            {sessions.find((s) => s.id === activeId)?.name}
          </span>

          <div className="ml-auto flex items-center gap-2">
            <div className="flex rounded-lg border border-base-700 overflow-hidden">
              <button
                onClick={() => updateSettings({ mode: "free" })}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  mode === "free" ? "bg-signal-500/15 text-signal-400" : "text-base-400 hover:text-base-200"
                }`}
              >
                Free keys
              </button>
              <button
                onClick={() => setAdvisorOpen(true)}
                title="Runs a free-key advisor to rank KodeKey models first — nothing on KodeKey executes until you approve one"
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  mode === "kodekey" ? "bg-signal-500/15 text-signal-400" : "text-base-400 hover:text-base-200"
                }`}
              >
                KodeKey
              </button>
            </div>
            <button
              onClick={() => setKeysOpen(true)}
              className="px-3 py-1.5 rounded-lg border border-base-700 text-xs font-medium text-base-300 hover:border-signal-500/40 hover:text-signal-400 transition-colors"
            >
              Manage keys
            </button>
          </div>
        </header>

        <PurposeBar
          mode={mode}
          purpose={purpose}
          onPurposeChange={(p) => updateSettings({ purpose: p })}
          freeKeys={freeKeys}
          preferredProviderKey={preferredProviderKey}
          preferredModelId={preferredModelId}
          onPreferredChange={(pk, mid) => updateSettings({ preferredProviderKey: pk, preferredModelId: mid })}
        />

        <Relay attempts={attempts} />

        {/* Spiritual Router Display - Shows during free key search and routing (GR009) */}
        <SpiritualRouter
          isSearching={loading && mode === "free"}
        />

        {error && (
          <div className="mx-4 md:mx-8 mt-3 rounded-lg border border-flare-500/40 bg-flare-500/10 text-flare-500 text-sm px-3 py-2.5">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-medium">{error}</p>
              {errorIssueType && (
                <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded border border-flare-500/40 text-flare-500/90 font-mono">
                  {issueTypeLabel(errorIssueType as any)}
                </span>
              )}
            </div>
            {errorFixes && errorFixes.length > 0 && (
              <ul className="mt-1.5 space-y-1 list-disc pl-4">
                {errorFixes.map((f, i) => (
                  <li key={i} className="text-xs text-flare-500/90">{f}</li>
                ))}
              </ul>
            )}
            {errorDocsUrl && (
              <a href={errorDocsUrl} target="_blank" rel="noreferrer" className="mt-1.5 inline-block text-xs underline">
                Open provider docs ↗
              </a>
            )}
          </div>
        )}

        <ChatWindow
          messages={messages}
          onSend={sendMessage}
          loading={loading}
          lastUsage={lastUsage}
          lastAnsweredBy={lastAnsweredBy}
          canGenerateImages={hasImageGenModel(mode, mode === "free" ? Object.keys(freeKeys).filter((k) => freeKeys[k]?.trim()) : [])}
          activeModel={(() => {
            const chain = buildChain({
              mode,
              purpose,
              availableProviderKeys: mode === "free" ? Object.keys(freeKeys).filter((k) => freeKeys[k]?.trim()) : [],
              preferredProviderKey,
              preferredModelId,
            });
            const link = chain[0];
            return link ? { label: link.model.label, providerLabel: link.provider.label, contextTokens: link.model.contextTokens } : undefined;
          })()}
        />
      </div>

      {keysOpen && (
        <KeySettings
          mode={mode}
          freeKeys={freeKeys}
          kodeKey={kodeKey}
          extra={extra}
          onFreeKeysChange={(k) => {
            setFreeKeys(k);
            store.setFreeKeys(k);
          }}
          onKodeKeyChange={(k) => {
            setKodeKey(k);
            store.setKodeKey(k);
          }}
          onExtraChange={(e) => {
            setExtra(e);
            store.setExtra(e);
          }}
          onClose={() => setKeysOpen(false)}
        />
      )}

      {advisorOpen && (
        <KodeKeyAdvisor
          purpose={purpose}
          initialPrompt={messages.length > 0 ? "" : ""}
          freeKeys={freeKeys}
          onApprove={approveKodeKey}
          onCancel={() => setAdvisorOpen(false)}
        />
      )}
    </div>
  );
}
