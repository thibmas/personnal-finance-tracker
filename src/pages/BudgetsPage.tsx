import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Filter, AlertTriangle, Copy, ClipboardList } from 'lucide-react';
import { useData } from '../context/DataContext';
import { 
  formatCurrency, 
  getBudgetSpent, 
  getBudgetRemaining,
  getBudgetPercentage
} from '../utils/formatters';
import { useTranslation } from 'react-i18next';

const BudgetsPage: React.FC = () => {
  const { budgets, transactions, categories, settings, applyPlannedBudgets, addBudget, deleteBudget } = useData();
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  });
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  
  // Filter transactions by date range
  const [year, month] = selectedMonth.split('-').map(Number);
  const selectedDate = new Date(year, month - 1);
  const nextMonth = new Date(year, month);
  
  // Get current month's budgets (non-template)
  const monthlyBudgets = budgets.filter(
    b => !b.isTemplate && 
    new Date(b.startDate) >= selectedDate && 
    new Date(b.startDate) < nextMonth
  );
  
  // Calculate budget progress
  const budgetsWithProgress = monthlyBudgets.map((budget) => {
    const spent = getBudgetSpent(budget, transactions);
    const remaining = getBudgetRemaining(budget, transactions);
    const percentage = getBudgetPercentage(budget, transactions);
    
    return {
      ...budget,
      spent,
      remaining,
      percentage,
    };
  }).sort((a, b) => b.percentage - a.percentage);
  
  const months = [];
  const today = new Date();
  for (let i = 0; i < 12; i++) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const label = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    months.push({ value, label });
  }

  const handleResetBudgets = () => {
    // Clear existing monthly budgets
    const nonTemplateBudgets = budgets.filter(b => !b.isTemplate);
    nonTemplateBudgets.forEach(budget => deleteBudget(budget.id));

    // Copy planned budgets as new monthly budgets
    const plannedBudgets = budgets.filter(b => b.isTemplate);
    plannedBudgets.forEach(plannedBudget => {
      addBudget({
        ...plannedBudget,
        isTemplate: false,
        startDate: new Date().toISOString().split('T')[0],
      });
    });

    setShowResetConfirm(false);
  };

  const { t } = useTranslation();
  
  return (
    <div className="page-container">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Budgets</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowResetConfirm(true)}
            className="btn-outline flex items-center text-sm"
            title="Reset to planned budgets"
          >
            <Copy size={16} className="mr-2" />
            Reset to Plan
          </button>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="border-none bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-1 focus:ring-0"
          >
            {months.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </header>
      
      <section className="mb-20">
        {budgetsWithProgress.length > 0 ? (
          <div className="space-y-4">
            {budgetsWithProgress.map((budget) => {
              const category = categories.find((c) => c.name === budget.category);
              const isOverBudget = budget.percentage >= 100;
              
              return (
                <Link 
                  key={budget.id} 
                  to={`/budgets/${budget.id}`}
                  className="card block hover:shadow-lg transition-shadow"
                >
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center">
                      <div 
                        className="w-8 h-8 rounded-full mr-2 flex items-center justify-center"
                        style={{ backgroundColor: category?.color + '30' }}
                      >
                        <span style={{ color: category?.color }}>{budget.category.charAt(0)}</span>
                      </div>
                      <span className="font-medium">{budget.category}</span>
                    </div>
                    
                    {isOverBudget && (
                      <div className="flex items-center text-warning-500">
                        <AlertTriangle size={16} className="mr-1" />
                        <span className="text-sm font-medium">Over budget</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-500 dark:text-gray-400">
                      Spent: {formatCurrency(budget.spent, settings.currency)}
                    </span>
                    <span className={`font-medium ${isOverBudget ? 'text-warning-500' : 'text-green-500'}`}>
                      {isOverBudget ? 'Over by ' : 'Left: '}
                      {formatCurrency(
                        isOverBudget ? -budget.remaining : budget.remaining, 
                        settings.currency
                      )}
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-1">
                    <div
                      className={`h-2.5 rounded-full ${
                        isOverBudget ? 'bg-warning-500' : 'bg-primary-600'
                      }`}
                      style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>
                      {formatCurrency(budget.spent, settings.currency)} of {formatCurrency(budget.amount, settings.currency)}
                    </span>
                    <span>{Math.round(budget.percentage)}%</span>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="card flex flex-col items-center justify-center py-12">
            <div className="text-center mb-4">
              <div className="text-gray-400 mb-2">
                <Filter size={48} />
              </div>
              <h3 className="text-lg font-medium mb-1">No budgets found</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Start by creating a budget for your expenses
              </p>
            </div>
            <div className="space-y-2">
              <Link to="/budgets/add" className="btn-primary flex items-center">
                <Plus size={18} className="mr-2" />
                Create Budget
              </Link>
              <Link to="/budgets/planned" className="btn-outline flex items-center">
                <Copy size={18} className="mr-2" />
                Manage Planned Budgets
              </Link>
            </div>
          </div>
        )}
      </section>
      
      <div className="fixed bottom-20 right-4 flex flex-col space-y-2">
        <Link
          to="/budgets/planned"
          className="bg-accent-600 text-white rounded-full p-4 shadow-lg hover:bg-accent-700 transition-all"
          aria-label="Manage planned budgets"
        >
          <ClipboardList size={24} />
        </Link>
        <Link
          to="/budgets/add"
          className="bg-primary-600 text-white rounded-full p-4 shadow-lg hover:bg-primary-700 transition-all"
          aria-label="Add budget"
        >
          <Plus size={24} />
        </Link>
      </div>

      {showResetConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
          <div className="card max-w-sm w-full animate-fade-in">
            <h3 className="text-xl font-bold mb-4">Reset Monthly Budgets?</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              This will reset your current month's budgets to match your planned budget template. 
              This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                className="btn-outline"
                onClick={() => setShowResetConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handleResetBudgets}
              >
                Reset to Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetsPage;