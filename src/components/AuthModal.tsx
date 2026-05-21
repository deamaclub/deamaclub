"use client";

import { useState, useEffect, useCallback } from "react";
import { signIn, useSession } from "next-auth/react";
import { X } from "lucide-react";
import { useAuthModal } from "./AuthModalProvider";

/**
 * Sign in / sign up modal. Opened via the AuthModalProvider context.
 * Used as a gate before like / comment actions for unauthenticated
 * visitors. After a successful auth, any queued "pending action" is
 * fired so the original click completes seamlessly.
 */
export default function AuthModal() {
  const { open, close, mode, setMode, pendingAction } = useAuthModal();
  const { status } = useSession();
  const [identifier, setIdentifier] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [hp, setHp] = useState(""); // honeypot
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fire pending action once we're authenticated
  useEffect(() => {
    if (status === "authenticated" && pendingAction) {
      pendingAction();
      close();
    }
  }, [status, pendingAction, close]);

  const reset = useCallback(() => {
    setIdentifier("");
    setUsername("");
    setPassword("");
    setEmail("");
    setHp("");
    setError(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  if (!open) return null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (mode === "signin") {
      const res = await signIn("credentials", {
        identifier,
        password,
        redirect: false,
      });
      setLoading(false);
      if (!res || res.error) {
        setError("Wrong username or password.");
        return;
      }
      // Session will pick up via useSession; pendingAction effect fires
    } else {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, email, hp }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        setLoading(false);
        setError(j.error || "Sign up failed.");
        return;
      }
      // Auto-sign-in after successful signup
      const signinRes = await signIn("credentials", {
        identifier: username,
        password,
        redirect: false,
      });
      setLoading(false);
      if (!signinRes || signinRes.error) {
        setError("Account created — but sign-in failed. Try logging in.");
        setMode("signin");
        return;
      }
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className="bg-deama-ink border border-deama-border rounded-lg w-full max-w-sm p-6 relative">
        <button
          type="button"
          aria-label="Close"
          onClick={close}
          className="absolute top-3 right-3 text-deama-muted hover:text-deama-text"
        >
          <X size={18} />
        </button>

        <h2 className="font-display text-2xl tracking-wide text-deama-gold-bright mb-4">
          {mode === "signin" ? "SIGN IN" : "CREATE ACCOUNT"}
        </h2>

        <div className="flex gap-2 text-xs uppercase tracking-wider mb-5 border-b border-deama-border">
          <button
            type="button"
            onClick={() => setMode("signin")}
            className={`pb-2 px-1 ${
              mode === "signin"
                ? "border-b-2 border-deama-red text-deama-text"
                : "text-deama-muted"
            }`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`pb-2 px-1 ${
              mode === "signup"
                ? "border-b-2 border-deama-red text-deama-text"
                : "text-deama-muted"
            }`}
          >
            Create account
          </button>
        </div>

        <form onSubmit={submit} className="space-y-3">
          {mode === "signin" ? (
            <input
              type="text"
              required
              maxLength={64}
              autoFocus
              autoComplete="username"
              placeholder="Username or email"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full bg-deama-black border border-deama-border focus:border-deama-red rounded px-3 py-2 text-sm focus:outline-none"
            />
          ) : (
            <>
              <input
                type="text"
                required
                minLength={3}
                maxLength={20}
                autoFocus
                autoComplete="username"
                pattern="[a-zA-Z0-9_]+"
                placeholder="Username (3-20, letters/numbers/_)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-deama-black border border-deama-border focus:border-deama-red rounded px-3 py-2 text-sm focus:outline-none"
              />
              <input
                type="email"
                maxLength={254}
                autoComplete="email"
                placeholder="Email (optional)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-deama-black border border-deama-border focus:border-deama-red rounded px-3 py-2 text-sm focus:outline-none"
              />
              {/* honeypot */}
              <input
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={hp}
                onChange={(e) => setHp(e.target.value)}
                aria-hidden
                style={{
                  position: "absolute",
                  left: "-9999px",
                  width: 1,
                  height: 1,
                  opacity: 0,
                }}
              />
            </>
          )}
          <input
            type="password"
            required
            minLength={mode === "signin" ? 1 : 6}
            maxLength={128}
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            placeholder={
              mode === "signin" ? "Password" : "Password (min 6 chars)"
            }
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-deama-black border border-deama-border focus:border-deama-red rounded px-3 py-2 text-sm focus:outline-none"
          />

          {error && (
            <p className="text-sm text-deama-red border border-deama-red/40 bg-deama-red/10 rounded px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-deama-red hover:bg-deama-red-hover disabled:opacity-60 text-white font-semibold uppercase tracking-wider px-4 py-2 rounded transition-colors text-sm"
          >
            {loading
              ? "Working..."
              : mode === "signin"
              ? "Sign in"
              : "Create account"}
          </button>
        </form>

        <p className="text-[11px] text-deama-muted mt-4 text-center">
          By signing up you agree to our{" "}
          <a href="/terms" className="underline">
            Terms
          </a>{" "}
          and{" "}
          <a href="/privacy" className="underline">
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </div>
  );
}
