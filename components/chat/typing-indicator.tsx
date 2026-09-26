// The label is real (sr-only) text: a role=status with only an aria-label is
// not announced as a live change by most screen readers.
export function TypingIndicator({ label }: { label?: string }) {
  return (
    <div className="flex items-center gap-1.5 px-1 py-1" role="status">
      <span className="sr-only">{label ?? "Thinking"}</span>
      <span className="typing-dot bg-accent inline-block h-1.5 w-1.5 rounded-full" />
      <span className="typing-dot bg-accent inline-block h-1.5 w-1.5 rounded-full" />
      <span className="typing-dot bg-accent inline-block h-1.5 w-1.5 rounded-full" />
    </div>
  );
}
