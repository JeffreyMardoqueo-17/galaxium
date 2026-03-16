export function DashboardHeader() {
  return (
    <header className="relative overflow-hidden border-b border-gray-200/80 bg-white/70 backdrop-blur-xl">
      <div className="absolute inset-0">
        <div className="absolute -top-24 -right-16 h-56 w-56 rounded-full bg-emerald-200/50 blur-3xl" />
        <div className="absolute -bottom-28 -left-12 h-72 w-72 rounded-full bg-sky-200/60 blur-3xl" />
      </div>
      <div className="relative mx-auto max-w-6xl px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-700">
          Panel General
        </p>
      </div>
    </header>
  );
}

