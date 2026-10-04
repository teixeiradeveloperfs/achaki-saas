import { useCallback, useEffect, useState } from 'react'
import { Icon } from '../../components/Icon'
import { AppLayout } from '../../layouts/AppLayout'
import { listOffers, syncShopeeOffers } from '../../services/offers'
import type { AdminOffer, OffersResponse } from '../../services/offers'
import './Offers.css'

const PAGE_SIZE = 25
const money = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const relative = (value: string) => {
  const minutes = Math.max(0, Math.round((Date.now() - new Date(value).getTime()) / 60_000))
  if (minutes < 1) return 'Agora'
  if (minutes < 60) return `Há ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `Há ${hours} h`
  return new Date(value).toLocaleDateString('pt-BR')
}

export function Offers() {
  const [scope, setScope] = useState<'all' | 'platform' | 'users'>('all')
  const [source, setSource] = useState('')
  const [category, setCategory] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [data, setData] = useState<OffersResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [feedback, setFeedback] = useState<{ kind: 'success' | 'error'; message: string } | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setData(await listOffers({ scope, source: source || undefined, category: category || undefined, query: query || undefined, page, limit: PAGE_SIZE }))
    } catch (error) {
      setFeedback({ kind: 'error', message: error instanceof Error ? error.message : 'Não foi possível carregar as ofertas.' })
    } finally {
      setLoading(false)
    }
  }, [category, page, query, scope, source])

  // Loading remote catalog data is the external synchronization performed by this effect.
  // oxlint-disable-next-line react/set-state-in-effect
  useEffect(() => { void load() }, [load])

  async function sync() {
    setSyncing(true)
    setFeedback(null)
    try {
      const categoryLabel = data?.categories.find((item) => item.value === category)?.label
      const result = await syncShopeeOffers(searchInput.trim() || categoryLabel)
      const summary = `${result.pagesFetched} páginas percorridas: ${result.newOffers} novas e ${result.updatedOffers} atualizadas.`
      setFeedback({ kind: result.completed ? 'success' : 'error', message: result.completed ? summary : `${summary} A paginação foi interrompida antes do fim.` })
      setPage(1)
      await load()
    } catch (error) {
      setFeedback({ kind: 'error', message: error instanceof Error ? error.message : 'Não foi possível buscar as ofertas.' })
    } finally {
      setSyncing(false)
    }
  }

  async function copyLink(offer: AdminOffer) {
    try {
      await navigator.clipboard.writeText(offer.affiliateUrl)
      setCopied(offer.id)
      window.setTimeout(() => setCopied(null), 1800)
    } catch {
      setFeedback({ kind: 'error', message: 'O navegador não permitiu copiar o link.' })
    }
  }

  const tabs = [
    { key: 'all' as const, label: 'Todas', count: data?.summary.all ?? 0 },
    { key: 'platform' as const, label: 'Padrão Achaki', count: data?.summary.platform ?? 0 },
    { key: 'users' as const, label: 'Usuários', count: data?.summary.users ?? 0 },
  ]
  const pages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1

  return (
    <AppLayout>
      <div className="offers-page">
        <header className="offers-page__header">
          <div><p className="offers-page__eyebrow">Catálogo</p><h1>Central de ofertas</h1><p>Veja as promoções e os links gerados em um único lugar.</p></div>
          <button className="offers-sync" type="button" disabled={syncing} onClick={() => void sync()}><Icon name="bolt-circle" />{syncing ? 'Buscando todas…' : 'Buscar todas'}</button>
        </header>

        {feedback && <p className={`offers-feedback is-${feedback.kind}`} role={feedback.kind === 'error' ? 'alert' : 'status'}><Icon name={feedback.kind === 'error' ? 'danger-circle' : 'check-circle'} />{feedback.message}</p>}

        <section className="offers-panel">
          <header className="offers-toolbar">
            <div className="offers-tabs" role="tablist" aria-label="Origem da configuração">
              {tabs.map((tab) => <button key={tab.key} role="tab" aria-selected={scope === tab.key} onClick={() => { setLoading(true); setScope(tab.key); setPage(1) }}>{tab.label}<span>{tab.count}</span></button>)}
            </div>
            <form className="offers-filters" onSubmit={(event) => { event.preventDefault(); setLoading(true); setQuery(searchInput.trim()); setPage(1) }}>
              <label className="offers-search"><Icon name="magnifer" size={18} /><input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Produto ou loja" aria-label="Buscar produto ou loja" /></label>
              <select value={category} onChange={(event) => { setLoading(true); setCategory(event.target.value); setPage(1) }} aria-label="Filtrar por categoria"><option value="">Todas as categorias</option>{data?.categories.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select>
              <select value={source} onChange={(event) => { setLoading(true); setSource(event.target.value); setPage(1) }} aria-label="Filtrar por marketplace"><option value="">Todos os marketplaces</option><option value="shopee">Shopee</option><option value="mercado_livre">Mercado Livre</option><option value="amazon">Amazon</option></select>
              <button type="submit">Buscar</button>
            </form>
          </header>

          <div className="offers-table-scroll">
            <table className="offers-table">
              <thead><tr><th>Oferta</th><th>Origem</th><th>Preço</th><th>Desconto</th><th>Link afiliado</th><th>Atualizada</th></tr></thead>
              <tbody>
                {data?.offers.map((offer) => (
                  <tr key={offer.id}>
                    <td><div className="offer-product"><span className="offer-product__image">{offer.imageUrl ? <img src={offer.imageUrl} alt="" loading="lazy" /> : <Icon name="tag-price" />}</span><div><strong title={offer.title}>{offer.title}</strong><small>{data?.categories.find((item) => item.value === offer.category)?.label || 'Outros'} · {offer.shopName || 'Loja não informada'} · #{offer.externalId}</small><a href={offer.productUrl} target="_blank" rel="noreferrer">Ver produto ↗</a></div></div></td>
                    <td><span className={`offer-source is-${offer.source}`}>{offer.source === 'shopee' ? 'S' : offer.source === 'amazon' ? 'A' : 'M'}</span><strong className="offer-owner">{offer.scope === 'platform' ? 'Padrão Achaki' : offer.ownerName}</strong><small>{offer.source === 'mercado_livre' ? 'Mercado Livre' : offer.source[0].toUpperCase() + offer.source.slice(1)}</small></td>
                    <td><strong className="offer-price">{money(offer.currentPrice)}</strong>{offer.originalPrice && <del>{money(offer.originalPrice)}</del>}</td>
                    <td>{offer.discountPercentage > 0 ? <span className="offer-discount">−{offer.discountPercentage}%</span> : <span className="offer-muted">—</span>}</td>
                    <td><div className="offer-link"><a href={offer.affiliateUrl} target="_blank" rel="noreferrer" title={offer.affiliateUrl}>{offer.affiliateUrl}</a><button type="button" onClick={() => void copyLink(offer)}>{copied === offer.id ? 'Copiado' : 'Copiar'}</button></div></td>
                    <td><span className="offer-updated">{relative(offer.fetchedAt)}</span><small>{new Date(offer.fetchedAt).toLocaleString('pt-BR')}</small></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!loading && data?.offers.length === 0 && <div className="offers-empty"><span><Icon name="tag-price" size={28} /></span><h2>Nenhuma oferta encontrada</h2><p>{scope === 'users' ? 'As ofertas aparecerão aqui quando as contas dos usuários forem conectadas ao motor.' : 'Configure e ative a Shopee em Integrações, depois use “Buscar agora”.'}</p></div>}
            {loading && <div className="offers-loading">Carregando ofertas…</div>}
          </div>

          <footer className="offers-pagination"><span>{data?.total ?? 0} ofertas</span><div><button disabled={page <= 1 || loading} onClick={() => { setLoading(true); setPage((value) => value - 1) }}>Anterior</button><span>{page} de {pages}</span><button disabled={page >= pages || loading} onClick={() => { setLoading(true); setPage((value) => value + 1) }}>Próxima</button></div></footer>
        </section>
      </div>
    </AppLayout>
  )
}
