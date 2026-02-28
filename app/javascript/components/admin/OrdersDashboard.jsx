import { useState, useEffect, useCallback } from 'react'
import { api } from '@utils/api'

const COLUMNS = [
  { status: 'pending', label: 'Pending', header: 'border-amber-500 bg-amber-100 text-amber-700', badge: 'bg-amber-500' },
  { status: 'confirmed', label: 'Confirmed', header: 'border-blue-500 bg-blue-100 text-blue-700', badge: 'bg-blue-500' },
  { status: 'out_for_delivery', label: 'Out for delivery', header: 'border-indigo-500 bg-indigo-100 text-indigo-700', badge: 'bg-indigo-500' },
  { status: 'delivered', label: 'Delivered', header: 'border-emerald-500 bg-emerald-100 text-emerald-700', badge: 'bg-emerald-500' },
]

const TRANSITIONS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['out_for_delivery', 'cancelled'],
  out_for_delivery: ['delivered', 'cancelled'],
  ready: ['delivered', 'cancelled'],
}

const STATUS_LABELS = {
  confirmed: 'Confirm',
  out_for_delivery: 'Set Out for delivery',
  delivered: 'Mark Delivered',
  cancelled: 'Cancel'
}

export default function OrdersDashboard() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)

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

  useEffect(() => {
    fetchOrders()
    const interval = setInterval(fetchOrders, 20000)
    return () => clearInterval(interval)
  }, [fetchOrders])

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

  if (loading) return <div className="flex justify-center p-16 text-slate-500">Loading orders...</div>

  const legacyReady = orders.filter((order) => order.status === 'ready')

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
        <h1 className="text-xl font-bold text-slate-900">Orders Dashboard</h1>
        <div className="flex gap-3">
          <a href="/admin/products" className="text-sm font-medium text-blue-600">Products</a>
          <a href="/admin/categories" className="text-sm font-medium text-blue-600">Categories</a>
          <a href="/admin/qr" className="text-sm font-medium text-blue-600">QR Code</a>
        </div>
      </div>

      <div className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-4">
        {COLUMNS.map(({ status, label, header, badge }) => {
          const columnOrders = orders.filter((order) => order.status === status)
          return (
            <div key={status} className="overflow-hidden rounded-xl bg-white shadow" data-testid={`column-${status}`}>
              <div className={`flex items-center justify-between border-t-4 px-4 py-3 ${header}`}>
                <span className="font-bold">{label}</span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-bold text-white ${badge}`}>{columnOrders.length}</span>
              </div>
              <div className="flex flex-col gap-3 p-3">
                {columnOrders.length === 0 && <div className="py-6 text-center text-sm text-slate-400">No orders</div>}
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
          <div className="mb-3 text-sm font-semibold text-slate-700">Legacy ready orders</div>
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
  const minutesAgo = Math.round((Date.now() - new Date(order.created_at)) / 60000)

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4" data-testid="order-card">
      <div className="mb-1 flex justify-between">
        <span className="text-sm font-bold text-slate-900">#{order.id}</span>
        <span className="text-xs text-slate-400">{minutesAgo}m ago</span>
      </div>
      <div className="text-sm font-semibold text-slate-700">{order.customer_name}</div>
      {order.customer_phone && <div className="text-xs text-slate-500">Tel: {order.customer_phone}</div>}
      {order.customer_email && <div className="text-xs text-slate-500">Email: {order.customer_email}</div>}
      {order.customer_address && <div className="mb-2 text-xs text-slate-500">Dir: {order.customer_address}</div>}
      {order.table_number && <div className="mb-2 text-xs text-slate-500">Table {order.table_number}</div>}
      <div className="mb-2 text-xs font-medium text-slate-600">
        Pago: {order.payment_method === 'cash' ? 'Efectivo' : 'Transferencia'}
        {order.cash_change_for && ` (cambio para $${order.cash_change_for.toFixed(2)})`}
      </div>
      <div className="mb-2">
        {order.order_items.map((item) => (
          <div key={item.id} className="py-0.5 text-xs text-slate-500">
            {item.quantity}x {item.product_name}
          </div>
        ))}
      </div>
      <div className="mb-1 text-sm font-bold text-slate-900">${order.total?.toFixed(2)}</div>
      {order.notes && <div className="mb-2 text-xs italic text-slate-400">{order.notes}</div>}
      <div className="mt-2 flex flex-wrap gap-2">
        {transitions.map((next) => (
          <button
            key={next}
            disabled={isUpdating}
            onClick={() => onUpdate(order.id, next)}
            className={next === 'cancelled'
              ? 'rounded-md border border-red-200 bg-white px-2.5 py-1 text-xs font-medium text-red-600'
              : 'rounded-md bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white'}
          >
            {STATUS_LABELS[next] || next}
          </button>
        ))}
      </div>
    </div>
  )
}
