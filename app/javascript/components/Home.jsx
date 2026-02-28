import { useTranslation } from 'react-i18next'

const RESTAURANT_LINK = '/empanadas-demo'

export default function Home() {
  const { t } = useTranslation()

  const features = [
    { key: 'menu', title: t('home.features.menu.title'), text: t('home.features.menu.text') },
    { key: 'orders', title: t('home.features.orders.title'), text: t('home.features.orders.text') },
    { key: 'products', title: t('home.features.products.title'), text: t('home.features.products.text') },
  ]

  const flowSteps = [t('home.steps.1'), t('home.steps.2'), t('home.steps.3'), t('home.steps.4')]

  const moreItems = [
    { key: 'sync', title: t('home.more.items.sync.title'), text: t('home.more.items.sync.text') },
    { key: 'qr', title: t('home.more.items.qr.title'), text: t('home.more.items.qr.text') },
    { key: 'status', title: t('home.more.items.status.title'), text: t('home.more.items.status.text') },
    { key: 'multi', title: t('home.more.items.multi.title'), text: t('home.more.items.multi.text') },
  ]

  const whyItems = [
    { key: 'speed', title: t('home.why.items.speed.title'), text: t('home.why.items.speed.text') },
    { key: 'clarity', title: t('home.why.items.clarity.title'), text: t('home.why.items.clarity.text') },
    { key: 'scale', title: t('home.why.items.scale.title'), text: t('home.why.items.scale.text') },
  ]

  const faqItems = [
    { key: 'setup', q: t('home.faq.items.setup.q'), a: t('home.faq.items.setup.a') },
    { key: 'domain', q: t('home.faq.items.domain.q'), a: t('home.faq.items.domain.a') },
    { key: 'payments', q: t('home.faq.items.payments.q'), a: t('home.faq.items.payments.a') },
    { key: 'support', q: t('home.faq.items.support.q'), a: t('home.faq.items.support.a') },
  ]

  return (
    <div className="min-h-screen overflow-x-clip text-[var(--ink-900)]">
      <section className="relative isolate overflow-hidden border-b border-[var(--line-soft)] bg-gradient-to-br from-[#fff7f2] via-[#fff3ed] to-[#ffe9df] px-6 pb-28 pt-8 text-[var(--ink-900)]">
        <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-[var(--panel-soft)] blur-2xl" aria-hidden="true" />
        <div className="absolute right-0 top-8 h-64 w-64 rounded-full bg-[var(--brand-600)]/15 blur-2xl" aria-hidden="true" />
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-full border border-[var(--line-soft)] bg-[var(--panel-strong)] text-xs font-semibold">
              QR
            </div>
            <span className="font-display text-3xl font-semibold">PedidoFácil</span>
          </div>
        </div>

        <div className="relative mx-auto mt-14 grid w-full max-w-6xl gap-12 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-[var(--ink-500)]">{t('home.badge')}</p>
            <h1 className="max-w-2xl text-5xl font-semibold leading-tight sm:text-6xl">{t('home.title')}</h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-[var(--ink-700)] sm:text-lg">{t('home.description')}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={RESTAURANT_LINK} className="inline-flex items-center justify-center rounded-full bg-[var(--panel-strong)] px-5 py-2.5 text-sm font-semibold text-[var(--brand-700)] shadow-[0_14px_25px_rgba(0,0,0,0.28)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_28px_rgba(0,0,0,0.34)]">
                {t('home.viewDemo')}
              </a>
              <a href="/panel/login" className="inline-flex items-center justify-center rounded-full border border-[var(--line-soft)] bg-[var(--panel-soft)] px-5 py-2.5 text-sm font-semibold text-[var(--ink-900)] transition hover:bg-[var(--panel-strong)]">
                {t('home.adminLogin')}
              </a>
            </div>
          </div>

          <div className="relative mx-auto h-[390px] w-full max-w-[530px] sm:h-[420px]">
            <div className="absolute left-[8%] top-[7%] h-56 w-40 rounded-3xl border border-[var(--line-soft)] bg-[var(--panel-strong)] p-3 shadow-2xl">
              <div className="h-3 w-20 rounded-full bg-[var(--panel-strong)]" />
              <div className="mt-3 space-y-2">
                <div className="h-8 rounded-lg bg-[var(--panel-strong)]" />
                <div className="h-8 rounded-lg bg-[var(--panel-strong)]" />
                <div className="h-8 rounded-lg bg-[var(--panel-strong)]" />
              </div>
              <div className="mt-5 h-9 rounded-full bg-gradient-to-r from-[var(--brand-600)] to-[var(--brand-700)]" />
            </div>

            <div className="absolute right-[6%] top-[1%] h-64 w-44 rotate-[8deg] rounded-3xl border border-[var(--line-soft)] bg-[var(--panel-strong)] p-3 shadow-2xl">
              <div className="h-3 w-24 rounded-full bg-[var(--panel-strong)]" />
              <div className="mt-3 h-24 rounded-xl bg-[var(--panel-strong)]" />
              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="h-10 rounded-lg bg-[var(--panel-strong)]" />
                <div className="h-10 rounded-lg bg-[var(--panel-strong)]" />
              </div>
              <div className="mt-4 h-8 rounded-full bg-gradient-to-r from-[var(--brand-600)] to-[var(--brand-700)]" />
            </div>

            <div className="absolute bottom-3 left-[22%] w-[74%] rounded-3xl border border-[var(--line-soft)] bg-[var(--panel-strong)] p-6 text-[var(--ink-900)] shadow-2xl">
              <h2 className="font-display text-3xl font-semibold">{t('home.howItWorks')}</h2>
              <ol className="mt-4 space-y-2 text-sm leading-relaxed text-[var(--ink-700)]">
                {flowSteps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 -bottom-14 h-28 -skew-y-3 bg-[var(--bg-cream-soft)]" aria-hidden="true" />
      </section>

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

      <section className="px-6 py-16">
        <div className="mx-auto max-w-6xl rounded-3xl border border-[var(--line-soft)] bg-gradient-to-r from-[var(--panel)] via-[var(--panel-strong)] to-[var(--panel-soft)] p-8 shadow-[0_18px_40px_rgba(0,0,0,0.35)] sm:p-10">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-[var(--line-soft)] bg-[var(--panel-strong)] p-5 text-center backdrop-blur">
              <div className="font-display text-5xl font-semibold text-[var(--ink-900)]">2 min</div>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--ink-500)]">{t('home.stats.order')}</p>
            </div>
            <div className="rounded-2xl border border-[var(--line-soft)] bg-[var(--panel-strong)] p-5 text-center backdrop-blur">
              <div className="font-display text-5xl font-semibold text-[var(--ink-900)]">24/7</div>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--ink-500)]">{t('home.stats.availability')}</p>
            </div>
            <div className="rounded-2xl border border-[var(--line-soft)] bg-[var(--panel-strong)] p-5 text-center backdrop-blur">
              <div className="font-display text-5xl font-semibold text-[var(--ink-900)]">0%</div>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--ink-500)]">{t('home.stats.fees')}</p>
            </div>
          </div>
        </div>
      </section>

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

      <section className="px-6 py-16">
        <div className="mx-auto max-w-6xl rounded-3xl border border-[var(--line-soft)] bg-gradient-to-br from-[var(--panel)] via-[var(--panel-strong)] to-[var(--panel-soft)] p-8 text-center shadow-[0_20px_45px_rgba(0,0,0,0.38)] sm:p-12">
          <h2 className="font-display text-4xl font-semibold text-[var(--ink-900)] sm:text-5xl">{t('home.ctaTitle')}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-[var(--ink-700)] sm:text-base">{t('home.ctaText')}</p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <a href={RESTAURANT_LINK} className="elegant-button-primary shadow-[0_12px_24px_rgba(166,41,84,0.32)]">
              {t('home.viewDemo')}
            </a>
            <a href="/panel/login" className="elegant-button-secondary">
              {t('home.adminLogin')}
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
