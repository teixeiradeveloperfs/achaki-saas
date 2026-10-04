export type IconName =
  | 'letter'
  | 'lock-password'
  | 'eye'
  | 'eye-closed'
  | 'arrow-right'
  | 'arrow-left'
  | 'user'
  | 'danger-circle'
  | 'tag-price'
  | 'users-group-rounded'
  | 'bolt-circle'
  | 'widget'
  | 'logout-2'
  | 'hamburger-menu'
  | 'add-circle'
  | 'magnifer'
  | 'close-circle'
  | 'clock-circle'
  | 'plain-2'
  | 'inbox-line'
  | 'double-alt-arrow-left'

type IconProps = {
  name: IconName
  size?: number
  className?: string
}

/** Solar Broken Line icon from the /icons/ui.svg sprite; inherits the text color. */
export function Icon({ name, size = 20, className }: IconProps) {
  return (
    <svg className={className} width={size} height={size} aria-hidden="true" focusable="false">
      <use href={`/icons/ui.svg#${name}`} />
    </svg>
  )
}
