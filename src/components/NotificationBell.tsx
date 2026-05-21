"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, Heart, MessageSquare } from "lucide-react";
import { useSession } from "next-auth/react";
import { timeAgo } from "@/lib/utils";

interface NotificationItem {
  id: string;
  type: "COMMENT_REPLY" | "COMMENT_LIKE";
  read: boolean;
  createdAt: string;
  postSlug: string | null;
  commentId: string | null;
  actorUsername: string;
  commentSnippet: string;
}

const POLL_MS = 30_000;

export default function NotificationBell() {
  const { status } = useSession();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const fetchNow = useCallback(async () => {
    if (status !== "authenticated") return;
    try {
      const res = await fetch("/api/notifications", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as {
        unreadCount: number;
        notifications: NotificationItem[];
      };
      setUnread(data.unreadCount);
      setItems(data.notifications);
    } catch {
      /* swallow */
    }
  }, [status]);

  // Initial + poll
  useEffect(() => {
    if (status !== "authenticated") {
      setItems([]);
      setUnread(0);
      return;
    }
    fetchNow();
    const t = setInterval(fetchNow, POLL_MS);
    return () => clearInterval(t);
  }, [status, fetchNow]);

  // Outside-click close
  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  async function markAllRead() {
    setUnread(0);
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    }).catch(() => {});
  }

  async function markOne(id: string) {
    setUnread((u) => Math.max(0, u - 1));
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: [id] }),
    }).catch(() => {});
  }

  if (status !== "authenticated") return null;

  return (
    <div className="relative" ref={wrapRef}>
      <button
        type="button"
        aria-label={`Notifications${unread > 0 ? ` (${unread} unread)` : ""}`}
        onClick={() => setOpen((v) => !v)}
        className="relative inline-flex items-center justify-center w-9 h-9 rounded text-deama-muted hover:text-deama-gold-bright transition-colors"
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute top-1 right-1 inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-deama-red text-white text-[10px] font-bold leading-none animate-pulse-red">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-80 max-h-[28rem] overflow-hidden bg-deama-ink border border-deama-border rounded-lg shadow-glow z-50 flex flex-col"
        >
          <div className="flex items-center justify-between px-3 py-2 border-b border-deama-border">
            <p className="text-xs uppercase tracking-widest text-deama-gold">
              Notifications
            </p>
            {unread > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="text-[11px] text-deama-muted hover:text-deama-red"
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="overflow-y-auto flex-1">
            {items.length === 0 ? (
              <p className="p-4 text-sm text-deama-muted text-center">
                Nothing yet.
              </p>
            ) : (
              <ul className="divide-y divide-deama-border">
                {items.map((n) => {
                  const Icon =
                    n.type === "COMMENT_LIKE" ? Heart : MessageSquare;
                  const action =
                    n.type === "COMMENT_LIKE"
                      ? "liked your comment"
                      : "replied to your comment";
                  const href = n.postSlug
                    ? `/video/${n.postSlug}#comments`
                    : "/account";
                  return (
                    <li
                      key={n.id}
                      className={n.read ? "" : "bg-deama-surface/50"}
                    >
                      <Link
                        href={href}
                        onClick={() => {
                          setOpen(false);
                          if (!n.read) markOne(n.id);
                        }}
                        className="flex gap-2 px-3 py-2.5 hover:bg-deama-surface"
                      >
                        <Icon
                          size={14}
                          className={
                            n.type === "COMMENT_LIKE"
                              ? "text-deama-red mt-0.5"
                              : "text-deama-gold mt-0.5"
                          }
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-deama-text/90">
                            <span className="font-semibold text-deama-gold-bright">
                              @{n.actorUsername}
                            </span>{" "}
                            {action}
                          </p>
                          {n.commentSnippet && (
                            <p className="text-[11px] text-deama-muted mt-0.5 line-clamp-2">
                              “{n.commentSnippet}”
                            </p>
                          )}
                          <p className="text-[10px] text-deama-muted mt-0.5">
                            {timeAgo(n.createdAt)}
                          </p>
                        </div>
                        {!n.read && (
                          <span className="block w-2 h-2 rounded-full bg-deama-red shrink-0 mt-1.5" />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
