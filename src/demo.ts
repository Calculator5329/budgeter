/**
 * Demo script to test loading the actual CSV file
 * 
 * Run this in the browser console or create a simple UI to test
 */

import { transactionStore } from './models';
import { TransactionCategory, RuleMatchType } from './models/types';

export async function loadDemoData() {
  try {
    // Load the CSV file
    const response = await fetch('/transactions_2025_11_13 (3).csv');
    const csvText = await response.text();
    
    // Load into store
    const count = transactionStore.loadFromCSV(csvText);
    console.log(`✅ Loaded ${count} transactions`);
    
    // Show some stats
    console.log(`📊 Summary:`);
    console.log(`  Total transactions: ${transactionStore.transactionCount}`);
    console.log(`  Total income: $${transactionStore.totalIncome.toFixed(2)}`);
    console.log(`  Total expenses: $${transactionStore.totalExpenses.toFixed(2)}`);
    console.log(`  Net total: $${transactionStore.netTotal.toFixed(2)}`);
    
    // Show category breakdown
    console.log(`\n📋 Category Breakdown:`);
    const summary = transactionStore.categorySummary;
    const sortedCategories = Array.from(summary.entries())
      .sort((a, b) => Math.abs(b[1].total) - Math.abs(a[1].total));
    
    sortedCategories.slice(0, 10).forEach(([category, data]) => {
      console.log(`  ${category}: ${data.count} transactions, $${data.total.toFixed(2)}`);
    });
    
    // Show some transactions
    console.log(`\n💰 Recent Transactions:`);
    transactionStore.sortedTransactions.slice(0, 5).forEach(t => {
      console.log(`  ${t.formattedDate} - ${t.description} - ${t.formattedAmount}`);
    });
    
    return transactionStore;
  } catch (error) {
    console.error('❌ Error loading demo data:', error);
    throw error;
  }
}

export function demoBulkCategorization() {
  console.log('\n🔄 Testing Bulk Categorization...');
  
  // Categorize all McDonald's transactions
  const mcdonalds = transactionStore.categorizeMatching(
    'MCDONALDS',
    TransactionCategory.FAST_FOOD_AND_CONVENIENCE,
    RuleMatchType.CONTAINS
  );
  console.log(`  Categorized ${mcdonalds} McDonald's transactions`);
  
  // Categorize all Chick-fil-A transactions
  const chickfila = transactionStore.categorizeMatching(
    'CHICKFILA',
    TransactionCategory.FAST_FOOD_AND_CONVENIENCE,
    RuleMatchType.CONTAINS
  );
  console.log(`  Categorized ${chickfila} Chick-fil-A transactions`);
  
  // Categorize Tesla charges
  const tesla = transactionStore.categorizeMatching(
    'TESLA',
    TransactionCategory.AUTO_SERVICE,
    RuleMatchType.CONTAINS
  );
  console.log(`  Categorized ${tesla} Tesla transactions`);
}

export function demoRules() {
  console.log('\n📜 Testing Categorization Rules...');
  
  // Clear any existing rules
  transactionStore.clearRules();
  
  // Add some rules
  transactionStore.addRule(
    RuleMatchType.CONTAINS,
    'MCDONALDS',
    TransactionCategory.FAST_FOOD_AND_CONVENIENCE
  );
  
  transactionStore.addRule(
    RuleMatchType.CONTAINS,
    'KWIK TRIP',
    TransactionCategory.GAS_AND_FUEL
  );
  
  transactionStore.addRule(
    RuleMatchType.CONTAINS,
    'GOOGLE FI',
    TransactionCategory.PHONE_INTERNET_CABLE
  );
  
  transactionStore.addRule(
    RuleMatchType.REGEX,
    'FID BKG.*MONEYLINE',
    TransactionCategory.EXCLUDED
  );
  
  console.log(`  Created ${transactionStore.rulesList.length} rules`);
  
  // Apply rules
  const appliedCount = transactionStore.applyRules();
  console.log(`  Applied rules to ${appliedCount} transactions`);
}

export function demoFiltering() {
  console.log('\n🔍 Testing Filtering...');
  
  // Filter by category
  transactionStore.setCategoryFilter(TransactionCategory.FAST_FOOD_AND_CONVENIENCE);
  console.log(`  Fast Food transactions: ${transactionStore.filteredTransactions.length}`);
  
  // Search
  transactionStore.clearFilters();
  transactionStore.setSearchQuery('ROCHESTER');
  console.log(`  Rochester transactions: ${transactionStore.filteredTransactions.length}`);
  
  // Clear filters
  transactionStore.clearFilters();
  console.log(`  All transactions: ${transactionStore.filteredTransactions.length}`);
}

// Run the demo
export async function runFullDemo() {
  console.log('🚀 Starting Transaction Store Demo...\n');
  
  await loadDemoData();
  demoBulkCategorization();
  demoRules();
  demoFiltering();
  
  console.log('\n✨ Demo completed!');
  console.log('\n💡 The store is available as: transactionStore');
  console.log('💡 Try: transactionStore.sortedTransactions');
  console.log('💡 Try: transactionStore.categorySummary');
  
  return transactionStore;
}

// Auto-run if in browser
if (typeof window !== 'undefined') {
  (window as any).runTransactionDemo = runFullDemo;
  (window as any).transactionStore = transactionStore;
  console.log('💡 Run: runTransactionDemo() to test the transaction store');
}

