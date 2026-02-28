import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { api } from '@utils/api'
import { fillPath } from '@utils/pathBuilder'

const STATUS_STEPS = ['pending', 'confirmed', 'out_for_delivery', 'delivered']

const STATUS_ICONS = {
  pending: 'time',
  confirmed: 'ok',
  out_for_delivery: 'route',
  delivered: 'done',
  ready: 'ready',
  cancelled: 'cancel'
}

export default function OrderStatus({ token, api_order_status_template }) {
  const { t } = useTranslation()
  const [order, setOrder] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchOrder()
    const interval = setInterval(fetchOrder, 15000)
    return () => clearInterval(interval)
  }, [token])

  async function fetchOrder() {
    try {
      const data = await api.get(fillPath(api_order_status_template, { token }))
      setOrder(data)
    } catch (err) {
      setError(err.message)
    }
  }

  if (error) {
    return (
      <div className="grid min-h-screen place-items-center px-4">
        <p className="rounded-full border border-red-900/50 bg-red-950/35 px-4 py-2 text-sm text-red-300">{error}</p>
      </div>
    )
  }

  if (!order) {
    return <div className="grid min-h-screen place-items-center text-sm text-[var(--ink-700)]">{t('orderStatus.loading')}</div>
  }

  const isCancelled = order.status === 'cancelled'
  const stepIndex = order.status === 'ready'
    ? STATUS_STEPS.indexOf('out_for_delivery')
    : STATUS_STEPS.indexOf(order.status)

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="mx-auto w-full max-w-2xl overflow-hidden rounded-3xl border border-[var(--line-soft)] bg-[var(--panel)] shadow-[0_18px_40px_rgba(22,18,10,0.12)]">
        <div className="border-b border-[var(--line-soft)] bg-[var(--panel-strong)] px-6 py-6 sm:px-8">
          <h1 className="font-display text-4xl font-semibold text-[var(--ink-900)]">{order.restaurant_name}</h1>
          <p className="mt-1 text-sm text-[var(--ink-500)]">{t('orderStatus.order', { id: order.id })}</p>
        </div>

        <div className={`mx-6 mt-6 rounded-2xl border px-4 py-3 text-center text-sm font-semibold sm:mx-8 ${isCancelled ? 'border-red-900/50 bg-red-950/35 text-red-300' : 'border-emerald-800/40 bg-emerald-900/20 text-emerald-300'}`}>
          {STATUS_ICONS[order.status]} {t(`orderStatus.status.${order.status}`) || order.status}
        </div>

        {!isCancelled && stepIndex >= 0 && (
          <div className="grid grid-cols-4 gap-2 px-5 py-6 sm:px-8">
            {STATUS_STEPS.map((step, index) => {
              const active = index <= stepIndex
              return (
                <div key={step} className="text-center">
                  <div className={`mx-auto mb-2 h-2.5 w-2.5 rounded-full ${active ? 'bg-[var(--brand-600)]' : 'bg-[var(--line-soft)]'}`} />
                  <span className={`text-[10px] font-medium uppercase tracking-[0.14em] sm:text-xs ${active ? 'text-[var(--brand-700)]' : 'text-[var(--ink-500)]'}`}>
                    {t(`orderStatus.status.${step}`)}
                  </span>
                </div>
              )
            })}
          </div>
        )}

        <div className="border-t border-[var(--line-soft)] px-6 py-5 sm:px-8">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-500)]">{t('orderStatus.items')}</h3>
          {order.order_items.map((item) => (
            <div key={item.id} className="flex justify-between py-1.5 text-sm text-[var(--ink-700)]">
              <span>{item.quantity}x {item.product_name}</span>
              <span className="font-semibold text-[var(--ink-900)]">${item.subtotal.toFixed(2)}</span>
            </div>
          ))}
          <div className="mt-3 flex justify-between border-t border-[var(--line-soft)] pt-3 text-sm font-semibold text-[var(--ink-900)]">
            <span>{t('common.total')}</span>
            <span>${order.total.toFixed(2)}</span>
          </div>
        </div>

        <div className="border-t border-[var(--line-soft)] px-6 py-5 sm:px-8">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-500)]">{t('orderStatus.deliveryAndPayment')}</h3>
          {order.customer_address && <p className="text-sm text-[var(--ink-700)]">{t('orderStatus.address', { address: order.customer_address })}</p>}
          <p className="text-sm text-[var(--ink-700)]">{t('orderStatus.payment', { method: order.payment_method === 'cash' ? t('orderStatus.cash') : t('orderStatus.bankTransfer') })}</p>
          {order.cash_change_for && (
            <p className="text-sm text-[var(--ink-700)]">{t('orderStatus.cashChangeFor', { amount: order.cash_change_for.toFixed(2) })}</p>
          )}
        </div>

        {order.notes && (
          <div className="border-t border-[var(--line-soft)] px-6 py-5 sm:px-8">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-500)]">{t('orderStatus.notes')}</h3>
            <p className="text-sm text-[var(--ink-700)]">{order.notes}</p>
          </div>
        )}

        <p className="px-6 py-4 text-center text-xs text-[var(--ink-500)] sm:px-8">{t('orderStatus.autoRefresh')}</p>
      </div>
    </div>
  )
}
