"use client";

import { Trash2 } from "lucide-react";
import { buttonClass } from "./ui";

/** Submit button that asks for confirmation before a destructive action. */
export function DeleteButton({
  confirmText = "Delete this? This can't be undone.",
  label = "Delete",
  compact = false,
}: {
  confirmText?: string;
  label?: string;
  compact?: boolean;
}) {
  return (
    <button
      type="submit"
      className={
        compact
          ? "rounded p-1.5 text-ink/40 hover:bg-red-50 hover:text-red-700"
          : buttonClass.danger
      }
      title={label}
      aria-label={label}
      onClick={(e) => {
        if (!confirm(confirmText)) e.preventDefault();
      }}
    >
      <Trash2 className="size-4" />
      {!compact && label}
    </button>
  );
}
