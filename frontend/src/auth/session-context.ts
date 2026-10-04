import { createContext, useContext } from 'react'
import type { Session } from '../services/auth'

export const SessionContext = createContext<Session | null>(null)

export function useSession() {
  const session = useContext(SessionContext)
  if (!session) throw new Error('useSession deve ser usado dentro de RequireAuth')
  return session
}
