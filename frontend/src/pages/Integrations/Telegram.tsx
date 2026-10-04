import { useEffect, useState } from 'react'
import { getJson, postJson } from '../../services/api'
import { Button } from '../../components/Button'
import { PasswordField, TextField } from '../../components/TextField'

type Connection = { id: string; kind: 'bot' | 'account'; name: string; username: string | null; verifiedAt: string }
async function result<T>(response: Response): Promise<T> {
  const body = await response.json()
  if (!response.ok) throw new Error(typeof body.message === 'string' ? body.message : 'Não foi possível concluir a operação.')
  return body as T
}

export function Telegram() {
  const [connections, setConnections] = useState<Connection[]>([])
  const [kind, setKind] = useState<'bot' | 'account'>('bot')
  const [token, setToken] = useState('')
  const [apiId, setApiId] = useState('')
  const [apiHash, setApiHash] = useState('')
  const [session, setSession] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  useEffect(() => {
    let active = true
    void getJson('/integrations/telegram').then(result<Connection[]>).then(data => { if (active) setConnections(data) }).catch(() => { if (active) setError('Não foi possível carregar as conexões do Telegram. Recarregue a página.') })
    return () => { active = false }
  }, [])

  async function save() {
    setBusy(true); setError(''); setNotice('')
    try {
      const row = await result<Connection>(await postJson('/integrations/telegram', kind === 'bot' ? { kind, token } : { kind, apiId: Number(apiId), apiHash, session }))
      setConnections(items => [...items.filter(item => item.id !== row.id), row])
      setToken(''); setApiHash(''); setSession('')
      setNotice('Conexão validada e cadastrada.')
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Falha ao conectar ao Telegram.') }
    finally { setBusy(false) }
  }
  async function remove(id: string) {
    if (!window.confirm('Remover este cadastro da Achaki? Para revogar uma sessão de conta, use também Dispositivos no Telegram.')) return
    setBusy(true); setError(''); setNotice('')
    try {
      await result(await fetch(`${import.meta.env.VITE_API_URL}/integrations/telegram/${id}`, { method: 'DELETE', credentials: 'include' }))
      setConnections(items => items.filter(item => item.id !== id))
      setNotice('Cadastro removido da Achaki.')
    } catch { setError('Não foi possível remover o cadastro.') }
    finally { setBusy(false) }
  }
  return <section className="integration-card" aria-labelledby="telegram-title">
    <header className="integration-card__header"><div><h2 id="telegram-title">Telegram</h2><p>Cadastre seus bots e contas. Nenhuma mensagem será enviada nesta etapa.</p></div></header>
    <form className="integration-form" onSubmit={event => { event.preventDefault(); void save() }}>
      <label>Tipo de conexão <select value={kind} disabled={busy} onChange={event => { setKind(event.target.value as 'bot' | 'account'); setToken(''); setApiHash(''); setSession('') }}><option value="bot">Bot (token do BotFather)</option><option value="account">Conta pessoal (importar sessão)</option></select></label>
      {kind === 'bot' ? <PasswordField id="telegram-token" label="Token do bot" autoComplete="off" value={token} onChange={event => setToken(event.target.value)} required disabled={busy} /> : <>
        <TextField id="telegram-api-id" label="API ID" icon="user" type="number" min={1} value={apiId} onChange={event => setApiId(event.target.value)} required disabled={busy} />
        <PasswordField id="telegram-api-hash" label="API Hash" autoComplete="off" value={apiHash} onChange={event => setApiHash(event.target.value)} required disabled={busy} />
        <PasswordField id="telegram-session" label="StringSession autenticada" autoComplete="off" value={session} onChange={event => setSession(event.target.value)} required disabled={busy} />
        <p className="integration-feedback">Importe uma sessão Teleproto/GramJS já autenticada. Obtenha API ID e Hash em <a href="https://my.telegram.org/apps" target="_blank" rel="noreferrer">my.telegram.org</a>. A sessão permite acesso à conta: utilize somente uma sessão sua. Login por telefone/código ainda não está disponível nesta tela.</p>
      </>}
      {error && <p className="integration-feedback is-error" role="alert">{error}</p>}
      {notice && <p className="integration-feedback is-success" role="status">{notice}</p>}
      <div className="integration-actions"><Button type="submit" disabled={busy}>{busy ? 'Aguarde…' : 'Validar e cadastrar'}</Button></div>
    </form>
    {connections.map(item => <div className="integration-card__footer" key={item.id}><div><strong>{item.name}</strong> · {item.kind === 'bot' ? 'Bot' : 'Conta pessoal'} {item.username && `· @${item.username}`}<br /><small>Validado em {new Date(item.verifiedAt).toLocaleString('pt-BR')}</small></div><button type="button" className="integration-test" disabled={busy} onClick={() => void remove(item.id)}>Remover cadastro</button></div>)}
  </section>
}
