import { Expense } from '../models';
import { round2 } from './money';

/** Net position per member: what they paid minus what they owe. */
export function computeBalances(expenses: Expense[], members: string[]): Record<string, number> {
  const net: Record<string, number> = {};
  for (const m of members) net[m] = 0;
  for (const e of expenses) {
    if (e.paidBy in net) net[e.paidBy] += e.amount;
    for (const [name, value] of Object.entries(e.owed)) {
      if (name in net) net[name] -= value;
    }
  }
  for (const m of members) net[m] = round2(net[m]);
  return net;
}
