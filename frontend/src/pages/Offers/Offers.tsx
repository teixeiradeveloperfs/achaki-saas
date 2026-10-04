import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router'
import { Icon } from '../../components/Icon'
import { AppLayout } from '../../layouts/AppLayout'
import { listMyOffers, syncMyShopeeOffers, type UserOffer, type UserOffersResponse } from '../../services/offers'
import './Offers.css'

const PAGE_SIZE = 24
const money = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

function marketplace(source: UserOffer['source']) {
  if (source === 'mercado_livre') return 'Mercado Livre'
  return source[0].toUpperCase() + source.slice(1)
}

export function Offers() {
  const [searchInput, setSearchInput] = useState('')
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')
  const [page, setPage] = useState(1)
  const [data, setData] = useState<UserOffersResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [feedback, setFeedback] = useState<{ kind: 'success' | 'error'; message: string } | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setData(await listMyOffers({ query: query || undefined, category: category || undefined, page, limit: PAGE_SIZE }))
    } catch (reason) {
      setFeedback({ kind: 'error', message: reason instanceof Error ? reason.message : 'Não foi possível carregar as ofertas.' })
    } finally {
      setLoading(false)
    }
  }, [category, page, query])

  // The effect synchronizes the view with the authenticated user's server-side catalog.
  // oxlint-disable-next-line react/set-state-in-effect
  useEffect(() => { void load() }, [load])

  useEffect(() => {
    const timer = window.setInterval(() => void load(), 60_000)
    return () => window.clearInterval(timer)
  }, [load])

  async function sync() {
    setSyncing(true)
    setFeedback(null)
    try {
      const categoryLabel = data?.categories.find((item) => item.value === category)?.label
      const result = await syncMyShopeeOffers(searchInput.trim() || categoryLabel)
      const summary = `${result.pagesFetched} páginas percorridas: ${result.newOffers} novas ofertas e ${result.updatedOffers} existentes atualizadas.`
      setFeedback({ kind: result.completed ? 'success' : 'error', message: result.completed ? summary : `${summary} A Shopee interrompeu a paginação antes do fim.` })
      setQuery(searchInput.trim())
      setPage(1)
      await load()
    } catch (reason) {
      setFeedback({ kind: 'error', message: reason instanceof Error ? reason.message : 'Não foi possível buscar ofertas.' })
    } finally {
      setSyncing(false)
    }
  }

  async function copy(offer: UserOffer) {
    try {
      await navigator.clipboard.writeText(offer.affiliateUrl)
      setCopied(offer.id)
      window.setTimeout(() => setCopied(null), 1800)
    } catch {
      setFeedback({ kind: 'error', message: 'O navegador não permitiu copiar o link.' })
    }
  }

  const pages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1

  return (
    <AppLayout>
      <div className="my-offers">
        <header className="my-offers__header">
          <div>
            <p className="my-offers__eyebrow">Seu catálogo</p>
            <h1>Ofertas</h1>
            <p>Atualizadas automaticamente; você também pode buscar quando quiser.</p>
          </div>
          <button type="button" className="my-offers__sync" disabled={syncing} onClick={() => void sync()}>
            <Icon name="bolt-circle" />
            {syncing ? 'Buscando todas…' : 'Buscar todas na Shopee'}
          </button>
        </header>

        <form
          className="offer-search"
          onSubmit={(event) => {
            event.preventDefault()
            setLoading(true)
            setQuery(searchInput.trim())
            setPage(1)
          }}
        >
          <label className="offer-search__input"><Icon name="magnifer" /><input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Buscar produto ou loja" aria-label="Buscar produto ou loja" /></label>
          <select value={category} onChange={(event) => { setLoading(true); setCategory(event.target.value); setPage(1) }} aria-label="Filtrar por categoria">
            <option value="">Todas as categorias</option>
            {data?.categories.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
          <button type="submit">Filtrar salvas</button>
        </form>

        {feedback && (
          <p className={`my-offers__feedback is-${feedback.kind}`} role={feedback.kind === 'error' ? 'alert' : 'status'}>
            <Icon name={feedback.kind === 'error' ? 'danger-circle' : 'bolt-circle'} />
            {feedback.message}
          </p>
        )}

        {loading && <div className="my-offers__state">Carregando ofertas…</div>}

        {!loading && data?.offers.length === 0 && (
          <div className="my-offers__state my-offers__empty">
            <span><Icon name="tag-price" size={30} /></span>
            <h2>{query ? 'Nenhuma oferta encontrada' : 'Seu catálogo ainda está vazio'}</h2>
            <p>
              {query
                ? 'Tente outro termo ou limpe a busca.'
                : 'Configure sua Shopee e clique em “Buscar na Shopee” para importar as primeiras promoções.'}
            </p>
            {!query && <Link to="/integracoes">Configurar integração</Link>}
          </div>
        )}

        {!loading && Boolean(data?.offers.length) && (
          <section className="offer-grid" aria-label="Ofertas encontradas">
            {data?.offers.map((offer) => (
              <article className="offer-card" key={offer.id}>
                <a className="offer-card__image" href={offer.productUrl} target="_blank" rel="noreferrer" aria-label={`Abrir ${offer.title}`}>
                  {offer.imageUrl ? <img src={offer.imageUrl} alt="" loading="lazy" /> : <Icon name="tag-price" size={32} />}
                  {offer.discountPercentage > 0 && <span>−{offer.discountPercentage}%</span>}
                </a>
                <div className="offer-card__body">
                  <div className="offer-card__source"><i className={`is-${offer.source}`}>{offer.source === 'shopee' ? 'S' : offer.source === 'amazon' ? 'A' : 'M'}</i>{marketplace(offer.source)}{offer.shopName && <span>· {offer.shopName}</span>}</div>
                  <span className="offer-card__category">{data?.categories.find((item) => item.value === offer.category)?.label || 'Outros'}</span>
                  <h2 title={offer.title}>{offer.title}</h2>
                  <div className="offer-card__price">
                    <strong>{money(offer.currentPrice)}</strong>
                    {offer.originalPrice && offer.originalPrice > offer.currentPrice && <del>{money(offer.originalPrice)}</del>}
                  </div>
                  <div className="offer-card__actions">
                    <button type="button" onClick={() => void copy(offer)}>{copied === offer.id ? 'Link copiado' : 'Copiar link'}</button>
                    <a href={offer.affiliateUrl} target="_blank" rel="noreferrer">Abrir oferta ↗</a>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}

        {!loading && (data?.total ?? 0) > 0 && (
          <footer className="my-offers__pagination">
            <span>{data?.total} ofertas salvas</span>
            <div>
              <button disabled={page <= 1} onClick={() => { setLoading(true); setPage((value) => value - 1) }}>Anterior</button>
              <span>{page} de {pages}</span>
              <button disabled={page >= pages} onClick={() => { setLoading(true); setPage((value) => value + 1) }}>Próxima</button>
            </div>
          </footer>
        )}
      </div>
    </AppLayout>
  )
}
