import { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router'
import { getSession } from '../services/auth'
import type { Session } from '../services/auth'
import { SessionContext } from './session-context'
import './RequireAuth.css'

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

  if (session === 'loading') return <main className="session-state">Carregando…</main>
  if (session === null) return <Navigate to="/login" replace />
  if (session === 'offline') {
    return (
      <main className="session-state">
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
