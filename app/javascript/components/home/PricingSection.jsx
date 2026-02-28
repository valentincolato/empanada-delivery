import { useTranslation } from 'react-i18next'

export default function PricingSection() {
  const { t } = useTranslation()

  return (
    <section className="relative border-y border-[var(--line-soft)] bg-[var(--panel)] px-6 py-16">
      <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand-700)]">{t('home.pricingBadge')}</p>
          <h2 className="mt-3 font-display text-4xl font-semibold text-[var(--ink-900)] sm:text-5xl">{t('home.pricingTitle')}</h2>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-[var(--ink-700)] sm:text-base">{t('home.pricingText')}</p>
        </div>
        <div className="elegant-card bg-[var(--panel-strong)] p-7">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="font-display text-4xl font-semibold text-[var(--ink-900)]">0%</div>
              <p className="mt-1 text-xs uppercase tracking-[0.14em] text-[var(--ink-500)]">{t('home.stats.fees')}</p>
            </div>
            <div>
              <div className="font-display text-4xl font-semibold text-[var(--ink-900)]">24/7</div>
              <p className="mt-1 text-xs uppercase tracking-[0.14em] text-[var(--ink-500)]">{t('home.stats.availability')}</p>
            </div>
            <div>
              <div className="font-display text-4xl font-semibold text-[var(--ink-900)]">+1</div>
              <p className="mt-1 text-xs uppercase tracking-[0.14em] text-[var(--ink-500)]">{t('home.stats.panel')}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
