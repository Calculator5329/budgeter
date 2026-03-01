import { makeAutoObservable } from 'mobx';
import { v4 as uuidv4 } from 'uuid';
import { TransactionCategory, RuleMatchType } from './types';
import type { ICategorizationRuleData } from './types';
import { Transaction } from './Transaction';

export class CategorizationRule {
  id: string;
  matchType: RuleMatchType;
  pattern: string;
  targetCategory: TransactionCategory;
  enabled: boolean;
  createdAt: Date;

  constructor(data: ICategorizationRuleData, id?: string, createdAt?: Date) {
    this.id = id || uuidv4();
    this.matchType = data.matchType;
    this.pattern = data.pattern;
    this.targetCategory = data.targetCategory;
    this.enabled = data.enabled;
    this.createdAt = createdAt || new Date();

    makeAutoObservable(this);
  }

  // Actions
  toggle(): void {
    this.enabled = !this.enabled;
  }

  setPattern(pattern: string): void {
    this.pattern = pattern;
  }

  setMatchType(matchType: RuleMatchType): void {
    this.matchType = matchType;
  }

  setTargetCategory(category: TransactionCategory): void {
    this.targetCategory = category;
  }

  // Check if this rule matches a transaction
  matches(transaction: Transaction): boolean {
    if (!this.enabled) {
      return false;
    }

    const description = transaction.description.toLowerCase();
    const pattern = this.pattern.toLowerCase();

    switch (this.matchType) {
      case RuleMatchType.CONTAINS:
        return description.includes(pattern);

      case RuleMatchType.STARTS_WITH:
        return description.startsWith(pattern);

      case RuleMatchType.ENDS_WITH:
        return description.endsWith(pattern);

      case RuleMatchType.EXACT_MATCH:
        return description === pattern;

      case RuleMatchType.REGEX:
        try {
          const regex = new RegExp(this.pattern, 'i');
          return regex.test(transaction.description);
        } catch (e) {
          // Invalid regex, don't match
          console.error(`Invalid regex pattern: ${this.pattern}`, e);
          return false;
        }

      default:
        return false;
    }
  }

  // Apply this rule to a transaction (if it matches)
  applyTo(transaction: Transaction): boolean {
    if (this.matches(transaction)) {
      transaction.setCategory(this.targetCategory);
      return true;
    }
    return false;
  }

  // Convert to plain object for serialization
  toJSON(): ICategorizationRuleData & { id: string; createdAt: Date } {
    return {
      id: this.id,
      matchType: this.matchType,
      pattern: this.pattern,
      targetCategory: this.targetCategory,
      enabled: this.enabled,
      createdAt: this.createdAt,
    };
  }

  // Create from plain object
  static fromJSON(
    json: ICategorizationRuleData & { id: string; createdAt: Date | string }
  ): CategorizationRule {
    return new CategorizationRule(
      {
        matchType: json.matchType,
        pattern: json.pattern,
        targetCategory: json.targetCategory,
        enabled: json.enabled,
      },
      json.id,
      json.createdAt instanceof Date ? json.createdAt : new Date(json.createdAt)
    );
  }
}

