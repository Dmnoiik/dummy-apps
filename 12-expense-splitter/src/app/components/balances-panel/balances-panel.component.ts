import { ChangeDetectionStrategy, Component, Input, Pipe, PipeTransform } from '@angular/core';
import { Expense } from '../../models';
import { computeBalances } from '../../lib/balances';
import { formatSigned } from '../../lib/money';

@Pipe({ name: 'balancesOf', standalone: true })
export class BalancesOfPipe implements PipeTransform {
  transform(expenses: Expense[], members: string[]): Record<string, number> {
    return computeBalances(expenses, members);
  }
}

@Component({
  selector: 'app-balances-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './balances-panel.component.html',
  styleUrl: './balances-panel.component.css',
})
export class BalancesPanelComponent {
  @Input({ required: true }) balances!: Record<string, number>;

  get rows(): { name: string; amount: number }[] {
    return Object.entries(this.balances).map(([name, amount]) => ({ name, amount }));
  }

  format(amount: number): string {
    return formatSigned(amount);
  }
}
