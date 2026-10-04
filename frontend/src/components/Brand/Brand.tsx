import './Brand.css'

type BrandProps = {
  theme?: 'light' | 'dark' | 'system'
  symbolOnly?: boolean
  className?: string
}

/** Explicit theme wins; otherwise follows data-theme on an ancestor, then the OS. */
export function Brand({ theme = 'system', symbolOnly = false, className = '' }: BrandProps) {
  const light = symbolOnly ? '/brand/marks/brand-mark.svg' : '/brand/logos/logo-light.svg'
  const dark = symbolOnly ? '/brand/marks/brand-mark-dark.svg' : '/brand/logos/logo-dark.svg'
  return (
    <span className={`achaki-brand ${symbolOnly ? 'achaki-brand--symbol' : ''} ${className}`} data-brand-theme={theme}>
      <img className="achaki-brand__light" src={light} alt="Achaki" width={symbolOnly ? 96 : 384} height="96" />
      <img className="achaki-brand__dark" src={dark} alt="Achaki" width={symbolOnly ? 96 : 384} height="96" />
    </span>
  )
}
