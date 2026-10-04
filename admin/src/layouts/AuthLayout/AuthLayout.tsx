import type { ReactNode } from 'react'
import { Brand } from '../../components/Brand'
import './AuthLayout.css'

type AuthLayoutProps = {
  title: string
  lead: ReactNode
  children?: ReactNode
}

/** Frame of the admin sign-in pages: brand, title and form. */
export function AuthLayout({ title, lead, children }: AuthLayoutProps) {
  return (
    <main className="auth">
      <Brand theme="dark" className="auth__brand" />
      <h1 className="auth__title">{title}</h1>
      <p className="auth__lead">{lead}</p>
      {children}
    </main>
  )
}
