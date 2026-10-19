import { SplitMethod } from '../models';
import { round2 } from './money';

export function parseAmount(raw: string): number {
  return parseFloat(raw);
}

/** Splits `amount` proportionally to `weights`, distributing leftover cents to the largest remainders. */
function allocate(amount: number, members: string[], weights: Record<string, number>): Record<string, number> {
  const active = members.filter((m) => (weights[m] ?? 0) > 0);
  const total = active.reduce((sum, m) => sum + weights[m], 0);
  const cents = Math.round(amount * 100);
  const raw = active.map((m) => (cents * weights[m]) / total);
  const base = raw.map((r) => Math.floor(r));
  let left = cents - base.reduce((sum, b) => sum + b, 0);
  const order = raw.map((r, i) => i).sort((a, b) => raw[b] - base[b] - (raw[a] - base[a]));
  for (const i of order) {
    if (left <= 0) break;
    base[i] += 1;
    left -= 1;
  }
  const owed: Record<string, number> = {};
  active.forEach((m, i) => (owed[m] = base[i] / 100));
  return owed;
}

export function computeShares(
  amount: number,
  method: SplitMethod,
  members: string[],
  input: Record<string, number>,
): Record<string, number> {
  const owed: Record<string, number> = {};
  switch (method) {
    case 'equally': {
      const each = round2(amount / members.length);
      for (const m of members) owed[m] = each;
      return owed;
    }
    case 'exact':
      for (const m of members) {
        if (input[m]) owed[m] = round2(input[m]);
      }
      return owed;
    case 'percentages':
    case 'shares':
      return allocate(amount, members, input);
  }
}

/** Returns an error message, or null when the split input is consistent. */
export function validateSplit(
  amount: number,
  method: SplitMethod,
  members: string[],
  input: Record<string, number>,
): string | null {
  switch (method) {
    case 'equally':
      return members.length > 0 ? null : 'Select at least one person';
    case 'exact': {
      const total = members.reduce((sum, m) => sum + (input[m] ?? 0), 0);
      return Math.round(total * 100) === Math.round(amount * 100) ? null : 'Amounts must add up to the total';
    }
    case 'percentages': {
      const total = members.reduce((sum, m) => sum + (input[m] ?? 0), 0);
      return total === 100 ? null : 'Percentages must add up to 100%';
    }
    case 'shares':
      return members.some((m) => (input[m] ?? 0) > 0) ? null : 'Enter shares for at least one person';
  }
}
