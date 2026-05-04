import { Link, useLocation } from 'react-router-dom'

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: '◈' },
  { path: '/map', label: 'Mapa', icon: '⬡' },
  { path: '/species', label: 'Espécies', icon: '◉' },
  { path: '/analytics', label: 'Analytics', icon: '◆' },
]

export function Layout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation()

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="brand-icon">⬡</span>
          <div>
            <div className="brand-title">EcoAnalysis</div>
            <div className="brand-subtitle">Platform 2026</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${pathname === item.path ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="status-dot" />
          <span>API Conectada</span>
        </div>
      </aside>

      <main className={`main-content${pathname === '/map' ? ' map-active' : ''}`}>
        {pathname === '/map' ? children : <div className="page-container">{children}</div>}
      </main>
    </div>
  )
}
