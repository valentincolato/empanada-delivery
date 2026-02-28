import { useTranslation } from 'react-i18next'

export default function OrderCard({ order, transitions, onUpdate, isUpdating }) {
  const { t } = useTranslation()
  const minutesAgo = Math.round((Date.now() - new Date(order.created_at)) / 60000)

  return (
    <div className="rounded-xl border border-[var(--line-soft)] bg-[var(--panel)] p-4" data-testid="order-card">
      <div className="mb-1 flex justify-between">
        <span className="text-sm font-bold text-[var(--ink-900)]">#{order.id}</span>
        <span className="text-xs text-[var(--ink-500)]">{t('admin.orders.minutesAgo', { count: minutesAgo })}</span>
      </div>
      <div className="text-sm font-semibold text-[var(--ink-700)]">{order.customer_name}</div>
      {order.customer_phone && <div className="text-xs text-[var(--ink-500)]">{t('admin.orders.tel', { phone: order.customer_phone })}</div>}
      {order.customer_email && <div className="text-xs text-[var(--ink-500)]">{t('admin.orders.email', { email: order.customer_email })}</div>}
      {order.customer_address && <div className="mb-2 text-xs text-[var(--ink-500)]">{t('admin.orders.address', { address: order.customer_address })}</div>}
      <div className="mb-2 text-xs font-medium text-[var(--ink-700)]">
        {t('admin.orders.payment', { method: order.payment_method === 'cash' ? t('admin.orders.cash') : t('admin.orders.transfer') })}
        {order.cash_change_for && ` ${t('admin.orders.changeFor', { amount: order.cash_change_for.toFixed(2) })}`}
      </div>
      <div className="mb-2">
        {order.order_items.map((item) => (
          <div key={item.id} className="py-0.5 text-xs text-[var(--ink-500)]">
            {item.quantity}x {item.product_name}
          </div>
        ))}
      </div>
      <div className="mb-1 text-sm font-bold text-[var(--ink-900)]">${order.total?.toFixed(2)}</div>
      {order.notes && <div className="mb-2 text-xs italic text-[var(--ink-500)]">{order.notes}</div>}
      <div className="mt-2 flex flex-wrap gap-2">
        {transitions.map((next) => (
          <button
            key={next}
            data-testid={`order-action-${next}`}
            disabled={isUpdating}
            onClick={() => onUpdate(order.id, next)}
            className={next === 'cancelled'
              ? 'rounded-md border border-red-900/50 bg-red-950/35 px-2.5 py-1 text-xs font-medium text-red-300'
              : 'rounded-md bg-[var(--brand-600)] px-2.5 py-1 text-xs font-semibold text-white'}
          >
            {t(`admin.orders.actions.${next}`) || next}
          </button>
        ))}
      </div>
    </div>
  )
}
