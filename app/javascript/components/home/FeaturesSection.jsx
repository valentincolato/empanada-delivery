import { useTranslation } from 'react-i18next'

export default function FeaturesSection() {
  const { t } = useTranslation()

  const features = [
    { key: 'menu', title: t('home.features.menu.title'), text: t('home.features.menu.text') },
    { key: 'orders', title: t('home.features.orders.title'), text: t('home.features.orders.text') },
    { key: 'products', title: t('home.features.products.title'), text: t('home.features.products.text') },
  ]

  return (
    <section className="relative mx-auto w-full max-w-6xl px-6 pb-16 pt-10">
      <div className="absolute -left-10 top-24 h-24 w-24 rounded-full bg-[var(--brand-600)]/35 blur-xl" aria-hidden="true" />
      <div className="absolute right-2 top-8 h-20 w-20 rounded-full bg-[var(--ink-700)]/15 blur-xl" aria-hidden="true" />

      <div className="grid gap-6 md:grid-cols-3">
        {features.map((item, idx) => (
          <article key={item.key} className={`elegant-card bg-[var(--panel)] p-6 ${idx === 1 ? 'md:-translate-y-4' : ''}`}>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand-700)]">0{idx + 1}</p>
            <h3 className="mt-3 font-display text-3xl font-semibold text-[var(--ink-900)]">{item.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ink-700)]">{item.text}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
