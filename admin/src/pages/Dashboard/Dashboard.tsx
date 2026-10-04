import { useState } from 'react'
import { Icon } from '../../components/Icon'
import type { IconName } from '../../components/Icon'
import { AppLayout } from '../../layouts/AppLayout'
import { SignupsChart } from './SignupsChart'
import { StoresPanel } from './StoresPanel'
import { UsersPanel } from './UsersPanel'
import { periods } from './data'
import type { PeriodKey } from './data'
import './Dashboard.css'

const PERIOD_KEYS = Object.keys(periods) as PeriodKey[]

export function Dashboard() {
  const [period, setPeriod] = useState<PeriodKey>('7D')
  const data = periods[period]

  const stats: { label: string; value: string; detail: string; icon: IconName }[] = [
    { label: 'Usuários cadastrados', value: data.users, detail: 'Total de contas na plataforma', icon: 'users-group-rounded' },
    { label: 'Novos usuários', value: data.newUsers, detail: `Cadastros nos últimos ${data.label}`, icon: 'user-plus' },
    { label: 'Canais ativos', value: data.activeChannels, detail: 'Recebendo ofertas agora', icon: 'bolt-circle' },
    { label: 'Ofertas enviadas', value: data.sent, detail: `Envios nos últimos ${data.label}`, icon: 'plain-2' },
  ]

  return (
    <AppLayout>
      <div className="dashboard" id="resumo">
        <header className="dashboard__header">
          <div>
            <p className="dashboard__eyebrow">Visão geral</p>
            <h1 className="dashboard__title">Dashboard</h1>
            <p className="dashboard__lead">Acompanhe usuários, canais e envios de toda a plataforma.</p>
          </div>
          <div className="dashboard__actions">
            <div className="segmented" role="group" aria-label="Período">
              {PERIOD_KEYS.map((key) => (
                <button key={key} type="button" aria-pressed={key === period} onClick={() => setPeriod(key)}>
                  {key}
                </button>
              ))}
            </div>
          </div>
        </header>

        <p className="dashboard__demo">
          <Icon name="danger-circle" size={18} />
          Modo demonstração: os dados abaixo são ilustrativos, o painel ainda não está ligado à API.
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
          <section className="panel" aria-labelledby="cadastros-title">
            <header className="panel__header">
              <div>
                <h2 id="cadastros-title">Novos cadastros</h2>
                <p>Contas criadas nos últimos {data.label}.</p>
              </div>
            </header>
            <SignupsChart points={data.signups} />
          </section>

          <StoresPanel stores={data.stores} periodLabel={data.label} />
        </div>

        <UsersPanel />
      </div>
    </AppLayout>
  )
}
