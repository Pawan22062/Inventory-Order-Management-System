import { useState } from 'react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Dashboard', icon: '◫' },
  { to: '/products', label: 'Products', icon: '▣' },
  { to: '/customers', label: 'Customers', icon: '◎' },
  { to: '/orders', label: 'Orders', icon: '◈' },
];

function Layout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="app-shell">
      <header className="topbar">
        <button
          type="button"
          className="menu-toggle"
          aria-label="Toggle navigation"
          onClick={() => setMenuOpen((o) => !o)}
        >
          ☰
        </button>
        <div className="brand">
          <span className="brand-mark">IO</span>
          <span className="brand-text">Inventory & Orders</span>
        </div>
      </header>

      <div className={`layout ${menuOpen ? 'sidebar-open' : ''}`}>
        <aside className="sidebar" onClick={() => setMenuOpen(false)}>
          <nav>
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="main-content">{children}</main>
      </div>

      {menuOpen && (
        <button
          type="button"
          className="sidebar-backdrop"
          aria-label="Close menu"
          onClick={() => setMenuOpen(false)}
        />
      )}
    </div>
  );
}

export default Layout;
