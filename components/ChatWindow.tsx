"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { Attachment, ChatMessage } from "@/lib/types";
import { estimateMessagesTokens, estimateTokens, formatTokenCount } from "@/lib/tokens";
import { RelayFlowDiagram } from "./Diagram";
import GeneratedDiagram, { DiagramSpec } from "./GeneratedDiagram";

const MAX_ATTACHMENT_BYTES = 8 * 1024 * 1024; // 8MB per file, kept sane for free-tier context windows
const TEXTY_EXTENSIONS = /\.(txt|md|csv|json|log|ts|tsx|js|jsx|py|java|c|cpp|go|rs|html|css|yml|yaml|xml|sql)$/i;

const LANG_TO_EXT: Record<string, string> = {
  javascript: "js", js: "js", jsx: "jsx", typescript: "ts", ts: "ts", tsx: "tsx",
  python: "py", py: "py", java: "java", c: "c", cpp: "cpp", "c++": "cpp",
  go: "go", golang: "go", rust: "rs", rs: "rs", html: "html", css: "css",
  json: "json", sql: "sql", sh: "sh", bash: "sh", shell: "sh", yaml: "yaml", yml: "yaml",
  markdown: "md", md: "md", xml: "xml", ruby: "rb", php: "php", diagram: "json",
};

interface CodeBlock {
  lang: string;
  ext: string;
  code: string;
  filename?: string; // set when the model annotated the fence with a filename, e.g. ```python app.py
}

/**
 * Parses fenced code blocks out of raw markdown. Beyond the language tag,
 * this also recognizes a filename hint on the same info-string line (either
 * space- or colon-separated: ```python app.py or ```python:app.py), which
 * models are asked to include (see the system prompt in app/api/chat) when
 * they generate or edit a project's files — that filename then drives the
 * per-file and zip download names instead of a generic "reply-1.py".
 */
function extractCodeBlocks(content: string): CodeBlock[] {
  const blocks: CodeBlock[] = [];
  const re = /```([^\n`]*)\n([\s\S]*?)```/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(content))) {
    const info = (m[1] || "").trim();
    const parts = info.split(/[\s:]+/).filter(Boolean);
    const rawLang = (parts[0] || "text").toLowerCase();
    const filename = parts.length > 1 ? parts.slice(1).join(" ") : undefined;
    const lang = rawLang;
    const ext = filename && filename.includes(".") ? filename.split(".").pop()! : LANG_TO_EXT[lang] ?? "txt";
    const code = m[2];
    if (code.trim().length > 0) blocks.push({ lang, ext, code, filename });
  }
  return blocks;
}

async function downloadBlocksAsZip(blocks: CodeBlock[], zipName: string) {
  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();
  blocks.forEach((b, i) => {
    const name = b.filename ?? `file-${i + 1}.${b.ext}`;
    zip.file(name, b.code);
  });
  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = zipName;
  a.click();
  URL.revokeObjectURL(url);
}

function classifyFile(file: File): "image" | "text" | "other" {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("text/") || file.type === "application/json" || TEXTY_EXTENSIONS.test(file.name)) return "text";
  return "other";
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

function downloadText(filename: string, text: string) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function downloadDataUrl(filename: string, dataUrl: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  a.click();
}

/** Flattens React children (incl. rehype-highlight's nested <span> tokens) back to plain text. */
function childrenToText(children: any): string {
  if (typeof children === "string") return children;
  if (typeof children === "number") return String(children);
  if (Array.isArray(children)) return children.map(childrenToText).join("");
  if (children?.props?.children) return childrenToText(children.props.children);
  return "";
}

/** A fenced code block, rendered with a small header (language + copy + download) above the highlighted body.
 * A ```diagram fence containing valid JSON (see GeneratedDiagram's schema) renders as an actual inline
 * diagram instead of a code block — this is how model replies produce real visuals, not just described ones. */
function CodeBlockRenderer({ className, children }: { className?: string; children: any }) {
  const [copied, setCopied] = useState(false);
  const langMatch = /language-(\w+)/.exec(className ?? "");
  const lang = langMatch?.[1] ?? "text";
  const text = childrenToText(children).replace(/\n$/, "");

  if (lang === "diagram") {
    try {
      const spec = JSON.parse(text) as DiagramSpec;
      if (spec && Array.isArray(spec.nodes) && spec.nodes.length > 0) {
        return <GeneratedDiagram spec={spec} />;
      }
    } catch {
      // fall through to plain code rendering below — malformed diagram JSON
      // shouldn't hide the content, just show it as code instead.
    }
  }

  function copy() {
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    });
  }

  function download() {
    const ext = LANG_TO_EXT[lang] ?? "txt";
    downloadText(`snippet.${ext}`, text);
  }

  return (
    <div className="rounded-lg overflow-hidden border border-base-700 my-1.5 not-prose">
      <div className="flex items-center justify-between px-3 py-1 bg-base-800/80 text-[10px] uppercase tracking-wide text-base-500 font-mono">
        <span>{lang}</span>
        <div className="flex gap-2">
          <button onClick={copy} className="hover:text-signal-400 normal-case tracking-normal">
            {copied ? "copied" : "copy"}
          </button>
          <button onClick={download} className="hover:text-signal-400 normal-case tracking-normal">
            download
          </button>
        </div>
      </div>
      <pre className="hljs !bg-base-950/60 !m-0 p-3 text-xs overflow-x-auto">
        <code className={className}>{children}</code>
      </pre>
    </div>
  );
}

export default function ChatWindow({
  messages,
  onSend,
  loading,
  lastUsage,
  lastAnsweredBy,
  canGenerateImages,
  activeModel,
}: {
  messages: ChatMessage[];
  onSend: (text: string, attachments?: Attachment[], imageGen?: boolean) => void;
  loading: boolean;
  lastUsage?: { promptTokens: number; completionTokens: number; totalTokens: number; estimated: boolean };
  lastAnsweredBy?: string;
  canGenerateImages?: boolean;
  activeModel?: { label: string; providerLabel: string; contextTokens?: number };
}) {
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState<Attachment[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [imageGen, setImageGen] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropDepth = useRef(0);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function addFiles(files: FileList | File[]) {
    const list = Array.from(files);
    const results: Attachment[] = [];
    for (const file of list) {
      if (file.size > MAX_ATTACHMENT_BYTES) {
        results.push({ name: file.name, mimeType: file.type, size: file.size, dataUrl: "", kind: "other" });
        continue;
      }
      const kind = classifyFile(file);
      const dataUrl = kind === "text" ? await readFileAsText(file) : await readFileAsDataUrl(file);
      results.push({ name: file.name, mimeType: file.type, size: file.size, dataUrl, kind });
    }
    setPending((p) => [...p, ...results]);
  }

  function submit() {
    const text = draft.trim();
    if ((!text && pending.length === 0) || loading) return;
    onSend(text || (imageGen ? "" : "(see attached files)"), pending.length ? pending : undefined, imageGen);
    setDraft("");
    setPending([]);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    dropDepth.current = 0;
    setDragActive(false);
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  }

  const draftTokens = estimateTokens(draft);
  const totalTokens = estimateMessagesTokens(messages);
  const contextTokens = activeModel?.contextTokens;
  const usedRatio = contextTokens ? (totalTokens + draftTokens) / contextTokens : undefined;
  const utilizationLevel: "ok" | "warn" | "hot" | undefined =
    usedRatio === undefined ? undefined : usedRatio >= 0.9 ? "hot" : usedRatio >= 0.7 ? "warn" : "ok";

  function copyMessage(text: string, i: number) {
    navigator.clipboard?.writeText(text).then(() => {
      setCopiedIdx(i);
      setTimeout(() => setCopiedIdx(null), 1200);
    });
  }

  return (
    <div
      className="flex flex-col flex-1 min-h-0 relative"
      onDragEnter={(e) => {
        e.preventDefault();
        dropDepth.current += 1;
        setDragActive(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        dropDepth.current -= 1;
        if (dropDepth.current <= 0) setDragActive(false);
      }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
    >
      {dragActive && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-base-950/80 border-2 border-dashed border-signal-500/60 rounded-lg m-2 pointer-events-none">
          <p className="text-signal-400 font-display text-lg">Drop files to attach them to your message</p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-4">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center text-base-500 gap-4 py-16">
            <p className="font-display text-lg text-base-300">Empty session, full relay</p>
            <p className="text-sm max-w-sm">
              Send a message and Relay will pick the best-ranked model for your purpose, and quietly hop to the
              next one if a key or model fails. Drag files in, or turn on image generation below.
            </p>
            <div className="w-full max-w-md text-left">
              <RelayFlowDiagram />
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`group flex ${m.role === "user" ? "justify-end" : "justify-start"} animate-in`}>
            <div className={`flex flex-col gap-1 ${m.role === "user" ? "max-w-[85%] md:max-w-[65%]" : "max-w-[92%] md:max-w-[85%]"}`}>
              <div
                className={`rounded-2xl px-4 py-3 text-[15px] leading-relaxed ${
                  m.role === "user"
                    ? "bg-signal-500/15 border border-signal-500/30 text-base-100 whitespace-pre-wrap"
                    : "bg-base-850 border border-base-700 text-base-200 markdown-body"
                }`}
              >
                {m.attachments && m.attachments.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {m.attachments.map((a, j) =>
                      a.kind === "image" && a.dataUrl ? (
                        <img key={j} src={a.dataUrl} alt={a.name} className="h-16 w-16 object-cover rounded-lg border border-base-600" />
                      ) : (
                        <span key={j} className="text-xs bg-base-950/40 border border-base-600 rounded-full px-2 py-1 text-base-300">
                          📎 {a.name}
                        </span>
                      )
                    )}
                  </div>
                )}
                {m.role === "assistant" ? (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeHighlight]}
                    components={{
                      a: (props) => <a {...props} target="_blank" rel="noreferrer" className="text-signal-400 underline" />,
                      code: (props: any) =>
                        props.inline ? (
                          <code className="bg-base-950/60 rounded px-1 py-0.5 text-xs">{props.children}</code>
                        ) : (
                          <CodeBlockRenderer className={props.className}>{props.children}</CodeBlockRenderer>
                        ),
                      pre: (props: any) => <>{props.children}</>, // CodeBlockRenderer owns its own <pre>, so unwrap ReactMarkdown's default one
                      img: (props: any) => (
                        <img {...props} className="rounded-lg border border-base-600 max-w-full mt-1" />
                      ),
                    }}
                  >
                    {m.content}
                  </ReactMarkdown>
                ) : (
                  m.content
                )}
              </div>
              {m.role === "assistant" && (
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-wrap gap-2 px-1 text-xs text-base-500">
                  <button onClick={() => copyMessage(m.content, i)} className="hover:text-signal-400">
                    {copiedIdx === i ? "copied" : "copy"}
                  </button>
                  <button onClick={() => downloadText(`relay-reply-${i}.md`, m.content)} className="hover:text-signal-400">
                    download .md
                  </button>
                  {m.generatedImageUrl && (
                    <button onClick={() => downloadDataUrl(`relay-image-${i}.png`, m.generatedImageUrl!)} className="hover:text-signal-400">
                      download image
                    </button>
                  )}
                  {extractCodeBlocks(m.content)
                    .filter((b) => b.lang !== "diagram")
                    .map((block, bi) => (
                      <button
                        key={bi}
                        onClick={() => downloadText(block.filename ?? `relay-reply-${i}-${bi + 1}.${block.ext}`, block.code)}
                        className="hover:text-signal-400"
                        title={`Download this ${block.lang} code block${block.filename ? ` (${block.filename})` : ""}`}
                      >
                        ⬇ {block.filename ?? `code ${bi + 1} (.${block.ext})`}
                      </button>
                    ))}
                  {extractCodeBlocks(m.content).filter((b) => b.lang !== "diagram").length > 1 && (
                    <button
                      onClick={() => downloadBlocksAsZip(extractCodeBlocks(m.content).filter((b) => b.lang !== "diagram"), `relay-project-${i}.zip`)}
                      className="hover:text-signal-400"
                      title="Download every file/code block in this reply as one .zip"
                    >
                      ⬇ all as .zip
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl px-4 py-2.5 bg-base-850 border border-base-700 text-base-400 text-sm font-mono">
              {imageGen ? "generating image…" : "routing…"}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-base-700 bg-base-900/60 px-4 md:px-8 py-3">
        {lastAnsweredBy && lastUsage && (
          <p className="text-xs text-base-500 font-mono mb-2">
            answered by <span className="text-signal-400">{lastAnsweredBy}</span> · {lastUsage.estimated ? "~" : ""}
            {formatTokenCount(lastUsage.totalTokens)} tokens ({formatTokenCount(lastUsage.promptTokens)} in /{" "}
            {formatTokenCount(lastUsage.completionTokens)} out)
          </p>
        )}

        {pending.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {pending.map((a, i) => (
              <span
                key={i}
                className={`text-xs rounded-full px-2.5 py-1 flex items-center gap-1.5 border ${
                  a.dataUrl ? "bg-base-850 border-base-600 text-base-300" : "bg-flare-500/10 border-flare-500/40 text-flare-500"
                }`}
              >
                {a.kind === "image" ? "🖼" : "📎"} {a.name} {!a.dataUrl && "(too large, 8MB max)"}
                <button onClick={() => setPending((p) => p.filter((_, j) => j !== i))} className="text-base-500 hover:text-flare-500">
                  ✕
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="flex items-end gap-2">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.length) addFiles(e.target.files);
              e.target.value = "";
            }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            title="Attach files (or drag & drop anywhere in the chat)"
            aria-label="Attach files"
            className="shrink-0 h-11 px-3 rounded-xl border border-base-700 text-base-400 hover:text-signal-400 hover:border-signal-500/40 transition-colors flex items-center gap-1.5 text-xs font-medium"
          >
            📎 <span className="hidden sm:inline">Attach</span>
          </button>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder={
              imageGen ? "Describe the image to generate…" : "Message Relay… (Shift+Enter for a new line, or drag files in)"
            }
            rows={1}
            className="flex-1 resize-none bg-base-950 border border-base-600 focus:border-signal-500/50 rounded-xl px-4 py-3 text-sm text-base-100 placeholder:text-base-500 max-h-40"
          />
          <button
            onClick={submit}
            disabled={loading || (!draft.trim() && pending.length === 0)}
            className="shrink-0 h-11 px-5 rounded-xl bg-signal-500 text-base-950 text-sm font-medium hover:bg-signal-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>
        <div className="flex justify-between mt-1.5 text-xs text-base-500 font-mono">
          <div className="flex items-center gap-3">
            <span>~{formatTokenCount(draftTokens)} tokens in this message</span>
            <span>~{formatTokenCount(totalTokens)} tokens in this session so far</span>
          </div>
          {canGenerateImages && (
            <button
              onClick={() => setImageGen((v) => !v)}
              className={`px-2 py-0.5 rounded-full border transition-colors ${
                imageGen ? "border-signal-500/50 bg-signal-500/15 text-signal-400" : "border-base-700 text-base-500 hover:text-base-300"
              }`}
            >
              🖼 image generation {imageGen ? "on" : "off"}
            </button>
          )}
        </div>

        {activeModel && contextTokens && (
          <div className="mt-1.5">
            <div className="flex items-center justify-between text-xs font-mono text-base-500 mb-1">
              <span>
                using <span className="text-base-300">{activeModel.providerLabel} · {activeModel.label}</span> ·{" "}
                {formatTokenCount(contextTokens)} token context
              </span>
              <span
                className={
                  utilizationLevel === "hot" ? "text-flare-500" : utilizationLevel === "warn" ? "text-amber-500" : "text-base-500"
                }
              >
                {Math.min(100, Math.round((usedRatio ?? 0) * 100))}% used
              </span>
            </div>
            <div className="h-1 rounded-full bg-base-800 overflow-hidden">
              <div
                className={`h-full transition-all ${
                  utilizationLevel === "hot" ? "bg-flare-500" : utilizationLevel === "warn" ? "bg-amber-500" : "bg-signal-500/60"
                }`}
                style={{ width: `${Math.min(100, Math.max(2, (usedRatio ?? 0) * 100))}%` }}
              />
            </div>
            {utilizationLevel === "warn" && (
              <p className="text-xs text-amber-500 mt-1">
                You're past 70% of this model's context window. Consider starting a new session for unrelated topics, or
                switch to a longer-context model in the Purpose bar.
              </p>
            )}
            {utilizationLevel === "hot" && (
              <p className="text-xs text-flare-500 mt-1">
                Nearly out of context (90%+). The next reply may get truncated or fail — start a new session, trim old
                messages, or pick a "Long context" purpose / bigger-context model before sending.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
