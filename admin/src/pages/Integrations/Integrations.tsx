import { useEffect, useState } from 'react'
import { Button } from '../../components/Button'
import { FormError } from '../../components/FormError'
import { Icon } from '../../components/Icon'
import { PasswordField, TextField } from '../../components/TextField'
import { AppLayout } from '../../layouts/AppLayout'
import { getShopeeIntegration, saveShopeeIntegration, testShopeeIntegration } from '../../services/integrations'
import type { ShopeeIntegration } from '../../services/integrations'
import './Integrations.css'

type Feedback = { kind: 'success' | 'error'; message: string } | null

export function Integrations() {
  const [settings, setSettings] = useState<ShopeeIntegration | null>(null)
  const [appId, setAppId] = useState('')
  const [secret, setSecret] = useState('')
  const [enabled, setEnabled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [feedback, setFeedback] = useState<Feedback>(null)

  useEffect(() => {
    let cancelled = false
    void getShopeeIntegration()
      .then((result) => {
        if (cancelled) return
        setSettings(result)
        setAppId(result.appId)
        setEnabled(result.enabled)
      })
      .catch((error: unknown) => {
        if (!cancelled) setFeedback({ kind: 'error', message: error instanceof Error ? error.message : 'Não foi possível carregar a integração.' })
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  async function save() {
    setSaving(true)
    setFeedback(null)
    try {
      const next = await saveShopeeIntegration({ appId: appId.trim(), enabled, ...(secret.trim() ? { secret: secret.trim() } : {}) })
      setSettings(next)
      setSecret('')
      setFeedback({ kind: 'success', message: 'Configuração da Shopee salva com segurança.' })
    } catch (error) {
      setFeedback({ kind: 'error', message: error instanceof Error ? error.message : 'Não foi possível salvar.' })
    } finally {
      setSaving(false)
    }
  }

  async function testConnection() {
    setTesting(true)
    setFeedback(null)
    try {
      const result = await testShopeeIntegration()
      setFeedback({ kind: 'success', message: `Conexão aprovada. A Shopee respondeu com ${result.offersReturned} oferta de teste.` })
    } catch (error) {
      setFeedback({ kind: 'error', message: error instanceof Error ? error.message : 'A conexão falhou.' })
    } finally {
      setTesting(false)
    }
  }

  return (
    <AppLayout>
      <div className="integrations-page">
        <header className="integrations-page__header">
          <div>
            <p className="integrations-page__eyebrow">Plataforma</p>
            <h1>Integrações</h1>
            <p>Defina as contas usadas pelo motor dos canais padrão do Achaki.</p>
          </div>
        </header>

        <section className="integration-card" aria-labelledby="shopee-title">
          <header className="integration-card__header">
            <div className="integration-card__identity">
              <span className="integration-card__logo" aria-hidden="true">S</span>
              <div>
                <h2 id="shopee-title">Shopee Affiliate</h2>
                <p>Fonte padrão para buscar ofertas e gerar links da plataforma.</p>
              </div>
            </div>
            <span className={`integration-status ${settings?.configured && enabled ? 'is-online' : ''}`}>
              <i />{loading ? 'Carregando' : settings?.configured && enabled ? 'Ativa' : settings?.configured ? 'Desativada' : 'Não configurada'}
            </span>
          </header>

          <form
            className="integration-form"
            onSubmit={(event) => {
              event.preventDefault()
              void save()
            }}
          >
            <div className="integration-form__fields">
              <TextField
                id="shopee-app-id"
                label="App ID"
                icon="user"
                autoComplete="off"
                placeholder="Informe o App ID da Open API"
                value={appId}
                onChange={(event) => setAppId(event.target.value)}
                disabled={loading}
                required
              />
              <PasswordField
                id="shopee-secret"
                label="Secret"
                labelAction={settings?.hasSecret ? <span className="integration-form__saved"><Icon name="check-circle" size={15} /> Salvo</span> : undefined}
                autoComplete="new-password"
                placeholder={settings?.hasSecret ? 'Deixe vazio para manter o atual' : 'Informe o Secret da Open API'}
                value={secret}
                onChange={(event) => setSecret(event.target.value)}
                disabled={loading}
                required={!settings?.hasSecret}
              />
            </div>

            <label className="integration-toggle">
              <input type="checkbox" checked={enabled} onChange={(event) => setEnabled(event.target.checked)} disabled={loading} />
              <span aria-hidden="true" />
              <div><strong>Usar como fonte padrão</strong><small>Quando ativa, o motor pode consultar ofertas usando esta conta.</small></div>
            </label>

            {feedback?.kind === 'error' && <FormError message={feedback.message} />}
            {feedback?.kind === 'success' && <p className="integration-success" role="status"><Icon name="check-circle" />{feedback.message}</p>}

            <footer className="integration-form__actions">
              <p><Icon name="lock-password" size={17} />O Secret é criptografado e não pode ser visualizado depois de salvo.</p>
              <div>
                <button className="integration-test" type="button" disabled={!settings?.configured || saving || testing} onClick={() => void testConnection()}>
                  {testing ? 'Testando…' : 'Testar conexão'}
                </button>
                <Button type="submit" disabled={loading || saving || !appId.trim()}>{saving ? 'Salvando…' : 'Salvar alterações'}</Button>
              </div>
            </footer>
          </form>
        </section>

        <aside className="integration-note"><Icon name="danger-circle" /><div><strong>Escopo atual</strong><p>Esta configuração alimenta somente o motor de busca de ofertas. Nenhum canal, mensagem ou envio é criado por esta tela.</p></div></aside>
      </div>
    </AppLayout>
  )
}
