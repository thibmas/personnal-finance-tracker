import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { AppData, Transaction, Budget, Category, Settings } from '../types';
import { loadData, saveData } from '../utils/storage';
import { startOfMonth, format } from 'date-fns';

interface DataContextType {
  transactions: Transaction[];
  budgets: Budget[];
  categories: Category[];
  settings: Settings;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateTransaction: (transaction: Transaction) => void;
  deleteTransaction: (id: string) => void;
  addBudget: (budget: Omit<Budget, 'id'>) => void;
  updateBudget: (budget: Budget) => void;
  deleteBudget: (id: string) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (id: string) => void;
  updateSettings: (settings: Settings) => void;
  resetData: () => void;
  importData: (data: AppData) => void;
  getPlannedBudgets: () => Budget[];
  applyPlannedBudgets: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [data, setData] = useState<AppData>(loadData());
  
  useEffect(() => {
    saveData(data);
  }, [data]);

  // Check and apply planned budgets at the start of each month
  useEffect(() => {
    const now = new Date();
    const firstDayOfMonth = startOfMonth(now);
    const monthKey = format(firstDayOfMonth, 'yyyy-MM');
    
    // Check if we already have budgets for this month
    const hasMonthlyBudgets = data.budgets.some(
      (b) => !b.isTemplate && format(new Date(b.startDate), 'yyyy-MM') === monthKey
    );

    if (!hasMonthlyBudgets) {
      applyPlannedBudgets();
    }
  }, []);
  
  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = { ...transaction, id: uuidv4() };
    setData((prevData) => ({
      ...prevData,
      transactions: [...prevData.transactions, newTransaction],
    }));
  };
  
  const updateTransaction = (transaction: Transaction) => {
    setData((prevData) => ({
      ...prevData,
      transactions: prevData.transactions.map((t) => 
        t.id === transaction.id ? transaction : t
      ),
    }));
  };
  
  const deleteTransaction = (id: string) => {
    setData((prevData) => ({
      ...prevData,
      transactions: prevData.transactions.filter((t) => t.id !== id),
    }));
  };
  
  const addBudget = (budget: Omit<Budget, 'id'>) => {
    const newBudget = { ...budget, id: uuidv4() };
    setData((prevData) => ({
      ...prevData,
      budgets: [...prevData.budgets, newBudget],
    }));
  };
  
  const updateBudget = (budget: Budget) => {
    setData((prevData) => ({
      ...prevData,
      budgets: prevData.budgets.map((b) => 
        b.id === budget.id ? budget : b
      ),
    }));
  };
  
  const deleteBudget = (id: string) => {
    setData((prevData) => ({
      ...prevData,
      budgets: prevData.budgets.filter((b) => b.id !== id),
    }));
  };
  
  const addCategory = (category: Omit<Category, 'id'>) => {
    const newCategory = { ...category, id: uuidv4() };
    setData((prevData) => ({
      ...prevData,
      categories: [...prevData.categories, newCategory],
    }));
  };
  
  const updateCategory = (category: Category) => {
    setData((prevData) => ({
      ...prevData,
      categories: prevData.categories.map((c) => 
        c.id === category.id ? category : c
      ),
    }));
  };
  
  const deleteCategory = (id: string) => {
    setData((prevData) => ({
      ...prevData,
      categories: prevData.categories.filter((c) => c.id !== id),
    }));
  };
  
  const updateSettings = (settings: Settings) => {
    setData((prevData) => ({
      ...prevData,
      settings,
    }));
  };
  
  const resetData = () => {
    setData(loadData());
  };
  
  const importData = (newData: AppData) => {
    setData(newData);
  };

  const getPlannedBudgets = () => {
    return data.budgets.filter(b => b.isTemplate);
  };

  const applyPlannedBudgets = () => {
    const plannedBudgets = getPlannedBudgets();
    const now = new Date();
    const firstDayOfMonth = startOfMonth(now);

    // Create new budgets based on templates
    const newBudgets = plannedBudgets.map(template => ({
      ...template,
      id: uuidv4(),
      isTemplate: false,
      startDate: firstDayOfMonth.toISOString().split('T')[0],
    }));

    setData(prevData => ({
      ...prevData,
      budgets: [...prevData.budgets, ...newBudgets],
    }));
  };
  
  const value: DataContextType = {
    transactions: data.transactions,
    budgets: data.budgets,
    categories: data.categories,
    settings: data.settings,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addBudget,
    updateBudget,
    deleteBudget,
    addCategory,
    updateCategory,
    deleteCategory,
    updateSettings,
    resetData,
    importData,
    getPlannedBudgets,
    applyPlannedBudgets,
  };
  
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};