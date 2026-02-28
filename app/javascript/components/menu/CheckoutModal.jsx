import { useTranslation } from 'react-i18next'

export default function CheckoutModal({ form, items, onChange, onUpdateQuantity, onSubmit, onClose, submitting, error, total }) {
  const { t } = useTranslation()

  return (
    <div className="fixed inset-0 z-[100] flex bg-black/40 p-4 backdrop-blur-[1px]">
      <div className="m-auto grid w-full max-w-5xl overflow-hidden rounded-3xl border border-[var(--line-soft)] bg-[var(--panel)] text-[var(--ink-900)] md:grid-cols-[1.08fr_0.92fr]">
        <div className="border-b border-[var(--line-soft)] p-6 md:border-b-0 md:border-r">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-4xl font-semibold">{t('menu.checkout.title')}</h2>
            <button onClick={onClose} className="rounded-full border border-[var(--line-soft)] px-2.5 py-1 text-[var(--ink-500)]">x</button>
          </div>
          <form onSubmit={onSubmit} className="flex flex-col gap-3">
            <div className="rounded-2xl border border-[var(--line-soft)] bg-[var(--panel-strong)] p-4">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-500)]">{t('menu.checkout.yourData')}</h3>
              <div className="grid gap-3">
                <label className="flex flex-col gap-1 text-sm text-[var(--ink-700)]">
                  {t('menu.checkout.fullName')}
                  <input
                    type="text"
                    required
                    value={form.customer_name}
                    onChange={(e) => onChange('customer_name', e.target.value)}
                    className="rounded-md border border-[var(--line-soft)] bg-[var(--panel-strong)] px-3 py-2 text-sm text-[var(--ink-900)] outline-none focus:border-[var(--brand-600)]"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm text-[var(--ink-700)]">
                  {t('menu.checkout.email')}
                  <input
                    type="email"
                    required
                    value={form.customer_email}
                    onChange={(e) => onChange('customer_email', e.target.value)}
                    className="rounded-md border border-[var(--line-soft)] bg-[var(--panel-strong)] px-3 py-2 text-sm text-[var(--ink-900)] outline-none focus:border-[var(--brand-600)]"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm text-[var(--ink-700)]">
                  {t('menu.checkout.phone')}
                  <input
                    type="tel"
                    required
                    value={form.customer_phone}
                    onChange={(e) => onChange('customer_phone', e.target.value)}
                    className="rounded-md border border-[var(--line-soft)] bg-[var(--panel-strong)] px-3 py-2 text-sm text-[var(--ink-900)] outline-none focus:border-[var(--brand-600)]"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm text-[var(--ink-700)]">
                  {t('menu.checkout.deliveryAddress')}
                  <input
                    type="text"
                    required
                    value={form.customer_address}
                    onChange={(e) => onChange('customer_address', e.target.value)}
                    className="rounded-md border border-[var(--line-soft)] bg-[var(--panel-strong)] px-3 py-2 text-sm text-[var(--ink-900)] outline-none focus:border-[var(--brand-600)]"
                  />
                </label>
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--line-soft)] bg-[var(--panel-strong)] p-4">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-500)]">{t('menu.checkout.payment')}</h3>
              <div className="grid gap-2 text-sm text-[var(--ink-700)]">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="payment_method"
                    checked={form.payment_method === 'cash'}
                    onChange={() => onChange('payment_method', 'cash')}
                  />
                  {t('menu.checkout.cash')}
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="payment_method"
                    checked={form.payment_method === 'transfer'}
                    onChange={() => onChange('payment_method', 'transfer')}
                  />
                  {t('menu.checkout.transfer')}
                </label>

                {form.payment_method === 'cash' && (
                  <label className="mt-2 flex flex-col gap-1 text-sm text-[var(--ink-700)]">
                    {t('menu.checkout.changeFor')}
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.cash_change_for}
                      onChange={(e) => onChange('cash_change_for', e.target.value)}
                      placeholder={t('menu.checkout.changeForPlaceholder')}
                      className="rounded-md border border-[var(--line-soft)] bg-[var(--panel-strong)] px-3 py-2 text-sm text-[var(--ink-900)] outline-none focus:border-[var(--brand-600)]"
                    />
                  </label>
                )}
              </div>
            </div>

            <label className="flex flex-col gap-1 text-sm text-[var(--ink-700)]">
              {t('menu.checkout.notes')}
              <input
                type="text"
                value={form.notes}
                onChange={(e) => onChange('notes', e.target.value)}
                className="rounded-md border border-[var(--line-soft)] bg-[var(--panel-strong)] px-3 py-2 text-sm text-[var(--ink-900)] outline-none focus:border-[var(--brand-600)]"
              />
            </label>
            {error && <div className="text-sm text-red-300">{error}</div>}
            <div className="mt-1 text-sm font-semibold text-[var(--ink-900)]">{t('menu.cart.total', { total })}</div>
            <button type="submit" disabled={submitting} className="elegant-button-primary !rounded-lg !px-5 !py-3 !text-sm">
              {submitting ? t('menu.checkout.placingOrder') : t('menu.checkout.placeOrder')}
            </button>
          </form>
        </div>

        <aside className="p-6">
          <h3 className="mb-4 font-display text-3xl font-semibold">{t('menu.checkout.orderSummary')}</h3>
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.product_id} className="rounded-xl border border-[var(--line-soft)] bg-[var(--panel-strong)] p-3 text-sm">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="font-medium text-[var(--ink-900)]">{item.product_name}</span>
                  <span className="font-semibold text-[var(--ink-900)]">${((item.unit_price_cents * item.quantity) / 100).toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => onUpdateQuantity(item.product_id, item.quantity - 1)} type="button" className="rounded border border-[var(--line-soft)] px-2 py-1 text-xs">-</button>
                  <span className="min-w-7 text-center text-[var(--ink-700)]">{item.quantity}</span>
                  <button onClick={() => onUpdateQuantity(item.product_id, item.quantity + 1)} type="button" className="rounded border border-[var(--line-soft)] px-2 py-1 text-xs">+</button>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  )
}
