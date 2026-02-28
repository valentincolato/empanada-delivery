const VARIANTS = {
  success: 'border border-emerald-800/40 bg-emerald-900/30 text-emerald-300',
  danger: 'border border-red-900/50 bg-red-950/35 text-red-300',
  warning: 'border border-amber-800/40 bg-amber-900/30 text-amber-300',
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
