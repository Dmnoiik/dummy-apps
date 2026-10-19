import { Expense, Group, SplitMethod } from '../models';
import { computeShares } from '../lib/split';

function expense(
  id: string,
  description: string,
  amount: number,
  paidBy: string,
  date: string,
  category: string,
  members: string[],
  method: SplitMethod = 'equally',
  split: Record<string, number> = {},
): Expense {
  return { id, description, amount, paidBy, date, category, method, split, owed: computeShares(amount, method, members, split) };
}

export function createSeed(): Group[] {
  const trip = ['Ania', 'Bartek', 'Celina'];
  const flat = ['Ania', 'Bartek', 'Celina', 'Dawid'];
  return [
    {
      id: 'zakopane',
      name: 'Weekend in Zakopane',
      members: trip,
      expenses: [
        expense('z1', 'Cabin deposit', 240, 'Ania', '28.09.2026', 'Housing', trip),
        expense('z2', 'Groceries', 210, 'Bartek', '05.10.2026', 'Food', trip),
        expense('z3', 'Cable car tickets', 180, 'Celina', '12.10.2026', 'Fun', trip, 'shares', {
          Ania: 3,
          Bartek: 2,
          Celina: 1,
        }),
      ],
    },
    {
      id: 'flat-4b',
      name: 'Flat 4B',
      members: flat,
      expenses: [
        expense('f1', 'Internet - September', 70, 'Bartek', '30.09.2026', 'Housing', flat),
        expense('f2', 'Groceries', 110, 'Ania', '03.10.2026', 'Food', flat),
        expense('f3', 'Cleaning supplies', 20, 'Dawid', '10.10.2026', 'Other', flat),
      ],
    },
  ];
}
