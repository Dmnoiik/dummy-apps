import { Expense } from '../models';

export function todayIso(): string {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}

/** 2026-10-05 -> 05.10.2026 */
export function isoToDisplay(iso: string): string {
  const [year, month, day] = iso.split('-');
  return `${day}.${month}.${year}`;
}

/** 05.10.2026 -> 2026-10-05 */
export function displayToIso(display: string): string {
  const [day, month, year] = display.split('.');
  return `${year}-${month}-${day}`;
}

/** Newest expenses first. */
export function sortByDateDesc(expenses: Expense[]): Expense[] {
  return [...expenses].sort((a, b) => b.date.localeCompare(a.date));
}
