import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import './Dashboard.css';

const INCOME_COLORS  = ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#059669', '#047857'];
const EXPENSE_COLORS = ['#ef4444', '#f87171', '#fca5a5', '#f97316', '#fb923c', '#dc2626'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: '#1e293b', borderRadius: 8, padding: '10px 14px',
        color: '#fff', fontSize: 13, boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
      }}>
        {label && <p style={{ color: '#94a3b8', marginBottom: 4 }}>{label}</p>}
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color || '#fff' }}>
            {p.name}: ₹{Number(p.value).toLocaleString('en-IN')}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const uid = authUser?.uid;

  const [chartData, setChartData] = useState(null);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    if (!uid) return;
    (async () => {
      try {
        const res  = await fetch('http://localhost:8080/api/dashboard', { credentials: 'include' });
        const json = await res.json();
        setChartData(json);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [uid]);

  // compute summary numbers from chart data
  const totalIncome  = chartData?.pieChartIncomeList?.reduce((s, r) => s + r.amount, 0) ?? 0;
  const totalExpense = chartData?.pieChartExpenseList?.reduce((s, r) => s + r.amount, 0) ?? 0;
  const netSavings   = totalIncome - totalExpense;

  return (
    <div className="dash-root">

      <header className="dash-topbar">
        <div>
          <h1 className="dash-title">Dashboard</h1>
          <p className="dash-subtitle">Your financial overview at a glance</p>
        </div>
        <div className="dash-topbar-actions">
          <button className="btn btn-outline" onClick={() => navigate('/category')}>
            + Category
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/transaction')}>
            + Add Transaction
          </button>
        </div>
      </header>

      {loading ? (
        <div className="dash-loading">
          <div className="dash-spinner" />
          <p>Loading your data…</p>
        </div>
      ) : (
        <div className="dash-content">

          {/* ── Summary Cards ── */}
          <div className="summary-grid">
            <div className="summary-card summary-income">
              <div className="summary-icon">↑</div>
              <div>
                <div className="summary-label">Total Income</div>
                <div className="summary-value">₹{totalIncome.toLocaleString('en-IN')}</div>
              </div>
            </div>
            <div className="summary-card summary-expense">
              <div className="summary-icon">↓</div>
              <div>
                <div className="summary-label">Total Expenses</div>
                <div className="summary-value">₹{totalExpense.toLocaleString('en-IN')}</div>
              </div>
            </div>
            <div className={`summary-card ${netSavings >= 0 ? 'summary-savings' : 'summary-deficit'}`}>
              <div className="summary-icon">◈</div>
              <div>
                <div className="summary-label">{netSavings >= 0 ? 'Net Savings' : 'Deficit'}</div>
                <div className="summary-value">₹{Math.abs(netSavings).toLocaleString('en-IN')}</div>
              </div>
            </div>
          </div>

          {/* ── Pie Charts Row ── */}
          <div className="charts-row">

            <div className="dash-card chart-card">
              <div className="chart-header">
                <span className="chart-title">Income Breakdown</span>
                <span className="chart-badge badge-income">Income</span>
              </div>
              {chartData?.pieChartIncomeList?.length > 0 ? (
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={chartData.pieChartIncomeList} dataKey="amount"
                      nameKey="category" cx="50%" cy="50%" innerRadius={55} outerRadius={90}>
                      {chartData.pieChartIncomeList.map((_, i) => (
                        <Cell key={i} fill={INCOME_COLORS[i % INCOME_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend iconType="circle" iconSize={8}
                      formatter={(v) => <span style={{ fontSize: 12, color: '#64748b' }}>{v}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              ) : <EmptyChart />}
            </div>

            <div className="dash-card chart-card">
              <div className="chart-header">
                <span className="chart-title">Expense Breakdown</span>
                <span className="chart-badge badge-expense">Expense</span>
              </div>
              {chartData?.pieChartExpenseList?.length > 0 ? (
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={chartData.pieChartExpenseList} dataKey="amount"
                      nameKey="category" cx="50%" cy="50%" innerRadius={55} outerRadius={90}>
                      {chartData.pieChartExpenseList.map((_, i) => (
                        <Cell key={i} fill={EXPENSE_COLORS[i % EXPENSE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend iconType="circle" iconSize={8}
                      formatter={(v) => <span style={{ fontSize: 12, color: '#64748b' }}>{v}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              ) : <EmptyChart />}
            </div>

          </div>

          {/* ── Area Chart — Income vs Expense ── */}
          <div className="dash-card chart-card chart-card--wide">
            <div className="chart-header">
              <span className="chart-title">Income vs Expense — Last 12 Months</span>
            </div>
            {chartData?.multiLineChartList?.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={chartData.multiLineChartList}
                  margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#10b981" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false}
                    tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" iconSize={8}
                    formatter={(v) => <span style={{ fontSize: 12, color: '#64748b' }}>{v}</span>} />
                  <Area type="monotone" dataKey="income"  stroke="#10b981" strokeWidth={2} fill="url(#colorIncome)"  name="Income" />
                  <Area type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} fill="url(#colorExpense)" name="Expense" />
                </AreaChart>
              </ResponsiveContainer>
            ) : <EmptyChart />}
          </div>

          {/* ── Line Chart — Savings ── */}
          <div className="dash-card chart-card chart-card--wide">
            <div className="chart-header">
              <span className="chart-title">Savings Over Time</span>
            </div>
            {chartData?.lineChartSavingsList?.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={chartData.lineChartSavingsList}
                  margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false}
                    tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="savings" stroke="#6366f1" strokeWidth={2.5}
                    dot={{ r: 4, fill: '#6366f1', strokeWidth: 0 }}
                    activeDot={{ r: 6 }} name="Savings" />
                </LineChart>
              </ResponsiveContainer>
            ) : <EmptyChart />}
          </div>

        </div>
      )}
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="chart-empty">
      <span>📊</span>
      <p>No data yet — add some transactions to see your charts!</p>
    </div>
  );
}