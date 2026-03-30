const DEFAULT_LOCALE = "es-SV";
const DATE_ONLY_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const CALENDAR_DATE_REGEX = /^(\d{4})-(\d{2})-(\d{2})/;
const HAS_TIMEZONE_REGEX = /(Z|[+\-]\d{2}:\d{2})$/i;

function isValidDate(date: Date): boolean {
  return !Number.isNaN(date.getTime());
}

function formatDateValue(
  date: Date,
  options: Intl.DateTimeFormatOptions,
  fallback: string,
): string {
  if (!isValidDate(date)) {
    return fallback;
  }

  return date.toLocaleString(DEFAULT_LOCALE, options);
}

function parseUtcTimestamp(rawDate: string | Date | null | undefined): Date | null {
  if (!rawDate) {
    return null;
  }

  if (rawDate instanceof Date) {
    return isValidDate(rawDate) ? rawDate : null;
  }

  const trimmed = rawDate.trim();

  if (!trimmed) {
    return null;
  }

  const normalized = DATE_ONLY_REGEX.test(trimmed)
    ? `${trimmed}T00:00:00Z`
    : HAS_TIMEZONE_REGEX.test(trimmed)
      ? trimmed
      : `${trimmed}Z`;

  const date = new Date(normalized);
  return isValidDate(date) ? date : null;
}

export function formatDate(rawDate: string | Date | null | undefined): string {
  const date = parseUtcTimestamp(rawDate);

  if (!date) {
    return rawDate ? "Fecha invalida" : "Fecha no proporcionada";
  }

  return formatDateValue(
    date,
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
    "Fecha invalida",
  );
}

export function formatDateOnly(rawDate: string | Date | null | undefined): string {
  const date = parseUtcTimestamp(rawDate);

  if (!date) {
    return rawDate ? "Fecha invalida" : "Fecha no proporcionada";
  }

  return formatDateValue(
    date,
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    },
    "Fecha invalida",
  );
}

export function formatCalendarDate(rawDate: string | null | undefined): string {
  if (!rawDate) {
    return "Fecha no proporcionada";
  }

  const match = rawDate.trim().match(CALENDAR_DATE_REGEX);

  if (!match) {
    return "Fecha invalida";
  }

  const [, year, month, day] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day), 12);

  return formatDateValue(
    date,
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    },
    "Fecha invalida",
  );
}

export function toLocalInputDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
