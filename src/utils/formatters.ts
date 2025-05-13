import { format, parseISO } from 'date-fns';
import { Transaction, Category, Budget } from '../types';

export const formatCurrency = (
  amount: number,
  currency = 'USD',
  locale = 'en-US'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
};

export const formatDate = (date: string): string => {
  try {
    return format(parseISO(date), 'MMM d, yyyy');
  } catch (error) {
    console.error('Invalid date format:', date);
    return date;
  }
};

export const getCategoryById = (id: string, categories: Category[]): Category | undefined => {
  return categories.find((category) => category.id === id);
};

export const getCategoryByName = (name: string, categories: Category[]): Category | undefined => {
  return categories.find((category) => category.name === name);
};

export const getTransactionsTotalByType = (
  transactions: Transaction[],
  type: 'expense' | 'income'
): number => {
  return transactions
    .filter((transaction) => transaction.type === type)
    .reduce((sum, transaction) => sum + transaction.amount, 0);
};

export const getTransactionsTotalByCategory = (
  transactions: Transaction[],
  category: string
): number => {
  return transactions
    .filter((transaction) => transaction.category === category)
    .reduce((sum, transaction) => sum + transaction.amount, 0);
};

export const getBudgetSpent = (
  budget: Budget,
  transactions: Transaction[]
): number => {
  return transactions
    .filter(
      (transaction) =>
        transaction.type === 'expense' && transaction.category === budget.category
    )
    .reduce((sum, transaction) => sum + transaction.amount, 0);
};

export const getBudgetRemaining = (
  budget: Budget,
  transactions: Transaction[]
): number => {
  const spent = getBudgetSpent(budget, transactions);
  return budget.amount - spent;
};

export const getBudgetPercentage = (
  budget: Budget,
  transactions: Transaction[]
): number => {
  const spent = getBudgetSpent(budget, transactions);
  return Math.min((spent / budget.amount) * 100, 100);
};

export const getNetBalance = (transactions: Transaction[]): number => {
  const income = getTransactionsTotalByType(transactions, 'income');
  const expenses = getTransactionsTotalByType(transactions, 'expense');
  return income - expenses;
};