"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy || !password) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        setPassword("");
        router.refresh();
        return;
      }
      const { error: code } = (await res.json().catch(() => ({}))) as { error?: string };
      setError(
        code === "rate_limited"
          ? "Too many attempts — wait a few minutes."
          : code === "not_configured"
            ? "ADMIN_PASSWORD isn't set on the server."
            : "Wrong password.",
      );
    } catch {
      setError("Couldn't reach the server.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="glass mx-auto mt-24 max-w-sm rounded-[var(--radius-card)] p-6">
      <div className="bg-accent/15 text-accent mb-4 grid h-10 w-10 place-items-center rounded-full">
        <Lock className="h-5 w-5" />
      </div>
      <h1 className="text-lg font-semibold tracking-tight">Admin</h1>
      <p className="text-muted mt-1 text-sm">Enter the password to view site analytics.</p>

      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoFocus
        aria-label="Admin password"
        className="text-text mt-5 w-full rounded-xl border border-border bg-transparent px-3 py-2.5 text-sm outline-none focus:border-accent/60"
      />
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-500">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={busy || !password}
        className="bg-accent text-accent-contrast mt-4 w-full rounded-xl py-2.5 text-sm font-medium transition-opacity disabled:opacity-40"
      >
        {busy ? "Checking…" : "Sign in"}
      </button>
    </form>
  );
}
