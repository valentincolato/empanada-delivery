import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { api } from '@utils/api'
import LanguageSwitcher from '../LanguageSwitcher'

export default function OrdersDashboard({ isSuperAdmin, is_super_admin, membershipRole, membership_role }) {
  const superAdmin = Boolean(isSuperAdmin ?? is_super_admin)
  const role = membershipRole || membership_role
  const { t } = useTranslation()
  const [orders, setOrders] = useState([])
  const [restaurant, setRestaurant] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)

  const COLUMNS = [
    { status: 'pending', labelKey: 'admin.orders.columns.pending', header: 'border-[#c39a5f] bg-[var(--panel-strong)] text-[var(--gold-700)]', badge: 'bg-[var(--gold-600)]' },
    { status: 'confirmed', labelKey: 'admin.orders.columns.confirmed', header: 'border-emerald-800/40 bg-emerald-900/20 text-emerald-300', badge: 'bg-emerald-700' },
    { status: 'out_for_delivery', labelKey: 'admin.orders.columns.out_for_delivery', header: 'border-sky-800/40 bg-sky-900/20 text-sky-300', badge: 'bg-sky-700' },
    { status: 'delivered', labelKey: 'admin.orders.columns.delivered', header: 'border-lime-800/40 bg-lime-900/20 text-lime-300', badge: 'bg-lime-700' },
    { status: 'cancelled', labelKey: 'admin.orders.columns.cancelled', header: 'border-red-900/50 bg-red-950/35 text-red-300', badge: 'bg-red-700' },
  ]

  const TRANSITIONS = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['out_for_delivery', 'cancelled'],
    out_for_delivery: ['delivered', 'cancelled'],
    ready: ['delivered', 'cancelled'],
  }

  const fetchOrders = useCallback(async () => {
    try {
      const data = await api.get('/api/v1/admin/orders')
      setOrders(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchRestaurant = useCallback(async () => {
    try {
      const data = await api.get('/api/v1/admin/restaurant')
      setRestaurant(data)
    } catch (err) {
      console.error(err)
    }
  }, [])

  useEffect(() => {
    fetchOrders()
    fetchRestaurant()
    const interval = setInterval(fetchOrders, 20000)
    return () => clearInterval(interval)
  }, [fetchOrders, fetchRestaurant])

  async function updateStatus(orderId, newStatus) {
    setUpdating(orderId)
    try {
      await api.patch(`/api/v1/admin/orders/${orderId}`, { order: { status: newStatus } })
      await fetchOrders()
    } catch (err) {
      alert(err.message)
    } finally {
      setUpdating(null)
    }
  }

  async function toggleAccepting() {
    try {
      const data = await api.post('/api/v1/admin/restaurant/toggle_accepting_orders', {})
      setRestaurant((prev) => prev ? { ...prev, settings: { ...prev.settings, accepting_orders: data.accepting_orders } } : prev)
    } catch (err) {
      alert(err.message)
    }
  }

  async function clearContext() {
    try {
      await api.delete('/api/v1/super_admin/restaurants/clear_context')
      window.location.href = '/super_admin/restaurants'
    } catch (err) {
      alert(err.message)
    }
  }

  if (loading) return <div className="flex justify-center p-16 text-[var(--ink-500)]">{t('admin.orders.loading')}</div>

  const accepting = restaurant?.settings?.accepting_orders !== false
  const legacyReady = orders.filter((order) => order.status === 'ready')
  const canManageMembers = superAdmin || role === 'owner'

  return (
    <div className="min-h-screen">
      <div className="flex items-center justify-between border-b border-[var(--line-soft)] bg-[var(--panel)] px-6 py-4">
        <h1 data-testid="orders-dashboard-title" className="font-display text-4xl font-semibold text-[var(--ink-900)]">{t('admin.orders.title')}</h1>
        <div className="flex items-center gap-3">
          {superAdmin && (
            <button
              onClick={clearContext}
              className="text-sm font-medium text-[var(--gold-700)]"
            >
              {t('admin.orders.nav.backToRestaurants')}
            </button>
          )}
          <a data-testid="nav-products" href="/admin/products" className="text-sm font-medium text-[var(--gold-700)]">{t('admin.orders.nav.products')}</a>
          <a data-testid="nav-categories" href="/admin/categories" className="text-sm font-medium text-[var(--gold-700)]">{t('admin.orders.nav.categories')}</a>
          <a data-testid="nav-qr" href="/admin/qr" className="text-sm font-medium text-[var(--gold-700)]">{t('admin.orders.nav.qr')}</a>
          {canManageMembers && (
            <a data-testid="nav-members" href="/admin/members" className="text-sm font-medium text-[var(--gold-700)]">{t('admin.orders.nav.members')}</a>
          )}
          {restaurant && (
            <button
              onClick={toggleAccepting}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${accepting ? 'border border-emerald-800/40 bg-emerald-900/30 text-emerald-300' : 'border border-red-900/50 bg-red-950/35 text-red-300'}`}
            >
              {accepting ? t('admin.orders.accepting') : t('admin.orders.notAccepting')}
              {' · '}
              {accepting ? t('admin.orders.toggleClose') : t('admin.orders.toggleOpen')}
            </button>
          )}
          <LanguageSwitcher />
        </div>
      </div>

      <div className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-5">
        {COLUMNS.map(({ status, labelKey, header, badge }) => {
          const columnOrders = orders.filter((order) => order.status === status)
          return (
            <div key={status} className="elegant-card overflow-hidden bg-[var(--panel)]" data-testid={`column-${status}`}>
              <div className={`flex items-center justify-between border-t-4 px-4 py-3 ${header}`}>
                <span className="text-sm font-semibold uppercase tracking-[0.12em]">{t(labelKey)}</span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-bold text-white ${badge}`}>{columnOrders.length}</span>
              </div>
              <div className="flex flex-col gap-3 p-3">
                {columnOrders.length === 0 && <div className="py-6 text-center text-sm text-[var(--ink-500)]">{t('admin.orders.noOrders')}</div>}
                {columnOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    transitions={TRANSITIONS[order.status] || []}
                    onUpdate={updateStatus}
                    isUpdating={updating === order.id}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {legacyReady.length > 0 && (
        <div className="px-6 pb-8">
          <div className="mb-3 text-sm font-semibold text-[var(--ink-700)]">{t('admin.orders.legacyReady')}</div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {legacyReady.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                transitions={TRANSITIONS[order.status] || []}
                onUpdate={updateStatus}
                isUpdating={updating === order.id}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function OrderCard({ order, transitions, onUpdate, isUpdating }) {
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
              : 'rounded-md bg-[var(--gold-600)] px-2.5 py-1 text-xs font-semibold text-white'}
          >
            {t(`admin.orders.actions.${next}`) || next}
          </button>
        ))}
      </div>
    </div>
  )
}
