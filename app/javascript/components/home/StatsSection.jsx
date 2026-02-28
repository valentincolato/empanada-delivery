import { useTranslation } from 'react-i18next'

function Stat({ value, label }) {
  return (
    <div className="rounded-2xl border border-[var(--line-soft)] bg-[var(--panel-strong)] p-5 text-center backdrop-blur">
      <div className="font-display text-5xl font-semibold text-[var(--ink-900)]">{value}</div>
      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--ink-500)]">{label}</p>
    </div>
  )
}

export default function StatsSection() {
  const { t } = useTranslation()

  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-6xl rounded-3xl border border-[var(--line-soft)] bg-gradient-to-r from-[var(--panel)] via-[var(--panel-strong)] to-[var(--panel-soft)] p-8 shadow-[0_18px_40px_rgba(0,0,0,0.35)] sm:p-10">
        <div className="grid gap-6 md:grid-cols-3">
          <Stat value="2 min" label={t('home.stats.order')} />
          <Stat value="24/7" label={t('home.stats.availability')} />
          <Stat value="0%" label={t('home.stats.fees')} />
        </div>
      </div>
    </section>
  )
}
