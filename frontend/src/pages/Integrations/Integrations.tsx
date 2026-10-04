import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import { Button } from '../../components/Button'
import { Icon } from '../../components/Icon'
import { PasswordField, TextField } from '../../components/TextField'
import { AppLayout } from '../../layouts/AppLayout'
import {
  getShopeeIntegration,
  saveShopeeIntegration,
  testShopeeIntegration,
  type ShopeeIntegration,
} from '../../services/integrations'
import './Integrations.css'
import { Telegram } from './Telegram'

export function Integrations() {
  const [params] = useSearchParams()
  const [status, setStatus] = useState<ShopeeIntegration | null>(null)
  const [appId, setAppId] = useState('')
  const [secret, setSecret] = useState('')
  const [enabled, setEnabled] = useState(true)
  const [busy, setBusy] = useState<'load' | 'save' | 'test' | null>('load')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    void getShopeeIntegration()
      .then((data) => {
        setStatus(data)
        setAppId(data.appId)
        setEnabled(data.enabled)
      })
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Não foi possível carregar a integração.'))
      .finally(() => setBusy(null))
  }, [])

  async function save() {
    setBusy('save')
    setError('')
    setMessage('')
    try {
      const data = await saveShopeeIntegration({ appId: appId.trim(), secret: secret.trim() || undefined, enabled })
      setStatus(data)
      setSecret('')
      setMessage('Integração salva com segurança.')
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Não foi possível salvar a integração.')
    } finally {
      setBusy(null)
    }
  }

  async function test() {
    setBusy('test')
    setError('')
    setMessage('')
    try {
      await testShopeeIntegration()
      setMessage('Conexão aprovada pela Shopee. Sua integração está pronta.')
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Não foi possível testar a integração.')
    } finally {
      setBusy(null)
    }
  }

  return (
    <AppLayout>
      <div className="integrations-page">
        <header className="integrations-page__header">
          <p className="integrations-page__eyebrow">Sua conta</p>
          <h1>Integrações</h1>
          <p>Conecte sua conta de afiliado para que os links e as comissões sejam seus.</p>
        </header>

        {params.has('boas-vindas') && (
          <div className="integration-welcome">
            <Icon name="bolt-circle" />
            <div>
              <strong>Conta criada. Agora falta conectar sua primeira fonte.</strong>
              <p>Use o App ID e o Secret do seu cadastro de afiliado da Shopee.</p>
            </div>
          </div>
        )}

        <section className="integration-card" aria-labelledby="shopee-title">
          <header className="integration-card__header">
            <div className="integration-card__brand" aria-hidden="true">S</div>
            <div>
              <div className="integration-card__title-row">
                <h2 id="shopee-title">Shopee Afiliados</h2>
                <span className={`integration-status ${status?.configured ? 'is-ready' : ''}`}>
                  {status?.configured ? 'Configurada' : 'Pendente'}
                </span>
              </div>
              <p>Credenciais individuais da Shopee Affiliate Open API.</p>
            </div>
          </header>

          <form
            className="integration-form"
            onSubmit={(event) => {
              event.preventDefault()
              void save()
            }}
          >
            <TextField
              id="shopee-app-id"
              name="appId"
              label="App ID"
              icon="user"
              autoComplete="off"
              placeholder="Seu App ID da Shopee"
              value={appId}
              onChange={(event) => setAppId(event.target.value)}
              disabled={busy === 'load'}
              required
            />
            <PasswordField
              id="shopee-secret"
              name="secret"
              label={status?.hasSecret ? 'Secret (deixe vazio para manter o atual)' : 'Secret'}
              autoComplete="new-password"
              placeholder={status?.hasSecret ? 'Secret já armazenado com segurança' : 'Seu Secret da Shopee'}
              value={secret}
              onChange={(event) => setSecret(event.target.value)}
              disabled={busy === 'load'}
              required={!status?.hasSecret}
            />

            <label className="integration-toggle">
              <input type="checkbox" checked={enabled} onChange={(event) => setEnabled(event.target.checked)} />
              <span aria-hidden="true" />
              Usar esta integração para buscar ofertas
            </label>

            {error && <p className="integration-feedback is-error" role="alert">{error}</p>}
            {message && <p className="integration-feedback is-success" role="status">{message}</p>}

            <div className="integration-actions">
              <Button type="submit" className="button--compact" disabled={busy !== null}>
                {busy === 'save' ? 'Salvando…' : 'Salvar integração'}
              </Button>
              <button type="button" className="integration-test" disabled={!status?.configured || busy !== null} onClick={() => void test()}>
                {busy === 'test' ? 'Testando…' : 'Testar conexão'}
              </button>
            </div>
          </form>

          <footer className="integration-card__footer">
            <Icon name="lock-password" size={18} />
            O Secret é criptografado e as ofertas desta integração são atualizadas automaticamente.
          </footer>
        </section>
        <Telegram />
      </div>
    </AppLayout>
  )
}
