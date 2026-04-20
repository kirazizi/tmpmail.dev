"use client";

import { useEffect, useState } from "react";
import {
  Copy,
  RefreshCw,
  Check,
  Hourglass,
  ShieldCheck,
  Zap,
  ArrowLeft,
  Mail,
  Clock,
  ChevronRight,
  Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Home() {
  const [email, setEmail] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [messages, setMessages] = useState<any[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<any | null>(null);
  const [selectedLoading, setSelectedLoading] = useState(false);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [remainingSec, setRemainingSec] = useState<number>(0);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // --- Logic Helpers ---

  const formatRelative = (iso?: string) => {
    if (!iso) return "";
    const d = new Date(iso);
    const now = Date.now();
    const diff = Math.max(0, now - d.getTime());
    const sec = Math.floor(diff / 1000);
    if (sec < 10) return "Just now";
    if (sec < 60) return `${sec}s ago`;
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min}m ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr}h ago`;
    return d.toLocaleDateString();
  };

  const formatHMS = (total: number) => {
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    const pad = (n: number) => n.toString().padStart(2, "0");
    return { h: pad(h), m: pad(m), s: pad(s) };
  };

  // --- Effects ---

  useEffect(() => {
    if (!expiresAt) {
      setRemainingSec(0);
      return;
    }
    const tick = () => {
      const remMs = Math.max(0, expiresAt - Date.now());
      setRemainingSec(Math.floor(remMs / 1000));
      if (remMs <= 0) {
        setEmail(null);
        setToken(null);
        setExpiresAt(null);
        setMessages([]);
        setSelectedMessageId(null);
        setSelectedMessage(null);
        setReadIds(new Set());
        window.localStorage.removeItem("tempMailAccount");
        window.localStorage.removeItem("tempMailExpiresAt");
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem("tempMailExpiresAt");

      let storedToken = window.localStorage.getItem("tempMailToken");

      if (!storedToken) {
        const rawFn = window.localStorage.getItem("tempMailAccount");
        if (rawFn) {
          try {
            const parsed = JSON.parse(rawFn);
            if (parsed.token) {
              storedToken = parsed.token;
              window.localStorage.setItem("tempMailToken", storedToken!);
              window.localStorage.removeItem("tempMailAccount");
            }
          } catch (e) {
            window.localStorage.removeItem("tempMailAccount");
          }
        }
      }

      if (storedToken) {
        setToken(storedToken);
        fetch("/api/temp-mail/me", {
          headers: { Authorization: `Bearer ${storedToken}` },
        })
          .then(async (res) => {
            if (res.ok) {
              const data = await res.json();
              setEmail(data.address);
              const created = data.createdAt ? new Date(data.createdAt).getTime() : Date.now();
              setExpiresAt(created + 60 * 60 * 1000);
            } else {
              window.localStorage.removeItem("tempMailToken");
              window.localStorage.removeItem("tempMailAccount");
              setToken(null);
            }
          })
          .catch(() => {
            window.localStorage.removeItem("tempMailToken");
            window.localStorage.removeItem("tempMailAccount");
            setToken(null);
          })
          .finally(() => {
            setInitializing(false);
          });
      } else {
        setInitializing(false);
      }
    } catch (error) {
      console.error("Failed to read localStorage", error);
      setInitializing(false);
    }
  }, []);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/temp-mail/messages`, {
          cache: "no-store",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 401) {
          setEmail(null);
          setToken(null);
          setExpiresAt(null);
          window.localStorage.removeItem("tempMailToken");
          return;
        }
        if (!res.ok) return;
        const data = await res.json();
        const items = data["hydra:member"] ?? [];
        if (!cancelled) setMessages(items);
      } catch (error) {
        console.error(error);
      }
    };
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [token]);

  const generateEmail = async () => {
    try {
      setLoading(true);
      setCopied(false);
      setMessages([]);
      setSelectedMessageId(null);
      setSelectedMessage(null);

      const res = await fetch("/api/temp-mail", { method: "POST" });
      if (!res.ok) {
        setLoading(false);
        return;
      }
      const data = await res.json();
      setEmail(data.address);
      setToken(data.token);

      if (typeof window !== "undefined") {
        window.localStorage.setItem("tempMailToken", data.token);
        window.localStorage.removeItem("tempMailAccount");
        window.localStorage.removeItem("tempMailExpiresAt");

        const base = data.createdAt ? new Date(data.createdAt).getTime() : Date.now();
        const exp = base + 60 * 60 * 1000;
        setExpiresAt(exp);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (email) {
      navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const manualRefresh = async () => {
    if (!token) return;
    setMessagesLoading(true);
    try {
      const res = await fetch(`/api/temp-mail/messages`, {
        cache: "no-store",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data["hydra:member"] ?? []);
      }
    } finally {
      setTimeout(() => setMessagesLoading(false), 1000);
    }
  };

  const openMessage = async (id: string) => {
    if (!token) return;
    setSelectedMessageId(id);
    setSelectedLoading(true);
    setSelectedMessage(null);
    setReadIds((prev) => new Set(prev).add(id));
    try {
      const res = await fetch(`/api/temp-mail/messages/${encodeURIComponent(id)}`, {
        cache: "no-store",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedMessage(data);
        // Mark as seen on the server (fire-and-forget)
        fetch(`/api/temp-mail/messages/${encodeURIComponent(id)}`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => {});
      }
    } finally {
      setSelectedLoading(false);
    }
  };

  const hms = formatHMS(remainingSec);

  return (
    <div suppressHydrationWarning className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans selection:bg-indigo-100 dark:selection:bg-indigo-900">

      {/* Background Decor */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-indigo-50/50 to-transparent dark:from-indigo-950/20 blur-3xl opacity-50" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">

        {/* Header */}
        <div className="mb-8 md:mb-12 text-center max-w-2xl mx-auto">
          {/* <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Live Mail System
          </div> */}
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-b from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400">
            Tmp Mail<span className="text-indigo-600 dark:text-indigo-400">.</span>
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Instant, disposable email addresses to keep your personal inbox clean and secure.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12">

          {/* Left Column: Control Center */}
          <div className="lg:col-span-5 flex flex-col gap-6">

            {/* Main Card */}
            <div className="relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
              <div className="p-6 md:p-8 space-y-6">

                {initializing ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-zinc-200 dark:bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
                      <Mail className="h-8 w-8 text-zinc-300 dark:text-zinc-600" />
                    </div>
                    <div className="h-4 w-32 bg-zinc-200 dark:bg-zinc-800 rounded-full mx-auto mb-3 animate-pulse" />
                    <div className="h-3 w-48 bg-zinc-200 dark:bg-zinc-800 rounded-full mx-auto mb-6 animate-pulse" />
                    <div className="h-11 w-40 bg-zinc-200 dark:bg-zinc-800 rounded-xl mx-auto animate-pulse" />
                  </div>
                ) : !email ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-zinc-200 dark:bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Mail className="h-8 w-8 text-zinc-400" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No Active Email</h3>
                    <p className="text-sm text-zinc-500 mb-6">Generate a secure temporary address instantly.</p>
                    <button
                      onClick={generateEmail}
                      disabled={loading}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-xl font-medium hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/10"
                    >
                      {loading ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Zap className="h-4 w-4" />
                      )}
                      <span>Generate Address</span>
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                          Your Temporary Address
                        </label>
                        {copied && (
                          <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 animate-in fade-in slide-in-from-bottom-1 duration-200">
                            Copied to clipboard!
                          </span>
                        )}
                      </div>
                      <div className="group relative flex items-center gap-3 p-1 pl-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 hover:border-indigo-500/50 transition-colors">
                        <div className="flex-1 overflow-hidden">
                          <p className="font-mono text-sm sm:text-base md:text-lg text-zinc-900 dark:text-zinc-100 truncate select-all">
                            {loading ? (
                              <span className="flex items-center gap-2 text-zinc-400 animate-pulse">
                                <RefreshCw className="h-4 w-4 animate-spin" /> Generating...
                              </span>
                            ) : (
                              email
                            )}
                          </p>
                        </div>
                        <button
                          onClick={copyToClipboard}
                          className={cn(
                            "w-10 h-10 inline-flex items-center justify-center rounded-lg transition-colors",
                            copied
                              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 border border-transparent"
                              : "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-white shadow-sm border border-zinc-200 dark:border-zinc-700"
                          )}
                        >
                          {copied ? <Check size={18} strokeWidth={3} /> : <Copy size={18} />}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center text-center">
                        <span className="text-xs text-zinc-500 mb-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Expires in
                        </span>
                        <div className="font-mono text-2xl font-bold tabular-nums tracking-tight">
                          {hms.m}:{hms.s}
                        </div>
                      </div>

                      <button
                        onClick={() => setShowConfirmDialog(true)}
                        className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex flex-col items-center justify-center text-center group"
                      >
                        <span className="text-xs text-zinc-500 mb-1 group-hover:text-zinc-800 dark:group-hover:text-zinc-200">
                          Need new?
                        </span>
                        <div className="flex items-center gap-2 font-semibold text-zinc-700 dark:text-zinc-300">
                          <RefreshCw className="h-4 w-4" /> Reset
                        </div>
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Security Badges Footer */}
              <div className="px-6 py-4 bg-zinc-50/50 dark:bg-zinc-900/50 border-t border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-y-2 text-xs text-zinc-500">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Secure
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Hourglass className="w-3.5 h-3.5 text-amber-500" /> 1 Hour Limit
                  </span>
                </div>
                {token && <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
              </div>
            </div>

            {/* Hint Text */}
            <div className="px-2 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
              <p>
                Use this address for verifications, sign-ups, or testing.
                Emails are automatically deleted after 1 hour.
                Do not use for important accounts.
              </p>
            </div>
          </div>

          {/* Right Column: Inbox */}
          <div className="lg:col-span-7 h-[480px] sm:h-[540px] md:h-[580px] lg:h-[600px] flex flex-col">
            <div className="flex-1 flex flex-col rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden relative">

              {/* Inbox Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm z-20">
                <div className="flex items-center gap-3">
                  <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">Inbox</h2>
                  {messages.length > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                      {messages.length}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={manualRefresh}
                    disabled={!token || messagesLoading}
                    className={cn(
                      "inline-flex items-center justify-center transition-colors text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 focus:outline-none disabled:opacity-40 cursor-pointer",
                      messagesLoading && "text-indigo-500"
                    )}
                    title="Refresh Messages"
                  >
                    <RefreshCw size={16} className={cn(messagesLoading && "animate-spin")} />
                  </button>
                </div>
              </div>

              {/* Content Area */}
              <div className="flex-1 overflow-hidden relative">

                {/* View: Message Details */}
                <div
                  className={cn(
                    "absolute inset-0 z-30 bg-white dark:bg-zinc-900 transition-transform duration-300 ease-in-out flex flex-col",
                    selectedMessageId ? "translate-x-0" : "translate-x-full"
                  )}
                >
                  <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
                    <button
                      onClick={() => { setSelectedMessage(null); setSelectedMessageId(null); }}
                      className="p-2 -ml-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 transition-colors"
                    >
                      <ArrowLeft size={18} />
                    </button>
                    <span className="text-sm font-medium">
                      {selectedLoading ? "Loading..." : "Read Message"}
                    </span>
                  </div>

                  {selectedLoading ? (
                    <div className="flex-1 overflow-y-auto p-6 space-y-4 animate-pulse">
                      <div className="h-7 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
                      <div className="flex items-center justify-between pt-2 pb-6 border-b border-zinc-200 dark:border-zinc-800">
                        <div className="space-y-2">
                          <div className="h-4 w-32 bg-zinc-200 dark:bg-zinc-800 rounded" />
                          <div className="h-3 w-48 bg-zinc-200 dark:bg-zinc-800 rounded" />
                        </div>
                        <div className="h-3 w-16 bg-zinc-200 dark:bg-zinc-800 rounded" />
                      </div>
                      <div className="space-y-3 pt-2">
                        <div className="h-3 w-full bg-zinc-200 dark:bg-zinc-800 rounded" />
                        <div className="h-3 w-5/6 bg-zinc-200 dark:bg-zinc-800 rounded" />
                        <div className="h-3 w-4/6 bg-zinc-200 dark:bg-zinc-800 rounded" />
                      </div>
                    </div>
                  ) : selectedMessage ? (
                    <div className="flex-1 overflow-y-auto p-6">
                      <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
                        {selectedMessage.subject || "(No Subject)"}
                      </h2>
                      <div className="flex items-center justify-between text-sm text-zinc-500 mb-8 pb-8 border-b border-zinc-200 dark:border-zinc-800">
                        <div className="flex flex-col">
                          <span className="font-medium text-zinc-900 dark:text-zinc-200">
                            {selectedMessage.from?.name || selectedMessage.from?.address}
                          </span>
                          <span className="text-xs text-zinc-400">{selectedMessage.from?.address}</span>
                        </div>
                        <time>{formatRelative(selectedMessage.createdAt)}</time>
                      </div>

                      <div className="prose prose-zinc dark:prose-invert max-w-none text-sm">
                        {selectedMessage.html?.[0] ? (
                          <iframe
                            className="w-full min-h-[400px] rounded-md border border-zinc-200 dark:border-zinc-800 bg-transparent"
                            sandbox="allow-popups allow-popups-to-escape-sandbox"
                            srcDoc={`<!DOCTYPE html><html><head><meta charset=\"utf-8\"/><meta http-equiv=\"Content-Security-Policy\" content=\"upgrade-insecure-requests\"/><base target=\"_blank\"/><style>html,body{margin:0;padding:0;background:transparent;color:#111} a{color:#2563eb} @media(prefers-color-scheme:dark){body{color:#e5e7eb;background:transparent}}</style></head><body>${selectedMessage.html[0]}</body></html>`}
                          />
                        ) : (
                          <pre className="whitespace-pre-wrap font-sans">{selectedMessage.text}</pre>
                        )}
                      </div>
                    </div>
                  ) : null}
                </div>

                {/* View: Message List */}
                <div className="absolute inset-0 overflow-y-auto">
                  {initializing ? (
                    <div className="h-full flex flex-col items-center justify-center p-8 text-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-zinc-200 dark:bg-zinc-800/50 flex items-center justify-center animate-pulse">
                        <Zap className="h-6 w-6 text-zinc-200 dark:text-zinc-700" />
                      </div>
                      <div className="h-3 w-40 bg-zinc-200 dark:bg-zinc-800 rounded-full animate-pulse" />
                    </div>
                  ) : !token ? (
                    <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                      <div className="w-16 h-16 rounded-full bg-zinc-50 dark:bg-zinc-800/50 flex items-center justify-center mb-4">
                        <Zap className="h-6 w-6 text-zinc-300 dark:text-zinc-600" />
                      </div>
                      <p className="text-zinc-500 font-medium">Generate an email to start receiving</p>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                      <div className="relative mb-6">
                        <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full" />
                        <div className="relative bg-white dark:bg-zinc-800 p-4 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-700">
                          <Mail className="h-8 w-8 text-zinc-400" />
                        </div>
                      </div>
                      <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-200">Inbox Empty</h3>
                      <p className="text-sm text-zinc-500 max-w-xs mt-2">
                        We are listening for incoming messages. They will appear here automatically.
                      </p>
                      <div className="mt-8 flex items-center gap-2 text-xs text-indigo-500 font-medium animate-pulse">
                        <span className="w-2 h-2 bg-indigo-500 rounded-full" />
                        Waiting for mail...
                      </div>
                    </div>
                  ) : (
                    <div className="divide-y divide-zinc-200 dark:divide-zinc-800/50">
                      {messages.map((msg) => {
                        const isRead = msg.seen || readIds.has(msg.id);
                        return (
                          <button
                            key={msg.id}
                            onClick={() => openMessage(msg.id)}
                            className={cn(
                              "relative w-full text-left px-6 py-4 transition-colors group",
                              selectedMessageId === msg.id
                                ? "bg-zinc-100 dark:bg-zinc-800"
                                : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                            )}
                          >
                            {/* Unread left accent bar */}
                            {!isRead && (
                              <span className="absolute left-0 inset-y-0 w-[3px] bg-indigo-500 rounded-r-full" />
                            )}

                            <div className="flex items-center justify-between mb-1">
                              <span className={cn(
                                "text-sm truncate max-w-[160px] sm:max-w-[220px]",
                                isRead
                                  ? "font-medium text-zinc-500 dark:text-zinc-400"
                                  : "font-semibold text-zinc-900 dark:text-zinc-100"
                              )}>
                                {msg.from?.name || msg.from?.address || "Unknown"}
                              </span>

                              <div className="flex items-center gap-2 shrink-0">
                                {!isRead && (
                                  <span className="px-1.5 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-semibold uppercase tracking-wide">
                                    New
                                  </span>
                                )}
                                <span className="text-xs text-zinc-400 font-mono">
                                  {formatRelative(msg.createdAt)}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between gap-4">
                              <p className={cn(
                                "text-sm truncate",
                                isRead
                                  ? "text-zinc-400 dark:text-zinc-500"
                                  : "text-zinc-600 dark:text-zinc-300"
                              )}>
                                {msg.subject || "(No Subject)"}
                              </p>
                              <ChevronRight className="w-4 h-4 text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity -mr-2 shrink-0" />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>

        </div>


      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowConfirmDialog(false)}
          />
          <div className="relative w-full max-w-sm rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center shrink-0">
                <Trash2 className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Generate new address?</h3>
                <p className="text-sm text-zinc-500">Your current inbox and all messages will be permanently lost.</p>
              </div>
            </div>
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="flex-1 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                Keep current
              </button>
              <button
                onClick={() => { setShowConfirmDialog(false); generateEmail(); }}
                className="flex-1 py-2.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-black text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Yes, reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}