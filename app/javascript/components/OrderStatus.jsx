import { useState, useEffect } from 'react'
import { api } from '@utils/api'

const STATUS_STEPS = ['pending', 'confirmed', 'preparing', 'ready', 'delivered']
const STATUS_LABELS = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  ready: 'Ready for pickup',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}
const STATUS_ICONS = { pending: '🕐', confirmed: '✅', preparing: '👨‍🍳', ready: '🛎️', delivered: '🎉', cancelled: '❌' }

export default function OrderStatus({ token }) {
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

  if (error) return <div style={s.center}><p style={{ color: '#dc2626' }}>{error}</p></div>
  if (!order) return <div style={s.center}>Loading order…</div>

  const isCancelled = order.status === 'cancelled'
  const stepIndex = STATUS_STEPS.indexOf(order.status)

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.header}>
          <h1 style={s.title}>{order.restaurant_name}</h1>
          <p style={s.subtitle}>Order #{order.id}</p>
        </div>

        <div style={s.statusBadge(isCancelled)}>
          {STATUS_ICONS[order.status]} {STATUS_LABELS[order.status]}
        </div>

        {!isCancelled && (
          <div style={s.steps}>
            {STATUS_STEPS.map((step, i) => (
              <div key={step} style={s.step}>
                <div style={s.stepDot(i <= stepIndex)} />
                <span style={s.stepLabel(i <= stepIndex)}>{STATUS_LABELS[step]}</span>
                {i < STATUS_STEPS.length - 1 && <div style={s.stepLine(i < stepIndex)} />}
              </div>
            ))}
          </div>
        )}

        <div style={s.section}>
          <h3 style={s.sectionTitle}>Items</h3>
          {order.order_items.map((item) => (
            <div key={item.id} style={s.item}>
              <span>{item.quantity}x {item.product_name}</span>
              <span style={{ fontWeight: 600 }}>${item.subtotal.toFixed(2)}</span>
            </div>
          ))}
          <div style={s.total}>
            <span>Total</span>
            <span>${order.total.toFixed(2)}</span>
          </div>
        </div>

        {order.notes && (
          <div style={s.section}>
            <h3 style={s.sectionTitle}>Notes</h3>
            <p style={{ margin: 0, color: '#6b7280' }}>{order.notes}</p>
          </div>
        )}

        <p style={s.refresh}>Updates automatically every 15 seconds</p>
      </div>
    </div>
  )
}

const s = {
  page: { fontFamily: 'Inter, sans-serif', minHeight: '100vh', background: '#f9fafb', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '2rem 1rem' },
  center: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'Inter, sans-serif' },
  card: { background: '#fff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', width: '100%', maxWidth: '520px', overflow: 'hidden' },
  header: { background: '#2563eb', padding: '1.5rem', color: '#fff' },
  title: { margin: 0, fontSize: '1.4rem', fontWeight: 700 },
  subtitle: { margin: '0.25rem 0 0', opacity: 0.8, fontSize: '0.9rem' },
  statusBadge: (cancelled) => ({ margin: '1.5rem 1.5rem 0', padding: '0.75rem 1rem', borderRadius: '10px', background: cancelled ? '#fee2e2' : '#dcfce7', color: cancelled ? '#991b1b' : '#166534', fontWeight: 700, fontSize: '1rem', textAlign: 'center' }),
  steps: { display: 'flex', justifyContent: 'space-between', padding: '1.5rem', alignItems: 'center' },
  step: { display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, position: 'relative' },
  stepDot: (active) => ({ width: 16, height: 16, borderRadius: '50%', background: active ? '#2563eb' : '#e5e7eb', marginBottom: '0.4rem' }),
  stepLabel: (active) => ({ fontSize: '0.65rem', color: active ? '#2563eb' : '#9ca3af', textAlign: 'center', fontWeight: active ? 600 : 400 }),
  stepLine: (active) => ({ position: 'absolute', top: 7, left: '50%', width: '100%', height: 2, background: active ? '#2563eb' : '#e5e7eb', zIndex: 0 }),
  section: { padding: '1rem 1.5rem', borderTop: '1px solid #e5e7eb' },
  sectionTitle: { margin: '0 0 0.75rem', fontSize: '0.85rem', fontWeight: 600, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' },
  item: { display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', fontSize: '0.95rem', color: '#374151' },
  total: { display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0 0', borderTop: '1px solid #e5e7eb', fontWeight: 700, marginTop: '0.5rem' },
  refresh: { textAlign: 'center', padding: '1rem', fontSize: '0.75rem', color: '#9ca3af', margin: 0 },
}
