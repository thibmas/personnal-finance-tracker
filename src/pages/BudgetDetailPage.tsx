import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Trash, AlertTriangle } from 'lucide-react';
import { useData } from '../context/DataContext';
import { 
  formatCurrency, 
  formatDate, 
  getBudgetSpent, 
  getBudgetRemaining,
  getBudgetPercentage
} from '../utils/formatters';
import TransactionList from '../components/transactions/TransactionList';

const BudgetDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { budgets, transactions, categories, settings, deleteBudget } = useData();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const budget = budgets.find((b) => b.id === id);
  
  if (!budget) {
    return (
      <div className="page-container">
        <div className="card flex flex-col items-center justify-center py-8">
          <AlertTriangle size={48} className="text-warning-500 mb-4" />
          <h2 className="text-xl font-bold mb-2">Budget Not Found</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            The budget you are looking for does not exist.
          </p>
          <Link to="/budgets" className="btn-primary">
            Back to Budgets
          </Link>
        </div>
      </div>
    );
  }
  
  const category = categories.find((c) => c.name === budget.category);
  const spent = getBudgetSpent(budget, transactions);
  const remaining = getBudgetRemaining(budget, transactions);
  const percentage = getBudgetPercentage(budget, transactions);
  const isOverBudget = percentage >= 100;
  
  // Get related transactions
  const relatedTransactions = transactions
    .filter((t) => t.type === 'expense' && t.category === budget.category)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  const handleDelete = () => {
    deleteBudget(budget.id);
    navigate('/budgets');
  };
  
  return (
    <div className="page-container">
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="mr-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold">Budget Details</h1>
        </div>
        <div className="flex">
          <Link
            to={`/budgets/${id}/edit`}
            className="btn-outline flex items-center mr-2"
          >
            <Edit size={18} className="mr-1" />
            Edit
          </Link>
          <button
            className="btn-outline text-red-500 dark:text-red-400 border-red-500 dark:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <Trash size={18} className="mr-1" />
            Delete
          </button>
        </div>
      </header>
      
      <div className="card mb-6 relative overflow-hidden">
        <div 
          className="absolute top-0 right-0 w-32 h-32 rounded-bl-full opacity-10"
          style={{ backgroundColor: category?.color || '#6B7280' }}
        />
        
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-bold mb-2">{budget.category}</h2>
            <div className="flex items-center">
              <div 
                className="w-6 h-6 rounded-full flex items-center justify-center mr-2"
                style={{ backgroundColor: category?.color + '30' }}
              >
                <span style={{ color: category?.color }}>{budget.category?.charAt(0)}</span>
              </div>
              <span className="text-gray-600 dark:text-gray-300">
                {budget.period === 'monthly' ? 'Monthly' : 'Yearly'} budget
              </span>
            </div>
          </div>
          <div className="text-2xl font-bold">
            {formatCurrency(budget.amount, settings.currency)}
          </div>
        </div>
        
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-500 dark:text-gray-400">
              Spent: {formatCurrency(spent, settings.currency)}
            </span>
            <span className={`font-medium ${isOverBudget ? 'text-warning-500' : 'text-green-500'}`}>
              {isOverBudget ? 'Over by ' : 'Left: '}
              {formatCurrency(
                isOverBudget ? -remaining : remaining, 
                settings.currency
              )}
            </span>
          </div>
          
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-1">
            <div
              className={`h-4 rounded-full ${
                isOverBudget ? 'bg-warning-500' : 'bg-primary-600'
              }`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            ></div>
          </div>
          
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>
              {formatCurrency(spent, settings.currency)} of {formatCurrency(budget.amount, settings.currency)}
            </span>
            <span>{Math.round(percentage)}%</span>
          </div>
        </div>
        
        <div className="border-t border-gray-100 dark:border-gray-800 pt-4 grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-1">Start Date</h3>
            <p>{formatDate(budget.startDate)}</p>
          </div>
          
          <div>
            <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-1">Period</h3>
            <p className="capitalize">{budget.period}</p>
          </div>
          
          {budget.notes && (
            <div className="col-span-2">
              <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-1">Notes</h3>
              <p className="whitespace-pre-line">{budget.notes}</p>
            </div>
          )}
        </div>
      </div>
      
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Related Transactions</h2>
        {relatedTransactions.length > 0 ? (
          <TransactionList transactions={relatedTransactions} />
        ) : (
          <div className="card p-6 text-center">
            <p className="text-gray-500 dark:text-gray-400">No related transactions found</p>
          </div>
        )}
      </section>
      
      {showDeleteConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
          <div className="card max-w-sm w-full animate-fade-in">
            <h3 className="text-xl font-bold mb-4">Delete Budget?</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to delete this budget? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                className="btn-outline"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="btn bg-red-500 hover:bg-red-600 text-white"
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetDetailPage;