const API_URL = import.meta.env.VITE_API_URL

export function getJson(path: string) {
  return fetch(`${API_URL}${path}`, { credentials: 'include' })
}

export function postJson(path: string, body?: unknown) {
  return fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: body === undefined ? undefined : JSON.stringify(body),
  })
}

export function putJson(path: string, body: unknown) {
  return fetch(`${API_URL}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  })
}
