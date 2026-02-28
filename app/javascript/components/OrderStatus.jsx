import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { api } from '@utils/api'

const STATUS_STEPS = ['pending', 'confirmed', 'out_for_delivery', 'delivered']

const STATUS_ICONS = {
  pending: '🕐',
  confirmed: '✅',
  out_for_delivery: '🛵',
  delivered: '🎉',
  ready: '📦',
  cancelled: '❌'
}

export default function OrderStatus({ token }) {
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
      const data = await api.get(`/api/v1/orders/${token}`)
      setOrder(data)
    } catch (err) {
      setError(err.message)
    }
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  if (!order) {
    return <div className="flex h-screen items-center justify-center">{t('orderStatus.loading')}</div>
  }

  const isCancelled = order.status === 'cancelled'
  const stepIndex = STATUS_STEPS.indexOf(order.status)

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-lg">
        <div className="bg-blue-600 px-6 py-6 text-white">
          <h1 className="text-2xl font-bold">{order.restaurant_name}</h1>
          <p className="mt-1 text-sm text-blue-100">{t('orderStatus.order', { id: order.id })}</p>
        </div>

        <div className={`mx-6 mt-6 rounded-xl px-4 py-3 text-center text-base font-bold ${isCancelled ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
          {STATUS_ICONS[order.status]} {t(`orderStatus.status.${order.status}`) || order.status}
        </div>

        {!isCancelled && stepIndex >= 0 && (
          <div className="grid grid-cols-4 gap-2 px-4 py-6 sm:px-6">
            {STATUS_STEPS.map((step, index) => {
              const active = index <= stepIndex
              return (
                <div key={step} className="text-center">
                  <div className={`mx-auto mb-2 h-4 w-4 rounded-full ${active ? 'bg-blue-600' : 'bg-slate-200'}`} />
                  <span className={`text-[10px] font-medium sm:text-xs ${active ? 'text-blue-600' : 'text-slate-400'}`}>
                    {t(`orderStatus.status.${step}`)}
                  </span>
                </div>
              )
            })}
          </div>
        )}

        <div className="border-t border-slate-200 px-6 py-4">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-600">{t('orderStatus.items')}</h3>
          {order.order_items.map((item) => (
            <div key={item.id} className="flex justify-between py-1 text-sm text-slate-700">
              <span>{item.quantity}x {item.product_name}</span>
              <span className="font-semibold">${item.subtotal.toFixed(2)}</span>
            </div>
          ))}
          <div className="mt-2 flex justify-between border-t border-slate-200 pt-3 font-bold text-slate-900">
            <span>{t('common.total')}</span>
            <span>${order.total.toFixed(2)}</span>
          </div>
        </div>

        <div className="border-t border-slate-200 px-6 py-4">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-600">{t('orderStatus.deliveryAndPayment')}</h3>
          {order.customer_address && <p className="text-sm text-slate-600">{t('orderStatus.address', { address: order.customer_address })}</p>}
          <p className="text-sm text-slate-600">{t('orderStatus.payment', { method: order.payment_method === 'cash' ? t('orderStatus.cash') : t('orderStatus.bankTransfer') })}</p>
          {order.cash_change_for && (
            <p className="text-sm text-slate-600">{t('orderStatus.cashChangeFor', { amount: order.cash_change_for.toFixed(2) })}</p>
          )}
        </div>

        {order.notes && (
          <div className="border-t border-slate-200 px-6 py-4">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-600">{t('orderStatus.notes')}</h3>
            <p className="text-sm text-slate-500">{order.notes}</p>
          </div>
        )}

        <p className="px-6 py-4 text-center text-xs text-slate-400">{t('orderStatus.autoRefresh')}</p>
      </div>
    </div>
  )
}
