import { useState } from 'react'
import { Icon } from '../../components/Icon'
import { STORES, offers } from './data'

const ALL_STORES = 'Todas as lojas'

const money = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const normalize = (value: string) => value.toLocaleLowerCase('pt-BR')

export function OffersPanel() {
  const [query, setQuery] = useState('')
  const [store, setStore] = useState(ALL_STORES)

  const filtered = offers.filter(
    (offer) => (store === ALL_STORES || offer.store === store) && normalize(`${offer.title} ${offer.channel}`).includes(normalize(query)),
  )

  return (
    <section className="panel" id="ofertas" aria-labelledby="ofertas-title">
      <header className="panel__header">
        <div>
          <h2 id="ofertas-title">Últimos achados</h2>
          <p>Ofertas que passaram pelos seus filtros.</p>
        </div>
        <div className="offers__filters">
          <div className="search">
            <Icon name="magnifer" size={18} />
            <input
              type="search"
              aria-label="Buscar ofertas"
              placeholder="Buscar oferta"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <select className="select" aria-label="Filtrar por loja" value={store} onChange={(event) => setStore(event.target.value)}>
            <option>{ALL_STORES}</option>
            {STORES.map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
        </div>
      </header>

      {filtered.length > 0 ? (
        <div className="offers__scroll">
          <table className="offers">
            <thead>
              <tr>
                <th>Produto</th>
                <th>Loja</th>
                <th>Preço</th>
                <th>Desconto</th>
                <th>Status</th>
                <th>Encontrado</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((offer) => (
                <tr key={offer.id}>
                  <td>
                    <strong>{offer.title}</strong>
                    <span>{offer.channel}</span>
                  </td>
                  <td>{offer.store}</td>
                  <td>
                    <strong>{money(offer.price)}</strong>
                    <del>{money(offer.original)}</del>
                  </td>
                  <td>−{Math.round((1 - offer.price / offer.original) * 100)}%</td>
                  <td>
                    <span className={`status ${offer.status === 'Enviada' ? 'status--sent' : ''}`}>
                      <Icon name={offer.status === 'Enviada' ? 'plain-2' : 'clock-circle'} size={16} />
                      {offer.status}
                    </span>
                  </td>
                  <td>{offer.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty">
          <Icon name="inbox-line" size={28} />
          <strong>Nenhum achado por aqui</strong>
          <p>Tente outro termo ou escolha outra loja.</p>
          <button
            type="button"
            className="link"
            onClick={() => {
              setQuery('')
              setStore(ALL_STORES)
            }}
          >
            Limpar filtros
          </button>
        </div>
      )}
    </section>
  )
}
