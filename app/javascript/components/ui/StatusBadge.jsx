const VARIANTS = {
  success: 'border border-emerald-300 bg-emerald-100 text-emerald-900',
  danger: 'border border-red-300 bg-red-100 text-red-900',
  warning: 'border border-amber-300 bg-amber-100 text-amber-900',
  neutral: 'border border-[var(--line-soft)] bg-[var(--panel-strong)] text-[var(--ink-700)]',
}

export default function StatusBadge({ variant = 'neutral', className = '', children }) {
  const tone = VARIANTS[variant] || VARIANTS.neutral
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${tone} ${className}`.trim()}>
      {children}
    </span>
  )
}
