import { useState } from 'react'
import { Icon } from '../Icon'
import { TextField } from './TextField'
import type { TextFieldProps } from './TextField'

type PasswordFieldProps = Omit<TextFieldProps, 'type' | 'icon' | 'trailing'>

export function PasswordField(props: PasswordFieldProps) {
  const [shown, setShown] = useState(false)

  return (
    <TextField
      {...props}
      type={shown ? 'text' : 'password'}
      icon="lock-password"
      trailing={
        <button
          type="button"
          className="field__toggle"
          onClick={() => setShown((value) => !value)}
          aria-label={shown ? 'Ocultar senha' : 'Mostrar senha'}
          aria-pressed={shown}
        >
          <Icon name={shown ? 'eye-closed' : 'eye'} />
        </button>
      }
    />
  )
}
