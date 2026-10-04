import { useState } from 'react'
import { Icon } from '../../components/Icon'
import { users } from './data'

const ALL = 'Todos os status'
const STATUSES = ['Ativo', 'Bloqueado']

const number = (value: number) => value.toLocaleString('pt-BR')
const normalize = (value: string) => value.toLocaleLowerCase('pt-BR')

export function UsersPanel() {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState(ALL)

  const filtered = users.filter(
    (user) => (status === ALL || user.status === status) && normalize(`${user.name} ${user.email}`).includes(normalize(query)),
  )

  return (
    <section className="panel" id="usuarios" aria-labelledby="usuarios-title">
      <header className="panel__header">
        <div>
          <h2 id="usuarios-title">Últimos cadastros</h2>
          <p>Contas criadas mais recentemente na plataforma.</p>
        </div>
        <div className="table-filters">
          <div className="search">
            <Icon name="magnifer" size={18} />
            <input
              type="search"
              aria-label="Buscar usuários"
              placeholder="Buscar por nome ou e-mail"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <select className="select" aria-label="Filtrar por status" value={status} onChange={(event) => setStatus(event.target.value)}>
            <option>{ALL}</option>
            {STATUSES.map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
        </div>
      </header>

      {filtered.length > 0 ? (
        <div className="table-scroll">
          <table className="table">
            <thead>
              <tr>
                <th>Usuário</th>
                <th>Canais</th>
                <th>Ofertas enviadas</th>
                <th>Status</th>
                <th>Cadastro</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user.id}>
                  <td>
                    <strong>{user.name}</strong>
                    <span>{user.email}</span>
                  </td>
                  <td>{user.channels}</td>
                  <td>{number(user.sent)}</td>
                  <td>
                    <span className={`status ${user.status === 'Ativo' ? 'status--active' : 'status--blocked'}`}>
                      <Icon name={user.status === 'Ativo' ? 'check-circle' : 'forbidden-circle'} size={16} />
                      {user.status}
                    </span>
                  </td>
                  <td>{user.joined}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty">
          <Icon name="inbox-line" size={28} />
          <strong>Nenhum usuário encontrado</strong>
          <p>Tente outro termo ou escolha outro status.</p>
          <button
            type="button"
            className="link"
            onClick={() => {
              setQuery('')
              setStatus(ALL)
            }}
          >
            Limpar filtros
          </button>
        </div>
      )}
    </section>
  )
}
