import { AppData } from '../types';

const STORAGE_KEY = 'finance_tracker_data';

// Default categories
const defaultCategories = [
  { id: '1', name: 'Food', type: 'expense', color: '#EF4444' },
  { id: '2', name: 'Transport', type: 'expense', color: '#F59E0B' },
  { id: '3', name: 'Housing', type: 'expense', color: '#10B981' },
  { id: '4', name: 'Entertainment', type: 'expense', color: '#6366F1' },
  { id: '5', name: 'Healthcare', type: 'expense', color: '#EC4899' },
  { id: '6', name: 'Shopping', type: 'expense', color: '#8B5CF6' },
  { id: '7', name: 'Utilities', type: 'expense', color: '#14B8A6' },
  { id: '8', name: 'Other Expense', type: 'expense', color: '#6B7280' },
  { id: '9', name: 'Salary', type: 'income', color: '#22C55E' },
  { id: '10', name: 'Freelance', type: 'income', color: '#3B82F6' },
  { id: '11', name: 'Gifts', type: 'income', color: '#D946EF' },
  { id: '12', name: 'Other Income', type: 'income', color: '#64748B' },
];

// Default settings
const defaultSettings = {
  currency: 'USD',
  firstDayOfMonth: 1,
  theme: 'system',
};

// Initial app data
const initialData: AppData = {
  transactions: [],
  budgets: [],
  categories: defaultCategories,
  settings: defaultSettings,
};

// Load data from localStorage
export const loadData = (): AppData => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
    return initialData;
  } catch (error) {
    console.error('Error loading data from localStorage:', error);
    return initialData;
  }
};

// Save data to localStorage
export const saveData = (data: AppData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving data to localStorage:', error);
  }
};

// Export data as JSON file
export const exportData = (): void => {
  try {
    const data = loadData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const date = new Date().toISOString().split('T')[0];
    a.href = url;
    a.download = `finance_tracker_backup_${date}.json`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting data:', error);
  }
};

// Import data from JSON file
export const importData = (file: File): Promise<AppData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        if (event.target?.result) {
          const importedData = JSON.parse(event.target.result as string) as AppData;
          saveData(importedData);
          resolve(importedData);
        }
      } catch (error) {
        reject(new Error('Invalid file format'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };
    
    reader.readAsText(file);
  });
};

// Export data as CSV
export const exportCSV = (type: 'transactions' | 'budgets'): void => {
  try {
    const data = loadData();
    let csv = '';
    let filename = '';
    
    if (type === 'transactions') {
      // Create headers
      csv = 'ID,Type,Amount,Date,Category,Description,Payment Method,Source,Notes\n';
      
      // Add rows
      data.transactions.forEach((t) => {
        csv += `${t.id},${t.type},${t.amount},${t.date},${t.category},${t.description},${t.paymentMethod || ''},${t.source || ''},${t.notes || ''}\n`;
      });
      
      filename = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    } else if (type === 'budgets') {
      // Create headers
      csv = 'ID,Category,Amount,Period,Start Date,Notes\n';
      
      // Add rows
      data.budgets.forEach((b) => {
        csv += `${b.id},${b.category},${b.amount},${b.period},${b.startDate},${b.notes || ''}\n`;
      });
      
      filename = `budgets_${new Date().toISOString().split('T')[0]}.csv`;
    }
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting CSV:', error);
  }
};