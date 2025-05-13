import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileUp, FileDown, CheckCircle, AlertCircle } from 'lucide-react';
import { useData } from '../context/DataContext';
import { exportData, exportCSV, importData as importDataUtil } from '../utils/storage';

const ImportExportPage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { importData } = useData();
  
  const [importing, setImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  
  const handleImport = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setImporting(true);
    setImportStatus(null);
    
    try {
      const data = await importDataUtil(file);
      importData(data);
      setImportStatus({
        type: 'success',
        message: 'Data imported successfully!',
      });
    } catch (error) {
      setImportStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to import data',
      });
    } finally {
      setImporting(false);
      // Reset the file input
      if (e.target) {
        e.target.value = '';
      }
    }
  };
  
  return (
    <div className="page-container">
      <header className="flex items-center mb-6">
        <button
          onClick={() => navigate('/settings')}
          className="mr-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold">Import/Export</h1>
      </header>
      
      <div className="card mb-6">
        <h2 className="text-lg font-semibold mb-4">Export Data</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Download a backup of all your data, including transactions, budgets, and settings.
        </p>
        
        <div className="space-y-4">
          <button
            onClick={() => exportData()}
            className="w-full btn-primary flex items-center justify-center"
          >
            <FileDown size={20} className="mr-2" />
            Export All Data (JSON)
          </button>
          
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => exportCSV('transactions')}
              className="btn-outline flex items-center justify-center"
            >
              <FileDown size={18} className="mr-2" />
              Transactions (CSV)
            </button>
            <button
              onClick={() => exportCSV('budgets')}
              className="btn-outline flex items-center justify-center"
            >
              <FileDown size={18} className="mr-2" />
              Budgets (CSV)
            </button>
          </div>
        </div>
      </div>
      
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Import Data</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Restore data from a previously exported JSON backup file.
        </p>
        
        <div className="space-y-4">
          <button
            onClick={handleImport}
            className="w-full btn-primary flex items-center justify-center"
            disabled={importing}
          >
            <FileUp size={20} className="mr-2" />
            {importing ? 'Importing...' : 'Import Data (JSON)'}
          </button>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />
          
          {importStatus && (
            <div className={`p-4 rounded-lg flex items-start ${
              importStatus.type === 'success'
                ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200'
            }`}>
              {importStatus.type === 'success' ? (
                <CheckCircle size={20} className="mr-2 flex-shrink-0" />
              ) : (
                <AlertCircle size={20} className="mr-2 flex-shrink-0" />
              )}
              <span>{importStatus.message}</span>
            </div>
          )}
          
          <div className="text-sm text-gray-500 dark:text-gray-400 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <p className="font-medium mb-2">Important Notes:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Importing data will replace all existing data</li>
              <li>Make sure to backup your current data before importing</li>
              <li>Only JSON files exported from this app are supported</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportExportPage;