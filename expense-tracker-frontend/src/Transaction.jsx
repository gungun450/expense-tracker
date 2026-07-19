import React, { useState, useEffect, useCallback } from "react";
import "./Transaction.css";
import { useAuth } from "./AuthContext";

const API_BASE = "http://localhost:8080";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount ?? 0);

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

// helper — handles both camelCase and PascalCase from backend
const getType     = (t) => t.categoryType || t.CategoryType || "";
const getName     = (t) => t.categoryName  || t.CategoryName  || "—";

export default function TransactionsPage() {
  const { user: authUser } = useAuth();
  const uid = authUser?.uid;

  const [transactions,  setTransactions]  = useState([]);
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState(null);
  const [totalRecords,  setTotalRecords]  = useState(0);
  const [stats,         setStats]         = useState({ income: 0, expense: 0, net: 0 });

  // ── Filters ──
  const [typeFilter,    setTypeFilter]    = useState("All");
  const [searchInput,   setSearchInput]   = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [startDate,     setStartDate]     = useState("");
  const [endDate,       setEndDate]       = useState("");

  // ── Sort ──
  const [sortCol, setSortCol] = useState("dateOfTransaction");
  const [sortDir, setSortDir] = useState("DESC");

  // ── Pagination ──
  const [page,    setPage]    = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [hasMore, setHasMore] = useState(true);

  // ── Build params (with pagination) ──
  const buildParams = useCallback(() => {
    const p = new URLSearchParams();
    p.set("uid", uid);
    if (appliedSearch)        p.set("category",  appliedSearch);
    if (typeFilter !== "All") p.set("type",       typeFilter);
    if (startDate)            p.set("start",      startDate);
    if (endDate)              p.set("end",        endDate);
    p.set("column",              sortCol);
    p.set("direction",           sortDir);
    p.set("pageNumber",          page);
    p.set("NoOfRecordsPerPage",  perPage);
    return p.toString();
  }, [uid, appliedSearch, typeFilter, startDate, endDate, sortCol, sortDir, page, perPage]);

  // ── Build params (no pagination — for total count) ──
  const buildParamsNoPage = useCallback(() => {
    const p = new URLSearchParams();
    p.set("uid", uid);                              // FIX: uid was missing here
    if (appliedSearch)        p.set("category",  appliedSearch);
    if (typeFilter !== "All") p.set("type",       typeFilter);
    if (startDate)            p.set("start",      startDate);
    if (endDate)              p.set("end",        endDate);
    p.set("column",    sortCol);
    p.set("direction", sortDir);
    return p.toString();
  }, [uid, appliedSearch, typeFilter, startDate, endDate, sortCol, sortDir]);

  // ── Fetch paginated transactions ──
  const fetchTransactions = useCallback(async () => {
    if (!uid) return;
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch(`${API_BASE}/api/transactions?${buildParams()}`, { credentials: "include" });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      setTransactions(list);
      setHasMore(list.length >= perPage);

      // FIX: use lowercase field names first, fallback to PascalCase
      const income  = list.filter(t => getType(t) === "Income" ).reduce((s, t) => s + t.amount, 0);
      const expense = list.filter(t => getType(t) === "Expense").reduce((s, t) => s + t.amount, 0);
      setStats({ income, expense, net: income - expense });
    } catch (e) {
      setError(e.message);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [buildParams, uid, perPage]);

  // ── Fetch total count ──
  useEffect(() => {
    if (!uid) return;
    (async () => {
      try {
        const res  = await fetch(`${API_BASE}/api/transactions?${buildParamsNoPage()}`, { credentials: "include" });
        if (!res.ok) return;
        const data = await res.json();
        setTotalRecords(Array.isArray(data) ? data.length : 0);
      } catch (_) {}
    })();
  }, [buildParamsNoPage, uid]);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  // ── Handlers ──
  const resetPage = () => setPage(1);

  const handleSearch = () => { setAppliedSearch(searchInput.trim()); resetPage(); };
  const handleKeyDown = (e) => { if (e.key === "Enter") handleSearch(); };

  const handleReset = () => {
    setTypeFilter("All"); setSearchInput(""); setAppliedSearch("");
    setStartDate(""); setEndDate("");
    setSortCol("dateOfTransaction"); setSortDir("DESC");
    setPage(1);
  };

  const totalPages = Math.ceil(totalRecords / perPage) || 1;

  return (
    <div className="transactions-page">
      <div className="container">

        {/* ── Header ── */}
        <div className="header">
          <div>
            <h1 className="header-title">My Transactions</h1>
            <p className="header-subtitle">Track and manage all your income & expenses</p>
          </div>
          <button className="btn btn-ghost" onClick={handleReset}>↺ Reset Filters</button>
        </div>

        {/* ── Stats Bar ── */}
        <div className="stats-bar">
          <div className="stat-item stat-total">
            <div className="stat-icon">📋</div>
            <div className="stat-label">Total Records</div>
            <div className="stat-value">{totalRecords}</div>
          </div>
          <div className="stat-item stat-income-card">
            <div className="stat-icon">📈</div>
            <div className="stat-label">Income (this page)</div>
            <div className="stat-value income">{formatCurrency(stats.income)}</div>
          </div>
          <div className="stat-item stat-expense-card">
            <div className="stat-icon">📉</div>
            <div className="stat-label">Expense (this page)</div>
            <div className="stat-value expense">{formatCurrency(stats.expense)}</div>
          </div>
          <div className="stat-item stat-net-card">
            <div className="stat-icon">💰</div>
            <div className="stat-label">Net (this page)</div>
            <div className={`stat-value ${stats.net >= 0 ? "net-pos" : "net-neg"}`}>
              {formatCurrency(stats.net)}
            </div>
          </div>
        </div>

        {/* ── Filter Panel ── */}
        <div className="filter-panel">
          <p className="filter-panel-title">Filter &amp; Sort</p>
          <div className="filter-grid">

            <div className="filter-group">
              <label className="filter-label">Search by Category</label>
              <div className="search-input-row">
                <input
                  className="form-input"
                  placeholder="e.g. Food, Salary…"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <button className="btn btn-primary" onClick={handleSearch}>Search</button>
              </div>
            </div>

            <div className="filter-group">
              <label className="filter-label">From Date</label>
              <input type="date" className="form-input" value={startDate}
                onChange={(e) => { setStartDate(e.target.value); resetPage(); }} />
            </div>

            <div className="filter-group">
              <label className="filter-label">To Date</label>
              <input type="date" className="form-input" value={endDate}
                onChange={(e) => { setEndDate(e.target.value); resetPage(); }} />
            </div>

            <div className="filter-group">
              <label className="filter-label">Sort By</label>
              <select className="form-select" value={sortCol}
                onChange={(e) => { setSortCol(e.target.value); resetPage(); }}>
                <option value="dateOfTransaction">Date</option>
                <option value="amount">Amount</option>
                <option value="name">Category Name</option>
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Order</label>
              <select className="form-select" value={sortDir}
                onChange={(e) => { setSortDir(e.target.value); resetPage(); }}>
                <option value="DESC">Newest First</option>
                <option value="ASC">Oldest First</option>
              </select>
            </div>

          </div>
        </div>

        {/* ── Type Tabs ── */}
        <div className="filter-tabs">
          {["All", "Income", "Expense"].map((t) => (
            <button key={t}
              className={`tab ${typeFilter === t ? "active" : ""}`}
              onClick={() => { setTypeFilter(t); resetPage(); }}>
              {t === "All" ? "All" : t === "Income" ? "📈 Income" : "📉 Expense"}
            </button>
          ))}
        </div>

        {error && <div className="error-banner">⚠️ {error} — Make sure you are logged in.</div>}

        {/* ── Table ── */}
        <div className="table-card">
          <div className="table-card-header">
            <span className="table-card-title">Transaction Records</span>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span className="table-meta">Page {page} of {totalPages}</span>
              <select className="per-page-select" value={perPage}
                onChange={(e) => { setPerPage(Number(e.target.value)); resetPage(); }}>
                {[5, 10, 20, 50].map(n => <option key={n} value={n}>{n} / page</option>)}
              </select>
            </div>
          </div>

          <div className="table-wrapper">
            {loading && (
              <div className="loading-overlay">
                <div className="spinner" />
                <span className="loading-text">Loading…</span>
              </div>
            )}
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {!loading && transactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: 0, border: "none" }}>
                      <div className="empty-state">
                        <div className="empty-icon">🗂️</div>
                        <h3>No transactions found</h3>
                        <p>Try adjusting your filters or add a new transaction.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  transactions.map((t, i) => {
                    const type = getType(t);
                    const isIncome = type === "Income";
                    return (
                      <tr key={t.Tid || t.tid || i}>
                        <td className="td-num">{(page - 1) * perPage + i + 1}</td>
                        <td>
                          <span className="category-pill">{getName(t)}</span>
                        </td>
                        <td>
                          <span className={`type-badge ${isIncome ? "type-income" : "type-expense"}`}>
                            {isIncome ? "↑" : "↓"}&nbsp;{type || "—"}
                          </span>
                        </td>
                        <td className={isIncome ? "amount-income" : "amount-expense"}>
                          {formatCurrency(t.amount)}
                        </td>
                        <td className="td-date">{formatDate(t.dateOfTransaction)}</td>
                        <td className={`td-notes ${!t.notes ? "empty" : ""}`}>
                          {t.notes || "No notes"}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* ── Pagination ── */}
          <div className="pagination-row">
            <span className="pagination-info">
              Showing {transactions.length === 0 ? 0 : (page - 1) * perPage + 1}–{(page - 1) * perPage + transactions.length} of {totalRecords} records
            </span>
            <div className="pagination-controls">
              <button className="page-btn" disabled={page === 1} onClick={() => setPage(1)}>«</button>
              <button className="page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹ Prev</button>
              <span className="page-btn active">{page}</span>
              <button className="page-btn" disabled={!hasMore} onClick={() => setPage(p => p + 1)}>Next ›</button>
              <button className="page-btn" disabled={!hasMore} onClick={() => setPage(totalPages)}>»</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}