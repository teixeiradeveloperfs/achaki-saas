import { useState } from 'react'
import { Link } from 'react-router'
import { Button } from '../../components/Button'
import { FormError } from '../../components/FormError'
import { Icon } from '../../components/Icon'
import { PasswordField, TextField } from '../../components/TextField'
import { AuthLayout } from '../../layouts/AuthLayout'
import { AUTH_ERRORS, register } from '../../services/auth'

export function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit() {
    setError('')
    setLoading(true)
    const result = await register(name, email, password)
    setLoading(false)
    if (result === 'ok') window.location.assign('/integracoes?boas-vindas=1')
    else setError(AUTH_ERRORS[result])
  }

  return (
    <AuthLayout
      title="Crie sua conta"
      lead="Leva menos de um minuto para começar."
      footer={
        <>
          Já tem conta?{' '}
          <Link className="link" to="/login">
            Entrar
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
          id="name"
          name="name"
          type="text"
          label="Nome"
          icon="user"
          autoComplete="name"
          placeholder="Seu nome"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />

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
          autoComplete="new-password"
          placeholder="Mínimo de 12 caracteres"
          minLength={12}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />

        <FormError message={error} />

        <Button type="submit" className="auth__submit" disabled={loading}>
          {loading ? 'Criando conta…' : 'Criar conta'}
          <Icon name="arrow-right" />
        </Button>
      </form>
    </AuthLayout>
  )
}
