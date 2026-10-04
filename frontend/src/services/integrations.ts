import { getJson, postJson, putJson } from './api'

export type ShopeeIntegration = {
  provider: 'shopee'
  configured: boolean
  enabled: boolean
  appId: string
  hasSecret: boolean
  updatedAt: string | null
}

async function errorMessage(response: Response) {
  try {
    const body = (await response.json()) as { message?: string | string[] }
    return Array.isArray(body.message) ? body.message[0] : body.message
  } catch {
    return undefined
  }
}

export async function getShopeeIntegration() {
  const response = await getJson('/integrations/shopee')
  if (!response.ok) throw new Error((await errorMessage(response)) ?? 'Não foi possível carregar a integração.')
  return (await response.json()) as ShopeeIntegration
}

export async function saveShopeeIntegration(input: { appId: string; secret?: string; enabled: boolean }) {
  const response = await putJson('/integrations/shopee', input)
  if (!response.ok) throw new Error((await errorMessage(response)) ?? 'Não foi possível salvar a integração.')
  return (await response.json()) as ShopeeIntegration
}

export async function testShopeeIntegration() {
  const response = await postJson('/integrations/shopee/test')
  if (!response.ok) throw new Error((await errorMessage(response)) ?? 'A Shopee recusou as credenciais.')
  return (await response.json()) as { ok: true; offersReturned: number }
}
