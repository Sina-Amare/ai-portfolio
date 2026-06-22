"use client";

import { useState } from "react";
import { ArrowRight, Check, Loader2, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocale } from "@/components/locale-provider";

type Status = "idle" | "submitting" | "success" | "error";

const EMPTY = { name: "", email: "", contact: "", message: "", company: "" };

const fieldCls =
  "w-full rounded-xl border border-border bg-surface/60 px-4 py-3 text-[15px] text-text placeholder:text-muted outline-none transition-colors focus:border-accent/60 focus:bg-surface focus:ring-2 focus:ring-accent-soft";

export function ContactForm() {
  const { t } = useLocale();
  const f = t.contact.form;
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  const set =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "submitting") return;
    // Client-side guard so empty/invalid input fails instantly, not after a round-trip.
    const name = form.name.trim();
    const email = form.email.trim();
    const message = form.message.trim();
    if (!name || !email || !message) {
      setError(f.errRequired);
      setStatus("error");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(f.errEmail);
      setStatus("error");
      return;
    }
    setStatus("submitting");
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setForm(EMPTY);
        setStatus("success");
      } else {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? f.errGeneric);
        setStatus("error");
      }
    } catch {
      setError(f.errNetwork);
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div
        role="status"
        className="glass flex flex-col items-center justify-center rounded-2xl px-6 py-12 text-center"
      >
        <span className="bg-accent-soft text-accent-text mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full">
          <Check className="h-6 w-6" />
        </span>
        <p className="text-text text-lg font-semibold">{f.sent}</p>
        <p className="text-muted mt-1.5 max-w-xs text-sm leading-relaxed">{f.sentNote}</p>
        <span className="text-muted/80 mt-3 font-mono text-[11px] tracking-wide">
          200 · {f.delivered}
        </span>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="text-muted hover:text-text mt-5 inline-flex items-center gap-1.5 text-sm transition-colors"
        >
          <RotateCcw className="h-3.5 w-3.5" /> {f.another}
        </button>
      </div>
    );
  }

  const submitting = status === "submitting";

  return (
    <form onSubmit={onSubmit} noValidate className="glass rounded-2xl p-5 sm:p-6">
      {/* Progress bar — only while the request is in flight */}
      <div
        aria-hidden
        className={cn(
          "mb-5 h-0.5 overflow-hidden rounded-full",
          submitting ? "bg-border" : "bg-transparent",
        )}
      >
        {submitting && <div className="progress-sweep bg-accent h-full w-1/3 rounded-full" />}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-muted mb-1.5 block text-xs font-medium">{f.name}</span>
          <input
            type="text"
            required
            maxLength={100}
            value={form.name}
            onChange={set("name")}
            disabled={submitting}
            placeholder={f.namePh}
            autoComplete="name"
            className={fieldCls}
          />
        </label>
        <label className="block">
          <span className="text-muted mb-1.5 block text-xs font-medium">{f.email}</span>
          <input
            type="email"
            required
            maxLength={160}
            value={form.email}
            onChange={set("email")}
            disabled={submitting}
            placeholder={f.emailPh}
            autoComplete="email"
            className={fieldCls}
          />
        </label>
      </div>

      <label className="mt-4 block">
        <span className="text-muted mb-1.5 block text-xs font-medium">
          {f.contact} <span className="opacity-60">{f.optional}</span>
        </span>
        <input
          type="text"
          maxLength={120}
          value={form.contact}
          onChange={set("contact")}
          disabled={submitting}
          placeholder={f.contactPh}
          className={fieldCls}
        />
      </label>

      <label className="mt-4 block">
        <span className="text-muted mb-1.5 block text-xs font-medium">{f.message}</span>
        <textarea
          required
          rows={4}
          maxLength={3000}
          value={form.message}
          onChange={set("message")}
          disabled={submitting}
          placeholder={f.messagePh}
          className={cn(fieldCls, "resize-none")}
        />
      </label>

      {/* Honeypot — visually hidden, ignored by humans */}
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        value={form.company}
        onChange={set("company")}
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
      />

      {status === "error" && (
        <p role="alert" className="mt-4 text-sm text-red-500">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="bg-accent text-accent-contrast hover:bg-accent-hover mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full text-[15px] font-medium shadow-[0_10px_28px_-14px_var(--accent-glow)] transition-all hover:-translate-y-px disabled:translate-y-0 disabled:opacity-70"
      >
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> {f.sending}
          </>
        ) : (
          <>
            {f.send} <ArrowRight className="h-4 w-4 rtl:-scale-x-100" />
          </>
        )}
      </button>
    </form>
  );
}
