import { Minus, Plus } from "lucide-react";

export default function QuantitySelector({ value, onChange, min = 1, max = 99, size = "md" }) {
  const dec = () => onChange(Math.max(min, value - 1));
  const inc = () => onChange(Math.min(max, value + 1));
  const dims = size === "sm" ? "h-8 w-8" : "h-9 w-9";

  return (
    <div className="inline-flex items-center rounded-full border border-slate-200">
      <button
        type="button"
        onClick={dec}
        disabled={value <= min}
        className={`${dims} flex items-center justify-center rounded-full text-ink-700 transition hover:bg-brand-50 disabled:opacity-30`}
        aria-label="Decrease quantity"
      >
        <Minus size={14} />
      </button>
      <span className="w-8 text-center text-sm font-medium tabular-nums">{value}</span>
      <button
        type="button"
        onClick={inc}
        disabled={value >= max}
        className={`${dims} flex items-center justify-center rounded-full text-ink-700 transition hover:bg-brand-50 disabled:opacity-30`}
        aria-label="Increase quantity"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}
