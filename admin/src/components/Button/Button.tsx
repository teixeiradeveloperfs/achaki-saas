import type { ComponentProps } from 'react'
import './Button.css'

type ButtonProps = ComponentProps<'button'>

export function Button({ type = 'button', className = '', ...props }: ButtonProps) {
  return <button type={type} className={`button ${className}`} {...props} />
}
