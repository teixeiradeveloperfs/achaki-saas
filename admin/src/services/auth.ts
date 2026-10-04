import { getJson, postJson } from './api'

export type Session = {
  user: { id: string; email: string; name: string }
  roles: string[]
  permissions: string[]
}

export type AuthError = 'invalid-credentials' | 'too-many-attempts' | 'unavailable' | 'offline'
export type AuthResult = 'ok' | AuthError

export const AUTH_ERRORS: Record<AuthError, string> = {
  'invalid-credentials': 'E-mail ou senha incorretos.',
  'too-many-attempts': 'Muitas tentativas. Aguarde um minuto e tente novamente.',
  unavailable: 'Não foi possível entrar agora. Tente novamente em instantes.',
  offline: 'Sem conexão com o servidor. Verifique sua internet e tente novamente.',
}

export async function login(email: string, password: string): Promise<AuthResult> {
  try {
    const response = await postJson('/admin/auth/login', { email: email.trim(), password })
    if (response.ok) return 'ok'
    if (response.status === 429) return 'too-many-attempts'
    if (response.status === 400 || response.status === 401 || response.status === 403) return 'invalid-credentials'
    return 'unavailable'
  } catch {
    return 'offline'
  }
}

/** The signed-in admin, `null` when there is no valid session, or `'offline'` when the API cannot be reached. */
export async function getSession(): Promise<Session | null | 'offline'> {
  try {
    const response = await getJson('/admin/auth/me')
    if (response.ok) return (await response.json()) as Session
    if (response.status === 401 || response.status === 403) return null
    return 'offline'
  } catch {
    return 'offline'
  }
}

export async function logout() {
  try {
    await postJson('/admin/auth/logout')
  } catch {
    /* Leaving the page is still correct; the session expires on its own. */
  }
}
