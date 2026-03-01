import { makeAutoObservable } from 'mobx';
import { v4 as uuidv4 } from 'uuid';
import { TransactionCategory } from './types';
import type { ITransactionData } from './types';

export class Transaction {
  id: string;
  date: Date;
  description: string;
  institution: string;
  account: string;
  category: TransactionCategory;
  isHidden: boolean;
  isPending: boolean;
  amount: number;

  constructor(data: ITransactionData, id?: string) {
    this.id = id || uuidv4();
    this.date = data.date;
    this.description = data.description;
    this.institution = data.institution;
    this.account = data.account;
    this.category = data.category;
    this.isHidden = data.isHidden;
    this.isPending = data.isPending;
    this.amount = data.amount;

    makeAutoObservable(this);
  }

  // Actions
  setCategory(category: TransactionCategory): void {
    this.category = category;
  }

  toggleHidden(): void {
    this.isHidden = !this.isHidden;
  }

  togglePending(): void {
    this.isPending = !this.isPending;
  }

  updateAmount(amount: number): void {
    this.amount = amount;
  }

  updateDescription(description: string): void {
    this.description = description;
  }

  // Computed values
  get formattedAmount(): string {
    const absAmount = Math.abs(this.amount);
    const formatted = absAmount.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    return this.amount < 0 ? `(${formatted})` : formatted;
  }

  get isExpense(): boolean {
    return this.amount < 0;
  }

  get isIncome(): boolean {
    return this.amount > 0;
  }

  get formattedDate(): string {
    return this.date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    });
  }

  // Convert to plain object for serialization (e.g., Firestore)
  toJSON(): ITransactionData & { id: string } {
    return {
      id: this.id,
      date: this.date,
      description: this.description,
      institution: this.institution,
      account: this.account,
      category: this.category,
      isHidden: this.isHidden,
      isPending: this.isPending,
      amount: this.amount,
    };
  }

  // Create from plain object (e.g., from Firestore)
  static fromJSON(json: ITransactionData & { id: string }): Transaction {
    return new Transaction(
      {
        date: json.date instanceof Date ? json.date : new Date(json.date),
        description: json.description,
        institution: json.institution,
        account: json.account,
        category: json.category,
        isHidden: json.isHidden,
        isPending: json.isPending,
        amount: json.amount,
      },
      json.id
    );
  }
}

