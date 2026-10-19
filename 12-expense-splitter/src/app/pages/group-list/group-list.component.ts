import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Group } from '../../models';
import { formatMoney } from '../../lib/money';
import { GroupStoreService } from '../../services/group-store.service';

@Component({
  selector: 'app-group-list',
  standalone: true,
  imports: [AsyncPipe, FormsModule, RouterLink],
  templateUrl: './group-list.component.html',
  styleUrl: './group-list.component.css',
})
export class GroupListComponent {
  private readonly store = inject(GroupStoreService);

  readonly groups$ = this.store.groups$;

  creating = false;
  groupName = '';
  memberName = '';
  newMembers: string[] = [];
  error = '';

  total(group: Group): string {
    return formatMoney(group.expenses.reduce((sum, e) => sum + e.amount, 0));
  }

  openDialog(): void {
    this.creating = true;
    this.groupName = '';
    this.memberName = '';
    this.newMembers = [];
    this.error = '';
  }

  closeDialog(): void {
    this.creating = false;
  }

  addPerson(): void {
    const name = this.memberName.trim();
    if (!name) return;
    if (this.newMembers.some((m) => m.toLowerCase() === name.toLowerCase())) {
      this.error = 'That name is already on the list';
      return;
    }
    this.newMembers = [...this.newMembers, name];
    this.memberName = '';
    this.error = '';
  }

  removePerson(name: string): void {
    this.newMembers = this.newMembers.filter((m) => m !== name);
  }

  create(): void {
    const name = this.groupName.trim();
    if (!name) {
      this.error = 'Enter a group name';
      return;
    }
    if (this.newMembers.length < 2) {
      this.error = 'Add at least two people';
      return;
    }
    this.store.createGroup(name, this.newMembers);
    this.creating = false;
  }
}
