import React, { useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { useData } from '../../context/DataContext';
import { Transaction } from '../../types';
import { formatCurrency } from '../../utils/formatters';

ChartJS.register(ArcElement, Tooltip, Legend);

interface ExpenseChartProps {
  transactions: Transaction[];
}

const ExpenseChart: React.FC<ExpenseChartProps> = ({ transactions }) => {
  const { categories, settings } = useData();
  
  const chartData = useMemo(() => {
    // Get expense transactions
    const expenses = transactions.filter((t) => t.type === 'expense');
    
    // Group expenses by category
    const expensesByCategory = expenses.reduce((acc, expense) => {
      if (!acc[expense.category]) {
        acc[expense.category] = 0;
      }
      acc[expense.category] += expense.amount;
      return acc;
    }, {} as Record<string, number>);
    
    // Sort by amount (descending)
    const sortedCategories = Object.entries(expensesByCategory)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6); // Limit to top 6 categories
    
    // Sum all other categories if there are more than 6
    const otherAmount = Object.entries(expensesByCategory)
      .sort(([, a], [, b]) => b - a)
      .slice(6)
      .reduce((sum, [, amount]) => sum + amount, 0);
    
    // Add "Other" category if needed
    const finalCategories = [...sortedCategories];
    if (otherAmount > 0) {
      finalCategories.push(['Other', otherAmount]);
    }
    
    // Get category colors
    const labels = finalCategories.map(([name]) => name);
    const data = finalCategories.map(([, amount]) => amount);
    
    const backgroundColors = finalCategories.map(([name]) => {
      const category = categories.find((c) => c.name === name);
      return category?.color || '#6B7280';
    });
    
    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: backgroundColors,
          borderColor: 'transparent',
          borderWidth: 0,
          hoverOffset: 4,
        },
      ],
    };
  }, [transactions, categories]);
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          usePointStyle: true,
          boxWidth: 8,
          font: {
            size: 12,
          },
          formatter: (item: any) => {
            const amount = chartData.datasets[0].data[item.dataIndex];
            return `${item.text}: ${formatCurrency(amount, settings.currency)}`;
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = context.raw;
            return `${context.label}: ${formatCurrency(value, settings.currency)}`;
          },
        },
      },
    },
    cutout: '70%',
  };
  
  const totalExpenses = chartData.datasets[0].data.reduce((sum, amount) => sum + amount, 0);
  
  return (
    <div className="relative h-full">
      {totalExpenses > 0 ? (
        <>
          <Doughnut data={chartData} options={options} />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <span className="block text-sm text-gray-500">Total</span>
              <span className="font-bold">{formatCurrency(totalExpenses, settings.currency)}</span>
            </div>
          </div>
        </>
      ) : (
        <div className="h-full flex items-center justify-center">
          <p className="text-gray-500 dark:text-gray-400">No expense data to display</p>
        </div>
      )}
    </div>
  );
};

export default ExpenseChart;