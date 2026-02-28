import { useTranslation } from 'react-i18next'

const RESTAURANT_LINK = '/empanadas-demo'

export default function Home() {
  const { t } = useTranslation()

  const features = [
    { key: 'menu', title: t('home.features.menu.title'), text: t('home.features.menu.text') },
    { key: 'orders', title: t('home.features.orders.title'), text: t('home.features.orders.text') },
    { key: 'products', title: t('home.features.products.title'), text: t('home.features.products.text') },
  ]

  return (
    <div className="min-h-screen bg-neutral-100 text-slate-900">
      <section className="relative overflow-hidden bg-gradient-to-r from-orange-600 to-rose-500 px-6 pb-24 pt-16 text-white">
        <div className="absolute -left-24 -top-24 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-20 right-0 h-72 w-72 rounded-full bg-black/10 blur-2xl" />
        <div className="relative mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-white/80">{t('home.badge')}</p>
            <h1 className="max-w-2xl text-4xl font-bold leading-tight sm:text-5xl">
              {t('home.title')}
            </h1>
            <p className="mt-5 max-w-xl text-base text-white/90 sm:text-lg">
              {t('home.description')}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={RESTAURANT_LINK} className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-orange-600 shadow-lg transition hover:scale-[1.02]">
                {t('home.viewDemo')}
              </a>
              <a href="/panel/login" className="rounded-full border border-white/70 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/15">
                {t('home.adminLogin')}
              </a>
            </div>
          </div>

          <div className="rounded-2xl border border-white/25 bg-black/20 p-6 shadow-2xl backdrop-blur-sm">
            <h2 className="text-xl font-semibold">{t('home.howItWorks')}</h2>
            <ol className="mt-4 space-y-3 text-sm text-white/90">
              <li>{t('home.steps.1')}</li>
              <li>{t('home.steps.2')}</li>
              <li>{t('home.steps.3')}</li>
              <li>{t('home.steps.4')}</li>
            </ol>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-6 px-6 py-16 md:grid-cols-3">
        {features.map((item) => (
          <article key={item.key} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{item.text}</p>
          </article>
        ))}
      </section>
    </div>
  )
}
