"use client";
import { useState } from "react";
export default function Stars({
  value,
  onChange,
}: {
  value?: number;
  onChange?: (v: number) => void;
}) {
  const [hover, setHover] = useState<number | undefined>();
  const v = hover ?? value ?? 0;
  return (
    <div className="flex gap-4 justify-center">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(undefined)}
          onClick={() => onChange?.(n)}
          className="text-5xl"
          aria-label={`${n} stars`}
        >
          {v >= n ? "⭐" : "☆"}
        </button>
      ))}
    </div>
  );
}
