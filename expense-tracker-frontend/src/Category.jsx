import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "./AuthContext";
import "./Category.css";

const CategoriesPage = () => {
  const { user: authUser } = useAuth();
  const uid = authUser?.uid;

  const [categories,      setCategories]      = useState([]);
  const [allCategories,   setAllCategories]   = useState([]);
  const [showAddModal,    setShowAddModal]    = useState(false);
  const [showEditModal,   setShowEditModal]   = useState(false);
  const [showExpenseModal,setShowExpenseModal]= useState(false);
  const [showBulkModal,   setShowBulkModal]   = useState(false);
  const [selectedCategory,setSelectedCategory]= useState(null);
  const [filterType,      setFilterType]      = useState("All");
  const [stats,           setStats]           = useState({ total: 0, income: 0, expense: 0 });
  const [formData,        setFormData]        = useState({ name: "", description: "", iconUrl: "", type: "Expense" });

  // Bulk upload state
  const [bulkFile,      setBulkFile]      = useState(null);
  const [bulkErrors,    setBulkErrors]    = useState([]);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [bulkSuccess,   setBulkSuccess]   = useState(false);
  const [dragOver,      setDragOver]      = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => { if (uid) fetchCategories(); }, [uid]);
  useEffect(() => { applyFilter(); }, [filterType, allCategories]);

  const fetchCategories = async () => {
    try {
      const res  = await fetch(`http://localhost:8080/categories/${uid}`, { credentials: "include" });
      const data = await res.json();
      const list = Array.isArray(data) ? data : (data.categories || []);
      setAllCategories(list);
      updateStats(list);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setAllCategories([]);
    }
  };

  const applyFilter = () =>
    setCategories(filterType === "All" ? allCategories : allCategories.filter(c => c.type === filterType));

  const updateStats = (list) => setStats({
    total:   list.length,
    income:  list.filter(c => c.type === "Income").length,
    expense: list.filter(c => c.type === "Expense").length,
  });

  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      const res  = await fetch("http://localhost:8080/categories/add", {
        method: "POST", headers: { "Content-Type": "application/json" },
        credentials: "include", body: JSON.stringify({ uid, ...formData }),
      });
      const data = await res.json();
      if (data.success || res.ok) { setShowAddModal(false); resetForm(); await fetchCategories(); }
      else alert(data.message || "Failed to add category");
    } catch { alert("Failed to add category"); }
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    try {
      const res  = await fetch("http://localhost:8080/categories/update", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        credentials: "include", body: JSON.stringify({ Cid: selectedCategory.Cid, Uid: uid, ...formData }),
      });
      const data = await res.json();
      if (data.success || res.ok) { setShowEditModal(false); resetForm(); await fetchCategories(); }
      else alert(data.message || "Failed to update category");
    } catch { alert("Failed to update category"); }
  };

  const handleDeleteCategory = async (Cid) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      const res  = await fetch(`http://localhost:8080/categories/${Cid}/delete/${uid}`, { method: "PATCH", credentials: "include" });
      const data = await res.json();
      if (data.success || res.ok) await fetchCategories();
      else alert(data.message || "Failed to delete category");
    } catch { alert("Failed to delete category"); }
  };

  const openEditModal = (cat) => {
    setSelectedCategory(cat);
    setFormData({ name: cat.name, description: cat.description || "", iconUrl: cat.iconUrl || "", type: cat.type });
    setShowEditModal(true);
  };

  const resetForm = () => { setFormData({ name: "", description: "", iconUrl: "", type: "Expense" }); setSelectedCategory(null); };

  const getIconDisplay = (iconUrl) => {
    if (!iconUrl) return "📁";
    if (iconUrl.length <= 2) return iconUrl;
    return <img src={iconUrl} alt="icon" className="category-icon-img" />;
  };

  // ── Bulk upload ──
  const handleFileSelect = (file) => { if (!file) return; setBulkFile(file); setBulkErrors([]); setBulkSuccess(false); };
  const handleDrop = (e) => { e.preventDefault(); setDragOver(false); handleFileSelect(e.dataTransfer.files[0]); };

  const handleBulkUpload = async () => {
    if (!bulkFile) return;
    setBulkUploading(true); setBulkErrors([]); setBulkSuccess(false);
    const fd = new FormData();
    fd.append("file", bulkFile); fd.append("uid", uid);
    try {
      const res  = await fetch("http://localhost:8080/api/transactions/bulk-upload", { method: "POST", credentials: "include", body: fd });
      const data = await res.json();
      if (res.ok) {
        const hasErrors = data.some(row => row.error?.length > 0);
        if (hasErrors) { setBulkErrors(data); }
        else           { setBulkSuccess(true); await fetchCategories(); }
      } else { setBulkErrors([{ error: [data.message || "Upload failed."] }]); }
    } catch { setBulkErrors([{ error: ["Could not reach the server."] }]); }
    finally { setBulkUploading(false); }
  };

  const resetBulkModal = () => { setBulkFile(null); setBulkErrors([]); setBulkSuccess(false); setDragOver(false); };

  // ── Shared form fields ──
  const CategoryForm = ({ onSubmit, submitLabel }) => (
    <form onSubmit={onSubmit}>
      <div className="modal-body">
        <div className="form-group">
          <label>Category Name *</label>
          <input type="text" required placeholder="e.g. Salary, Food, Shopping"
            value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea rows="3" placeholder="Optional description"
            value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Icon <span className="form-hint-inline">(emoji or image URL)</span></label>
          <input type="text" placeholder="e.g. 🍕 or https://…/icon.png"
            value={formData.iconUrl} onChange={e => setFormData({ ...formData, iconUrl: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Type *</label>
          <div className="type-toggle">
            {["Expense", "Income"].map(t => (
              <button key={t} type="button"
                className={`type-toggle-btn ${formData.type === t ? (t === "Income" ? "active-income" : "active-expense") : ""}`}
                onClick={() => setFormData({ ...formData, type: t })}>
                {t === "Income" ? "📈 Income" : "📉 Expense"}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="modal-footer">
        <button type="button" className="btn btn-secondary"
          onClick={() => { setShowAddModal(false); setShowEditModal(false); resetForm(); }}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">{submitLabel}</button>
      </div>
    </form>
  );

  return (
    <div className="categories-page">
      <div className="container">

        {/* ── Header ── */}
        <div className="header">
          <div>
            <h1 className="header-title">Categories</h1>
            <p className="header-subtitle">Organise your income and expense types</p>
          </div>
          <div className="header-buttons">
            <button className="btn btn-outline" onClick={() => setShowBulkModal(true)}>⬆ Bulk Upload</button>
            <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>+ Add Category</button>
          </div>
        </div>

        {/* ── Stats Bar ── */}
        <div className="stats-bar">
          <div className="stat-item">
            <div className="stat-icon">🗂️</div>
            <div className="stat-label">Total</div>
            <div className="stat-value">{stats.total}</div>
          </div>
          <div className="stat-item stat-income-card">
            <div className="stat-icon">📈</div>
            <div className="stat-label">Income</div>
            <div className="stat-value income">{stats.income}</div>
          </div>
          <div className="stat-item stat-expense-card">
            <div className="stat-icon">📉</div>
            <div className="stat-label">Expense</div>
            <div className="stat-value expense">{stats.expense}</div>
          </div>
        </div>

        {/* ── Filter Tabs ── */}
        <div className="filter-tabs">
          {["All", "Income", "Expense"].map(type => (
            <button key={type} className={`tab ${filterType === type ? "active" : ""}`}
              onClick={() => setFilterType(type)}>
              {type === "All" ? "All Categories" : type === "Income" ? "📈 Income" : "📉 Expense"}
            </button>
          ))}
        </div>

        {/* ── Grid ── */}
        {categories.length > 0 ? (
          <div className="categories-grid">
            {categories.map(cat => (
              <div key={cat.Cid} className="category-card">
                <div className="category-card-top">
                  <div className="category-icon-wrap">{getIconDisplay(cat.iconUrl)}</div>
                  <div className="category-card-actions">
                    <button className="icon-btn" onClick={() => openEditModal(cat)} title="Edit">✏️</button>
                    <button className="icon-btn icon-btn-danger" onClick={() => handleDeleteCategory(cat.Cid)} title="Delete">🗑️</button>
                  </div>
                </div>
                <div className="category-card-body">
                  <h3 className="category-name">{cat.name}</h3>
                  <span className={`category-badge ${cat.type === "Income" ? "badge-income" : "badge-expense"}`}>
                    {cat.type === "Income" ? "↑" : "↓"} {cat.type}
                  </span>
                  <p className="category-desc">{cat.description || "No description"}</p>
                </div>
                <div className="category-card-footer">
                  <button className="add-expense-btn"
                    onClick={() => { setSelectedCategory(cat); setShowExpenseModal(true); }}>
                    + Add {cat.type} entry
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📂</div>
            <h3>No categories yet</h3>
            <p>{filterType === "All" ? "Create your first category to get started!" : `No ${filterType} categories found.`}</p>
            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setShowAddModal(true)}>
              + Add Category
            </button>
          </div>
        )}
      </div>

      {/* ── Bulk Upload Modal ── */}
      {showBulkModal && (
        <div className="modal-overlay" onClick={() => { setShowBulkModal(false); resetBulkModal(); }}>
          <div className="modal modal-bulk" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>⬆ Bulk Upload</h2>
                <p className="modal-subtitle">Upload a CSV or text file — validation handled by server</p>
              </div>
              <button className="btn-close" onClick={() => { setShowBulkModal(false); resetBulkModal(); }}>✕</button>
            </div>
            <div className="modal-body">
              {!bulkSuccess && (
                <div className={`drop-zone ${dragOver ? "drag-over" : ""} ${bulkFile ? "has-file" : ""}`}
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}>
                  <input ref={fileInputRef} type="file" accept=".csv,.txt" style={{ display: "none" }}
                    onChange={e => handleFileSelect(e.target.files[0])} />
                  {bulkFile ? (
                    <div className="drop-zone-file">
                      <span className="dz-icon">📄</span>
                      <span className="dz-filename">{bulkFile.name}</span>
                      <span className="dz-change">Click to change</span>
                    </div>
                  ) : (
                    <div className="drop-zone-empty">
                      <span className="dz-icon">📂</span>
                      <span className="dz-text">Drag & drop your file here</span>
                      <span className="dz-sub">or click to browse · .csv or .txt</span>
                    </div>
                  )}
                </div>
              )}
              {bulkErrors.length > 0 && (
                <div className="bulk-errors">
                  <strong>⚠ Issues found:</strong>
                  <div className="bulk-error-list">
                    {bulkErrors.map((row, i) => row.error?.length > 0 && (
                      <div key={i} className="bulk-error-item">
                        <span className="error-row-num">Row {i + 2}:</span>
                        <ul>{row.error.map((msg, j) => <li key={j}>{msg}</li>)}</ul>
                        <div className="error-row-data">Data: {row.name || "N/A"} | {row.amount} | {row.category}</div>
                      </div>
                    ))}
                  </div>
                  <p className="bulk-errors-hint">Fix these rows and try again.</p>
                </div>
              )}
              {bulkSuccess && (
                <div className="bulk-result">
                  <div className="bulk-result-icon">🎉</div>
                  <strong>Uploaded successfully!</strong>
                  <button className="btn btn-outline" onClick={resetBulkModal}>Upload Another</button>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => { setShowBulkModal(false); resetBulkModal(); }}>Cancel</button>
              {!bulkSuccess && (
                <button className="btn btn-primary" onClick={handleBulkUpload} disabled={!bulkFile || bulkUploading}>
                  {bulkUploading ? "Uploading…" : "Upload"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Add Modal ── */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => { setShowAddModal(false); resetForm(); }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>Add New Category</h2></div>
            <CategoryForm onSubmit={handleAddCategory} submitLabel="Add Category" />
          </div>
        </div>
      )}

      {/* ── Edit Modal ── */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => { setShowEditModal(false); resetForm(); }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>Edit Category</h2></div>
            <CategoryForm onSubmit={handleUpdateCategory} submitLabel="Save Changes" />
          </div>
        </div>
      )}

      {/* ── Add Expense Modal (placeholder) ── */}
      {showExpenseModal && (
        <div className="modal-overlay" onClick={() => setShowExpenseModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add {selectedCategory?.type || "Entry"}</h2>
            </div>
            <div className="modal-body">
              <p style={{ color: "#94a3b8", textAlign: "center", padding: "40px 0" }}>
                {selectedCategory ? `Adding to: ${selectedCategory.name}` : "Form coming soon"}
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => { setShowExpenseModal(false); setSelectedCategory(null); }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesPage;