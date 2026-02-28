import { useTranslation } from 'react-i18next'

export default function FaqSection() {
  const { t } = useTranslation()

  const faqItems = [
    { key: 'setup', q: t('home.faq.items.setup.q'), a: t('home.faq.items.setup.a') },
    { key: 'domain', q: t('home.faq.items.domain.q'), a: t('home.faq.items.domain.a') },
    { key: 'payments', q: t('home.faq.items.payments.q'), a: t('home.faq.items.payments.a') },
    { key: 'support', q: t('home.faq.items.support.q'), a: t('home.faq.items.support.a') },
  ]

  return (
    <section className="px-6 py-16">
      <div className="mx-auto w-full max-w-6xl">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand-700)]">{t('home.faq.kicker')}</p>
        <h2 className="mt-3 text-center font-display text-4xl font-semibold text-[var(--ink-900)] sm:text-5xl">{t('home.faq.title')}</h2>
        <div className="mx-auto mt-10 grid max-w-4xl gap-4">
          {faqItems.map((item) => (
            <details key={item.key} className="elegant-card bg-[var(--panel-strong)] p-5" open={item.key === 'setup'}>
              <summary className="cursor-pointer text-base font-semibold text-[var(--ink-900)]">{item.q}</summary>
              <p className="mt-3 text-sm leading-relaxed text-[var(--ink-700)]">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
