/**
 * Example usage of the MobX Transaction Store
 * 
 * This file demonstrates how to use the transaction management system
 */

import { transactionStore } from './models/TransactionStore';
import { TransactionCategory, RuleMatchType } from './models/types';
import { parseCSV } from './utils/csvParser';

// ============ Loading Transactions from CSV ============

async function loadTransactionsExample() {
  // Option 1: Load from CSV text
  const csvText = `...`; // Your CSV content
  const count = transactionStore.loadFromCSV(csvText);
  console.log(`Loaded ${count} transactions`);

  // Option 2: Load from file in browser
  const fileInput = document.getElementById('csvFile') as HTMLInputElement;
  fileInput?.addEventListener('change', async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const csvText = event.target?.result as string;
        const count = transactionStore.loadFromCSV(csvText);
        console.log(`Loaded ${count} transactions`);
      };
      reader.readAsText(file);
    }
  });
}

// ============ Basic Transaction Management ============

function basicTransactionOperations() {
  // Get all transactions
  console.log('Total transactions:', transactionStore.transactionCount);

  // Get a specific transaction
  const transaction = transactionStore.transactionsList[0];
  console.log('First transaction:', transaction?.description);

  // Update a transaction's category
  if (transaction) {
    transaction.setCategory(TransactionCategory.GROCERIES);
    console.log('Updated category:', transaction.category);
  }

  // Toggle hidden/pending status
  transaction?.toggleHidden();
  transaction?.togglePending();

  // Get formatted values
  console.log('Formatted amount:', transaction?.formattedAmount);
  console.log('Is expense:', transaction?.isExpense);
}

// ============ Filtering and Searching ============

function filteringExample() {
  // Filter by category
  transactionStore.setCategoryFilter(TransactionCategory.FAST_FOOD_AND_CONVENIENCE);
  console.log('Fast food transactions:', transactionStore.filteredTransactions.length);

  // Search by description
  transactionStore.setSearchQuery('MCDONALDS');
  console.log('McDonald\'s transactions:', transactionStore.filteredTransactions.length);

  // Hide hidden/pending transactions
  transactionStore.setShowHidden(false);
  transactionStore.setShowPending(false);

  // Clear all filters
  transactionStore.clearFilters();

  // Get sorted transactions (newest first)
  const sorted = transactionStore.sortedTransactions;
  console.log('Newest transaction:', sorted[0]?.date);
}

// ============ Category Summary and Totals ============

function summaryExample() {
  // Get category summary
  const summary = transactionStore.categorySummary;
  summary.forEach((data, category) => {
    console.log(`${category}: ${data.count} transactions, total: $${data.total.toFixed(2)}`);
  });

  // Get totals
  console.log('Total income:', transactionStore.totalIncome);
  console.log('Total expenses:', transactionStore.totalExpenses);
  console.log('Net total:', transactionStore.netTotal);

  // Get unique institutions and accounts
  console.log('Institutions:', transactionStore.institutions);
  console.log('Accounts:', transactionStore.accounts);
}

// ============ Bulk Categorization ============

function bulkCategorizationExample() {
  // Categorize all transactions containing "MCDONALDS"
  const count1 = transactionStore.categorizeMatching(
    'MCDONALDS',
    TransactionCategory.FAST_FOOD_AND_CONVENIENCE,
    RuleMatchType.CONTAINS
  );
  console.log(`Categorized ${count1} McDonald's transactions`);

  // Categorize all transactions with exact description match
  const count2 = transactionStore.applyCategorizeAllMatching(
    'GOOGLE GOOGLE ONE CA',
    TransactionCategory.SUBSCRIPTIONS
  );
  console.log(`Categorized ${count2} Google One subscriptions`);

  // Use different match types
  transactionStore.categorizeMatching(
    'CHICKFILA',
    TransactionCategory.FAST_FOOD_AND_CONVENIENCE,
    RuleMatchType.CONTAINS
  );

  transactionStore.categorizeMatching(
    'TESLA',
    TransactionCategory.AUTO_SERVICE,
    RuleMatchType.STARTS_WITH
  );
}

// ============ Categorization Rules ============

function rulesExample() {
  // Add a rule to auto-categorize McDonald's transactions
  const rule1 = transactionStore.addRule(
    RuleMatchType.CONTAINS,
    'MCDONALDS',
    TransactionCategory.FAST_FOOD_AND_CONVENIENCE
  );

  // Add a rule for gas stations
  const rule2 = transactionStore.addRule(
    RuleMatchType.CONTAINS,
    'KWIK TRIP',
    TransactionCategory.GAS_AND_FUEL
  );

  // Add a regex rule
  const rule3 = transactionStore.addRule(
    RuleMatchType.REGEX,
    'GOOGLE (FI|CLOUD)',
    TransactionCategory.PHONE_INTERNET_CABLE
  );

  // Apply all rules to all transactions
  const appliedCount = transactionStore.applyRules();
  console.log(`Applied rules to ${appliedCount} transactions`);

  // Toggle a rule on/off
  rule1.toggle();

  // Delete a rule
  transactionStore.deleteRule(rule2.id);

  // Get all enabled rules
  console.log('Enabled rules:', transactionStore.enabledRules.length);
}

// ============ React Component Example (Observer) ============

/**
 * Example React component using MobX observer
 * 
 * import { observer } from 'mobx-react-lite';
 * 
 * const TransactionList = observer(() => {
 *   const { sortedTransactions, totalIncome, totalExpenses } = transactionStore;
 * 
 *   return (
 *     <div>
 *       <div>
 *         <h3>Summary</h3>
 *         <p>Income: ${totalIncome.toFixed(2)}</p>
 *         <p>Expenses: ${totalExpenses.toFixed(2)}</p>
 *       </div>
 * 
 *       <div>
 *         <input
 *           type="text"
 *           placeholder="Search..."
 *           onChange={(e) => transactionStore.setSearchQuery(e.target.value)}
 *         />
 *       </div>
 * 
 *       <ul>
 *         {sortedTransactions.map((transaction) => (
 *           <li key={transaction.id}>
 *             <span>{transaction.formattedDate}</span>
 *             <span>{transaction.description}</span>
 *             <span>{transaction.formattedAmount}</span>
 *             <select
 *               value={transaction.category}
 *               onChange={(e) => transaction.setCategory(e.target.value as TransactionCategory)}
 *             >
 *               {getAllCategories().map((cat) => (
 *                 <option key={cat} value={cat}>{cat}</option>
 *               ))}
 *             </select>
 *           </li>
 *         ))}
 *       </ul>
 *     </div>
 *   );
 * });
 */

// ============ Firestore Integration (Future) ============

/**
 * Example of how to sync with Firestore (to be implemented)
 * 
 * import { collection, doc, setDoc, getDocs } from 'firebase/firestore';
 * 
 * async function saveToFirestore() {
 *   const batch = [];
 *   transactionStore.transactionsList.forEach(transaction => {
 *     const ref = doc(db, 'transactions', transaction.id);
 *     batch.push(setDoc(ref, transaction.toJSON()));
 *   });
 *   await Promise.all(batch);
 * }
 * 
 * async function loadFromFirestore() {
 *   const snapshot = await getDocs(collection(db, 'transactions'));
 *   snapshot.forEach(doc => {
 *     const data = doc.data();
 *     transactionStore.addTransaction(data, doc.id);
 *   });
 * }
 */

export {
  loadTransactionsExample,
  basicTransactionOperations,
  filteringExample,
  summaryExample,
  bulkCategorizationExample,
  rulesExample,
};

