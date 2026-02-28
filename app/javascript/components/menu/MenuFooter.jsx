import { useTranslation } from 'react-i18next'

export default function MenuFooter({ restaurant }) {
  const { t } = useTranslation()

  return (
    <footer className="border-t border-[var(--line-soft)] bg-[var(--panel)] px-4 pb-20 pt-7 text-center sm:px-6">
      <div className="font-display text-3xl font-semibold text-[var(--ink-900)]">{restaurant.name}</div>
      <div className="mt-4 flex flex-wrap justify-center gap-12 text-left">
        <div>
          <div className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--ink-500)]">{t('menu.location')}</div>
          <div className="text-sm text-[var(--ink-700)]">{restaurant.address || t('common.notDefined')}</div>
        </div>
        <div>
          <div className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--ink-500)]">{t('menu.contact')}</div>
          <div className="text-sm text-[var(--ink-700)]">{restaurant.phone || t('common.notDefined')}</div>
        </div>
      </div>
    </footer>
  )
}
