import { useTranslation } from 'react-i18next'

export function EmptyState() {
  const { t } = useTranslation()

  return (
    <section className="grid min-h-[380px] place-items-center px-4 text-center text-[var(--ink-700)]">
      <div>
        <div className="font-display text-7xl text-[var(--brand-700)]">Menu</div>
        <h2 className="mb-1 mt-2 font-display text-4xl font-semibold text-[var(--ink-900)]">{t('menu.emptyMenuTitle')}</h2>
        <p className="mx-auto max-w-2xl text-sm">{t('menu.emptyMenuDesc')}</p>
      </div>
    </section>
  )
}

export function ClosedState() {
  const { t } = useTranslation()

  return (
    <section className="grid min-h-[380px] place-items-center px-4 text-center text-[var(--ink-700)]">
      <div>
        <h2 className="mb-1 mt-2 font-display text-4xl font-semibold text-[var(--ink-900)]">{t('menu.closed')}</h2>
        <p className="mx-auto max-w-2xl text-sm">{t('menu.notAccepting')}</p>
      </div>
    </section>
  )
}
