"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function SignOut() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={async () => {
        await fetch("/api/admin/login", { method: "DELETE" }).catch(() => {});
        router.refresh();
      }}
      className="text-muted hover:text-text inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs transition-colors hover:border-accent/40"
    >
      <LogOut className="h-3.5 w-3.5" /> Sign out
    </button>
  );
}
