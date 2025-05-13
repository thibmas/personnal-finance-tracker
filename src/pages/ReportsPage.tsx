import React, { useState } from 'react';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { useData } from '../context/DataContext';
import { formatCurrency, getTransactionsTotalByType } from '../utils/formatters';
import { format, subMonths, eachMonthOfInterval } from 'date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const ReportsPage: React.FC = () => {
  const { transactions, categories, settings } = useData();
  const [period, setPeriod] = useState('6months');
  const [chartType, setChartType] = useState('overview');
  
  // Calculate date range based on period
  const endDate = new Date();
  let startDate;
  
  switch (period) {
    case '1month':
      startDate = subMonths(endDate, 1);
      break;
    case '3months':
      startDate = subMonths(endDate, 3);
      break;
    case '6months':
      startDate = subMonths(endDate, 6);
      break;
    case '12months':
      startDate = subMonths(endDate, 12);
      break;
    default:
      startDate = subMonths(endDate, 6);
  }
  
  // Get all months in the range
  const months = eachMonthOfInterval({ start: startDate, end: endDate });
  
  // Filter transactions by date range
  const filteredTransactions = transactions.filter(
    (t) => new Date(t.date) >= startDate && new Date(t.date) <= endDate
  );
  
  // Group transactions by month
  const transactionsByMonth = months.map((month) => {
    const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
    const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);
    
    return filteredTransactions.filter(
      (t) => new Date(t.date) >= monthStart && new Date(t.date) <= monthEnd
    );
  });
  
  // Calculate monthly income and expenses
  const monthlyIncome = transactionsByMonth.map((monthTransactions) =>
    getTransactionsTotalByType(monthTransactions, 'income')
  );
  
  const monthlyExpenses = transactionsByMonth.map((monthTransactions) =>
    getTransactionsTotalByType(monthTransactions, 'expense')
  );
  
  // Calculate monthly balance
  const monthlyBalance = monthlyIncome.map((income, i) => income - monthlyExpenses[i]);
  
  // Format month labels
  const monthLabels = months.map((month) => format(month, 'MMM yyyy'));
  
  // Data for overview chart
  const overviewData = {
    labels: monthLabels,
    datasets: [
      {
        label: 'Income',
        data: monthlyIncome,
        backgroundColor: 'rgba(34, 197, 94, 0.2)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 1,
      },
      {
        label: 'Expenses',
        data: monthlyExpenses,
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 1,
      },
    ],
  };
  
  // Data for balance chart
  const balanceData = {
    labels: monthLabels,
    datasets: [
      {
        label: 'Balance',
        data: monthlyBalance,
        backgroundColor: 'rgba(13, 148, 136, 0.2)',
        borderColor: 'rgba(13, 148, 136, 1)',
        borderWidth: 2,
        fill: true,
        tension: 0.3,
      },
    ],
  };
  
  // Group expenses by category
  const expensesByCategory: Record<string, number> = {};
  
  filteredTransactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      if (!expensesByCategory[t.category]) {
        expensesByCategory[t.category] = 0;
      }
      expensesByCategory[t.category] += t.amount;
    });
  
  // Sort and get top categories
  const sortedExpenseCategories = Object.entries(expensesByCategory)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 7);
  
  const categoryColors = sortedExpenseCategories.map(([categoryName]) => {
    const category = categories.find((c) => c.name === categoryName);
    return category?.color || '#6B7280';
  });
  
  // Data for category chart
  const categoryData = {
    labels: sortedExpenseCategories.map(([name]) => name),
    datasets: [
      {
        data: sortedExpenseCategories.map(([, value]) => value),
        backgroundColor: categoryColors,
        borderWidth: 0,
      },
    ],
  };
  
  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: number) => formatCurrency(value, settings.currency, undefined, false),
        },
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: (context: any) => {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            label += formatCurrency(context.raw, settings.currency);
            return label;
          },
        },
      },
    },
  };
  
  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = context.raw;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${context.label}: ${formatCurrency(value, settings.currency)} (${percentage}%)`;
          },
        },
      },
    },
  };
  
  return (
    <div className="page-container">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Reports</h1>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="border-none bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-1 focus:ring-0"
        >
          <option value="1month">Last Month</option>
          <option value="3months">Last 3 Months</option>
          <option value="6months">Last 6 Months</option>
          <option value="12months">Last 12 Months</option>
        </select>
      </header>
      
      <div className="flex mb-6 overflow-x-auto">
        <button
          className={`px-4 py-2 mr-2 rounded-lg ${
            chartType === 'overview'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
          }`}
          onClick={() => setChartType('overview')}
        >
          Overview
        </button>
        <button
          className={`px-4 py-2 mr-2 rounded-lg ${
            chartType === 'balance'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
          }`}
          onClick={() => setChartType('balance')}
        >
          Balance
        </button>
        <button
          className={`px-4 py-2 mr-2 rounded-lg ${
            chartType === 'categories'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
          }`}
          onClick={() => setChartType('categories')}
        >
          Categories
        </button>
      </div>
      
      <div className="card p-4 mb-8">
        <div className="h-80">
          {chartType === 'overview' && <Bar data={overviewData} options={chartOptions} />}
          {chartType === 'balance' && <Line data={balanceData} options={chartOptions} />}
          {chartType === 'categories' && <Doughnut data={categoryData} options={pieOptions} />}
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Summary</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card">
            <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Income</h3>
            <p className="text-xl font-semibold text-green-500 dark:text-green-400">
              {formatCurrency(monthlyIncome.reduce((sum, val) => sum + val, 0), settings.currency)}
            </p>
          </div>
          <div className="card">
            <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Expenses</h3>
            <p className="text-xl font-semibold text-red-500 dark:text-red-400">
              {formatCurrency(monthlyExpenses.reduce((sum, val) => sum + val, 0), settings.currency)}
            </p>
          </div>
          <div className="card">
            <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-1">Net Balance</h3>
            <p className={`text-xl font-semibold ${
              monthlyBalance.reduce((sum, val) => sum + val, 0) >= 0
                ? 'text-green-500 dark:text-green-400'
                : 'text-red-500 dark:text-red-400'
            }`}>
              {formatCurrency(monthlyBalance.reduce((sum, val) => sum + val, 0), settings.currency)}
            </p>
          </div>
        </div>
      </div>
      
      {chartType === 'categories' && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Top Expense Categories</h2>
          <div className="card divide-y divide-gray-100 dark:divide-gray-800">
            {sortedExpenseCategories.map(([category, amount]) => (
              <div key={category} className="flex justify-between py-3">
                <div className="flex items-center">
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{
                      backgroundColor: categories.find((c) => c.name === category)?.color || '#6B7280',
                    }}
                  ></div>
                  <span>{category}</span>
                </div>
                <span className="font-medium">{formatCurrency(amount, settings.currency)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;