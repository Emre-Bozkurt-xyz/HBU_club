"use client";

export function DeleteButton({
  confirmText = "Delete this? This can't be undone.",
}: {
  confirmText?: string;
}) {
  return (
    <button
      type="submit"
      className="text-red-600 hover:underline"
      onClick={(e) => {
        if (!confirm(confirmText)) e.preventDefault();
      }}
    >
      Delete
    </button>
  );
}
