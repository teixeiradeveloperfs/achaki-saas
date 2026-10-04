import { useState } from 'react'
import { Link } from 'react-router'
import { Button } from '../../components/Button'
import { FormError } from '../../components/FormError'
import { Icon } from '../../components/Icon'
import { PasswordField, TextField } from '../../components/TextField'
import { AuthLayout } from '../../layouts/AuthLayout'
import { AUTH_ERRORS, login } from '../../services/auth'

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit() {
    setError('')
    setLoading(true)
    const result = await login(email, password)
    setLoading(false)
    if (result === 'ok') window.location.assign('/dashboard')
    else setError(AUTH_ERRORS[result])
  }

  return (
    <AuthLayout
      title="Acesse sua conta"
      lead="Ofertas certas, no seu grupo, no momento certo."
      footer={
        <>
          Ainda não tem conta?{' '}
          <Link className="link" to="/cadastro">
            Criar conta
          </Link>
        </>
      }
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

        <PasswordField
          id="password"
          name="password"
          label="Senha"
          labelAction={
            <Link className="link" to="/recuperar-senha">
              Esqueci minha senha
            </Link>
          }
          autoComplete="current-password"
          placeholder="Sua senha"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />

        <FormError message={error} />

        <Button type="submit" className="auth__submit" disabled={loading}>
          {loading ? 'Entrando…' : 'Entrar'}
          <Icon name="arrow-right" />
        </Button>
      </form>
    </AuthLayout>
  )
}
