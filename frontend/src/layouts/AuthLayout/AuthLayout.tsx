import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { Brand } from '../../components/Brand'
import './AuthLayout.css'

type AuthLayoutProps = {
  title: string
  lead: ReactNode
  children?: ReactNode
  /** Centered line below the form (e.g. link to another auth page). */
  footer: ReactNode
}

/** Shared frame of the login, sign-up and password recovery pages. */
export function AuthLayout({ title, lead, children, footer }: AuthLayoutProps) {
  return (
    <main className="auth">
      <Link className="auth__brand-link" to="/" aria-label="Achaki — página inicial">
        <Brand theme="dark" className="auth__brand" />
      </Link>
      <h1 className="auth__title">{title}</h1>
      <p className="auth__lead">{lead}</p>
      {children}
      <p className="auth__footer">{footer}</p>
    </main>
  )
}
