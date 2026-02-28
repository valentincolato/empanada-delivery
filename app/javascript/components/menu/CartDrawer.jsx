import { useTranslation } from 'react-i18next'

export default function CartDrawer({ items, onUpdateQuantity, onCheckout, onClose, total }) {
  const { t } = useTranslation()

  return (
    <div className="fixed inset-0 z-[100] flex justify-end bg-black/40 backdrop-blur-[1px]">
      <div data-testid="cart-drawer" className="flex h-full w-full max-w-[440px] flex-col border-l border-[var(--line-soft)] bg-[var(--panel)] text-[var(--ink-900)]">
        <div className="flex items-center justify-between border-b border-[var(--line-soft)] px-6 py-5">
          <h2 className="font-display text-4xl font-semibold">{t('menu.cart.title')}</h2>
          <button onClick={onClose} className="rounded-full border border-[var(--line-soft)] px-2.5 py-1 text-[var(--ink-500)]">x</button>
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto px-6 py-4">
          {items.map((item) => (
            <div key={item.product_id} data-testid="cart-item" className="rounded-xl border border-[var(--line-soft)] bg-[var(--panel-strong)] p-3 text-sm">
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="font-medium text-[var(--ink-900)]">{item.product_name}</span>
                <span className="font-semibold text-[var(--ink-900)]">${((item.unit_price_cents * item.quantity) / 100).toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-2">
                <button data-testid="quantity-decrease" onClick={() => onUpdateQuantity(item.product_id, item.quantity - 1)} className="rounded border border-[var(--line-soft)] px-2 py-1 text-xs">-</button>
                <span className="min-w-7 text-center text-[var(--ink-700)]">{item.quantity}</span>
                <button data-testid="quantity-increase" onClick={() => onUpdateQuantity(item.product_id, item.quantity + 1)} className="rounded border border-[var(--line-soft)] px-2 py-1 text-xs">+</button>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between border-t border-[var(--line-soft)] px-6 py-5">
          <div className="text-base font-semibold text-[var(--ink-900)]">{t('menu.cart.total', { total })}</div>
          <button className="elegant-button-primary !rounded-lg !px-5 !py-2.5 !text-sm" onClick={onCheckout}>{t('menu.cart.checkout')}</button>
        </div>
      </div>
    </div>
  )
}
