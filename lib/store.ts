import { ChatMessage, Mode, Purpose, SessionMeta } from "./types";
import { generateSessionName } from "./sessionNames";

const SESSIONS_KEY = "kr.sessions";
const FREE_KEYS_KEY = "kr.keys.free";
const KODEKEY_KEY = "kr.keys.kodekey";
const EXTRA_KEYS_KEY = "kr.keys.extra";
const msgKey = (id: string) => `kr.session.${id}.messages`;
const settingsKey = (id: string) => `kr.session.${id}.settings`;

const isBrowser = () => typeof window !== "undefined";

function read<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (!isBrowser()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export interface SessionSettings {
  mode: Mode;
  purpose: Purpose;
  preferredProviderKey?: string;
  preferredModelId?: string;
}

export const store = {
  listSessions(): SessionMeta[] {
    return read<SessionMeta[]>(SESSIONS_KEY, []).sort((a, b) => b.updatedAt - a.updatedAt);
  },

  createSession(mode: Mode, context?: string): SessionMeta {
    const sessions = read<SessionMeta[]>(SESSIONS_KEY, []);
    const now = Date.now();
    const session: SessionMeta = {
      id: crypto.randomUUID(),
      name: generateSessionName(sessions.map((s) => s.name), context),
      mode,
      createdAt: now,
      updatedAt: now,
    };
    write(SESSIONS_KEY, [...sessions, session]);
    write<SessionSettings>(settingsKey(session.id), { mode, purpose: "general" });
    write<ChatMessage[]>(msgKey(session.id), []);
    return session;
  },

  renameSession(id: string, name: string) {
    const sessions = read<SessionMeta[]>(SESSIONS_KEY, []);
    write(
      SESSIONS_KEY,
      sessions.map((s) => (s.id === id ? { ...s, name, updatedAt: Date.now() } : s))
    );
  },

  touchSession(id: string) {
    const sessions = read<SessionMeta[]>(SESSIONS_KEY, []);
    write(
      SESSIONS_KEY,
      sessions.map((s) => (s.id === id ? { ...s, updatedAt: Date.now() } : s))
    );
  },

  deleteSession(id: string) {
    const sessions = read<SessionMeta[]>(SESSIONS_KEY, []).filter((s) => s.id !== id);
    write(SESSIONS_KEY, sessions);
    if (isBrowser()) {
      window.localStorage.removeItem(msgKey(id));
      window.localStorage.removeItem(settingsKey(id));
    }
  },

  getMessages(id: string): ChatMessage[] {
    return read<ChatMessage[]>(msgKey(id), []);
  },

  setMessages(id: string, messages: ChatMessage[]) {
    write(msgKey(id), messages);
    this.touchSession(id);
  },

  getSettings(id: string): SessionSettings {
    return read<SessionSettings>(settingsKey(id), { mode: "free", purpose: "general" });
  },

  setSettings(id: string, settings: SessionSettings) {
    write(settingsKey(id), settings);
  },

  getFreeKeys(): Record<string, string> {
    return read<Record<string, string>>(FREE_KEYS_KEY, {});
  },

  setFreeKeys(keys: Record<string, string>) {
    write(FREE_KEYS_KEY, keys);
  },

  getKodeKey(): string {
    return read<string>(KODEKEY_KEY, "");
  },

  setKodeKey(key: string) {
    write(KODEKEY_KEY, key);
  },

  getExtra(): Record<string, Record<string, string>> {
    return read<Record<string, Record<string, string>>>(EXTRA_KEYS_KEY, {});
  },

  setExtra(extra: Record<string, Record<string, string>>) {
    write(EXTRA_KEYS_KEY, extra);
  },

  /** Dumps every kr.* localStorage key into a single plain object for backup/export. */
  exportAll(): Record<string, unknown> {
    if (!isBrowser()) return {};
    const out: Record<string, unknown> = {};
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (!key || !key.startsWith("kr.")) continue;
      try {
        out[key] = JSON.parse(window.localStorage.getItem(key)!);
      } catch {
        out[key] = window.localStorage.getItem(key);
      }
    }
    return { version: 1, exportedAt: Date.now(), data: out };
  },

  /** Restores everything from a previously exported backup object. Overwrites existing kr.* keys. */
  importAll(backup: any) {
    if (!isBrowser()) return;
    const data = backup?.data && typeof backup.data === "object" ? backup.data : backup;
    if (!data || typeof data !== "object") throw new Error("Invalid backup file.");
    for (const [key, value] of Object.entries(data)) {
      if (!key.startsWith("kr.")) continue;
      window.localStorage.setItem(key, JSON.stringify(value));
    }
  },
};
