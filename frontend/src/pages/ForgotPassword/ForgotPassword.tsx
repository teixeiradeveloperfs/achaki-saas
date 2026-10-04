import { useState } from 'react'
import { Link } from 'react-router'
import { Button } from '../../components/Button'
import { FormError } from '../../components/FormError'
import { Icon } from '../../components/Icon'
import { TextField } from '../../components/TextField'
import { AuthLayout } from '../../layouts/AuthLayout'
import { AUTH_ERRORS, requestPasswordReset } from '../../services/auth'

const backToLogin = (
  <Link className="link auth__back" to="/login">
    <Icon name="arrow-left" size={18} />
    Voltar para o login
  </Link>
)

export function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  async function submit() {
    setError('')
    setLoading(true)
    const result = await requestPasswordReset(email)
    setLoading(false)
    if (result === 'ok') setSent(true)
    else setError(AUTH_ERRORS[result])
  }

  if (sent) {
    return (
      <AuthLayout
        title="Confira seu e-mail"
        lead={
          <>
            Se existir uma conta para <strong>{email.trim()}</strong>, enviamos um link para você criar uma nova senha.
          </>
        }
        footer={backToLogin}
      />
    )
  }

  return (
    <AuthLayout
      title="Recupere sua senha"
      lead="Informe seu e-mail e enviaremos um link para criar uma nova senha."
      footer={backToLogin}
    >
      <form
        className="auth__form"
        onSubmit={(event) => {
          event.preventDefault()
          void submit()
        }}
      >
        <TextField
          id="email"
          name="email"
          type="email"
          label="E-mail"
          icon="letter"
          autoComplete="email"
          inputMode="email"
          placeholder="voce@exemplo.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />

        <FormError message={error} />

        <Button type="submit" className="auth__submit" disabled={loading}>
          {loading ? 'Enviando…' : 'Enviar link'}
          <Icon name="arrow-right" />
        </Button>
      </form>
    </AuthLayout>
  )
}
