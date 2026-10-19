import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, map } from 'rxjs';
import { createSeed } from '../data/seed';
import { Expense, ExpenseDraft, Group, StoreEvent } from '../models';

const STORAGE_KEY = 'halves:v1';

@Injectable({ providedIn: 'root' })
export class GroupStoreService {
  private readonly groupsSubject = new BehaviorSubject<Group[]>(this.load());
  private readonly eventsSubject = new Subject<StoreEvent>();

  readonly groups$ = this.groupsSubject.asObservable();
  readonly events$ = this.eventsSubject.asObservable();

  group$(id: string): Observable<Group | undefined> {
    return this.groups$.pipe(map((groups) => groups.find((g) => g.id === id)));
  }

  createGroup(name: string, members: string[]): Group {
    const group: Group = { id: this.newId('g'), name, members, expenses: [] };
    this.groupsSubject.value.push(group);
    this.commit();
    return group;
  }

  addMember(groupId: string, name: string): string | null {
    const group = this.find(groupId);
    if (!group) return 'Group not found';
    if (!name) return 'Enter a name';
    if (group.members.some((m) => m.toLowerCase() === name.toLowerCase())) return 'That name is already in the group';
    group.members = [...group.members, name];
    this.commit();
    return null;
  }

  removeMember(groupId: string, name: string): string | null {
    const group = this.find(groupId);
    if (!group) return 'Group not found';
    // A member who is still owed money for expenses they paid cannot leave yet.
    const owedToThem = group.expenses
      .filter((e) => e.paidBy === name)
      .reduce((sum, e) => sum + e.amount - (e.owed[name] ?? 0), 0);
    if (owedToThem > 0) return 'Cannot remove a member with an outstanding balance';
    group.members = group.members.filter((m) => m !== name);
    this.commit();
    return null;
  }

  addExpense(groupId: string, draft: ExpenseDraft): void {
    const group = this.find(groupId);
    if (!group) return;
    group.expenses = [...group.expenses, { ...draft, id: this.newId('e') }];
    this.commit();
    this.eventsSubject.next({ type: 'expense-added', groupId });
  }

  updateExpense(groupId: string, expenseId: string, changes: ExpenseDraft): void {
    const expense = this.find(groupId)?.expenses.find((e) => e.id === expenseId);
    if (!expense) return;
    Object.assign(expense, changes);
    this.commit();
    this.eventsSubject.next({ type: 'expense-updated', groupId });
  }

  deleteExpense(groupId: string, expenseId: string): void {
    const group = this.find(groupId);
    if (!group) return;
    group.expenses = group.expenses.filter((e: Expense) => e.id !== expenseId);
    this.commit();
  }

  reset(): void {
    this.groupsSubject.next(createSeed());
    this.save();
  }

  private find(groupId: string): Group | undefined {
    return this.groupsSubject.value.find((g) => g.id === groupId);
  }

  private commit(): void {
    this.save();
    this.groupsSubject.next(this.groupsSubject.value);
  }

  private save(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.groupsSubject.value));
  }

  private load(): Group[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as Group[];
    } catch {
      // Fall through to the seed data when storage is unavailable or corrupted.
    }
    return createSeed();
  }

  private newId(prefix: string): string {
    return `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  }
}
