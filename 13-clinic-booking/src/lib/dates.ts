export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export const DAY_MS = 24 * 60 * 60 * 1000

export function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

/** Stable YYYY-MM-DD key for a calendar day. */
export function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10)
}

export function parseDayKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function addMonths(d: Date, n: number): Date {
  const next = new Date(d)
  next.setMonth(next.getMonth() + n)
  return next
}

export function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

/** Cancellation is only allowed when the visit is more than a day away. */
export function canCancel(appt: Date, now: Date): boolean {
  return appt.getDate() - now.getDate() >= 1
}

/** e.g. "Wed, 21 Oct 2026" */
export function formatDay(d: Date): string {
  return `${WEEKDAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)} ${d.getFullYear()}`
}

export function withTime(day: Date, time: string): Date {
  const [h, m] = time.split(':').map(Number)
  return new Date(day.getFullYear(), day.getMonth(), day.getDate(), h, m)
}
