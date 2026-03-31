"use client";

import { cn } from "@/lib/utils";

interface SelectionGroupProps {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  columns?: string;
}

export default function SelectionGroup({
  label,
  options,
  value,
  onChange,
  columns = "grid-cols-2 sm:grid-cols-3",
}: SelectionGroupProps) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-black">{label}</label>
      <div className={cn("grid gap-3", columns)}>
        {options.map((option) => {
          const selected = option === value;

          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              className={cn(
                "rounded-xl border px-4 py-4 text-sm font-semibold transition",
                selected
                  ? "border-black bg-black text-white"
                  : "border-gray-300 bg-white text-black hover:border-black",
              )}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}
