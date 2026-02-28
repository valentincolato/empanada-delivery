import { useTranslation } from 'react-i18next'

export default function MoreSection() {
  const { t } = useTranslation()

  const moreItems = [
    { key: 'sync', title: t('home.more.items.sync.title'), text: t('home.more.items.sync.text') },
    { key: 'qr', title: t('home.more.items.qr.title'), text: t('home.more.items.qr.text') },
    { key: 'status', title: t('home.more.items.status.title'), text: t('home.more.items.status.text') },
    { key: 'multi', title: t('home.more.items.multi.title'), text: t('home.more.items.multi.text') },
  ]

  return (
    <section className="relative border-y border-[var(--line-soft)] bg-[var(--panel)] px-6 py-16">
      <div className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[1.06fr_0.94fr] lg:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand-700)]">{t('home.more.kicker')}</p>
          <h2 className="mt-3 max-w-xl font-display text-4xl font-semibold text-[var(--ink-900)] sm:text-5xl">{t('home.more.title')}</h2>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-[var(--ink-700)] sm:text-base">{t('home.more.text')}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {moreItems.map((item) => (
            <article key={item.key} className="elegant-card bg-[var(--panel-strong)] p-5">
              <h3 className="font-display text-2xl font-semibold text-[var(--ink-900)]">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ink-700)]">{item.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
