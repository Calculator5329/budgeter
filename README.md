# Budgeter

Categorize, track, and analyze your financial transactions with an intelligent budgeting tool.

## What It Is

Budgeter is a transaction tracking and budget analysis application that imports financial data from CSV exports. Upload your bank and credit card statements, and the app automatically categorizes transactions, calculates spending by category, and provides a comprehensive view of income vs. expenses. Built with MobX for reactive state management, it updates calculations instantly as you adjust transaction categories and filters.

## Tech Stack

- React 19 with TypeScript
- Vite for fast development
- MobX for state management
- Mobx-React-Lite for reactive components
- UUID for transaction IDs

## Getting Started

```
npm install
npm run dev
```

Upload a CSV file with your transactions to get started. The app will display a dashboard with total income, expenses, and a categorized transaction table. Click transactions to adjust their categories or hide them from totals.
