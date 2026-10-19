import { Component, Input } from '@angular/core';
import { Expense } from '../../models';
import { computeBalances } from '../../lib/balances';
import { formatMoney } from '../../lib/money';
import { Transfer, settleUp } from '../../lib/settle';

@Component({
  selector: 'app-settle-up',
  standalone: true,
  templateUrl: './settle-up.component.html',
  styleUrl: './settle-up.component.css',
})
export class SettleUpComponent {
  @Input({ required: true }) expenses!: Expense[];
  @Input({ required: true }) members!: string[];

  get transfers(): Transfer[] {
    return settleUp(computeBalances(this.expenses, this.members));
  }

  format(amount: number): string {
    return formatMoney(amount);
  }
}
