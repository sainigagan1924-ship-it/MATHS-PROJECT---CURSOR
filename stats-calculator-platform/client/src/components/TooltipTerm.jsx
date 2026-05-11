export function TooltipTerm({ label, tip, children }) {
  return (
    <span className="group relative inline-flex cursor-help items-center gap-1 border-b border-dotted border-slate-400 dark:border-slate-500">
      {children ?? label}
      <span
        className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 w-56 -translate-x-1/2 rounded-lg bg-slate-900 px-2 py-1.5 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:pointer-events-auto group-hover:opacity-100 dark:bg-slate-100 dark:text-slate-900"
        role="tooltip"
      >
        {tip}
      </span>
    </span>
  );
}
