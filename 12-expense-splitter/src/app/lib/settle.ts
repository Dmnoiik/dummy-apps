export interface Transfer {
  from: string;
  to: string;
  amount: number;
}

interface Position {
  name: string;
  cents: number;
}

/** Suggests transfers that clear the balances, preferring a single creditor per debtor. */
export function settleUp(balances: Record<string, number>): Transfer[] {
  const creditors: Position[] = [];
  const debtors: Position[] = [];
  for (const [name, value] of Object.entries(balances)) {
    const cents = Math.round(value * 100);
    if (cents > 0) creditors.push({ name, cents });
    if (cents < 0) debtors.push({ name, cents: -cents });
  }
  debtors.sort((a, b) => b.cents - a.cents);

  const transfers: Transfer[] = [];
  for (const debtor of debtors) {
    creditors.sort((a, b) => b.cents - a.cents);
    const creditor = creditors.find((c) => c.cents >= debtor.cents) ?? creditors[0];
    if (!creditor || creditor.cents <= 0) break;
    const cents = Math.min(debtor.cents, creditor.cents);
    transfers.push({ from: debtor.name, to: creditor.name, amount: cents / 100 });
    creditor.cents -= cents;
  }
  return transfers;
}
