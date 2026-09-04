export default function PageLoader() {
  return (
    <div className="flex min-h-[60vh] w-full items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand-100 border-t-brand-600" />
        <p className="text-sm text-ink-500">Loading GADCO ZEN…</p>
      </div>
    </div>
  );
}
