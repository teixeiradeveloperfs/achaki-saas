import { getJson, postJson } from './api'

export type UserOffer = {
  id: string
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

export type UserOffersResponse = {
  offers: UserOffer[]
  page: number
  limit: number
  total: number
  categories: Array<{ value: string; label: string }>
}

async function errorMessage(response: Response) {
  try {
    const body = (await response.json()) as { message?: string | string[] }
    return Array.isArray(body.message) ? body.message[0] : body.message || 'Não foi possível concluir a operação.'
  } catch {
    return 'Não foi possível concluir a operação.'
  }
}

export async function listMyOffers(input: { query?: string; category?: string; page: number; limit: number }) {
  const search = new URLSearchParams({ page: String(input.page), limit: String(input.limit) })
  if (input.query) search.set('query', input.query)
  if (input.category) search.set('category', input.category)
  const response = await getJson(`/my/offers?${search}`)
  if (!response.ok) throw new Error(await errorMessage(response))
  return (await response.json()) as UserOffersResponse
}

export async function syncMyShopeeOffers(keyword?: string) {
  const response = await postJson('/my/offers/sync/shopee', {
    keyword: keyword || undefined,
    page: 1,
    limit: 50,
    listType: 0,
    sortType: 2,
  })
  if (!response.ok) throw new Error(await errorMessage(response))
  return (await response.json()) as { imported: number; newOffers: number; updatedOffers: number; pagesFetched: number; completed: boolean }
}
