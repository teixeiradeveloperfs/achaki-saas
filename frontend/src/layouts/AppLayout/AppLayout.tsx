import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router'
import { useSession } from '../../auth/session-context'
import { Brand } from '../../components/Brand'
import { Icon } from '../../components/Icon'
import type { IconName } from '../../components/Icon'
import { logout } from '../../services/auth'
import './AppLayout.css'

type NavItem = { label: string; href: string; icon: IconName }

const NAV: { title: string; items: NavItem[] }[] = [
  { title: 'Visão geral', items: [{ label: 'Dashboard', href: '/dashboard', icon: 'widget' }] },
  {
    title: 'Ofertas',
    items: [
      { label: 'Minhas ofertas', href: '/ofertas', icon: 'tag-price' },
    ],
  },
  {
    title: 'Configuração',
    items: [
      { label: 'Integrações', href: '/integracoes', icon: 'bolt-circle' },
      { label: 'Perfil', href: '/perfil', icon: 'user' },
    ],
  },
]

const COLLAPSED_KEY = 'achaki-sidebar-collapsed'

function readCollapsed() {
  try {
    return localStorage.getItem(COLLAPSED_KEY) === '1'
  } catch {
    return false
  }
}

/** Frame of the logged-in area: sidebar navigation plus the page content. */
export function AppLayout({ children }: { children: ReactNode }) {
  const session = useSession()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(readCollapsed)

  useEffect(() => {
    try {
      localStorage.setItem(COLLAPSED_KEY, collapsed ? '1' : '0')
    } catch {
      /* Storage is optional; the choice just won't persist. */
    }
  }, [collapsed])

  return (
    <div className={`app ${collapsed ? 'is-collapsed' : ''}`}>
      <header className="app__topbar">
        <button
          type="button"
          className="app__menu"
          aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <Icon name={menuOpen ? 'close-circle' : 'hamburger-menu'} size={24} />
        </button>
        <Brand theme="dark" className="app__brand" />
      </header>

      <aside className={`app__sidebar ${menuOpen ? 'is-open' : ''}`} aria-label="Menu principal">
        <Link className="app__brand-link" to="/dashboard" aria-label="Achaki — dashboard">
          <Brand theme="dark" className="app__brand" />
          <Brand theme="dark" symbolOnly className="app__brand-symbol" />
        </Link>

        <nav className="app__nav">
          {NAV.map((group) => (
            <div key={group.title}>
              <p className="app__nav-title">{group.title}</p>
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  className={`app__nav-item ${location.pathname === item.href ? 'is-selected' : ''}`}
                  to={item.href}
                  title={collapsed ? item.label : undefined}
                  onClick={() => setMenuOpen(false)}
                >
                  <Icon name={item.icon} />
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          ))}
        </nav>

        <div className="app__sidebar-bottom">
          <div className="app__user" title={collapsed ? session.user.email : undefined}>
            <span className="app__avatar">{session.user.name.slice(0, 1).toUpperCase()}</span>
            <span><strong>{session.user.name}</strong><small>{session.user.email}</small></span>
          </div>
          <button
            type="button"
            className="app__nav-item app__logout"
            title={collapsed ? 'Sair' : undefined}
            onClick={() => void logout().finally(() => window.location.assign('/login'))}
          >
            <Icon name="logout-2" />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      <button
        type="button"
        className="app__collapse"
        aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
        aria-expanded={!collapsed}
        onClick={() => setCollapsed((value) => !value)}
      >
        <Icon name="double-alt-arrow-left" size={18} />
      </button>

      <main className="app__main">{children}</main>
    </div>
  )
}
