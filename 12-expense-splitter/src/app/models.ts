export type SplitMethod = 'equally' | 'exact' | 'percentages' | 'shares';

export const SPLIT_METHODS: { value: SplitMethod; label: string }[] = [
  { value: 'equally', label: 'Equally' },
  { value: 'exact', label: 'Exact amounts' },
  { value: 'percentages', label: 'Percentages' },
  { value: 'shares', label: 'Shares' },
];

export const CATEGORIES = ['Food', 'Housing', 'Transport', 'Fun', 'Other'];

export interface Expense {
  id: string;
  description: string;
  amount: number;
  paidBy: string;
  /** Display format, DD.MM.YYYY */
  date: string;
  category: string;
  method: SplitMethod;
  /** Raw per-person input used for the split (amounts, percentages or shares). */
  split: Record<string, number>;
  /** Amount in PLN each participant owes. */
  owed: Record<string, number>;
}

export type ExpenseDraft = Omit<Expense, 'id'>;

export interface Group {
  id: string;
  name: string;
  members: string[];
  expenses: Expense[];
}

export type StoreEvent =
  | { type: 'expense-added'; groupId: string }
  | { type: 'expense-updated'; groupId: string };
