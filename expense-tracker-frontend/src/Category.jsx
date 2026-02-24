import React, { useState, useEffect } from 'react';
import './Category.css';

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [filterType, setFilterType] = useState('All');
  const [stats, setStats] = useState({ total: 0, income: 0, expense: 0 });
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    iconUrl: '',
    type: 'Expense'
  });

  const uid = 1;

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [filterType, allCategories]);

  const fetchCategories = async () => {
    try {
      const url = `http://localhost:8080/categories/${uid}`;

      const response = await fetch(url, {
    credentials: 'include'  // ← add this
     });
      const data = await response.json();
      
      // Backend returns array directly, not wrapped in an object
      if (Array.isArray(data)) {
        console.log('✅ Received array with', data.length, 'categories');
        setAllCategories(data);
        updateStats(data);
      } else if (data.success && data.categories) {
        // Fallback: if backend changes to return {success, categories}
        console.log('✅ Received object with categories array');
        setAllCategories(data.categories);
        updateStats(data.categories);
      } else {
        console.error('❌ Unexpected response format:', data);
        setAllCategories([]);
      }
    } catch (error) {
      console.error('❌ Error fetching categories:', error);
      alert('Failed to fetch categories. Error: ' + error.message);
      setAllCategories([]);
    }
  };

  const applyFilter = () => {
    if (filterType === 'All') {
      setCategories(allCategories);
    } else {
      const filtered = allCategories.filter(c => c.type === filterType);
      setCategories(filtered);
    }
  };

  const updateStats = (categoriesData) => {
    const total = categoriesData.length;
    const income = categoriesData.filter(c => c.type === 'Income').length;
    const expense = categoriesData.filter(c => c.type === 'Expense').length;

    setStats({ total, income, expense });
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8080/categories/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          uid: uid,
          name: formData.name,
          description: formData.description,
          iconUrl: formData.iconUrl,
          type: formData.type
        })
      });

      const data = await response.json();
      console.log('Add category response:', data);

      // Handle both response formats
      if (data.success || response.ok) {
        alert('Category added successfully!');
        setShowAddModal(false);
        resetForm();
        await fetchCategories();
      } else {
        alert(data.message || 'Failed to add category');
      }
    } catch (error) {
      console.error('Error adding category:', error);
      alert('Failed to add category');
    }
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8080/categories/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          cid: selectedCategory.cid,
          uid: uid,
          name: formData.name,
          description: formData.description,
          iconUrl: formData.iconUrl,
          type: formData.type
        })
      });

      const data = await response.json();

      if (data.success || response.ok) {
        alert('Category updated successfully!');
        setShowEditModal(false);
        resetForm();
        await fetchCategories();
      } else {
        alert(data.message || 'Failed to update category');
      }
    } catch (error) {
      console.error('Error updating category:', error);
      alert('Failed to update category');
    }
  };

  const handleDeleteCategory = async (cid) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        const response = await fetch(
          `http://localhost:8080/categories/${cid}/user/${uid}`,
          { method: 'DELETE',
            credentials: 'include'
           }
        );

        const data = await response.json();

        if (data.success || response.ok) {
          alert('Category deleted successfully!');
          await fetchCategories();
        } else {
          alert(data.message || 'Failed to delete category');
        }
      } catch (error) {
        console.error('Error deleting category:', error);
        alert('Failed to delete category');
      }
    }
  };

  const openEditModal = (category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      iconUrl: category.iconUrl || '',
      type: category.type
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      iconUrl: '',
      type: 'Expense'
    });
    setSelectedCategory(null);
  };

  const getIconDisplay = (iconUrl) => {
    if (!iconUrl) return '📁';
    if (iconUrl.length <= 2) return iconUrl;
    return <img src={iconUrl} alt="icon" className="category-icon-img" />;
  };

  const handleFilterChange = (type) => {
    setFilterType(type);
  };

  return (
    <div className="categories-page">
      <div className="container">
        {/* Header */}
        <div className="header">
          <h1 className="header-title">💰 My Expenses</h1>
          <div className="header-buttons">
            <button className="btn btn-success" onClick={() => setShowExpenseModal(true)}>
              <span>+</span> Add Expense
            </button>
            <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
              <span>+</span> Add Category
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="stats-bar">
          <div className="stat-item">
            <div className="stat-label">Total Categories</div>
            <div className="stat-value">{stats.total}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Income Categories</div>
            <div className="stat-value">{stats.income}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Expense Categories</div>
            <div className="stat-value">{stats.expense}</div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="filter-tabs">
          <button
            className={`tab ${filterType === 'All' ? 'active' : ''}`}
            onClick={() => handleFilterChange('All')}
          >
            All Categories
          </button>
          <button
            className={`tab ${filterType === 'Income' ? 'active' : ''}`}
            onClick={() => handleFilterChange('Income')}
          >
            Income
          </button>
          <button
            className={`tab ${filterType === 'Expense' ? 'active' : ''}`}
            onClick={() => handleFilterChange('Expense')}
          >
            Expenses
          </button>
        </div>

        {/* Categories Grid */}
        {categories.length > 0 ? (
          <div className="categories-grid">
            {categories.map((category) => (
              <div key={category.cid} className="category-card">
                <div className="category-header">
                  <div className="category-info">
                    <div className="category-icon">
                      {getIconDisplay(category.iconUrl)}
                    </div>
                    <div className="category-details">
                      <h3>{category.name}</h3>
                      <span className={`category-type type-${category.type?.toLowerCase() || 'expense'}`}>
                        {category.type || 'Expense'}
                      </span>
                    </div>
                  </div>
                  <div className="category-actions">
                    <button
                      className="icon-btn"
                      onClick={() => openEditModal(category)}
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      className="icon-btn"
                      onClick={() => handleDeleteCategory(category.cid)}
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <p className="category-description">
                  {category.description || 'No description'}
                </p>
                <div className="category-footer">
                  <button
                    className="add-expense-btn"
                    onClick={() => {
                      setSelectedCategory(category);
                      setShowExpenseModal(true);
                    }}
                  >
                    Add {category.type || 'Expense'} to this Category
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">📂</div>
            <h3>No categories yet</h3>
            <p>
              {filterType === 'All'
                ? 'Create your first category to get started!'
                : `No ${filterType} categories found. Create one!`}
            </p>
          </div>
        )}
      </div>

      {/* Add Category Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Category</h2>
            </div>
            <form onSubmit={handleAddCategory}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Category Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Salary, Food, Shopping"
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Optional description"
                    rows="3"
                  />
                </div>
                <div className="form-group">
                  <label>Icon (Emoji or URL)</label>
                  <input
                    type="text"
                    value={formData.iconUrl}
                    onChange={(e) => setFormData({ ...formData, iconUrl: e.target.value })}
                    placeholder="e.g., 🍕 or https://example.com/icon.png"
                  />
                  <div className="form-hint">
                    You can use emojis like 💰 🍔 🏠 or image URLs
                  </div>
                </div>
                <div className="form-group">
                  <label>Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    required
                  >
                    <option value="Expense">Expense</option>
                    <option value="Income">Income</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Category</h2>
            </div>
            <form onSubmit={handleUpdateCategory}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Category Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows="3"
                  />
                </div>
                <div className="form-group">
                  <label>Icon (Emoji or URL)</label>
                  <input
                    type="text"
                    value={formData.iconUrl}
                    onChange={(e) => setFormData({ ...formData, iconUrl: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    required
                  >
                    <option value="Expense">Expense</option>
                    <option value="Income">Income</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowEditModal(false);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Update Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Expense Modal Placeholder */}
      {showExpenseModal && (
        <div className="modal-overlay" onClick={() => setShowExpenseModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add {selectedCategory ? selectedCategory.type : 'Expense/Income'}</h2>
            </div>
            <div className="modal-body">
              <p style={{ color: '#718096', textAlign: 'center', padding: '40px 0' }}>
                {selectedCategory
                  ? `Adding ${selectedCategory.type?.toLowerCase() || 'expense'} to: ${selectedCategory.name}`
                  : 'Expense/Income form will go here'}
              </p>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setShowExpenseModal(false);
                  setSelectedCategory(null);
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesPage;