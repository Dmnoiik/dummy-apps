import { Component, DestroyRef, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { CATEGORIES, Expense, ExpenseDraft, SPLIT_METHODS, SplitMethod } from '../../models';
import { displayToIso, isoToDisplay, todayIso } from '../../lib/dates';
import { computeShares, parseAmount, validateSplit } from '../../lib/split';

function amountValidator(control: AbstractControl<string>): ValidationErrors | null {
  const value = control.value;
  if (!value) return null;
  return Number.isNaN(parseAmount(value)) ? { amount: true } : null;
}

@Component({
  selector: 'app-expense-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './expense-form.component.html',
  styleUrl: './expense-form.component.css',
})
export class ExpenseFormComponent implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  @Input({ required: true }) members!: string[];
  @Input() expense: Expense | null = null;
  @Output() saved = new EventEmitter<ExpenseDraft>();
  @Output() cancelled = new EventEmitter<void>();

  @ViewChild('description', { static: true }) descriptionField!: ElementRef<HTMLInputElement>;

  readonly methods = SPLIT_METHODS;
  readonly categories = CATEGORIES;

  form = this.fb.group({
    description: ['', [Validators.required]],
    amount: ['', [Validators.required, amountValidator]],
    paidBy: ['', [Validators.required]],
    date: [todayIso(), [Validators.required]],
    category: [CATEGORIES[0]],
    method: ['equally' as SplitMethod],
  });
  included = new FormGroup<Record<string, FormControl<boolean>>>({});
  values = new FormGroup<Record<string, FormControl<string>>>({});

  splitError: string | null = null;

  ngOnInit(): void {
    const e = this.expense;
    for (const m of this.members) {
      this.included.addControl(m, new FormControl(e ? m in e.owed : true, { nonNullable: true }));
      const preset = e && e.method !== 'equally' && e.split[m] !== undefined ? String(e.split[m]) : '';
      this.values.addControl(m, new FormControl(preset, { nonNullable: true }));
    }
    if (e) {
      this.form.patchValue({
        description: e.description,
        amount: String(e.amount),
        paidBy: e.paidBy,
        date: displayToIso(e.date),
        category: e.category,
        method: e.method,
      });
    } else {
      this.form.patchValue({ paidBy: this.members[0] ?? '' });
    }
    this.form.controls.method.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((method) => {
      this.splitError = null;
      for (const m of this.members) this.values.controls[m].setValue(method === 'shares' ? '1' : '');
    });
    this.descriptionField.nativeElement.focus();
  }

  get method(): SplitMethod {
    return this.form.controls.method.value;
  }

  get unitHint(): string {
    switch (this.method) {
      case 'exact':
        return 'Amount in PLN';
      case 'percentages':
        return 'Percent of the total';
      default:
        return 'Number of shares';
    }
  }

  @HostListener('document:keydown.escape')
  close(): void {
    this.cancelled.emit();
  }

  backdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.close();
  }

  save(): void {
    this.splitError = null;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const amount = parseAmount(v.amount);
    const equally = v.method === 'equally';
    const participants = equally ? this.members.filter((m) => this.included.controls[m].value) : this.members;
    const input: Record<string, number> = {};
    if (!equally) {
      for (const m of this.members) input[m] = parseAmount(this.values.controls[m].value) || 0;
    }
    this.splitError = validateSplit(amount, v.method, participants, input);
    if (this.splitError) return;
    this.saved.emit({
      description: v.description.trim(),
      amount,
      paidBy: v.paidBy,
      date: isoToDisplay(v.date),
      category: v.category,
      method: v.method,
      split: input,
      owed: computeShares(amount, v.method, participants, input),
    });
  }
}
