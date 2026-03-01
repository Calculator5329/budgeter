import { categoryFromString } from '../models/types';
import type { ITransactionData, ICSVRow } from '../models/types';

/**
 * Parse amount string from CSV format to number
 * Examples:
 *   "($7.64)" => -7.64
 *   "$16.27" => 16.27
 *   "($950.1)" => -950.1
 */
export const parseAmount = (amountStr: string): number => {
  // Remove all non-numeric characters except decimal point and parentheses
  const cleaned = amountStr.replace(/[^0-9.\-()]/g, '');

  // Check if it's in parentheses (negative)
  if (cleaned.startsWith('(') && cleaned.endsWith(')')) {
    const numStr = cleaned.substring(1, cleaned.length - 1);
    return -parseFloat(numStr);
  }

  return parseFloat(cleaned);
};

/**
 * Parse date string from CSV format to Date object
 * Expects format like "11/10/2025" or "1/2/2025"
 */
export const parseDate = (dateStr: string): Date => {
  const [month, day, year] = dateStr.split('/').map(Number);
  return new Date(year, month - 1, day);
};

/**
 * Parse boolean string from CSV format
 * "Yes" => true, "No" => false
 */
export const parseBoolean = (boolStr: string): boolean => {
  return boolStr.toLowerCase() === 'yes';
};

/**
 * Parse a single CSV row to transaction data
 */
export const parseCSVRow = (row: ICSVRow): ITransactionData => {
  return {
    date: parseDate(row.Date),
    description: row.Description,
    institution: row.Institution,
    account: row.Account,
    category: categoryFromString(row.Category),
    isHidden: parseBoolean(row['Is Hidden']),
    isPending: parseBoolean(row['Is Pending']),
    amount: parseAmount(row.Amount),
  };
};

/**
 * Simple CSV parser
 * Handles quoted fields and commas within quotes
 */
export const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  // Push the last field
  result.push(current);

  return result;
};

/**
 * Parse entire CSV text to array of transaction data
 */
export const parseCSV = (csvText: string): ITransactionData[] => {
  const lines = csvText.trim().split('\n');

  if (lines.length < 2) {
    throw new Error('CSV must have at least a header row and one data row');
  }

  // Parse header
  const headerLine = lines[0];
  const headers = parseCSVLine(headerLine);

  // Parse data rows
  const transactions: ITransactionData[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue; // Skip empty lines

    const values = parseCSVLine(line);

    // Create row object
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });

    try {
      const transaction = parseCSVRow(row as unknown as ICSVRow);
      transactions.push(transaction);
    } catch (error) {
      console.error(`Error parsing row ${i + 1}:`, error);
      // Continue parsing other rows
    }
  }

  return transactions;
};

/**
 * Load CSV from file (for use in browser with File API)
 */
export const loadCSVFromFile = (file: File): Promise<ITransactionData[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const csvText = event.target?.result as string;
        const transactions = parseCSV(csvText);
        resolve(transactions);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsText(file);
  });
};

