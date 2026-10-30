/**
 * Date and time formatting utilities enforcing Indian Standard Time (IST, UTC+5:30).
 */

const IST_TIMEZONE = 'Asia/Kolkata';

/**
 * Formats a date or ISO string into IST date & time: "27 Oct 2026, 04:30 PM IST"
 */
export function formatDateTimeIST(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return '-';
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return '-';

  const formatted = new Intl.DateTimeFormat('en-IN', {
    timeZone: IST_TIMEZONE,
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);

  return `${formatted} IST`;
}

/**
 * Formats a date or ISO string into IST date & time with seconds: "27 Oct 2026, 04:30:15 PM IST"
 */
export function formatDateTimeISTWithSeconds(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return '-';
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return '-';

  const formatted = new Intl.DateTimeFormat('en-IN', {
    timeZone: IST_TIMEZONE,
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }).format(date);

  return `${formatted} IST`;
}

/**
 * Formats a date or ISO string into IST date only: "27 Oct 2026"
 */
export function formatDateIST(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return '-';
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return '-';

  return new Intl.DateTimeFormat('en-IN', {
    timeZone: IST_TIMEZONE,
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

/**
 * Formats a date or ISO string into IST time only: "04:30 PM IST"
 */
export function formatTimeIST(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return '-';
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return '-';

  const formatted = new Intl.DateTimeFormat('en-IN', {
    timeZone: IST_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);

  return `${formatted} IST`;
}

/**
 * Checks whether the given date is in the past compared to the current time.
 */
export function isDatePast(dateInput: string | Date | null | undefined): boolean {
  if (!dateInput) return false;
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return false;
  return date.getTime() < Date.now();
}

/**
 * Formats a date or ISO string into an IST "YYYY-MM-DD" string suitable for HTML <input type="date">.
 */
export function toISTDateInputValue(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return '';
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('en-CA', {
    timeZone: IST_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

/**
 * Formats a date or ISO string into "DD-MM-YYYY" format.
 */
export function formatDateDMY(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return '-';
  if (typeof dateInput === 'string') {
    const trimmed = dateInput.trim();
    // YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      const [y, m, d] = trimmed.split('-');
      return `${d}-${m}-${y}`;
    }
    // Already DD-MM-YYYY
    if (/^\d{2}-\d{2}-\d{4}$/.test(trimmed)) {
      return trimmed;
    }
  }

  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return '-';

  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: IST_TIMEZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).formatToParts(date);

  const day = parts.find((p) => p.type === 'day')?.value ?? '01';
  const month = parts.find((p) => p.type === 'month')?.value ?? '01';
  const year = parts.find((p) => p.type === 'year')?.value ?? '1970';
  return `${day}-${month}-${year}`;
}
