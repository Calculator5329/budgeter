# MobX Transaction Models

This directory contains the MobX-based object models for transaction management, categorization, and rule-based automation.

## Architecture

### Core Models

1. **Transaction** (`Transaction.ts`)
   - Represents a single financial transaction
   - Observable properties: amount, category, hidden/pending status
   - Computed properties: formatted amount, expense/income flags
   - Actions: change category, toggle hidden/pending

2. **CategorizationRule** (`CategorizationRule.ts`)
   - Represents a rule for automatically categorizing transactions
   - Supports multiple match types: contains, starts_with, ends_with, exact_match, regex
   - Can be enabled/disabled
   - Applies to transactions based on description patterns

3. **TransactionStore** (`TransactionStore.ts`)
   - Central store managing all transactions and rules
   - Provides filtering, searching, and sorting capabilities
   - Handles bulk categorization operations
   - Computes summaries and totals
   - Singleton instance: `transactionStore`

4. **Types** (`types.ts`)
   - Enums: `TransactionCategory`, `RuleMatchType`
   - Interfaces: `ITransactionData`, `ICSVRow`, `ICategorizationRuleData`
   - Helper functions for category mapping

## Category Enum

All 35 transaction categories from your CSV:

- Auto & Transport
- Auto Payment  
- Auto Service
- Books
- Business
- Cash/ATM
- Clothing
- Concerts & Events
- Electronics & Software
- Entertainment
- Excluded
- Fast Food & Convenience
- Federal Tax
- Fees & Charges
- Food
- Gas & Fuel
- Groceries
- Gym
- Income
- Interest Income
- Medical
- Online Payment
- Parking
- Paycheck/Salary
- Personal Care
- Pharmacy
- Phone, Internet & Cable
- Restaurants/Dining
- Savings
- Shopping
- Sports & Hobbies
- State Tax
- Subscriptions
- Tax Refund
- Vision

## Basic Usage

### Loading Transactions

```typescript
import { transactionStore } from './models';

// Load from CSV text
const csvText = await fetch('/transactions.csv').then(r => r.text());
const count = transactionStore.loadFromCSV(csvText);
console.log(`Loaded ${count} transactions`);
```

### Working with Transactions

```typescript
// Get all transactions
const transactions = transactionStore.transactionsList;

// Get filtered/sorted transactions
const sorted = transactionStore.sortedTransactions;

// Update a transaction
const transaction = transactions[0];
transaction.setCategory(TransactionCategory.GROCERIES);
transaction.toggleHidden();

// Get formatted values
console.log(transaction.formattedAmount); // "$12.50" or "($12.50)"
console.log(transaction.isExpense); // true/false
```

### Filtering & Searching

```typescript
// Filter by category
transactionStore.setCategoryFilter(TransactionCategory.FAST_FOOD_AND_CONVENIENCE);

// Search by description/institution/account
transactionStore.setSearchQuery('MCDONALDS');

// Hide hidden/pending transactions
transactionStore.setShowHidden(false);
transactionStore.setShowPending(false);

// Clear filters
transactionStore.clearFilters();
```

### Bulk Categorization

```typescript
// Categorize all matching transactions
const count = transactionStore.categorizeMatching(
  'MCDONALDS',
  TransactionCategory.FAST_FOOD_AND_CONVENIENCE,
  RuleMatchType.CONTAINS
);

// Categorize by exact match
transactionStore.applyCategorizeAllMatching(
  'GOOGLE FI',
  TransactionCategory.PHONE_INTERNET_CABLE
);
```

### Categorization Rules

```typescript
// Add a rule
const rule = transactionStore.addRule(
  RuleMatchType.CONTAINS,
  'CHICKFILA',
  TransactionCategory.FAST_FOOD_AND_CONVENIENCE
);

// Apply all rules to all transactions
const appliedCount = transactionStore.applyRules();

// Toggle rule on/off
rule.toggle();

// Delete rule
transactionStore.deleteRule(rule.id);
```

### Getting Summaries

```typescript
// Category summary
const summary = transactionStore.categorySummary;
summary.forEach((data, category) => {
  console.log(`${category}: ${data.count} transactions, $${data.total}`);
});

// Totals
console.log(transactionStore.totalIncome);
console.log(transactionStore.totalExpenses);
console.log(transactionStore.netTotal);
```

## React Integration

Use with `mobx-react-lite`:

```typescript
import { observer } from 'mobx-react-lite';
import { transactionStore } from './models';

const TransactionList = observer(() => {
  const { sortedTransactions, totalIncome, totalExpenses } = transactionStore;
  
  return (
    <div>
      <h3>Income: ${totalIncome.toFixed(2)}</h3>
      <h3>Expenses: ${totalExpenses.toFixed(2)}</h3>
      
      {sortedTransactions.map(transaction => (
        <div key={transaction.id}>
          <span>{transaction.description}</span>
          <span>{transaction.formattedAmount}</span>
          <button onClick={() => transaction.setCategory(someCategory)}>
            Change Category
          </button>
        </div>
      ))}
    </div>
  );
});
```

## CSV Parser

The CSV parser (`src/utils/csvParser.ts`) handles:

- Amount parsing: `($7.64)` → `-7.64`, `$16.27` → `16.27`
- Date parsing: `11/10/2025` → `Date` object
- Boolean parsing: `Yes`/`No` → `true`/`false`
- Quoted field handling

## Future: Firestore Integration

The models are designed to be Firestore-ready:

- All models have `toJSON()` and `fromJSON()` methods
- Transaction IDs use UUIDs for distributed systems
- Store structure supports easy sync with Firestore collections

```typescript
// Example Firestore sync (to be implemented)
const transaction = transactionStore.getTransaction(id);
await setDoc(doc(db, 'transactions', id), transaction.toJSON());
```

## Dependencies

- `mobx` - State management
- `uuid` - Transaction ID generation

## File Structure

```
src/
├── models/
│   ├── Transaction.ts           # Transaction model
│   ├── TransactionStore.ts      # Central store
│   ├── CategorizationRule.ts    # Rule model
│   ├── types.ts                 # Enums and interfaces
│   ├── index.ts                 # Exports
│   └── README.md                # This file
└── utils/
    ├── csvParser.ts             # CSV parsing
    └── index.ts                 # Exports
```

