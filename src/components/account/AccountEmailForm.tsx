"use client";

import { useState } from "react";

interface AccountEmailFormProps {
  initialEmail: string;
}

export default function AccountEmailForm({ initialEmail }: AccountEmailFormProps) {
  const [email, setEmail] = useState(initialEmail);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const dirty = email !== initialEmail;

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMsg(null);
    const res = await fetch("/api/account/email", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setSaving(false);
    if (!res.ok) {
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      setError(j.error || "Save failed.");
      return;
    }
    setMsg("Saved.");
  }

  return (
    <form onSubmit={save} className="flex flex-col sm:flex-row gap-2 items-stretch">
      <input
        type="email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          setMsg(null);
        }}
        maxLength={254}
        placeholder="Add an email (optional)"
        className="flex-1 bg-deama-black border border-deama-border focus:border-deama-red rounded px-3 py-2 text-sm focus:outline-none"
      />
      <button
        type="submit"
        disabled={!dirty || saving}
        className="bg-deama-red hover:bg-deama-red-hover disabled:opacity-50 text-white text-xs uppercase tracking-wider font-bold px-4 py-2 rounded"
      >
        {saving ? "Saving…" : "Save"}
      </button>
      {error && (
        <p className="text-xs text-deama-red sm:w-full">{error}</p>
      )}
      {msg && <p className="text-xs text-green-400 sm:w-full">{msg}</p>}
    </form>
  );
}
