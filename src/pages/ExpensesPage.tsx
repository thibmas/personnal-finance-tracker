import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Filter, Search } from 'lucide-react';
import { useData } from '../context/DataContext';
import { formatCurrency } from '../utils/formatters';
import TransactionList from '../components/transactions/TransactionList';
import { FilterOptions } from '../types';

const ExpensesPage: React.FC = () => {
  const { transactions, categories, settings } = useData();

  // Charger les filtres depuis la sessionStorage
  const sessionFilters = sessionStorage.getItem('expensesFilters');
  const sessionSearch = sessionStorage.getItem('expensesSearchTerm');

  const [searchTerm, setSearchTerm] = useState(sessionSearch || '');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>(
    sessionFilters ? JSON.parse(sessionFilters) : { categories: [], startDate: '', endDate: '' }
  );

  // Sauvegarder les filtres et la recherche à chaque modification
  useEffect(() => {
    sessionStorage.setItem('expensesFilters', JSON.stringify(filters));
  }, [filters]);

  useEffect(() => {
    sessionStorage.setItem('expensesSearchTerm', searchTerm);
  }, [searchTerm]);

  // Get expense categories
  const expenseCategories = categories.filter(
    (category) => category.type === 'expense' || category.type === 'both'
  );
  
  // Get expenses and filter them
  const expenses = transactions
    .filter((t) => t.type === 'expense')
    .filter((t) => {
      // Search by description or category
      if (searchTerm && !t.description.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !t.category.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Filter by category
      if (filters.categories && filters.categories.length > 0 && 
          !filters.categories.includes(t.category)) {
        return false;
      }
      
      // Filter by date range
      if (filters.startDate && new Date(t.date) < new Date(filters.startDate)) {
        return false;
      }
      
      if (filters.endDate && new Date(t.date) > new Date(filters.endDate)) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
  
  const handleCategoryToggle = (category: string) => {
    setFilters((prevFilters) => {
      const categoryFilters = prevFilters.categories || [];
      
      if (categoryFilters.includes(category)) {
        return {
          ...prevFilters,
          categories: categoryFilters.filter((c) => c !== category),
        };
      } else {
        return {
          ...prevFilters,
          categories: [...categoryFilters, category],
        };
      }
    });
  };
  
  const clearFilters = () => {
    setFilters({
      categories: [],
      startDate: '',
      endDate: '',
    });
    setSearchTerm('');
  };
  
  return (
    <div className="page-container">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Expenses</h1>
        <div className="text-xl font-semibold text-red-500 dark:text-red-400">
          {formatCurrency(totalExpenses, settings.currency)}
        </div>
      </header>
      
      <div className="mb-6">
        <div className="relative mb-4">
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2"
            placeholder="Search expenses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        </div>
        
        <div className="flex justify-between items-center mb-2">
          <button
            className="btn-outline flex items-center py-1 px-3 text-sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={16} className="mr-2" />
            Filters {filters.categories?.length ? `(${filters.categories.length})` : ''}
          </button>
          
          {(filters.categories?.length || filters.startDate || filters.endDate) && (
            <button
              className="text-sm text-primary-600 dark:text-primary-400"
              onClick={clearFilters}
            >
              Clear all
            </button>
          )}
        </div>
        
        {showFilters && (
          <div className="card mb-4 animate-slide-up">
            <div className="mb-4">
              <h3 className="text-sm font-medium mb-2">Categories</h3>
              <div className="flex flex-wrap gap-2">
                {expenseCategories.map((category) => (
                  <button
                    key={category.id}
                    className={`py-1 px-3 text-sm rounded-full transition-colors ${
                      filters.categories?.includes(category.name)
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                    }`}
                    onClick={() => handleCategoryToggle(category.name)}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="startDate" className="input-label">
                  From Date
                </label>
                <input
                  type="date"
                  id="startDate"
                  className="w-full"
                  value={filters.startDate}
                  onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                />
              </div>
              <div>
                <label htmlFor="endDate" className="input-label">
                  To Date
                </label>
                <input
                  type="date"
                  id="endDate"
                  className="w-full"
                  value={filters.endDate}
                  onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                />
              </div>
            </div>
          </div>
        )}
      </div>
      
      <section className="mb-20">
        {expenses.length > 0 ? (
          <TransactionList transactions={expenses} />
        ) : (
          <div className="card flex flex-col items-center justify-center py-12">
            <div className="text-center mb-4">
              <div className="text-gray-400 mb-2">
                <Filter size={48} />
              </div>
              <h3 className="text-lg font-medium mb-1">No expenses found</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {searchTerm || filters.categories?.length || filters.startDate || filters.endDate
                  ? 'Try changing your filters or search term'
                  : 'Start tracking your expenses'}
              </p>
            </div>
            <Link to="/expenses/add" className="btn-primary flex items-center">
              <Plus size={18} className="mr-2" />
              Add Expense
            </Link>
          </div>
        )}
      </section>
      
      <Link
        to="/expenses/add"
        className="fixed bottom-20 right-4 bg-primary-600 text-white rounded-full p-4 shadow-lg hover:bg-primary-700 transition-all"
        aria-label="Add expense"
      >
        <Plus size={24} />
      </Link>
    </div>
  );
};

export default ExpensesPage;