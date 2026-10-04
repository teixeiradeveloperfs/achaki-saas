import { getJson, postJson, putJson } from './api'

export type Session = {
  user: { id: string; email: string; name: string }
  roles: string[]
  permissions: string[]
}

export type AuthError = 'invalid-credentials' | 'email-taken' | 'unavailable' | 'offline'
export type AuthResult = 'ok' | AuthError

export const AUTH_ERRORS: Record<AuthError, string> = {
  'invalid-credentials': 'E-mail ou senha incorretos.',
  'email-taken': 'Já existe uma conta com este e-mail.',
  unavailable: 'Não foi possível concluir agora. Tente novamente em instantes.',
  offline: 'Sem conexão com o servidor. Verifique sua internet e tente novamente.',
}

async function send(path: string, body: unknown, statuses: Record<number, AuthError> = {}): Promise<AuthResult> {
  try {
    const response = await postJson(path, body)
    if (response.ok) return 'ok'
    return statuses[response.status] ?? 'unavailable'
  } catch {
    return 'offline'
  }
}

export function login(email: string, password: string) {
  return send('/auth/login', { email: email.trim(), password }, { 400: 'invalid-credentials', 401: 'invalid-credentials' })
}

export function register(name: string, email: string, password: string) {
  return send('/auth/register', { name: name.trim(), email: email.trim(), password }, { 409: 'email-taken' })
}

export function requestPasswordReset(email: string) {
  return send('/auth/forgot-password', { email: email.trim() })
}

export async function getSession(): Promise<Session | null | 'offline'> {
  try {
    const response = await getJson('/auth/me')
    if (response.ok) return (await response.json()) as Session
    if (response.status === 401 || response.status === 403) return null
    return 'offline'
  } catch {
    return 'offline'
  }
}

export async function logout() {
  try {
    await postJson('/auth/logout')
  } catch {
    /* The local navigation still signs the user out of the visible app. */
  }
}

export async function updateProfile(input: {
  name: string
  email: string
  currentPassword?: string
  newPassword?: string
}) {
  const response = await putJson('/auth/profile', input)
  if (response.ok) return (await response.json()) as Session['user']
  try {
    const body = (await response.json()) as { message?: string | string[] }
    throw new Error(Array.isArray(body.message) ? body.message[0] : body.message || 'Não foi possível atualizar seu perfil.')
  } catch (reason) {
    if (reason instanceof Error) throw reason
    throw new Error('Não foi possível atualizar seu perfil.')
  }
}
