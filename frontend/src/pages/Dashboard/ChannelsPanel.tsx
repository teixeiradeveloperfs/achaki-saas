import { Icon } from '../../components/Icon'
import type { Channel } from './data'

type ChannelsPanelProps = {
  channels: Channel[]
  onToggle: (channel: Channel) => void
  onAdd: () => void
}

export function ChannelsPanel({ channels, onToggle, onAdd }: ChannelsPanelProps) {
  return (
    <section className="panel" id="canais" aria-labelledby="canais-title">
      <header className="panel__header">
        <div>
          <h2 id="canais-title">Meus canais</h2>
          <p>Uma boa oferta, no lugar certo.</p>
        </div>
      </header>

      <ul className="channels">
        {channels.map((channel) => (
          <li className="channels__item" key={channel.id}>
            <span className="channels__icon">
              <Icon name="users-group-rounded" />
            </span>
            <div className="channels__text">
              <strong>{channel.name}</strong>
              <span>
                {channel.category} · {channel.sent} envios
              </span>
            </div>
            <button
              type="button"
              className="switch"
              role="switch"
              aria-checked={channel.active}
              aria-label={`${channel.active ? 'Pausar' : 'Ativar'} ${channel.name}`}
              onClick={() => onToggle(channel)}
            />
          </li>
        ))}
      </ul>

      <button type="button" className="channels__add" onClick={onAdd}>
        <Icon name="add-circle" size={18} />
        Adicionar canal
      </button>
    </section>
  )
}
