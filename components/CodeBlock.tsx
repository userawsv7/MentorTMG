"use client";

import { useState } from "react";

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  showLineNumbers?: boolean;
  allowDownload?: boolean;
}

export default function CodeBlock({
  code,
  language = "text",
  filename,
  showLineNumbers = false,
  allowDownload = true
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = code;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename || `code.${getFileExtension(language)}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getFileExtension = (lang: string): string => {
    const extensions: Record<string, string> = {
      javascript: "js",
      typescript: "ts",
      python: "py",
      yaml: "yaml",
      yml: "yml",
      json: "json",
      bash: "sh",
      shell: "sh",
      sql: "sql",
      html: "html",
      css: "css",
      java: "java",
      go: "go",
      rust: "rs",
      cpp: "cpp",
      c: "c",
    };
    return extensions[lang.toLowerCase()] || "txt";
  };

  const getLanguageLabel = (lang: string): string => {
    const labels: Record<string, string> = {
      javascript: "JavaScript",
      typescript: "TypeScript",
      python: "Python",
      yaml: "YAML",
      yml: "YAML",
      json: "JSON",
      bash: "Bash",
      shell: "Shell",
      sql: "SQL",
      html: "HTML",
      css: "CSS",
      java: "Java",
      go: "Go",
      rust: "Rust",
      cpp: "C++",
      c: "C",
    };
    return labels[lang.toLowerCase()] || lang.toUpperCase();
  };

  return (
    <div className="rounded-lg border border-base-700 bg-base-950 overflow-hidden my-2">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-base-700 bg-base-900/50">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-base-500">
            {getLanguageLabel(language)}
          </span>
          {filename && (
            <span className="text-xs text-base-600">• {filename}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {allowDownload && (
            <button
              onClick={handleDownload}
              className="text-xs px-2 py-1 rounded border border-base-700 hover:bg-base-800 text-base-400 transition-colors"
              title="Download file"
            >
              ⬇ Download
            </button>
          )}
          <button
            onClick={handleCopy}
            className={`text-xs px-3 py-1 rounded border transition-all ${
              copied
                ? "border-signal-500 bg-signal-500/10 text-signal-400"
                : "border-base-700 hover:bg-base-800 text-base-400"
            }`}
          >
            {copied ? "✓ Copied!" : "📋 Copy"}
          </button>
        </div>
      </div>

      {/* Code Content */}
      <div className="overflow-x-auto">
        <pre className="p-4 text-sm font-mono text-base-200 leading-relaxed">
          <code>
            {showLineNumbers
              ? code.split("\n").map((line, index) => (
                  <div key={index} className="flex">
                    <span className="select-none text-base-600 w-8 text-right pr-4 border-r border-base-800 mr-4">
                      {index + 1}
                    </span>
                    <span>{line}</span>
                  </div>
                ))
              : code}
          </code>
        </pre>
      </div>
    </div>
  );
}

// Collapsible source documentation component
interface SourceDocProps {
  title: string;
  link: string;
  description: string;
  verifyText: string;
}

export function SourceDocumentation({ title, link, description, verifyText }: SourceDocProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <details className="my-2" open={isOpen} onToggle={() => setIsOpen(!isOpen)}>
      <summary className="cursor-pointer text-sm text-signal-400 hover:text-signal-300 transition-colors flex items-center gap-2">
        <span>📚 {title}</span>
        <span className="text-xs text-base-600">(click to expand)</span>
      </summary>
      <div className="mt-3 pl-6 border-l-2 border-base-700">
        <p className="text-sm text-base-400 mb-2">{description}</p>
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm text-signal-400 hover:text-signal-300 underline"
        >
          {link} ↗
        </a>
        <p className="mt-2 text-xs text-base-500">Verify: {verifyText}</p>
      </div>
    </details>
  );
}