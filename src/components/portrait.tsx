function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0][0];
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

/** Headshot, or an initials monogram when there's no photo. */
export function Portrait({
  name,
  photoUrl,
  className = "",
  textClassName = "text-3xl",
}: {
  name: string;
  photoUrl: string | null;
  className?: string;
  textClassName?: string;
}) {
  if (photoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photoUrl}
        alt={name}
        loading="lazy"
        className={`object-cover ${className}`}
      />
    );
  }
  return (
    <div
      aria-label={name}
      role="img"
      className={`paper-grain flex items-center justify-center bg-paper-deep font-serif text-accent/70 ${className}`}
    >
      <span className={textClassName}>{initials(name)}</span>
    </div>
  );
}
