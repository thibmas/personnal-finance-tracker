import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Trash, AlertTriangle } from 'lucide-react';
import { useData } from '../context/DataContext';
import { formatCurrency, formatDate } from '../utils/formatters';

interface TransactionDetailPageProps {
  type: 'expense' | 'income';
}

const TransactionDetailPage: React.FC<TransactionDetailPageProps> = ({ type }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { transactions, categories, settings, deleteTransaction } = useData();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const transaction = transactions.find((t) => t.id === id);
  const category = categories.find((c) => c.name === transaction?.category);
  
  if (!transaction || transaction.type !== type) {
    return (
      <div className="page-container">
        <div className="card flex flex-col items-center justify-center py-8">
          <AlertTriangle size={48} className="text-warning-500 mb-4" />
          <h2 className="text-xl font-bold mb-2">Transaction Not Found</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            The {type} you are looking for does not exist.
          </p>
          <Link to={`/${type}s`} className="btn-primary">
            Back to {type === 'expense' ? 'Expenses' : 'Income'}
          </Link>
        </div>
      </div>
    );
  }
  
  const handleDelete = () => {
    deleteTransaction(transaction.id);
    navigate(`/${type}s`);
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
          <h1 className="text-2xl font-bold">
            {type === 'expense' ? 'Expense Details' : 'Income Details'}
          </h1>
        </div>
        <div className="flex">
          <Link
            to={`/${type}s/${id}/edit`}
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
            <h2 className="text-xl font-bold mb-2">{transaction.description}</h2>
            <div className="flex items-center">
              <div 
                className="w-6 h-6 rounded-full flex items-center justify-center mr-2"
                style={{ backgroundColor: category?.color + '30' }}
              >
                <span style={{ color: category?.color }}>{transaction.category.charAt(0)}</span>
              </div>
              <span className="text-gray-600 dark:text-gray-300">{transaction.category}</span>
            </div>
          </div>
          <div className={`text-2xl font-bold ${
            type === 'expense' 
              ? 'text-red-500 dark:text-red-400' 
              : 'text-green-500 dark:text-green-400'
          }`}>
            {type === 'expense' ? '−' : '+'}{formatCurrency(transaction.amount, settings.currency)}
          </div>
        </div>
        
        <div className="border-t border-gray-100 dark:border-gray-800 pt-4 grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-1">Date</h3>
            <p>{formatDate(transaction.date)}</p>
          </div>
          
          {transaction.paymentMethod && (
            <div>
              <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-1">Payment Method</h3>
              <p>{transaction.paymentMethod}</p>
            </div>
          )}
          
          {transaction.source && (
            <div>
              <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-1">Source</h3>
              <p>{transaction.source}</p>
            </div>
          )}
          
          {transaction.notes && (
            <div className="col-span-2">
              <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-1">Notes</h3>
              <p className="whitespace-pre-line">{transaction.notes}</p>
            </div>
          )}
        </div>
      </div>
      
      {showDeleteConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
          <div className="card max-w-sm w-full animate-fade-in">
            <h3 className="text-xl font-bold mb-4">Delete Transaction?</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to delete this {type}? This action cannot be undone.
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

export default TransactionDetailPage;