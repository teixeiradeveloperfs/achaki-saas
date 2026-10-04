import { useState } from 'react'
import { useSearchParams } from 'react-router'
import { useSession } from '../../auth/session-context'
import { Button } from '../../components/Button'
import { Icon } from '../../components/Icon'
import { PasswordField, TextField } from '../../components/TextField'
import { AppLayout } from '../../layouts/AppLayout'
import { updateProfile } from '../../services/auth'
import './Profile.css'

export function Profile() {
  const session = useSession()
  const [params] = useSearchParams()
  const [name, setName] = useState(session.user.name)
  const [email, setEmail] = useState(session.user.email)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function save() {
    setError('')
    if (newPassword && newPassword !== confirmPassword) {
      setError('A confirmação da nova senha não confere.')
      return
    }
    setLoading(true)
    try {
      await updateProfile({
        name: name.trim(),
        email: email.trim(),
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined,
      })
      window.location.assign('/perfil?salvo=1')
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Não foi possível atualizar seu perfil.')
      setLoading(false)
    }
  }

  const sensitiveChange = email.trim().toLowerCase() !== session.user.email || Boolean(newPassword)

  return (
    <AppLayout>
      <div className="profile-page">
        <header className="profile-page__header">
          <p className="profile-page__eyebrow">Sua conta</p>
          <h1>Perfil</h1>
          <p>Atualize seus dados de acesso e informações pessoais.</p>
        </header>

        {params.has('salvo') && <p className="profile-feedback is-success"><Icon name="bolt-circle" />Perfil atualizado com sucesso.</p>}
        {error && <p className="profile-feedback is-error" role="alert"><Icon name="danger-circle" />{error}</p>}

        <form
          className="profile-card"
          onSubmit={(event) => {
            event.preventDefault()
            void save()
          }}
        >
          <section className="profile-section">
            <header><span><Icon name="user" /></span><div><h2>Dados pessoais</h2><p>Informações usadas para identificar sua conta.</p></div></header>
            <div className="profile-fields">
              <TextField id="profile-name" name="name" label="Nome" icon="user" autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} required />
              <TextField id="profile-email" name="email" type="email" label="E-mail" icon="letter" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            </div>
          </section>

          <section className="profile-section">
            <header><span><Icon name="lock-password" /></span><div><h2>Segurança</h2><p>Deixe a nova senha vazia caso não queira alterá-la.</p></div></header>
            <div className="profile-fields">
              <PasswordField id="profile-new-password" name="newPassword" label="Nova senha" autoComplete="new-password" placeholder="Mínimo de 12 caracteres" minLength={12} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} />
              <PasswordField id="profile-confirm-password" name="confirmPassword" label="Confirmar nova senha" autoComplete="new-password" placeholder="Repita a nova senha" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required={Boolean(newPassword)} />
              <div className="profile-current-password">
                <PasswordField id="profile-current-password" name="currentPassword" label={`Senha atual${sensitiveChange ? '' : ' (necessária ao trocar e-mail ou senha)'}`} autoComplete="current-password" placeholder="Confirme sua identidade" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} required={sensitiveChange} />
              </div>
            </div>
          </section>

          <footer className="profile-actions">
            <p><Icon name="lock-password" size={17} />Alterar a senha encerra as outras sessões da sua conta.</p>
            <Button type="submit" className="button--compact" disabled={loading}>{loading ? 'Salvando…' : 'Salvar alterações'}</Button>
          </footer>
        </form>
      </div>
    </AppLayout>
  )
}
