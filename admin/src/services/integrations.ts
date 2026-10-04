import { getJson, postJson, putJson } from './api'

export type ShopeeIntegration = {
  provider: 'shopee'
  configured: boolean
  enabled: boolean
  appId: string
  hasSecret: boolean
  updatedAt: string | null
}

type ApiError = { message?: string }

async function message(response: Response) {
  try {
    const body = (await response.json()) as ApiError
    return body.message || 'Não foi possível concluir a operação.'
  } catch {
    return 'Não foi possível concluir a operação.'
  }
}

export async function getShopeeIntegration() {
  const response = await getJson('/admin/integrations/shopee')
  if (!response.ok) throw new Error(await message(response))
  return (await response.json()) as ShopeeIntegration
}

export async function saveShopeeIntegration(input: { appId: string; secret?: string; enabled: boolean }) {
  const response = await putJson('/admin/integrations/shopee', input)
  if (!response.ok) throw new Error(await message(response))
  return (await response.json()) as ShopeeIntegration
}

export async function testShopeeIntegration() {
  const response = await postJson('/admin/integrations/shopee/test')
  if (!response.ok) throw new Error(await message(response))
  return (await response.json()) as { ok: true; offersReturned: number }
}
