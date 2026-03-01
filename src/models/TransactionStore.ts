import { makeAutoObservable } from 'mobx';
import { Transaction } from './Transaction';
import { CategorizationRule } from './CategorizationRule';
import { TransactionCategory, RuleMatchType } from './types';
import type { ITransactionData } from './types';
import { parseCSV } from '../utils/csvParser';

export class TransactionStore {
  transactions: Map<string, Transaction> = new Map();
  rules: Map<string, CategorizationRule> = new Map();

  // Filters
  categoryFilter: TransactionCategory | null = null;
  searchQuery: string = '';
  showHidden: boolean = true;
  showPending: boolean = true;

  constructor() {
    makeAutoObservable(this);
  }

  // ============ Transaction Management Actions ============

  addTransaction(data: ITransactionData, id?: string): Transaction {
    const transaction = new Transaction(data, id);
    this.transactions.set(transaction.id, transaction);
    return transaction;
  }

  updateTransaction(id: string, data: Partial<ITransactionData>): boolean {
    const transaction = this.transactions.get(id);
    if (!transaction) return false;

    if (data.category !== undefined) transaction.setCategory(data.category);
    if (data.isHidden !== undefined && data.isHidden !== transaction.isHidden) {
      transaction.toggleHidden();
    }
    if (data.isPending !== undefined && data.isPending !== transaction.isPending) {
      transaction.togglePending();
    }
    if (data.amount !== undefined) transaction.updateAmount(data.amount);
    if (data.description !== undefined) transaction.updateDescription(data.description);

    return true;
  }

  deleteTransaction(id: string): boolean {
    return this.transactions.delete(id);
  }

  getTransaction(id: string): Transaction | undefined {
    return this.transactions.get(id);
  }

  // ============ Rule Management Actions ============

  addRule(
    matchType: RuleMatchType,
    pattern: string,
    targetCategory: TransactionCategory,
    enabled = true
  ): CategorizationRule {
    const rule = new CategorizationRule({
      matchType,
      pattern,
      targetCategory,
      enabled,
    });
    this.rules.set(rule.id, rule);
    return rule;
  }

  deleteRule(id: string): boolean {
    return this.rules.delete(id);
  }

  getRule(id: string): CategorizationRule | undefined {
    return this.rules.get(id);
  }

  // ============ Bulk Categorization Actions ============

  /**
   * Categorize all transactions matching a pattern
   */
  categorizeMatching(
    pattern: string,
    category: TransactionCategory,
    matchType: RuleMatchType = RuleMatchType.CONTAINS
  ): number {
    let count = 0;

    // Create a temporary rule to use for matching
    const tempRule = new CategorizationRule({
      matchType,
      pattern,
      targetCategory: category,
      enabled: true,
    });

    this.transactions.forEach((transaction) => {
      if (tempRule.matches(transaction)) {
        transaction.setCategory(category);
        count++;
      }
    });

    return count;
  }

  /**
   * Find all transactions with exact description match and categorize them
   */
  applyCategorizeAllMatching(description: string, category: TransactionCategory): number {
    return this.categorizeMatching(description, category, RuleMatchType.EXACT_MATCH);
  }

  /**
   * Apply all enabled rules to all transactions
   */
  applyRules(): number {
    let count = 0;

    this.transactions.forEach((transaction) => {
      this.rules.forEach((rule) => {
        if (rule.applyTo(transaction)) {
          count++;
        }
      });
    });

    return count;
  }

  /**
   * Apply all enabled rules to a specific transaction
   */
  applyRulesToTransaction(transactionId: string): boolean {
    const transaction = this.transactions.get(transactionId);
    if (!transaction) return false;

    let applied = false;
    this.rules.forEach((rule) => {
      if (rule.applyTo(transaction)) {
        applied = true;
      }
    });

    return applied;
  }

  // ============ CSV Management ============

  /**
   * Load transactions from CSV text
   */
  loadFromCSV(csvText: string): number {
    try {
      const transactionsData = parseCSV(csvText);
      let count = 0;

      transactionsData.forEach((data) => {
        this.addTransaction(data);
        count++;
      });

      return count;
    } catch (error) {
      console.error('Error loading CSV:', error);
      throw error;
    }
  }

  /**
   * Clear all transactions
   */
  clearTransactions(): void {
    this.transactions.clear();
  }

  /**
   * Clear all rules
   */
  clearRules(): void {
    this.rules.clear();
  }

  /**
   * Clear everything
   */
  clearAll(): void {
    this.clearTransactions();
    this.clearRules();
  }

  // ============ Filter Actions ============

  setCategoryFilter(category: TransactionCategory | null): void {
    this.categoryFilter = category;
  }

  setSearchQuery(query: string): void {
    this.searchQuery = query;
  }

  setShowHidden(show: boolean): void {
    this.showHidden = show;
  }

  setShowPending(show: boolean): void {
    this.showPending = show;
  }

  clearFilters(): void {
    this.categoryFilter = null;
    this.searchQuery = '';
    this.showHidden = true;
    this.showPending = true;
  }

  // ============ Computed Values ============

  /**
   * Get transactions as array
   */
  get transactionsList(): Transaction[] {
    return Array.from(this.transactions.values());
  }

  /**
   * Get rules as array
   */
  get rulesList(): CategorizationRule[] {
    return Array.from(this.rules.values());
  }

  /**
   * Get filtered transactions based on current filters
   */
  get filteredTransactions(): Transaction[] {
    return this.transactionsList.filter((transaction) => {
      // Category filter
      if (this.categoryFilter && transaction.category !== this.categoryFilter) {
        return false;
      }

      // Hidden filter
      if (!this.showHidden && transaction.isHidden) {
        return false;
      }

      // Pending filter
      if (!this.showPending && transaction.isPending) {
        return false;
      }

      // Search query
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        return (
          transaction.description.toLowerCase().includes(query) ||
          transaction.institution.toLowerCase().includes(query) ||
          transaction.account.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }

  /**
   * Get transactions sorted by date (newest first)
   */
  get sortedTransactions(): Transaction[] {
    return [...this.filteredTransactions].sort((a, b) => {
      return b.date.getTime() - a.date.getTime();
    });
  }

  /**
   * Get category summary (total amount per category)
   */
  get categorySummary(): Map<TransactionCategory, { count: number; total: number }> {
    const summary = new Map<TransactionCategory, { count: number; total: number }>();

    this.filteredTransactions.forEach((transaction) => {
      const existing = summary.get(transaction.category) || { count: 0, total: 0 };
      summary.set(transaction.category, {
        count: existing.count + 1,
        total: existing.total + transaction.amount,
      });
    });

    return summary;
  }

  /**
   * Get total income
   */
  get totalIncome(): number {
    return this.filteredTransactions
      .filter((t) => t.isIncome)
      .reduce((sum, t) => sum + t.amount, 0);
  }

  /**
   * Get total expenses (as positive number)
   */
  get totalExpenses(): number {
    return Math.abs(
      this.filteredTransactions
        .filter((t) => t.isExpense)
        .reduce((sum, t) => sum + t.amount, 0)
    );
  }

  /**
   * Get net total (income - expenses)
   */
  get netTotal(): number {
    return this.filteredTransactions.reduce((sum, t) => sum + t.amount, 0);
  }

  /**
   * Get count of transactions
   */
  get transactionCount(): number {
    return this.filteredTransactions.length;
  }

  /**
   * Get enabled rules
   */
  get enabledRules(): CategorizationRule[] {
    return this.rulesList.filter((rule) => rule.enabled);
  }

  /**
   * Get unique institutions
   */
  get institutions(): string[] {
    const institutionsSet = new Set<string>();
    this.transactionsList.forEach((t) => institutionsSet.add(t.institution));
    return Array.from(institutionsSet).sort();
  }

  /**
   * Get unique accounts
   */
  get accounts(): string[] {
    const accountsSet = new Set<string>();
    this.transactionsList.forEach((t) => accountsSet.add(t.account));
    return Array.from(accountsSet).sort();
  }
}

// Create singleton instance
export const transactionStore = new TransactionStore();

