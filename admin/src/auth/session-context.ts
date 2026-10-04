import { createContext, useContext } from 'react'
import type { Session } from '../services/auth'

export const SessionContext = createContext<Session | null>(null)

/** The signed-in admin. Only valid under <RequireAuth>. */
export function useSession() {
  const session = useContext(SessionContext)
  if (!session) throw new Error('useSession must be used inside <RequireAuth>')
  return session
}
