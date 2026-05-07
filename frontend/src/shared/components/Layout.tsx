import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Map, Leaf, BarChart2, Menu, Wifi } from 'lucide-react'

type NavItem = { path: string; label: string; Icon: React.ElementType }

const NAV_ITEMS: NavItem[] = [
  { path: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { path: '/map',       label: 'Mapa',       Icon: Map },
  { path: '/species',   label: 'Espécies',   Icon: Leaf },
  { path: '/analytics', label: 'Analytics',  Icon: BarChart2 },
]

export function Layout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)

  return (
    <div className="app-shell">
      {open && <div className="sidebar-overlay" onClick={() => setOpen(false)} />}

      <aside className={`sidebar${open ? ' open' : ''}`}>
        <div className="sidebar-brand">
          <img src="/logo.svg" alt="EcoAnalysis" className="brand-logo" />
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map(({ path, label, Icon }) => (
            <Link
              key={path}
              to={path}
              className={`nav-item ${pathname === path ? 'active' : ''}`}
              onClick={() => setOpen(false)}
            >
              <span className="nav-icon"><Icon size={16} strokeWidth={1.8} /></span>
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <Wifi size={13} color="var(--green)" />
          <span>API Conectada</span>
        </div>
      </aside>

      <main className={`main-content${pathname === '/map' ? ' map-active' : ''}`}>
        <div className="mobile-header">
          <button className="hamburger" onClick={() => setOpen(true)} aria-label="Abrir menu">
            <Menu size={18} strokeWidth={1.8} />
          </button>
          <img src="/logo.svg" alt="EcoAnalysis" className="mobile-logo" />
          <div className="mobile-header-spacer" />
        </div>
        {pathname === '/map' ? children : <div className="page-container">{children}</div>}
      </main>
    </div>
  )
}
