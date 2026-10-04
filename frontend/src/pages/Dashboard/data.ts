// Illustrative data: the dashboard is not connected to the API yet.

export type Channel = { id: number; name: string; category: string; active: boolean; sent: number }

export type Offer = {
  id: number
  title: string
  store: string
  price: number
  original: number
  time: string
  status: 'Enviada' | 'Na fila'
  channel: string
}

export type Point = { label: string; value: number }

export type Period = { label: string; found: string; sent: string; saved: string; points: Point[] }

export const CATEGORIES = ['Todas as categorias', 'Casa e decoração', 'Eletrônicos', 'Moda e acessórios']

export const STORES = ['Mercado Livre', 'Shopee']

export const initialChannels: Channel[] = [
  { id: 1, name: 'Achadinhos da casa', category: 'Casa e decoração', active: true, sent: 48 },
  { id: 2, name: 'Tech com desconto', category: 'Eletrônicos', active: true, sent: 32 },
  { id: 3, name: 'Ofertas que valem', category: 'Todas as categorias', active: false, sent: 16 },
]

export const offers: Offer[] = [
  { id: 1, title: 'Echo Pop · Smart speaker com Alexa', store: 'Mercado Livre', price: 189.9, original: 329.9, time: 'Há 5 min', status: 'Enviada', channel: 'Tech com desconto' },
  { id: 2, title: 'Jogo de cama queen · 4 peças', store: 'Shopee', price: 79.9, original: 149.9, time: 'Há 12 min', status: 'Enviada', channel: 'Achadinhos da casa' },
  { id: 3, title: 'Fone de ouvido Bluetooth sem fio', store: 'Mercado Livre', price: 129.9, original: 219.9, time: 'Há 18 min', status: 'Na fila', channel: 'Tech com desconto' },
  { id: 4, title: 'Garrafa térmica inox · 500 ml', store: 'Shopee', price: 39.9, original: 69.9, time: 'Há 24 min', status: 'Enviada', channel: 'Achadinhos da casa' },
]

export const periods = {
  '7D': {
    label: '7 dias',
    found: '1.284',
    sent: '342',
    saved: '27 h',
    points: [
      { label: 'Seg', value: 42 },
      { label: 'Ter', value: 58 },
      { label: 'Qua', value: 46 },
      { label: 'Qui', value: 78 },
      { label: 'Sex', value: 62 },
      { label: 'Sáb', value: 88 },
      { label: 'Dom', value: 72 },
    ],
  },
  '30D': {
    label: '30 dias',
    found: '5.612',
    sent: '1.496',
    saved: '119 h',
    points: [
      { label: 'Semana 1', value: 46 },
      { label: 'Semana 2', value: 64 },
      { label: 'Semana 3', value: 55 },
      { label: 'Semana 4', value: 79 },
    ],
  },
} satisfies Record<string, Period>

export type PeriodKey = keyof typeof periods
