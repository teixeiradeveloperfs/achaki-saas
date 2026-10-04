import type { ComponentProps, ReactNode } from 'react'
import { Icon } from '../Icon'
import type { IconName } from '../Icon'
import './TextField.css'

export type TextFieldProps = Omit<ComponentProps<'input'>, 'id'> & {
  id: string
  label: string
  icon: IconName
  /** Shown on the label row, aligned right (e.g. a help link). */
  labelAction?: ReactNode
  /** Rendered inside the input, on the right (e.g. a toggle button). */
  trailing?: ReactNode
}

export function TextField({ id, label, icon, labelAction, trailing, ...input }: TextFieldProps) {
  return (
    <div className="field">
      <div className="field__row">
        <label htmlFor={id}>{label}</label>
        {labelAction}
      </div>
      <div className="field__control">
        <Icon name={icon} className="field__icon" />
        <input id={id} {...input} />
        {trailing}
      </div>
    </div>
  )
}
