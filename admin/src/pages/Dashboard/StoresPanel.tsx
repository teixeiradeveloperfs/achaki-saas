import type { StoreShare } from './data'

const number = (value: number) => value.toLocaleString('pt-BR')

export function StoresPanel({ stores, periodLabel }: { stores: StoreShare[]; periodLabel: string }) {
  const total = stores.reduce((sum, store) => sum + store.sent, 0)

  return (
    <section className="panel" id="lojas" aria-labelledby="lojas-title">
      <header className="panel__header">
        <div>
          <h2 id="lojas-title">Envios por loja</h2>
          <p>Ofertas enviadas nos últimos {periodLabel}.</p>
        </div>
      </header>

      <ul className="ranking">
        {stores.map((store) => {
          const share = Math.round((store.sent / total) * 100)
          return (
            <li className="ranking__item" key={store.name}>
              <div className="ranking__row">
                <strong>{store.name}</strong>
                <span>
                  {number(store.sent)} · {share}%
                </span>
              </div>
              <div className="ranking__meter" aria-hidden="true">
                <i style={{ width: `${share}%` }} />
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
