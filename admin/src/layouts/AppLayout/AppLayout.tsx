import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { Brand } from '../../components/Brand'
import { Icon } from '../../components/Icon'
import type { IconName } from '../../components/Icon'
import { useSession } from '../../auth/session-context'
import { logout } from '../../services/auth'
import './AppLayout.css'

type NavItem = { label: string; href: string; icon: IconName; permission?: string }

const NAV: { title: string; items: NavItem[] }[] = [
  { title: 'Visão geral', items: [{ label: 'Dashboard', href: '#resumo', icon: 'widget' }] },
  {
    title: 'Plataforma',
    items: [
      { label: 'Usuários', href: '#usuarios', icon: 'users-group-rounded' },
      { label: 'Lojas', href: '#lojas', icon: 'shop-2' },
      { label: 'Ofertas', href: '/offers', icon: 'tag-price', permission: 'offers:read' },
      { label: 'Integrações', href: '/integrations', icon: 'bolt-circle', permission: 'integrations:manage' },
    ],
  },
]

const COLLAPSED_KEY = 'achaki-admin-sidebar-collapsed'

function readCollapsed() {
  try {
    return localStorage.getItem(COLLAPSED_KEY) === '1'
  } catch {
    return false
  }
}

/** Frame of the logged-in area: sidebar navigation plus the page content. */
export function AppLayout({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, permissions } = useSession()
  const navigate = useNavigate()
  const location = useLocation()
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
              {group.items.filter((item) => !item.permission || permissions.includes(item.permission)).map((item) => {
                const selected = item.href.startsWith('/') ? location.pathname === item.href : location.pathname === '/dashboard' && item.href === '#resumo'
                const content = <><Icon name={item.icon} /><span>{item.label}</span></>
                return item.href.startsWith('/') ? (
                  <Link key={item.href} className={`app__nav-item ${selected ? 'is-selected' : ''}`} to={item.href} title={collapsed ? item.label : undefined} onClick={() => setMenuOpen(false)}>{content}</Link>
                ) : (
                  <a key={item.href} className={`app__nav-item ${selected ? 'is-selected' : ''}`} href={`/dashboard${item.href}`} title={collapsed ? item.label : undefined} onClick={() => setMenuOpen(false)}>{content}</a>
                )
              })}
            </div>
          ))}
        </nav>

        <div className="app__sidebar-bottom">
          <div className="app__account" title={collapsed ? `${user.name} · ${user.email}` : undefined}>
            <Icon name="user" />
            <span>
              <strong>{user.name}</strong>
              {user.email}
            </span>
          </div>
          <button
            type="button"
            className="app__nav-item"
            title={collapsed ? 'Sair' : undefined}
            onClick={() => {
              void logout().then(() => navigate('/login', { replace: true }))
            }}
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
