import { AsyncPipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { BalancesOfPipe, BalancesPanelComponent } from '../../components/balances-panel/balances-panel.component';
import { ExpenseFormComponent } from '../../components/expense-form/expense-form.component';
import { SettleUpComponent } from '../../components/settle-up/settle-up.component';
import { sortByDateDesc } from '../../lib/dates';
import { formatMoney } from '../../lib/money';
import { Expense, ExpenseDraft, Group } from '../../models';
import { GroupStoreService } from '../../services/group-store.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-group-detail',
  standalone: true,
  imports: [AsyncPipe, FormsModule, BalancesOfPipe, BalancesPanelComponent, ExpenseFormComponent, SettleUpComponent],
  templateUrl: './group-detail.component.html',
  styleUrl: './group-detail.component.css',
})
export class GroupDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly store = inject(GroupStoreService);
  private readonly toasts = inject(ToastService);

  group$!: Observable<Group | undefined>;
  groupId = '';

  tab: 'expenses' | 'settle' = 'expenses';
  formOpen = false;
  editing: Expense | null = null;
  newMember = '';
  memberError = '';

  ngOnInit(): void {
    this.groupId = this.route.snapshot.paramMap.get('id') ?? '';
    this.group$ = this.store.group$(this.groupId);
    this.store.events$.subscribe((event) => {
      this.toasts.show(event.type === 'expense-added' ? 'Expense added' : 'Expense updated');
    });
  }

  sorted(group: Group): Expense[] {
    return sortByDateDesc(group.expenses);
  }

  format(amount: number): string {
    return formatMoney(amount);
  }

  owedEntries(expense: Expense): { name: string; amount: number }[] {
    return Object.entries(expense.owed).map(([name, amount]) => ({ name, amount }));
  }

  back(): void {
    void this.router.navigate(['/groups']);
  }

  openAdd(): void {
    this.editing = null;
    this.formOpen = true;
  }

  openEdit(expense: Expense): void {
    this.editing = expense;
    this.formOpen = true;
  }

  closeForm(): void {
    this.formOpen = false;
    this.editing = null;
  }

  onSaved(draft: ExpenseDraft): void {
    if (this.editing) {
      this.store.updateExpense(this.groupId, this.editing.id, draft);
    } else {
      this.store.addExpense(this.groupId, draft);
    }
    this.closeForm();
  }

  deleteExpense(expense: Expense): void {
    this.store.deleteExpense(this.groupId, expense.id);
    this.toasts.show('Expense deleted');
  }

  addMember(): void {
    const error = this.store.addMember(this.groupId, this.newMember.trim());
    this.memberError = error ?? '';
    if (!error) this.newMember = '';
  }

  removeMember(name: string): void {
    this.memberError = this.store.removeMember(this.groupId, name) ?? '';
  }
}
