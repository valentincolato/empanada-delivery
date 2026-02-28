export default function SectionTitle({ kicker, title, description, align = 'left', className = '' }) {
  const alignClass = align === 'center' ? 'text-center' : 'text-left'

  return (
    <div className={[alignClass, className].filter(Boolean).join(' ')}>
      {kicker && <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand-700)]">{kicker}</p>}
      {title && <h2 className="mt-3 font-display text-4xl font-semibold text-[var(--ink-900)] sm:text-5xl">{title}</h2>}
      {description && <p className="mt-4 text-sm leading-relaxed text-[var(--ink-700)] sm:text-base">{description}</p>}
    </div>
  )
}
