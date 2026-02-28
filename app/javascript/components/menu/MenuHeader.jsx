import { useTranslation } from 'react-i18next'

export default function MenuHeader({ restaurant }) {
  const { t } = useTranslation()

  return (
    <header className="border-b border-[var(--line-soft)] bg-[linear-gradient(180deg,#fff7f2,#fff0e8)]">
      <div className="mx-auto max-w-6xl px-4 pb-7 pt-8 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="flex min-w-0 flex-1 gap-4">
            <div className="grid h-[74px] w-[74px] shrink-0 place-items-center rounded-full border border-[var(--brand-600)] bg-[var(--panel)] font-display text-2xl font-semibold text-[var(--brand-700)] shadow-sm">
              {initials(restaurant.name)}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand-700)]">Signature Menu</p>
              <h1 className="font-display text-5xl font-semibold leading-none text-[var(--ink-900)] sm:text-6xl">{restaurant.name}</h1>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-medium text-[var(--ink-500)]">
                <span>Today 11:30 - 15:00 and 19:15 - 23:00</span>
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${restaurant.accepting_orders ? 'border border-emerald-800/40 bg-emerald-900/30 text-emerald-300' : 'border border-red-900/50 bg-red-950/35 text-red-300'}`}>
                  {restaurant.accepting_orders ? t('menu.open') : t('menu.closed')}
                </span>
              </div>
              {!restaurant.accepting_orders && <div className="mt-1 text-sm text-red-300">{t('menu.notAccepting')}</div>}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {restaurant.phone && (
                  <a href={`tel:${restaurant.phone}`} className="elegant-button-secondary !rounded-lg !px-4 !py-2 !text-xs">
                    {t('menu.call')}
                  </a>
                )}
                {restaurant.phone && (
                  <a href={whatsappUrl(restaurant.phone)} target="_blank" rel="noreferrer" className="elegant-button-secondary !rounded-lg !px-4 !py-2 !text-xs">
                    WhatsApp
                  </a>
                )}
                <a href="#menu-sections" className="elegant-button-primary !rounded-lg !px-4 !py-2 !text-xs">
                  Menu
                </a>
              </div>
            </div>
          </div>

          <div className="elegant-card w-full bg-[var(--panel)] p-4 sm:w-[260px]">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ink-500)]">{t('menu.location')}</div>
            <div className="mt-2 text-sm leading-relaxed text-[var(--ink-700)]">{restaurant.address || t('menu.addressNotAvailable')}</div>
          </div>
        </div>
      </div>
    </header>
  )
}

function initials(name) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

function whatsappUrl(phone) {
  const digits = String(phone).replace(/\D/g, '')
  return `https://wa.me/${digits}`
}
