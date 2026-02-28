import { useTranslation } from 'react-i18next'

export default function RestaurantsPagination({ safePage, pageCount, onChangePage }) {
  const { t } = useTranslation()

  const pageButtons = Array.from({ length: pageCount }, (_, i) => i + 1)
    .filter((n) => Math.abs(n - safePage) <= 2 || n === 1 || n === pageCount)

  return (
    <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
      <button
        type="button"
        disabled={safePage === 1}
        onClick={() => onChangePage(1)}
        className="rounded-md border border-[var(--line-soft)] bg-[var(--panel-strong)] px-3 py-1.5 text-sm text-[var(--ink-700)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {t('superAdmin.restaurants.pagination.first')}
      </button>

      <button
        type="button"
        disabled={safePage === 1}
        onClick={() => onChangePage(Math.max(1, safePage - 1))}
        className="rounded-md border border-[var(--line-soft)] bg-[var(--panel-strong)] px-3 py-1.5 text-sm text-[var(--ink-700)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {t('superAdmin.restaurants.pagination.prev')}
      </button>

      {pageButtons.map((n, idx, arr) => (
        <span key={n} className="inline-flex items-center">
          {idx > 0 && arr[idx - 1] !== n - 1 && <span className="px-1 text-[var(--ink-500)]">...</span>}
          <button
            type="button"
            onClick={() => onChangePage(n)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${safePage === n ? 'bg-[var(--brand-600)] text-white' : 'border border-[var(--line-soft)] bg-[var(--panel-strong)] text-[var(--ink-700)]'}`}
          >
            {n}
          </button>
        </span>
      ))}

      <button
        type="button"
        disabled={safePage === pageCount}
        onClick={() => onChangePage(Math.min(pageCount, safePage + 1))}
        className="rounded-md border border-[var(--line-soft)] bg-[var(--panel-strong)] px-3 py-1.5 text-sm text-[var(--ink-700)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {t('superAdmin.restaurants.pagination.next')}
      </button>

      <button
        type="button"
        disabled={safePage === pageCount}
        onClick={() => onChangePage(pageCount)}
        className="rounded-md border border-[var(--line-soft)] bg-[var(--panel-strong)] px-3 py-1.5 text-sm text-[var(--ink-700)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {t('superAdmin.restaurants.pagination.last')}
      </button>
    </div>
  )
}
