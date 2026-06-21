export function TypingIndicator({ label }: { label?: string }) {
  return (
    <div
      className="flex items-center gap-1.5 px-1 py-1"
      role="status"
      aria-label={label ?? "Thinking"}
    >
      <span className="typing-dot bg-accent inline-block h-1.5 w-1.5 rounded-full" />
      <span className="typing-dot bg-accent inline-block h-1.5 w-1.5 rounded-full" />
      <span className="typing-dot bg-accent inline-block h-1.5 w-1.5 rounded-full" />
    </div>
  );
}
