import React, { useState, useEffect, useCallback } from 'react';
import './Transaction.css';

const API_BASE = 'http://localhost:8080';

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount ?? 0);

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};



const TransactionsPage = () => {
  const [transactions, setTransactions]   = useState([]);
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState(null);

  // ── Filter state ──
  const [typeFilter, setTypeFilter]       = useState('All');   // tab
  const [searchInput, setSearchInput]     = useState('');       // controlled input
  const [appliedSearch, setAppliedSearch] = useState('');       // sent to backend
  const [startDate, setStartDate]         = useState('');
  const [endDate, setEndDate]             = useState('');

  // ── Sort state ──
  const [sortCol, setSortCol]   = useState('dateOfTransaction');
  const [sortDir, setSortDir]   = useState('DESC');

  // ── Pagination ──
  const [page, setPage] = useState(1);
  const perPage = 5;
  const [hasMore, setHasMore] = useState(true);

  // ── Stats (computed from current page data) ──
  const [stats, setStats] = useState({ total: 0, income: 0, expense: 0, net: 0 });
  const [totalRecords, setTotalRecords] = useState(0);

  // ─────────────────────────────────────────────
  // Build query params → all filtering/sorting/pagination done by backend
  // ─────────────────────────────────────────────
  const buildParams = useCallback(() => {
    const p = new URLSearchParams();
    if (appliedSearch)             p.set('category', appliedSearch);
    if (typeFilter !== 'All')      p.set('type', typeFilter);
    if (startDate)                 p.set('start', startDate);
    if (endDate)                   p.set('end', endDate);
    p.set('column', sortCol);
    p.set('direction', sortDir);
    p.set('pageNumber', page);
    p.set('NoOfRecordsPerPage', perPage);
    return p.toString();
  }, [appliedSearch, typeFilter, startDate, endDate, sortCol, sortDir, page, perPage]);

  // using pagination which is returning the values from backend
  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/transactions?${buildParams()}`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      setTransactions(list);
      setHasMore(list.length >= perPage);

      // compute page-level stats
      const income  = list.filter(t => t.CategoryType === 'Income').reduce((s, t) => s + t.amount, 0);
      console.log("Income calculated from transactions:", income);
      const expense = list.filter(t => t.CategoryType === 'Expense').reduce((s, t) => s + t.amount, 0);
      setStats({ total: list.length, income, expense, net: income - expense });
    } catch (e) {
      setError(e.message);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [buildParams]);

  // Fetch total count (no pagination) whenever filters change
  const buildParamsNoPage = useCallback(() => {
    const p = new URLSearchParams();
    if (appliedSearch)        p.set('category', appliedSearch);
    if (typeFilter !== 'All') p.set('type', typeFilter);
    if (startDate)            p.set('start', startDate);
    if (endDate)              p.set('end', endDate);
    p.set('column', sortCol);
    p.set('direction', sortDir);
    return p.toString();
  }, [appliedSearch, typeFilter, startDate, endDate, sortCol, sortDir]);


  // noPage version for total count of records 
  useEffect(() => {
    const fetchTotal = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/transactions?${buildParamsNoPage()}`, {
          credentials: 'include',
        });
        if (!res.ok) return;
        const data = await res.json();
        setTotalRecords(Array.isArray(data) ? data.length : 0);
      } catch (_) {}
    };
    fetchTotal();
  }, [buildParamsNoPage]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Reset to page 1 whenever filters change
  const resetPage = () => setPage(1);

  const handleSearch = () => {
    setAppliedSearch(searchInput.trim());
    resetPage();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleTypeTab = (t) => {
    setTypeFilter(t);
    resetPage();
  };


  const handleReset = () => {
    setTypeFilter('All');
    setSearchInput('');
    setAppliedSearch('');
    setStartDate('');
    setEndDate('');
    setSortCol('dateOfTransaction');
    setSortDir('DESC');
    setPage(1);
  };


  return (
    <div className="transactions-page">
      <div className="container">

        {/* ── Header ── */}
        <div className="header">
          <h1 className="header-title">💳 My Transactions</h1>
          <div className="header-buttons">
            <button className="btn btn-ghost" onClick={handleReset}>
              ↺ Reset Filters
            </button>
          </div>
        </div>

        {/* ── Stats Bar ── */}
        <div className="stats-bar">
          <div className="stat-item">📋
            <span className="stat-label">Total Records</span>
            <span className="stat-value">{totalRecords}</span>
          </div>
          <div className="stat-item">📈
            <span className="stat-label">Income</span>
            <span className="stat-value income">{formatCurrency(stats.income)}</span>
          </div>
          <div className="stat-item">📉
            <span className="stat-label">Expense</span>
            <span className="stat-value expense">{formatCurrency(stats.expense)}</span>
          </div>
          <div className="stat-item">💰
            <span className="stat-label">Net</span>
            <span className={`stat-value ${stats.net >= 0 ? 'net-pos' : 'net-neg'}`}>
              {formatCurrency(stats.net)}
            </span>
          </div>
        </div>

        {/* ── Filter Panel ── */}
        <div className="filter-panel">
          <p className="filter-panel-title">🔍 Filter &amp; Sort</p>

          <div className="filter-grid">
            {/* Search */}
            <div className="filter-group">
              <label className="filter-label">Search by Category</label>
              <div className="search-input-row">
                <input
                  className="form-input"
                  placeholder="e.g. Food, Salary, Shopping..."
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <button className="btn btn-primary" style={{ whiteSpace: 'nowrap' }} onClick={handleSearch}>
                  Search
                </button>
              </div>
            </div>

            {/* From date */}
            <div className="filter-group">
              <label className="filter-label">From Date</label>
              <input
                type="text"
                className="form-input"
                placeholder="yyyy-mm-dd"
                pattern="\d{4}-\d{2}-\d{2}"
                maxLength={10}
                value={startDate}
                onChange={e => {
                  setStartDate(e.target.value);
                  if (/^\d{4}-\d{2}-\d{2}$/.test(e.target.value)) resetPage();
                }}
              />
            </div>

            {/* To date */}
             <div className="filter-group">
              <label className="filter-label">To Date</label>
              <input
                type="text"
                className="form-input"
                placeholder="yyyy-mm-dd"
                pattern="\d{4}-\d{2}-\d{2}"
                maxLength={10}
                value={endDate}
               onChange={e => {
                  setEndDate(e.target.value);
                  if (/^\d{4}-\d{2}-\d{2}$/.test(e.target.value)) resetPage();
                }}
              />
            </div>

            {/* Sort column */}
            <div className="filter-group">
              <label className="filter-label">Sort By</label>
              <select
                className="form-select"
                value={sortCol}
                onChange={e => { setSortCol(e.target.value); resetPage(); }}>
                <option value="name">Name </option>
                <option value="amount">Amount</option>
                <option value="dateOfTransaction">Date</option>
              </select>
            </div>

            {/* Sort direction */}
            <div className="filter-group">
              <label className="filter-label">Order</label>
              <select
                className="form-select"
                value={sortDir}
                onChange={e => { setSortDir(e.target.value); resetPage(); }}>
                <option value="DESC"> Descending </option>
                <option value="ASC">Ascending</option>
              </select>
            </div>
          </div>

        </div>

        {/* ── Type Filter Tabs ── */}
        <div className="filter-tabs">
          {['All', 'Income', 'Expense'].map(t => (
            <button
              key={t}
              className={`tab ${typeFilter === t ? 'active' : ''}`}
              onClick={() => handleTypeTab(t)}
            >
              {t === 'All' ? '📋 All' : t === 'Income' ? '📈 Income' : '📉 Expense'}
            </button>
          ))}
        </div>

        {/* ── Error banner ── */}
        {error && (
          <div className="error-banner">
            ⚠️ {error} — Make sure you are logged in.
          </div>
        )}

        {/* ── Table Card ── */}
        <div className="table-card">
          <div className="table-card-header"> Transaction Records
            <span className="table-meta">
              Page {page} &nbsp;·&nbsp; {perPage} per page
            </span>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th>Amount </th>
                  <th>Date </th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {!loading && transactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: 0, border: 'none' }}>
                      <div className="empty-state">
                        <div className="empty-icon">🗂️</div>
                        <h3>No transactions found</h3>
                      </div>
                    </td>
                  </tr>
                ) : (
                  transactions.map((t, i) => (
                    <tr key={t.tid ?? t.Tid ?? i}>
                      <td className="td-num">{(page - 1) * perPage + i + 1}</td>
                      <td>
                        <span className="category-pill">
                          {t.categoryName || t.CategoryName || '—'}
                        </span>
                      </td>
                      <td>
                        <span className={`type-badge ${
                          (t.categoryType || t.CategoryType) === 'Income'
                            ? 'type-income'
                            : 'type-expense'
                        }`}>
                          {(t.categoryType || t.CategoryType) === 'Income' ? '↑' : '↓'}
                          &nbsp;{t.categoryType || t.CategoryType || '—'}
                        </span>
                      </td>
                      <td className={
                        (t.categoryType || t.CategoryType) === 'Income'
                          ? 'amount-income'
                          : 'amount-expense'
                      }>
                        {formatCurrency(t.amount)}
                      </td>
                      <td className="td-date">{formatDate(t.dateOfTransaction)}</td>
                      <td className={`td-notes ${!t.notes ? 'empty' : ''}`}>
                        {t.notes || 'No notes'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* ── Pagination ── */}
          <div className="pagination-row">
            <span className="pagination-info">
              Showing records {((page - 1) * perPage) + 1}–{((page - 1) * perPage) + transactions.length}
            </span>

            <div className="pagination-controls">
              <button
                className="page-btn"
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
              >
                ‹ Prev
              </button>
              <span className="page-btn active">{page}</span>
              <button
                className="page-btn"
                disabled={!hasMore}
                onClick={() => setPage(p => p + 1)}
              >
                Next ›
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TransactionsPage;