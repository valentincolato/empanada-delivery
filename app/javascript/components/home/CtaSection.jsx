import { useTranslation } from 'react-i18next'

export default function CtaSection({ restaurantLink }) {
  const { t } = useTranslation()

  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-6xl rounded-3xl border border-[var(--line-soft)] bg-gradient-to-br from-[var(--panel)] via-[var(--panel-strong)] to-[var(--panel-soft)] p-8 text-center shadow-[0_20px_45px_rgba(0,0,0,0.38)] sm:p-12">
        <h2 className="font-display text-4xl font-semibold text-[var(--ink-900)] sm:text-5xl">{t('home.ctaTitle')}</h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-[var(--ink-700)] sm:text-base">{t('home.ctaText')}</p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <a href={restaurantLink} className="elegant-button-primary shadow-[0_12px_24px_rgba(166,41,84,0.32)]">
            {t('home.viewDemo')}
          </a>
          <a href="/panel/login" className="elegant-button-secondary">
            {t('home.adminLogin')}
          </a>
        </div>
      </div>
    </section>
  )
}
