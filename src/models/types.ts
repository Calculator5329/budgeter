// Transaction Categories (as const object for verbatimModuleSyntax compatibility)
export const TransactionCategory = {
  AUTO_AND_TRANSPORT: 'Auto & Transport',
  AUTO_PAYMENT: 'Auto Payment',
  AUTO_SERVICE: 'Auto Service',
  BOOKS: 'Books',
  BUSINESS: 'Business',
  CASH_ATM: 'Cash/ATM',
  CLOTHING: 'Clothing',
  CONCERTS_AND_EVENTS: 'Concerts & Events',
  ELECTRONICS_AND_SOFTWARE: 'Electronics & Software',
  ENTERTAINMENT: 'Entertainment',
  EXCLUDED: 'Excluded',
  FAST_FOOD_AND_CONVENIENCE: 'Fast Food & Convenience',
  FEDERAL_TAX: 'Federal Tax',
  FEES_AND_CHARGES: 'Fees & Charges',
  FOOD: 'Food',
  GAS_AND_FUEL: 'Gas & Fuel',
  GROCERIES: 'Groceries',
  GYM: 'Gym',
  INCOME: 'Income',
  INTEREST_INCOME: 'Interest Income',
  MEDICAL: 'Medical',
  ONLINE_PAYMENT: 'Online Payment',
  PARKING: 'Parking',
  PAYCHECK_SALARY: 'Paycheck/Salary',
  PERSONAL_CARE: 'Personal Care',
  PHARMACY: 'Pharmacy',
  PHONE_INTERNET_CABLE: 'Phone, Internet & Cable',
  RESTAURANTS_DINING: 'Restaurants/Dining',
  SAVINGS: 'Savings',
  SHOPPING: 'Shopping',
  SPORTS_AND_HOBBIES: 'Sports & Hobbies',
  STATE_TAX: 'State Tax',
  SUBSCRIPTIONS: 'Subscriptions',
  TAX_REFUND: 'Tax Refund',
  VISION: 'Vision',
} as const;

export type TransactionCategory = typeof TransactionCategory[keyof typeof TransactionCategory];

// Helper to map CSV category strings to category values
export const categoryFromString = (category: string): TransactionCategory => {
  return Object.values(TransactionCategory).find(
    (cat) => cat === category
  ) as TransactionCategory;
};

// Helper to get all category values as array
export const getAllCategories = (): TransactionCategory[] => {
  return Object.values(TransactionCategory);
};

// Rule Match Types (as const object)
export const RuleMatchType = {
  CONTAINS: 'contains',
  STARTS_WITH: 'starts_with',
  ENDS_WITH: 'ends_with',
  EXACT_MATCH: 'exact_match',
  REGEX: 'regex',
} as const;

export type RuleMatchType = typeof RuleMatchType[keyof typeof RuleMatchType];

// Transaction Data Interface (for raw data)
export interface ITransactionData {
  date: Date;
  description: string;
  institution: string;
  account: string;
  category: TransactionCategory;
  isHidden: boolean;
  isPending: boolean;
  amount: number;
}

// CSV Row Interface (for parsing)
export interface ICSVRow {
  Date: string;
  Description: string;
  Institution: string;
  Account: string;
  Category: string;
  'Is Hidden': string;
  'Is Pending': string;
  Amount: string;
}

// Categorization Rule Data
export interface ICategorizationRuleData {
  matchType: RuleMatchType;
  pattern: string;
  targetCategory: TransactionCategory;
  enabled: boolean;
}

