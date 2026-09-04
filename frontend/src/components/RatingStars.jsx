import { Star } from "lucide-react";

export default function RatingStars({ rating = 0, size = 14, showCount, count = 0 }) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((n) => (
          <Star
            key={n}
            size={size}
            className={n <= Math.round(rating) ? "fill-brand-500 text-brand-500" : "text-slate-200"}
          />
        ))}
      </div>
      {showCount && (
        <span className="text-xs text-ink-500">
          {rating > 0 ? rating.toFixed(1) : "New"}
          {count > 0 ? ` (${count})` : ""}
        </span>
      )}
    </div>
  );
}
