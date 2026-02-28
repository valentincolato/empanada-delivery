import { useTranslation } from 'react-i18next'
import Card from '../../ui/Card'

function StatCard({ label, value }) {
  return (
    <Card className="rounded-lg border border-[var(--line-soft)] bg-[var(--panel-strong)] px-3 py-2 text-center">
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--ink-500)]">{label}</p>
      <p className="text-lg font-bold text-[var(--ink-900)]">{value}</p>
    </Card>
  )
}

export default function RestaurantsToolbar({ query, stats, onQueryChange, onOpenNew }) {
  const { t } = useTranslation()

  return (
    <>
      <div className="border-b border-[var(--line-soft)] bg-[var(--panel)] px-4 py-4 sm:px-6">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand-700)]">{t('superAdmin.restaurants.subtitle')}</p>
            <h1 className="font-display text-5xl font-semibold text-[var(--ink-900)]">{t('superAdmin.restaurants.title')}</h1>
            <p className="mt-1 text-sm text-[var(--ink-700)]">{t('superAdmin.restaurants.description')}</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={onOpenNew} className="elegant-button-primary !rounded-lg !px-4 !py-2 !text-sm">{t('superAdmin.restaurants.newRestaurant')}</button>
          </div>
        </div>
      </div>

      <div className="mb-5 grid gap-3 rounded-2xl border border-[var(--line-soft)] bg-[var(--panel)] p-4 shadow-[0_12px_30px_rgba(22,18,10,0.08)] md:grid-cols-[1fr_auto]">
        <label className="text-sm">
          <span className="mb-1 block font-medium text-[var(--ink-700)]">{t('superAdmin.restaurants.search')}</span>
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder={t('superAdmin.restaurants.searchPlaceholder')}
            className="w-full rounded-lg border border-[var(--line-soft)] bg-[var(--panel-strong)] px-3 py-2 text-sm text-[var(--ink-700)] outline-none ring-[var(--focus-ring)] transition focus:ring"
          />
        </label>

        <div className="grid grid-cols-3 gap-2 md:min-w-72">
          <StatCard label={t('superAdmin.restaurants.stats.total')} value={stats.total} />
          <StatCard label={t('superAdmin.restaurants.stats.active')} value={stats.active} />
          <StatCard label={t('superAdmin.restaurants.stats.inactive')} value={stats.inactive} />
        </div>
      </div>
    </>
  )
}
