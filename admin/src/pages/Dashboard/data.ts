// Illustrative data: the admin dashboard is not connected to the API yet.

export type Point = { label: string; value: number }

export type StoreShare = { name: string; sent: number }

export type Period = {
  label: string
  users: string
  newUsers: string
  activeChannels: string
  sent: string
  signups: Point[]
  stores: StoreShare[]
}

export type User = {
  id: number
  name: string
  email: string
  channels: number
  sent: number
  status: 'Ativo' | 'Bloqueado'
  joined: string
}

export const periods = {
  '7D': {
    label: '7 dias',
    users: '2.418',
    newUsers: '163',
    activeChannels: '1.092',
    sent: '48.310',
    signups: [
      { label: 'Seg', value: 18 },
      { label: 'Ter', value: 24 },
      { label: 'Qua', value: 21 },
      { label: 'Qui', value: 31 },
      { label: 'Sex', value: 27 },
      { label: 'Sáb', value: 23 },
      { label: 'Dom', value: 19 },
    ],
    stores: [
      { name: 'Mercado Livre', sent: 27840 },
      { name: 'Shopee', sent: 20470 },
    ],
  },
  '30D': {
    label: '30 dias',
    users: '2.418',
    newUsers: '642',
    activeChannels: '1.092',
    sent: '201.760',
    signups: [
      { label: 'Semana 1', value: 148 },
      { label: 'Semana 2', value: 171 },
      { label: 'Semana 3', value: 160 },
      { label: 'Semana 4', value: 163 },
    ],
    stores: [
      { name: 'Mercado Livre', sent: 113900 },
      { name: 'Shopee', sent: 87860 },
    ],
  },
} satisfies Record<string, Period>

export type PeriodKey = keyof typeof periods

export const users: User[] = [
  { id: 1, name: 'Usuário de exemplo 1', email: 'usuario1@exemplo.com', channels: 4, sent: 1280, status: 'Ativo', joined: 'Há 12 min' },
  { id: 2, name: 'Usuário de exemplo 2', email: 'usuario2@exemplo.com', channels: 1, sent: 96, status: 'Ativo', joined: 'Há 40 min' },
  { id: 3, name: 'Usuário de exemplo 3', email: 'usuario3@exemplo.com', channels: 2, sent: 0, status: 'Bloqueado', joined: 'Há 2 h' },
  { id: 4, name: 'Usuário de exemplo 4', email: 'usuario4@exemplo.com', channels: 3, sent: 412, status: 'Ativo', joined: 'Há 5 h' },
  { id: 5, name: 'Usuário de exemplo 5', email: 'usuario5@exemplo.com', channels: 1, sent: 37, status: 'Ativo', joined: 'Ontem' },
]
