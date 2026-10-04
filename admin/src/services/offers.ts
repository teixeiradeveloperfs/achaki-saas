import { getJson, postJson } from './api'

export type AdminOffer = {
  id: string
  scope: 'platform' | 'user'
  ownerUserId: string | null
  ownerName: string
  source: 'shopee' | 'mercado_livre' | 'amazon'
  externalId: string
  title: string
  currentPrice: number
  originalPrice: number | null
  discountPercentage: number
  category: string | null
  imageUrl: string | null
  productUrl: string
  affiliateUrl: string
  shopName: string | null
  validUntil: string | null
  fetchedAt: string
}

export type OffersResponse = {
  offers: AdminOffer[]
  page: number
  limit: number
  total: number
  summary: { all: number; platform: number; users: number }
  categories: Array<{ value: string; label: string }>
}

async function errorMessage(response: Response) {
  try {
    const body = (await response.json()) as { message?: string }
    return body.message || 'Não foi possível concluir a operação.'
  } catch {
    return 'Não foi possível concluir a operação.'
  }
}

export async function listOffers(input: { scope: string; source?: string; category?: string; query?: string; page: number; limit: number }) {
  const search = new URLSearchParams({ scope: input.scope, page: String(input.page), limit: String(input.limit) })
  if (input.source) search.set('source', input.source)
  if (input.category) search.set('category', input.category)
  if (input.query) search.set('query', input.query)
  const response = await getJson(`/admin/offers?${search}`)
  if (!response.ok) throw new Error(await errorMessage(response))
  return (await response.json()) as OffersResponse
}

export async function syncShopeeOffers(keyword?: string) {
  const response = await postJson('/admin/offers/sync/shopee', { keyword: keyword || undefined, page: 1, limit: 50, listType: 0, sortType: 2 })
  if (!response.ok) throw new Error(await errorMessage(response))
  return (await response.json()) as { imported: number; newOffers: number; updatedOffers: number; pagesFetched: number; completed: boolean }
}
