// All dates are shown and entered in the club's local time, regardless of where
// the server runs (Vercel runs in UTC).
export const SITE_TIME_ZONE = "America/Toronto";

export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function fmt(date: Date, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: SITE_TIME_ZONE,
    ...options,
  }).format(date);
}

/** "Thu, October 15, 2026 · 6:00 PM" */
export function formatEventDate(date: Date) {
  return `${fmt(date, {
    weekday: "short",
    month: "long",
    day: "numeric",
    year: "numeric",
  })} · ${formatTime(date)}`;
}

/** "6:00 PM", or "6:00 – 8:30 PM" when an end time is given. */
export function formatTime(date: Date, end?: Date | null) {
  const start = fmt(date, { hour: "numeric", minute: "2-digit" });
  if (!end) return start;
  return `${start} – ${fmt(end, { hour: "numeric", minute: "2-digit" })}`;
}

/** "Thursday, October 15, 2026" */
export function formatLongDate(date: Date) {
  return fmt(date, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/** "Oct 15, 2026" */
export function formatShortDate(date: Date) {
  return fmt(date, { month: "short", day: "numeric", year: "numeric" });
}

/** Pieces for a calendar-style date block. */
export function dateBlock(date: Date) {
  return {
    month: fmt(date, { month: "short" }),
    day: fmt(date, { day: "numeric" }),
    weekday: fmt(date, { weekday: "short" }),
  };
}

type ZonedParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
};

export function zonedParts(date: Date): ZonedParts {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: SITE_TIME_ZONE,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type: string) =>
    Number(parts.find((p) => p.type === type)?.value ?? 0);
  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour"),
    minute: get("minute"),
  };
}

/** Today's month (1-12) and day in the club's time zone. */
export function today() {
  const { month, day, year } = zonedParts(new Date());
  return { month, day, year };
}

/** Value for an <input type="datetime-local">, in club-local time. */
export function toDateTimeLocal(date: Date) {
  const p = zonedParts(date);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${p.year}-${pad(p.month)}-${pad(p.day)}T${pad(p.hour)}:${pad(p.minute)}`;
}

/** Parse an <input type="datetime-local"> value as club-local time. */
export function fromDateTimeLocal(value: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(value);
  if (!m) return null;
  const [y, mo, d, h, mi] = m.slice(1).map(Number);
  const wallAsUtc = Date.UTC(y, mo - 1, d, h, mi);
  // Offset between UTC and the zone at a given instant, in ms.
  const offsetAt = (t: number) => {
    const p = zonedParts(new Date(t));
    return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute) - t;
  };
  let result = wallAsUtc - offsetAt(wallAsUtc);
  // Re-check once in case the guess landed across a DST boundary.
  const corrected = wallAsUtc - offsetAt(result);
  if (corrected !== result) result = corrected;
  return new Date(result);
}

/** "1867", "44 BCE" */
export function formatYear(year: number) {
  return year < 0 ? `${-year} BCE` : String(year);
}

/** "July 1, 1867", "March 44 BCE", "October 7", "1215", ... */
export function formatHistoricalDate({
  year,
  month,
  day,
}: {
  year: number | null;
  month: number | null;
  day: number | null;
}) {
  const monthName = month ? MONTH_NAMES[month - 1] : null;
  const yearText = year != null ? formatYear(year) : null;
  if (monthName && day) {
    return yearText
      ? `${monthName} ${day}, ${yearText}`
      : `${monthName} ${day}`;
  }
  return [monthName, yearText].filter(Boolean).join(" ");
}

/** "19th century", "1st century BCE" */
export function centuryLabel(year: number) {
  const bce = year < 0;
  const n = Math.floor((Math.abs(year) - (bce ? 1 : 0)) / 100) + 1;
  const suffix =
    n % 100 >= 11 && n % 100 <= 13
      ? "th"
      : (({ 1: "st", 2: "nd", 3: "rd" } as Record<number, string>)[n % 10] ??
        "th");
  return `${n}${suffix} century${bce ? " BCE" : ""}`;
}
