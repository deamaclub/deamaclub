"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/admin";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    });
    setLoading(false);
    if (!res || res.error) {
      setError("Invalid email or password.");
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="bg-deama-ink border border-deama-border rounded-lg p-8">
        <h1 className="font-display text-3xl tracking-wide text-deama-gold-bright mb-1">
          DEAMACLUB
        </h1>
        <p className="text-sm text-deama-muted mb-6">Admin sign in</p>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-deama-muted mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-deama-black border border-deama-border rounded px-3 py-2 focus:outline-none focus:border-deama-red"
              autoComplete="email"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-deama-muted mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-deama-black border border-deama-border rounded px-3 py-2 focus:outline-none focus:border-deama-red"
              autoComplete="current-password"
            />
          </div>
          {error && (
            <p className="text-sm text-deama-red border border-deama-red/40 bg-deama-red/10 rounded px-3 py-2">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-deama-red hover:bg-deama-red-hover disabled:opacity-60 text-white font-semibold uppercase tracking-wider px-4 py-2 rounded transition-colors"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
