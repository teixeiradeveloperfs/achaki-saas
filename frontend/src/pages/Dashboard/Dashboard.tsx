import { useEffect, useRef, useState } from 'react'
import { Button } from '../../components/Button'
import { Icon } from '../../components/Icon'
import type { IconName } from '../../components/Icon'
import { AppLayout } from '../../layouts/AppLayout'
import { ActivityChart } from './ActivityChart'
import { ChannelsPanel } from './ChannelsPanel'
import { NewChannelDialog } from './NewChannelDialog'
import { OffersPanel } from './OffersPanel'
import { initialChannels, periods } from './data'
import type { PeriodKey } from './data'
import './Dashboard.css'

const PERIOD_KEYS = Object.keys(periods) as PeriodKey[]

export function Dashboard() {
  const [period, setPeriod] = useState<PeriodKey>('7D')
  const [channels, setChannels] = useState(initialChannels)
  const [notice, setNotice] = useState('')
  const dialog = useRef<HTMLDialogElement>(null)

  const data = periods[period]
  const active = channels.filter((channel) => channel.active).length

  useEffect(() => {
    if (!notice) return
    const timer = setTimeout(() => setNotice(''), 4000)
    return () => clearTimeout(timer)
  }, [notice])

  const stats: { label: string; value: string; detail: string; icon: IconName }[] = [
    { label: 'Ofertas encontradas', value: data.found, detail: 'Selecionadas pelos seus filtros', icon: 'tag-price' },
    { label: 'Ofertas enviadas', value: data.sent, detail: 'Compartilhadas nos seus canais', icon: 'plain-2' },
    { label: 'Canais ativos', value: String(active), detail: `De ${channels.length} canais criados`, icon: 'users-group-rounded' },
    { label: 'Tempo economizado', value: data.saved, detail: 'Estimativa de 5 min por envio', icon: 'clock-circle' },
  ]

  return (
    <AppLayout>
      <div className="dashboard" id="resumo">
        <header className="dashboard__header">
          <div>
            <p className="dashboard__eyebrow">Visão geral</p>
            <h1 className="dashboard__title">Dashboard</h1>
            <p className="dashboard__lead">Acompanhe o que está chegando e o que já foi para seus grupos.</p>
          </div>
          <div className="dashboard__actions">
            <div className="segmented" role="group" aria-label="Período">
              {PERIOD_KEYS.map((key) => (
                <button key={key} type="button" aria-pressed={key === period} onClick={() => setPeriod(key)}>
                  {key}
                </button>
              ))}
            </div>
            <Button className="button--compact" onClick={() => dialog.current?.showModal()}>
              <Icon name="add-circle" />
              Novo canal
            </Button>
          </div>
        </header>

        <p className="dashboard__demo">
          <Icon name="danger-circle" size={18} />
          Modo demonstração: os dados abaixo são ilustrativos e nenhuma mensagem é enviada.
        </p>

        <section className="stats" aria-label={`Resumo dos últimos ${data.label}`}>
          {stats.map((stat) => (
            <article className="stat" key={stat.label}>
              <div className="stat__label">
                <Icon name={stat.icon} />
                {stat.label}
              </div>
              <strong className="stat__value">{stat.value}</strong>
              <span className="stat__detail">{stat.detail}</span>
            </article>
          ))}
        </section>

        <div className="dashboard__split">
          <section className="panel" aria-labelledby="envios-title">
            <header className="panel__header">
              <div>
                <h2 id="envios-title">Ofertas enviadas</h2>
                <p>Envios nos últimos {data.label}.</p>
              </div>
            </header>
            <ActivityChart points={data.points} />
          </section>

          <ChannelsPanel
            channels={channels}
            onAdd={() => dialog.current?.showModal()}
            onToggle={(channel) => {
              setChannels(channels.map((item) => (item.id === channel.id ? { ...item, active: !item.active } : item)))
              setNotice(`${channel.name}: ${channel.active ? 'pausado' : 'ativado'} nesta demonstração.`)
            }}
          />
        </div>

        <OffersPanel />

        <p className={`toast ${notice ? 'is-visible' : ''}`} role="status">
          {notice}
        </p>
      </div>

      <NewChannelDialog
        ref={dialog}
        onCreate={(name, category) => {
          setChannels([...channels, { id: Date.now(), name, category, active: false, sent: 0 }])
          setNotice('Canal de exemplo criado. A conexão com o Telegram ainda não está disponível.')
        }}
      />
    </AppLayout>
  )
}
