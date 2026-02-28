import { useState, useEffect } from 'react'
import { api } from '@utils/api'
import { cart } from '@utils/cart'

export default function Menu({ slug, restaurantName }) {
  const [data, setData] = useState(null)
  const [cartItems, setCartItems] = useState([])
  const [showCart, setShowCart] = useState(false)
  const [checkout, setCheckout] = useState(false)
  const [form, setForm] = useState({ customer_name: '', customer_phone: '', customer_email: '', table_number: '', notes: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.get(`/api/v1/public/menu/${slug}`).then(setData).catch(console.error)
    setCartItems(cart.get(slug))
  }, [slug])

  function addToCart(product) {
    const updated = cart.add(slug, product)
    setCartItems([...updated])
  }

  function removeFromCart(productId) {
    const updated = cart.remove(slug, productId)
    setCartItems([...updated])
  }

  function totalCents() {
    return cartItems.reduce((s, i) => s + i.unit_price_cents * i.quantity, 0)
  }

  async function placeOrder(e) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const order = await api.post('/api/v1/orders', {
        order: { restaurant_slug: slug, ...form, items: cartItems }
      })
      cart.clear(slug)
      window.location.href = `/orders/${order.token}`
    } catch (err) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  if (!data) return <div style={styles.loading}>Loading menu…</div>

  const restaurant = data.restaurant
  const categories = data.categories || []
  const totalFormatted = `$${(totalCents() / 100).toFixed(2)}`

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <h1 style={styles.restaurantName}>{restaurant.name}</h1>
          {restaurant.description && <p style={styles.restaurantDesc}>{restaurant.description}</p>}
          {!restaurant.accepting_orders && (
            <div style={styles.closedBanner}>⏸ Not accepting orders right now</div>
          )}
        </div>
        {cartItems.length > 0 && (
          <button style={styles.cartBtn} onClick={() => setShowCart(true)}>
            🛒 {cartItems.reduce((s, i) => s + i.quantity, 0)} — {totalFormatted}
          </button>
        )}
      </header>

      <main style={styles.main}>
        {categories.map((cat) => (
          <section key={cat.id} style={styles.section}>
            <h2 style={styles.catName}>{cat.name}</h2>
            <div style={styles.productGrid}>
              {(cat.products || []).map((product) => (
                <ProductCard key={product.id} product={product} onAdd={addToCart} />
              ))}
            </div>
          </section>
        ))}
      </main>

      {showCart && !checkout && (
        <CartDrawer
          items={cartItems}
          onRemove={removeFromCart}
          onCheckout={() => { setShowCart(false); setCheckout(true) }}
          onClose={() => setShowCart(false)}
          total={totalFormatted}
        />
      )}

      {checkout && (
        <CheckoutModal
          form={form}
          onChange={(k, v) => setForm(f => ({ ...f, [k]: v }))}
          onSubmit={placeOrder}
          onClose={() => setCheckout(false)}
          submitting={submitting}
          error={error}
          total={totalFormatted}
        />
      )}
    </div>
  )
}

function ProductCard({ product, onAdd }) {
  return (
    <div style={styles.card}>
      {product.image_url && <img src={product.image_url} alt={product.name} style={styles.productImg} />}
      <div style={styles.cardBody}>
        <h3 style={styles.productName}>{product.name}</h3>
        {product.description && <p style={styles.productDesc}>{product.description}</p>}
        <div style={styles.cardFooter}>
          <span style={styles.price}>${parseFloat(product.price).toFixed(2)}</span>
          <button style={styles.addBtn} onClick={() => onAdd(product)}>+ Add</button>
        </div>
      </div>
    </div>
  )
}

function CartDrawer({ items, onRemove, onCheckout, onClose, total }) {
  return (
    <div style={styles.overlay}>
      <div style={styles.drawer}>
        <div style={styles.drawerHeader}>
          <h2 style={{ margin: 0 }}>Your Cart</h2>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>
        <div style={styles.drawerBody}>
          {items.map((item) => (
            <div key={item.product_id} style={styles.cartItem}>
              <span>{item.quantity}x {item.product_name}</span>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span>${((item.unit_price_cents * item.quantity) / 100).toFixed(2)}</span>
                <button onClick={() => onRemove(item.product_id)} style={styles.removeBtn}>✕</button>
              </div>
            </div>
          ))}
        </div>
        <div style={styles.drawerFooter}>
          <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>Total: {total}</div>
          <button style={styles.checkoutBtn} onClick={onCheckout}>Checkout →</button>
        </div>
      </div>
    </div>
  )
}

function CheckoutModal({ form, onChange, onSubmit, onClose, submitting, error, total }) {
  const fields = [
    { key: 'customer_name', label: 'Name *', type: 'text', required: true },
    { key: 'customer_phone', label: 'Phone', type: 'tel' },
    { key: 'customer_email', label: 'Email', type: 'email' },
    { key: 'table_number', label: 'Table number', type: 'text' },
    { key: 'notes', label: 'Notes', type: 'text' },
  ]
  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.drawerHeader}>
          <h2 style={{ margin: 0 }}>Checkout</h2>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>
        <form onSubmit={onSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {fields.map(({ key, label, type, required }) => (
            <label key={key} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.9rem' }}>
              {label}
              <input
                type={type}
                required={required}
                value={form[key]}
                onChange={(e) => onChange(key, e.target.value)}
                style={styles.input}
              />
            </label>
          ))}
          {error && <div style={{ color: '#dc2626', fontSize: '0.9rem' }}>{error}</div>}
          <div style={{ fontWeight: 700, marginTop: '0.5rem' }}>Total: {total}</div>
          <button type="submit" disabled={submitting} style={styles.checkoutBtn}>
            {submitting ? 'Placing order…' : 'Place Order'}
          </button>
        </form>
      </div>
    </div>
  )
}

const styles = {
  page: { fontFamily: 'Inter, sans-serif', minHeight: '100vh', background: '#f9fafb' },
  loading: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#666' },
  header: { background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'sticky', top: 0, zIndex: 10 },
  headerInner: { flex: 1 },
  restaurantName: { margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#111' },
  restaurantDesc: { margin: '0.25rem 0 0', color: '#6b7280', fontSize: '0.9rem' },
  closedBanner: { marginTop: '0.5rem', background: '#fef3c7', color: '#92400e', padding: '0.4rem 0.75rem', borderRadius: '6px', fontSize: '0.85rem', display: 'inline-block' },
  cartBtn: { background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.6rem 1rem', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem', whiteSpace: 'nowrap' },
  main: { maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem' },
  section: { marginBottom: '2.5rem' },
  catName: { fontSize: '1.25rem', fontWeight: 700, color: '#111', borderBottom: '2px solid #e5e7eb', paddingBottom: '0.5rem', marginBottom: '1rem' },
  productGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' },
  card: { background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb' },
  productImg: { width: '100%', height: '160px', objectFit: 'cover' },
  cardBody: { padding: '1rem' },
  productName: { margin: '0 0 0.25rem', fontWeight: 600, fontSize: '1rem', color: '#111' },
  productDesc: { margin: '0 0 0.75rem', fontSize: '0.85rem', color: '#6b7280', lineHeight: 1.4 },
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  price: { fontWeight: 700, color: '#111', fontSize: '1rem' },
  addBtn: { background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', padding: '0.4rem 0.9rem', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', justifyContent: 'flex-end' },
  drawer: { background: '#fff', width: '100%', maxWidth: '420px', height: '100%', display: 'flex', flexDirection: 'column' },
  modal: { background: '#fff', width: '100%', maxWidth: '480px', margin: 'auto', borderRadius: '16px', overflow: 'hidden' },
  drawerHeader: { padding: '1.25rem 1.5rem', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  drawerBody: { flex: 1, overflowY: 'auto', padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  drawerFooter: { padding: '1.25rem 1.5rem', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  cartItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.95rem' },
  removeBtn: { background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: '0.85rem' },
  closeBtn: { background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#6b7280' },
  checkoutBtn: { background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.75rem 1.25rem', fontWeight: 600, cursor: 'pointer', fontSize: '0.95rem' },
  input: { border: '1px solid #d1d5db', borderRadius: '6px', padding: '0.5rem 0.75rem', fontSize: '0.95rem', outline: 'none' },
}
