import { useState, useEffect, useCallback } from 'react'
import { api } from '@utils/api'

const COLUMNS = [
  { status: 'pending', label: 'Pending', color: '#f59e0b', bg: '#fef3c7' },
  { status: 'confirmed', label: 'Confirmed', color: '#3b82f6', bg: '#dbeafe' },
  { status: 'preparing', label: 'Preparing', color: '#8b5cf6', bg: '#ede9fe' },
  { status: 'ready', label: 'Ready', color: '#10b981', bg: '#d1fae5' },
]

const TRANSITIONS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['preparing', 'cancelled'],
  preparing: ['ready', 'cancelled'],
  ready: ['delivered', 'cancelled'],
}

const STATUS_LABELS = { confirmed: 'Confirm', preparing: 'Start Preparing', ready: 'Mark Ready', delivered: 'Delivered', cancelled: 'Cancel' }

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

  if (loading) return <div style={s.loading}>Loading orders…</div>

  return (
    <div style={s.page}>
      <div style={s.topbar}>
        <h1 style={s.title}>Orders Dashboard</h1>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <a href="/admin/products" style={s.navLink}>Products</a>
          <a href="/admin/categories" style={s.navLink}>Categories</a>
          <a href="/admin/qr" style={s.navLink}>QR Code</a>
        </div>
      </div>

      <div style={s.board}>
        {COLUMNS.map(({ status, label, color, bg }) => {
          const colOrders = orders.filter((o) => o.status === status)
          return (
            <div key={status} style={s.column} data-testid={`column-${status}`}>
              <div style={{ ...s.colHeader, borderTopColor: color, background: bg }}>
                <span style={{ fontWeight: 700, color }}>{label}</span>
                <span style={{ ...s.badge, background: color }}>{colOrders.length}</span>
              </div>
              <div style={s.colBody}>
                {colOrders.length === 0 && <div style={s.empty}>No orders</div>}
                {colOrders.map((order) => (
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
    </div>
  )
}

function OrderCard({ order, transitions, onUpdate, isUpdating }) {
  const ago = Math.round((Date.now() - new Date(order.created_at)) / 60000)
  return (
    <div style={s.card} data-testid="order-card">
      <div style={s.cardHeader}>
        <span style={s.orderId}>#{order.id}</span>
        <span style={s.ago}>{ago}m ago</span>
      </div>
      <div style={s.customerName}>{order.customer_name}</div>
      {order.table_number && <div style={s.tableNum}>Table {order.table_number}</div>}
      <div style={s.items}>
        {order.order_items.map((item) => (
          <div key={item.id} style={s.itemRow}>
            <span>{item.quantity}× {item.product_name}</span>
          </div>
        ))}
      </div>
      <div style={s.total}>${order.total?.toFixed(2)}</div>
      {order.notes && <div style={s.notes}>{order.notes}</div>}
      <div style={s.actions}>
        {transitions.map((next) => (
          <button
            key={next}
            disabled={isUpdating}
            onClick={() => onUpdate(order.id, next)}
            style={next === 'cancelled' ? s.cancelBtn : s.actionBtn}
          >
            {STATUS_LABELS[next] || next}
          </button>
        ))}
      </div>
    </div>
  )
}

const s = {
  page: { fontFamily: 'Inter, sans-serif', minHeight: '100vh', background: '#f1f5f9' },
  loading: { display: 'flex', justifyContent: 'center', padding: '4rem', fontFamily: 'Inter, sans-serif', color: '#6b7280' },
  topbar: { background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  title: { margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#111' },
  navLink: { color: '#2563eb', textDecoration: 'none', fontWeight: 500, fontSize: '0.9rem' },
  board: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', padding: '1.5rem', minHeight: 'calc(100vh - 64px)', alignItems: 'start' },
  column: { background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.07)' },
  colHeader: { padding: '0.85rem 1rem', borderTop: '3px solid', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  badge: { color: '#fff', borderRadius: '9999px', padding: '0.1rem 0.5rem', fontSize: '0.8rem', fontWeight: 700 },
  colBody: { padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  empty: { textAlign: 'center', color: '#9ca3af', fontSize: '0.85rem', padding: '1.5rem 0' },
  card: { background: '#f9fafb', borderRadius: '10px', padding: '0.9rem', border: '1px solid #e5e7eb' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' },
  orderId: { fontWeight: 700, fontSize: '0.9rem', color: '#111' },
  ago: { fontSize: '0.75rem', color: '#9ca3af' },
  customerName: { fontWeight: 600, fontSize: '0.95rem', color: '#374151', marginBottom: '0.2rem' },
  tableNum: { fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.5rem' },
  items: { marginBottom: '0.5rem' },
  itemRow: { fontSize: '0.82rem', color: '#6b7280', padding: '0.1rem 0' },
  total: { fontWeight: 700, fontSize: '0.95rem', color: '#111', marginBottom: '0.25rem' },
  notes: { fontSize: '0.8rem', color: '#9ca3af', fontStyle: 'italic', marginBottom: '0.5rem' },
  actions: { display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.6rem' },
  actionBtn: { background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', padding: '0.35rem 0.7rem', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' },
  cancelBtn: { background: '#fff', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: '6px', padding: '0.35rem 0.7rem', fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer' },
}
