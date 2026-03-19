import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "./AuthContext";
import "./Category.css";

const CategoriesPage = () => {
  const { user: authUser } = useAuth();
  const uid = authUser?.uid;

  const [categories, setCategories] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [filterType, setFilterType] = useState("All");
  const [stats, setStats] = useState({ total: 0, income: 0, expense: 0 });
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    iconUrl: "",
    type: "Expense",
  });

  // Bulk upload state
  const [bulkFile, setBulkFile] = useState(null);
  const [bulkErrors, setBulkErrors] = useState([]);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [bulkSuccess, setBulkSuccess] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (uid) fetchCategories();
  }, [uid]);

  useEffect(() => {
    applyFilter();
  }, [filterType, allCategories]);

  const fetchCategories = async () => {
    try {
      const url = `http://localhost:8080/categories/${uid}`;
      const response = await fetch(url, { credentials: "include" });
      const data = await response.json();

      // const data = await response.json();
      console.log("Category fields:", data[0]); // ← what is the id field called?

      if (Array.isArray(data)) {
        setAllCategories(data);
        updateStats(data);
      } else if (data.success && data.categories) {
        setAllCategories(data.categories);
        updateStats(data.categories);
      } else {
        setAllCategories([]);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      alert("Failed to fetch categories. Error: " + error.message);
      setAllCategories([]);
    }
  };

  const applyFilter = () => {
    if (filterType === "All") {
      setCategories(allCategories);
    } else {
      setCategories(allCategories.filter((c) => c.type === filterType));
    }
  };

  const updateStats = (categoriesData) => {
    setStats({
      total: categoriesData.length,
      income: categoriesData.filter((c) => c.type === "Income").length,
      expense: categoriesData.filter((c) => c.type === "Expense").length,
    });
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8080/categories/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ uid, ...formData }),
      });
      const data = await response.json();
      if (data.success || response.ok) {
        alert("Category added successfully!");
        setShowAddModal(false);
        resetForm();
        await fetchCategories();
      } else {
        alert(data.message || "Failed to add category");
      }
    } catch (error) {
      alert("Failed to add category");
    }
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8080/categories/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          Cid: selectedCategory.Cid,
          Uid: uid,
          ...formData,
        }),
      });
      const data = await response.json();
      if (data.success || response.ok) {
        alert("Category updated successfully!");
        setShowEditModal(false);
        resetForm();
        await fetchCategories();
      } else {
        alert(data.message || "Failed to update category");
      }
    } catch (error) {
      alert("Failed to update category");
    }
  };

  const handleDeleteCategory = async (Cid) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        const response = await fetch(
          `http://localhost:8080/categories/${Cid}/delete/${uid}`,
          {
            method: "PATCH",
            credentials: "include",
          },
        );
        const data = await response.json();
        if (data.success || response.ok) {
          alert("Category deleted successfully!");
          await fetchCategories();
        } else {
          alert(data.message || "Failed to delete category");
        }
      } catch (error) {
        alert("Failed to delete category");
      }
    }
  };

  const openEditModal = (category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
      iconUrl: category.iconUrl || "",
      type: category.type,
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({ name: "", description: "", iconUrl: "", type: "Expense" });
    setSelectedCategory(null);
  };

  const getIconDisplay = (iconUrl) => {
    if (!iconUrl) return "📁";
    if (iconUrl.length <= 2) return iconUrl;
    return <img src={iconUrl} alt="icon" className="category-icon-img" />;
  };

  // ─── Bulk Upload ──────────────────────────────────────────────────────────
  const handleFileSelect = (file) => {
    if (!file) return;
    setBulkFile(file);
    setBulkErrors([]);
    setBulkSuccess(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files[0]);
  };

  // src/Category.jsx

  const handleBulkUpload = async () => {
    if (!bulkFile) return;
    setBulkUploading(true);
    setBulkErrors([]); // We will store the full result array here
    setBulkSuccess(false);

    const fd = new FormData();
    fd.append("file", bulkFile);
    fd.append("uid", uid);

    try {
      const response = await fetch(
        "http://localhost:8080/api/transactions/bulk-upload",
        {
          method: "POST",
          credentials: "include",
          body: fd,
        },
      );

      const data = await response.json(); // This is the List<ResponseBulkUploadModel>

      if (response.ok) {
        // Check if ANY row in the returned list has an error
        const hasAnyErrors = data.some(
          (row) => row.error && row.error.length > 0,
        );

        if (hasAnyErrors) {
          setBulkErrors(data); // Store the whole array to show per-row errors
          setBulkSuccess(false);
        } else {
          setBulkSuccess(true);
          await fetchCategories();
        }
      } else {
        setBulkErrors([{ error: [data.message || "Upload failed."] }]);
      }
    } catch (err) {
      setBulkErrors([{ error: ["Could not reach the server."] }]);
    } finally {
      setBulkUploading(false);
    }
  };

  const resetBulkModal = () => {
    setBulkFile(null);
    setBulkErrors([]);
    setBulkSuccess(false);
    setDragOver(false);
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="categories-page">
      <div className="container">
        {/* Header */}
        <div className="header">
          <h1 className="header-title">💰 My Expenses</h1>
          <div className="header-buttons">
            <button
              className="btn btn-success"
              onClick={() => setShowExpenseModal(true)}
            >
              <span>+</span> Add Expense
            </button>
            <button
              className="btn btn-outline"
              onClick={() => setShowBulkModal(true)}
            >
              <span>⬆</span> Bulk Upload
            </button>
            <button
              className="btn btn-primary"
              onClick={() => setShowAddModal(true)}
            >
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
          {["All", "Income", "Expense"].map((type) => (
            <button
              key={type}
              className={`tab ${filterType === type ? "active" : ""}`}
              onClick={() => setFilterType(type)}
            >
              {type === "All" ? "All Categories" : type}
            </button>
          ))}
        </div>

        {/* Categories Grid */}
        {categories.length > 0 ? (
          <div className="categories-grid">
            {categories.map((category) => (
              <div key={category.Cid} className="category-card">
                <div className="category-header">
                  <div className="category-info">
                    <div className="category-icon">
                      {getIconDisplay(category.iconUrl)}
                    </div>
                    <div className="category-details">
                      <h3>{category.name}</h3>
                      <span
                        className={`category-type type-${category.type?.toLowerCase() || "expense"}`}
                      >
                        {category.type || "Expense"}
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
                      onClick={() => handleDeleteCategory(category.Cid)}
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <p className="category-description">
                  {category.description || "No description"}
                </p>
                <div className="category-footer">
                  <button
                    className="add-expense-btn"
                    onClick={() => {
                      setSelectedCategory(category);
                      setShowExpenseModal(true);
                    }}
                  >
                    Add {category.type || "Expense"} to this Category
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
              {filterType === "All"
                ? "Create your first category to get started!"
                : `No ${filterType} categories found. Create one!`}
            </p>
          </div>
        )}
      </div>

      {/* Bulk Upload Modal */}
      {showBulkModal && (
        <div
          className="modal-overlay"
          onClick={() => {
            setShowBulkModal(false);
            resetBulkModal();
          }}
        >
          <div
            className="modal modal-bulk"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header bulk-header">
              <div>
                <h2>⬆ Bulk Upload Categories</h2>
                <p className="bulk-subtitle">
                  Upload a CSV or text file — validation is handled by the
                  server
                </p>
              </div>
              <button
                className="btn-close"
                onClick={() => {
                  setShowBulkModal(false);
                  resetBulkModal();
                }}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              {!bulkSuccess && (
                <div
                  className={`drop-zone ${dragOver ? "drag-over" : ""} ${bulkFile ? "has-file" : ""}`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.txt"
                    style={{ display: "none" }}
                    onChange={(e) => handleFileSelect(e.target.files[0])}
                  />
                  {bulkFile ? (
                    <div className="drop-zone-file">
                      <span className="dz-icon">📄</span>
                      <span className="dz-filename">{bulkFile.name}</span>
                      <span className="dz-change">Click to change file</span>
                    </div>
                  ) : (
                    <div className="drop-zone-empty">
                      <span className="dz-icon">📂</span>
                      <span className="dz-text">
                        Drag & drop your file here
                      </span>
                      <span className="dz-sub">
                        or click to browse · .csv or .txt
                      </span>
                    </div>
                  )}
                </div>
              )}
              {/* Inside the Bulk Upload Modal Body */}
              {bulkErrors.length > 0 && (
                <div className="bulk-errors-container">
                  <strong>⚠ Issues found in your file:</strong>
                  <div className="bulk-error-list">
                    {bulkErrors.map(
                      (row, index) =>
                        // Only show rows that actually have errors
                        row.error &&
                        row.error.length > 0 && (
                          <div key={index} className="bulk-error-item">
                            <span className="error-row-num">
                              Row {index + 2}:
                            </span>
                            <ul>
                              {row.error.map((msg, i) => (
                                <li key={i}>{msg}</li>
                              ))}
                            </ul>
                            <div className="error-row-data">
                              Data: {row.name || "N/A"} | {row.amount} |{" "}
                              {row.category}
                            </div>
                          </div>
                        ),
                    )}
                  </div>
                  <p className="bulk-errors-hint">
                    Please fix these rows and try again.
                  </p>
                </div>
              )}
              {bulkSuccess && (
                <div className="bulk-result">
                  <div className="bulk-result-icon">🎉</div>
                  <strong>Categories uploaded successfully!</strong>
                  <button className="btn btn-outline" onClick={resetBulkModal}>
                    Upload Another File
                  </button>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setShowBulkModal(false);
                  resetBulkModal();
                }}
              >
                Cancel
              </button>
              {!bulkSuccess && (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleBulkUpload}
                  disabled={!bulkFile || bulkUploading}
                >
                  {bulkUploading ? "Uploading..." : "Upload"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

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
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g., Salary, Food, Shopping"
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Optional description"
                    rows="3"
                  />
                </div>
                <div className="form-group">
                  <label>Icon (Emoji or URL)</label>
                  <input
                    type="text"
                    value={formData.iconUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, iconUrl: e.target.value })
                    }
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
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
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
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows="3"
                  />
                </div>
                <div className="form-group">
                  <label>Icon (Emoji or URL)</label>
                  <input
                    type="text"
                    value={formData.iconUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, iconUrl: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
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

      {/* Expense Modal */}
      {showExpenseModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowExpenseModal(false)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                Add{" "}
                {selectedCategory ? selectedCategory.type : "Expense/Income"}
              </h2>
            </div>
            <div className="modal-body">
              <p
                style={{
                  color: "#718096",
                  textAlign: "center",
                  padding: "40px 0",
                }}
              >
                {selectedCategory
                  ? `Adding ${selectedCategory.type?.toLowerCase() || "expense"} to: ${selectedCategory.name}`
                  : "Expense/Income form will go here"}
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
