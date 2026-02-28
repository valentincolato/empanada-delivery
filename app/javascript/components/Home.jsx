import { useTranslation } from 'react-i18next'
import LanguageSwitcher from './LanguageSwitcher'

const RESTAURANT_LINK = '/empanadas-demo'

export default function Home() {
  const { t } = useTranslation()

  const features = [
    { key: 'menu', title: t('home.features.menu.title'), text: t('home.features.menu.text') },
    { key: 'orders', title: t('home.features.orders.title'), text: t('home.features.orders.text') },
    { key: 'products', title: t('home.features.products.title'), text: t('home.features.products.text') },
  ]

  return (
    <div className="min-h-screen text-[var(--ink-900)]">
      <section className="relative overflow-hidden border-b border-[var(--line-soft)] px-6 pb-20 pt-8">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-full border border-[var(--gold-600)] bg-[var(--panel)] text-xs font-semibold text-[var(--gold-700)]">
              QR
            </div>
            <span className="font-display text-3xl font-semibold">QueResto</span>
          </div>
          <LanguageSwitcher className="!border-[var(--line-soft)] !bg-white/70" />
        </div>

        <div className="relative mx-auto mt-12 grid w-full max-w-6xl gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-[var(--gold-700)]">{t('home.badge')}</p>
            <h1 className="max-w-2xl text-5xl font-semibold leading-tight text-[var(--ink-900)] sm:text-6xl">
              {t('home.title')}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-[var(--ink-700)] sm:text-lg">
              {t('home.description')}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={RESTAURANT_LINK} className="elegant-button-primary shadow-[0_12px_24px_rgba(127,96,47,0.28)]">
                {t('home.viewDemo')}
              </a>
              <a href="/panel/login" className="elegant-button-secondary">
                {t('home.adminLogin')}
              </a>
            </div>
          </div>

          <div className="elegant-card bg-[var(--panel)] p-7">
            <h2 className="font-display text-3xl font-semibold text-[var(--ink-900)]">{t('home.howItWorks')}</h2>
            <ol className="mt-4 space-y-3 text-sm leading-relaxed text-[var(--ink-700)]">
              <li>{t('home.steps.1')}</li>
              <li>{t('home.steps.2')}</li>
              <li>{t('home.steps.3')}</li>
              <li>{t('home.steps.4')}</li>
            </ol>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-6 px-6 py-14 md:grid-cols-3">
        {features.map((item) => (
          <article key={item.key} className="elegant-card bg-white/75 p-6">
            <h3 className="font-display text-3xl font-semibold text-[var(--ink-900)]">{item.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ink-700)]">{item.text}</p>
          </article>
        ))}
      </section>
    </div>
  )
}
