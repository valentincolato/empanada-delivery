import { useTranslation } from 'react-i18next'

export default function WhySection() {
  const { t } = useTranslation()

  const whyItems = [
    { key: 'speed', title: t('home.why.items.speed.title'), text: t('home.why.items.speed.text') },
    { key: 'clarity', title: t('home.why.items.clarity.title'), text: t('home.why.items.clarity.text') },
    { key: 'scale', title: t('home.why.items.scale.title'), text: t('home.why.items.scale.text') },
  ]

  return (
    <section className="relative border-y border-[var(--line-soft)] bg-[var(--panel)] px-6 py-16">
      <div className="mx-auto w-full max-w-6xl">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand-700)]">{t('home.why.kicker')}</p>
        <h2 className="mt-3 text-center font-display text-4xl font-semibold text-[var(--ink-900)] sm:text-5xl">{t('home.why.title')}</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {whyItems.map((item) => (
            <article key={item.key} className="elegant-card bg-[var(--panel-strong)] p-6">
              <h3 className="font-display text-3xl font-semibold text-[var(--ink-900)]">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ink-700)]">{item.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
