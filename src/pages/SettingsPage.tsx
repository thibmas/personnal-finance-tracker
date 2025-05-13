import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Tag, Download, Upload, Trash, Moon, Sun, ArrowRight, 
  DollarSign, Calendar, FileText
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useTheme } from '../context/ThemeContext';
import { exportData, exportCSV } from '../utils/storage';

const SettingsPage: React.FC = () => {
  const { settings, updateSettings, resetData } = useData();
  const { theme, toggleTheme } = useTheme();
  const [showResetConfirm, setShowResetConfirm] = React.useState(false);
  
  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateSettings({
      ...settings,
      currency: e.target.value,
    });
  };
  
  const handleFirstDayChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateSettings({
      ...settings,
      firstDayOfMonth: parseInt(e.target.value),
    });
  };
  
  const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateSettings({
      ...settings,
      theme: e.target.value as 'light' | 'dark' | 'system',
    });
  };
  
  const handleReset = () => {
    resetData();
    setShowResetConfirm(false);
  };
  
  return (
    <div className="page-container">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
      </header>
      
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Preferences</h2>
        <div className="card space-y-6">
          <div>
            <label htmlFor="currency" className="input-label">Currency</label>
            <div className="flex items-center">
              <DollarSign size={20} className="text-gray-500 mr-2" />
              <select
                id="currency"
                value={settings.currency}
                onChange={handleCurrencyChange}
                className="flex-1"
              >
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="JPY">JPY - Japanese Yen</option>
                <option value="CAD">CAD - Canadian Dollar</option>
                <option value="AUD">AUD - Australian Dollar</option>
                <option value="CHF">CHF - Swiss Franc</option>
              </select>
            </div>
          </div>
          
          <div>
            <label htmlFor="firstDay" className="input-label">First Day of Month</label>
            <div className="flex items-center">
              <Calendar size={20} className="text-gray-500 mr-2" />
              <select
                id="firstDay"
                value={settings.firstDayOfMonth}
                onChange={handleFirstDayChange}
                className="flex-1"
              >
                <option value="1">1st of Month</option>
                <option value="15">15th of Month</option>
                <option value="25">25th of Month</option>
              </select>
            </div>
          </div>
          
          <div>
            <label htmlFor="theme" className="input-label">Theme</label>
            <div className="flex items-center">
              {theme === 'dark' ? (
                <Moon size={20} className="text-gray-500 mr-2" />
              ) : (
                <Sun size={20} className="text-gray-500 mr-2" />
              )}
              <select
                id="theme"
                value={settings.theme}
                onChange={handleThemeChange}
                className="flex-1"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </select>
            </div>
          </div>
        </div>
      </section>
      
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Data Management</h2>
        <div className="space-y-2">
          <Link
            to="/settings/categories"
            className="card block hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-primary-100 dark:bg-primary-900/30 p-2 rounded-lg mr-3">
                  <Tag size={20} className="text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <h3 className="font-medium">Categories</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Manage expense and income categories
                  </p>
                </div>
              </div>
              <ArrowRight size={20} className="text-gray-400" />
            </div>
          </Link>
          
          <Link
            to="/settings/import-export"
            className="card block hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-primary-100 dark:bg-primary-900/30 p-2 rounded-lg mr-3">
                  <FileText size={20} className="text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <h3 className="font-medium">Import/Export</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Backup and restore your financial data
                  </p>
                </div>
              </div>
              <ArrowRight size={20} className="text-gray-400" />
            </div>
          </Link>
          
          <div className="card">
            <h3 className="font-medium mb-2">Quick Export</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => exportData()}
                className="btn-outline flex items-center justify-center"
              >
                <Download size={18} className="mr-2" />
                Full Backup
              </button>
              <button
                onClick={() => exportCSV('transactions')}
                className="btn-outline flex items-center justify-center"
              >
                <Download size={18} className="mr-2" />
                Transactions CSV
              </button>
            </div>
          </div>
          
          <button
            onClick={() => setShowResetConfirm(true)}
            className="card block w-full hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center">
              <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-lg mr-3">
                <Trash size={20} className="text-red-600 dark:text-red-400" />
              </div>
              <div className="text-left">
                <h3 className="font-medium">Reset All Data</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Delete all transactions, budgets, and settings
                </p>
              </div>
            </div>
          </button>
        </div>
      </section>
      
      {showResetConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
          <div className="card max-w-sm w-full animate-fade-in">
            <h3 className="text-xl font-bold mb-4">Reset All Data?</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              This will permanently delete all your transactions, budgets, and settings. 
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
                className="btn bg-red-500 hover:bg-red-600 text-white"
                onClick={handleReset}
              >
                Reset All Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;