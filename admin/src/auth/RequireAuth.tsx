import { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router'
import { getSession } from '../services/auth'
import type { Session } from '../services/auth'
import { SessionContext } from './session-context'
import './RequireAuth.css'

/** Renders the nested routes only for a signed-in admin; everyone else goes to the login. */
export function RequireAuth() {
  const [session, setSession] = useState<Session | null | 'offline' | 'loading'>('loading')

  useEffect(() => {
    let cancelled = false
    void getSession().then((result) => {
      if (!cancelled) setSession(result)
    })
    return () => {
      cancelled = true
    }
  }, [])

  if (session === 'loading') return null
  if (session === null) return <Navigate to="/login" replace />
  if (session === 'offline') {
    return (
      <main className="auth-offline">
        <h1>Sem conexão com o servidor</h1>
        <p>Não foi possível verificar sua sessão.</p>
        <button type="button" className="link" onClick={() => window.location.reload()}>
          Tentar novamente
        </button>
      </main>
    )
  }

  return (
    <SessionContext value={session}>
      <Outlet />
    </SessionContext>
  )
}
