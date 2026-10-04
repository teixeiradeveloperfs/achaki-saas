import { Icon } from '../Icon'
import './FormError.css'

export function FormError({ message }: { message: string }) {
  if (!message) return null
  return (
    <p className="form-error" role="alert">
      <Icon name="danger-circle" />
      {message}
    </p>
  )
}
