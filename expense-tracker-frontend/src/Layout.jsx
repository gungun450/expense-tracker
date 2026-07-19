import React, { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import './Layout.css';

const NAV_ITEMS = [
  { key: 'dashboard',    label: 'Dashboard',    icon: '▦', path: '/dashboard' },
  { key: 'categories',   label: 'Category',   icon: '⊞', path: '/category' },
  { key: 'transactions', label: 'Transaction', icon: '↕', path: '/transaction' },
  { key: 'profile',      label: 'Profile',      icon: '👨🏻‍💼', path: '/profile' },
];

export default function Layout() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const activeKey = NAV_ITEMS.find(n => location.pathname.startsWith(n.path))?.key || 'dashboard';

  return (
    <div className={`layout-shell ${collapsed ? 'layout-collapsed' : ''}`}>

      {/* ── Sidebar ─────────────────────────────────────── */}
      <aside className="layout-sidebar">
        <div className="layout-logo">
          <span className="layout-logo-icon">💸</span>
          {!collapsed && <span className="layout-logo-text">Spendly</span>}
        </div>

        <nav className="layout-nav">
          {NAV_ITEMS.map(item => (
            <button
              key={item.key}
              className={`layout-nav-item ${activeKey === item.key ? 'layout-nav-active' : ''}`}
              onClick={() => navigate(item.path)}
              title={collapsed ? item.label : undefined}
            >
              <span className="layout-nav-icon">{item.icon}</span>
              {!collapsed && <span className="layout-nav-label">{item.label}</span>}
            </button>
          ))}
        </nav>

        <button
          className="layout-collapse-btn"
          onClick={() => setCollapsed(p => !p)}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? '▶' : '◀'}
        </button>
      </aside>

      {/* ── Page content ────────────────────────────────── */}
      <div className="layout-page">
        <Outlet />
      </div>

    </div>
  );
}