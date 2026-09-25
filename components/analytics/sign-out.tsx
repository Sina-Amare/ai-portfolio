"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useLocale } from "@/components/locale-provider";
import { pageCopy } from "@/lib/page-copy";

export function SignOut() {
  const { locale } = useLocale();
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={async () => {
        await fetch("/api/admin/login", { method: "DELETE" }).catch(() => {});
        router.refresh();
      }}
      className="text-muted hover:text-text border-border hover:border-accent/40 inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors"
    >
      <LogOut className="h-3.5 w-3.5" /> {pageCopy[locale].admin.signOut}
    </button>
  );
}
