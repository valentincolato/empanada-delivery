import { useTranslation } from 'react-i18next'

export default function HeroSection({ restaurantLink }) {
  const { t } = useTranslation()
  const flowSteps = [t('home.steps.1'), t('home.steps.2'), t('home.steps.3'), t('home.steps.4')]

  return (
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
            <a href={restaurantLink} className="inline-flex items-center justify-center rounded-full bg-[var(--panel-strong)] px-5 py-2.5 text-sm font-semibold text-[var(--brand-700)] shadow-[0_14px_25px_rgba(0,0,0,0.28)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_28px_rgba(0,0,0,0.34)]">
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
  )
}
