import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit, Trash, AlertTriangle } from 'lucide-react';
import { useData } from '../context/DataContext';
import { formatCurrency } from '../utils/formatters';
import { Budget } from '../types';

const PlannedBudgetPage: React.FC = () => {
  const navigate = useNavigate();
  const { categories, settings, budgets, addBudget, updateBudget, deleteBudget } = useData();
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    notes: '',
  });

  // Get planned budgets
  const plannedBudgets = budgets.filter(b => b.isTemplate);
  
  // Get expense categories
  const expenseCategories = categories.filter(
    (category) => category.type === 'expense' || category.type === 'both'
  );

  const handleAddBudget = () => {
    setFormData({
      category: expenseCategories[0]?.name || '',
      amount: '',
      notes: '',
    });
    setShowAddModal(true);
  };

  const handleEditBudget = (budget: Budget) => {
    setSelectedBudget(budget);
    setFormData({
      category: budget.category,
      amount: budget.amount.toString(),
      notes: budget.notes || '',
    });
    setShowEditModal(true);
  };

  const handleDeleteBudget = (budget: Budget) => {
    setSelectedBudget(budget);
    setShowDeleteConfirm(true);
  };

  const handleSubmitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    addBudget({
      category: formData.category,
      amount: parseFloat(formData.amount),
      period: 'monthly',
      startDate: new Date().toISOString().split('T')[0],
      notes: formData.notes,
      isTemplate: true,
    });
    setShowAddModal(false);
  };

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedBudget) {
      updateBudget({
        ...selectedBudget,
        category: formData.category,
        amount: parseFloat(formData.amount),
        notes: formData.notes,
      });
    }
    setShowEditModal(false);
  };

  const handleConfirmDelete = () => {
    if (selectedBudget) {
      deleteBudget(selectedBudget.id);
    }
    setShowDeleteConfirm(false);
  };

  return (
    <div className="page-container">
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/budgets')}
            className="mr-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold">Planned Budgets</h1>
        </div>
        <button
          onClick={handleAddBudget}
          className="btn-primary flex items-center"
        >
          <Plus size={20} className="mr-2" />
          Add Budget
        </button>
      </header>

      <div className="card mb-6">
        <div className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          <p>
            Planned budgets serve as a template for your monthly budgets. 
            They will be automatically applied at the start of each month.
          </p>
        </div>

        {plannedBudgets.length > 0 ? (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {plannedBudgets.map((budget) => {
              const category = categories.find((c) => c.name === budget.category);
              
              return (
                <div
                  key={budget.id}
                  className="py-4 flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center mr-3"
                      style={{ backgroundColor: category?.color + '30' }}
                    >
                      <span
                        className="text-lg font-bold"
                        style={{ color: category?.color }}
                      >
                        {budget.category.charAt(0)}
                      </span>
                    </div>
                    
                    <div>
                      <div className="font-medium">{budget.category}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Monthly budget: {formatCurrency(budget.amount, settings.currency)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <button
                      onClick={() => handleEditBudget(budget)}
                      className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteBudget(budget)}
                      className="p-2 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                    >
                      <Trash size={18} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <AlertTriangle size={48} className="mx-auto text-warning-500 mb-4" />
            <h3 className="text-lg font-medium mb-2">No planned budgets</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Start by creating a planned budget that will be used as a template each month.
            </p>
            <button
              onClick={handleAddBudget}
              className="btn-primary flex items-center mx-auto"
            >
              <Plus size={18} className="mr-2" />
              Add Planned Budget
            </button>
          </div>
        )}
      </div>

      {/* Add Budget Modal */}
      {showAddModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
          <div className="card max-w-md w-full animate-fade-in">
            <h3 className="text-xl font-bold mb-4">Add Planned Budget</h3>
            <form onSubmit={handleSubmitAdd}>
              <div className="input-group">
                <label htmlFor="category" className="input-label">Category</label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full"
                  required
                >
                  <option value="">Select a category</option>
                  {expenseCategories.map((category) => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label htmlFor="amount" className="input-label">
                  Monthly Amount ({settings.currency})
                </label>
                <input
                  type="number"
                  id="amount"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div className="input-group">
                <label htmlFor="notes" className="input-label">Notes (Optional)</label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full"
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Add Budget
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Budget Modal */}
      {showEditModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
          <div className="card max-w-md w-full animate-fade-in">
            <h3 className="text-xl font-bold mb-4">Edit Planned Budget</h3>
            <form onSubmit={handleSubmitEdit}>
              <div className="input-group">
                <label htmlFor="edit-category" className="input-label">Category</label>
                <select
                  id="edit-category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full"
                  required
                >
                  <option value="">Select a category</option>
                  {expenseCategories.map((category) => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label htmlFor="edit-amount" className="input-label">
                  Monthly Amount ({settings.currency})
                </label>
                <input
                  type="number"
                  id="edit-amount"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div className="input-group">
                <label htmlFor="edit-notes" className="input-label">Notes (Optional)</label>
                <textarea
                  id="edit-notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full"
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
          <div className="card max-w-sm w-full animate-fade-in">
            <h3 className="text-xl font-bold mb-4">Delete Planned Budget?</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to delete this planned budget? This will not affect existing monthly budgets.
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
                onClick={handleConfirmDelete}
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

export default PlannedBudgetPage;