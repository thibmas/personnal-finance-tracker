export interface Transaction {
  id: string;
  amount: number;
  date: string;
  category: string;
  description: string;
  notes?: string;
  type: 'expense' | 'income';
}

export interface Budget {
  id: string;
  category: string;
  amount: number;
  period: 'monthly' | 'yearly';
  startDate: string;
  notes?: string;
  isTemplate?: boolean;
}

export interface Category {
  id: string;
  name: string;
  type: 'expense' | 'income' | 'both';
  color: string;
  icon?: string;
}

export interface Settings {
  currency: string;
  firstDayOfMonth: number;
  theme: 'light' | 'dark' | 'system';
}

export interface AppData {
  transactions: Transaction[];
  budgets: Budget[];
  categories: Category[];
  settings: Settings;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string[];
    borderColor?: string[];
    borderWidth?: number;
  }[];
}

export interface FilterOptions {
  startDate?: string;
  endDate?: string;
  categories?: string[];
  minAmount?: number;
  maxAmount?: number;
}