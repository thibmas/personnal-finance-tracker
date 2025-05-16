import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Tag, Download, Upload, Trash, Moon, Sun, ArrowRight, 
  DollarSign, Calendar, FileText
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useTheme } from '../context/ThemeContext';
import { exportData, exportCSV } from '../utils/storage';
import { useTranslation } from 'react-i18next';

const SettingsPage: React.FC = () => {
  const { t } = useTranslation();
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
        <h1 className="text-2xl font-bold">{t('settings.title')}</h1>
      </header>
      
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">{t('settings.preferences')}</h2>
        <div className="card space-y-6">
          <div>
            <label htmlFor="currency" className="input-label">{t('settings.currency')}</label>
            <div className="flex items-center">
              <DollarSign size={20} className="text-gray-500 mr-2" />
              <select
                id="currency"
                value={settings.currency}
                onChange={handleCurrencyChange}
                className="flex-1"
              >
                <option value="USD">{t('currency.usd')}</option>
                <option value="EUR">{t('currency.eur')}</option>
                <option value="GBP">{t('currency.gbp')}</option>
                <option value="JPY">{t('currency.jpy')}</option>
                <option value="CAD">{t('currency.cad')}</option>
                <option value="AUD">{t('currency.aud')}</option>
                <option value="CHF">{t('currency.chf')}</option>
              </select>
            </div>
          </div>
          
          <div>
            <label htmlFor="firstDay" className="input-label">{t('settings.firstDay')}</label>
            <div className="flex items-center">
              <Calendar size={20} className="text-gray-500 mr-2" />
              <select
                id="firstDay"
                value={settings.firstDayOfMonth}
                onChange={handleFirstDayChange}
                className="flex-1"
              >
                <option value="1">{t('firstDay.1')}</option>
                <option value="15">{t('firstDay.15')}</option>
                <option value="25">{t('firstDay.25')}</option>
              </select>
            </div>
          </div>
          
          <div>
            <label htmlFor="theme" className="input-label">{t('settings.theme')}</label>
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
                <option value="light">{t('theme.light')}</option>
                <option value="dark">{t('theme.dark')}</option>
                <option value="system">{t('theme.system')}</option>
              </select>
            </div>
          </div>
        </div>
      </section>
      
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">{t('settings.dataManagement')}</h2>
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
                  <h3 className="font-medium">{t('settings.categories')}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t('settings.categoriesDescription')}
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
                  <h3 className="font-medium">{t('settings.importExport')}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t('settings.importExportDescription')}
                  </p>
                </div>
              </div>
              <ArrowRight size={20} className="text-gray-400" />
            </div>
          </Link>
          
          <div className="card">
            <h3 className="font-medium mb-2">{t('settings.quickExport')}</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => exportData()}
                className="btn-outline flex items-center justify-center"
              >
                <Download size={18} className="mr-2" />
                {t('settings.fullBackup')}
              </button>
              <button
                onClick={() => exportCSV('transactions')}
                className="btn-outline flex items-center justify-center"
              >
                <Download size={18} className="mr-2" />
                {t('settings.transactionsCSV')}
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
                <h3 className="font-medium">{t('settings.resetAllData')}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('settings.resetAllDataDescription')}
                </p>
              </div>
            </div>
          </button>
        </div>
      </section>
      
      {showResetConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
          <div className="card max-w-sm w-full animate-fade-in">
            <h3 className="text-xl font-bold mb-4">{t('settings.resetConfirmTitle')}</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {t('settings.resetConfirmDescription')}
            </p>
            <div className="flex justify-end space-x-3">
              <button
                className="btn-outline"
                onClick={() => setShowResetConfirm(false)}
              >
                {t('settings.cancel')}
              </button>
              <button
                className="btn bg-red-500 hover:bg-red-600 text-white"
                onClick={handleReset}
              >
                {t('settings.reset')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;