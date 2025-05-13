import React from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { Transaction } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface TransactionListProps {
  transactions: Transaction[];
  limit?: number;
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions, limit }) => {
  const { categories, settings } = useData();
  
  const displayTransactions = limit
    ? transactions.slice(0, limit)
    : transactions;
  
  return (
    <div className="card p-0 divide-y divide-gray-100 dark:divide-gray-800">
      {displayTransactions.length > 0 ? (
        displayTransactions.map((transaction) => {
          const category = categories.find((c) => c.name === transaction.category);
          const isExpense = transaction.type === 'expense';
          
          return (
            <Link
              key={transaction.id}
              to={`/${transaction.type}s/${transaction.id}`}
              className="flex items-center p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center mr-3"
                style={{ backgroundColor: category?.color + '30' }}
              >
                <span
                  className="text-lg font-bold"
                  style={{ color: category?.color }}
                >
                  {transaction.category.charAt(0)}
                </span>
              </div>
              
              <div className="flex-1">
                <div className="font-medium">{transaction.description}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {transaction.category} • {formatDate(transaction.date)}
                </div>
              </div>
              
              <div className={`font-semibold ${
                isExpense 
                  ? 'text-red-500 dark:text-red-400' 
                  : 'text-green-500 dark:text-green-400'
              }`}>
                {isExpense ? '−' : '+'}{formatCurrency(transaction.amount, settings.currency)}
              </div>
            </Link>
          );
        })
      ) : (
        <div className="p-6 text-center">
          <p className="text-gray-500 dark:text-gray-400">No transactions found</p>
        </div>
      )}
    </div>
  );
};

export default TransactionList;