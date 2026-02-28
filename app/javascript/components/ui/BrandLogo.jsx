export default function BrandLogo({ size = 'md', withWordmark = true }) {
  const sizeClass = size === 'lg'
    ? 'h-16 w-16'
    : size === 'sm'
      ? 'h-10 w-10'
      : 'h-12 w-12'

  const markTextClass = size === 'lg' ? 'text-lg' : size === 'sm' ? 'text-xs' : 'text-sm'
  const textClass = size === 'lg' ? 'text-5xl' : 'text-3xl'

  return (
    <div className="flex items-center gap-3 text-[var(--ink-900)]">
      <div className={`brand-mark ${sizeClass}`} aria-hidden="true">
        <span className={`brand-mark-text ${markTextClass}`}>PF</span>
      </div>
      {withWordmark && <span className={`font-display font-semibold leading-none ${textClass}`}>PedidoFácil</span>}
    </div>
  )
}
