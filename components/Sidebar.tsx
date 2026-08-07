"use client";

import { useState } from "react";
import { SessionMeta } from "@/lib/types";

export default function Sidebar({
  open,
  onClose,
  sessions,
  activeId,
  onSelect,
  onNew,
  onRename,
  onDelete,
}: {
  open: boolean;
  onClose: () => void;
  sessions: SessionMeta[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-30 bg-black/40 md:hidden" onClick={onClose} aria-hidden />
      )}
      <aside
        className={`fixed md:static z-40 h-full md:h-auto w-72 shrink-0 border-r border-base-700 bg-base-900 flex flex-col transition-transform duration-200 ${
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0 md:w-0 md:border-r-0 md:overflow-hidden"
        }`}
      >
        <div className="flex items-center justify-between px-4 h-14 border-b border-base-700 shrink-0">
          <span className="font-display font-medium text-base-200 tracking-tight">Sessions</span>
          <button
            onClick={onClose}
            className="text-base-400 hover:text-signal-400 text-sm px-2 py-1 rounded transition-colors"
            aria-label="Close sidebar"
          >
            ✕
          </button>
        </div>

        <div className="p-3 shrink-0">
          <button
            onClick={onNew}
            className="w-full rounded-lg border border-signal-500/40 bg-signal-500/10 text-signal-400 hover:bg-signal-500/20 transition-colors text-sm font-medium py-2.5"
          >
            + New session
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 pb-4 space-y-1">
          {sessions.length === 0 && (
            <p className="text-base-500 text-sm px-3 py-6 text-center">No sessions yet. Start one above.</p>
          )}
          {sessions.map((s) => (
            <div
              key={s.id}
              className={`group rounded-lg px-3 py-2.5 cursor-pointer transition-colors ${
                s.id === activeId ? "bg-base-800 border border-signal-500/30" : "hover:bg-base-850 border border-transparent"
              }`}
              onClick={() => onSelect(s.id)}
            >
              {editingId === s.id ? (
                <input
                  autoFocus
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  onBlur={() => {
                    if (draft.trim()) onRename(s.id, draft.trim());
                    setEditingId(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                    if (e.key === "Escape") setEditingId(null);
                  }}
                  className="w-full bg-base-950 border border-base-600 rounded px-2 py-1 text-sm text-base-100"
                />
              ) : (
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm text-base-100 truncate">{s.name}</p>
                    <p className="text-xs text-base-500 uppercase tracking-wide font-mono">{s.mode === "free" ? "free keys" : "kodekey"}</p>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 flex gap-1 shrink-0 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDraft(s.name);
                        setEditingId(s.id);
                      }}
                      className="text-base-400 hover:text-signal-400 text-xs px-1.5 py-0.5"
                      aria-label="Rename session"
                    >
                      rename
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(s.id);
                      }}
                      className="text-base-400 hover:text-flare-500 text-xs px-1.5 py-0.5"
                      aria-label="Delete session"
                    >
                      delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="p-3 border-t border-base-700 text-xs text-base-500 shrink-0">
          Sessions and keys live only in this browser. Nothing is sent to a database.
        </div>
      </aside>
    </>
  );
}
