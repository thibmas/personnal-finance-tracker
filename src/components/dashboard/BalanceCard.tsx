import React from 'react';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { formatCurrency, getTransactionsTotalByType, getNetBalance } from '../../utils/formatters';
import { Transaction } from '../../types';

interface BalanceCardProps {
  transactions: Transaction[];
  currency: string;
  startOfMonthDay: number; // jour de début de mois (ex: 1 pour le 1er, 5 pour le 5 du mois)
}

function getStartOfCurrentPeriod(startOfMonthDay: number): Date {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  if (now.getDate() < startOfMonthDay) {
    // On est avant le jour de début, donc on prend le mois précédent
    return new Date(year, month - 1, startOfMonthDay);
  }
  return new Date(year, month, startOfMonthDay);
}

const BalanceCard: React.FC<BalanceCardProps> = ({ transactions, currency, startOfMonthDay }) => {
  if (!transactions || !Array.isArray(transactions)) {
    return null;
  }
  const startPeriod = getStartOfCurrentPeriod(startOfMonthDay);
  const filtered = transactions.filter(t => new Date(t.date) >= startPeriod);
  const income = getTransactionsTotalByType(filtered, 'income');
  const expenses = getTransactionsTotalByType(filtered, 'expense');
  const balance = getNetBalance(filtered);
  return (
    <div className="card relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-primary-100 dark:bg-primary-900/20 rounded-bl-full opacity-50" />
      
      <div className="flex flex-col">
        <div className="mb-4">
          <span className="text-sm text-gray-500 dark:text-gray-400">Current Balance</span>
          <div className="flex items-center mt-1">
            <DollarSign 
              size={28} 
              className={`mr-2 ${
                balance >= 0 
                  ? 'text-success-500' 
                  : 'text-error-500'
              }`} 
            />
            <span className={`text-3xl font-bold ${
              balance >= 0 
                ? 'text-success-500' 
                : 'text-error-500'
            }`}>
              {formatCurrency(balance, currency)}
            </span>
          </div>
        </div>
        
        <div className="flex justify-between">
          <div className="flex items-center">
            <div className="rounded-full bg-primary-100 dark:bg-primary-900/30 p-2 mr-3">
              <TrendingUp size={18} className="text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Income</p>
              <p className="font-semibold">{formatCurrency(income, currency)}</p>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="rounded-full bg-accent-100 dark:bg-accent-900/30 p-2 mr-3">
              <TrendingDown size={18} className="text-accent-600 dark:text-accent-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Expenses</p>
              <p className="font-semibold">{formatCurrency(expenses, currency)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BalanceCard;