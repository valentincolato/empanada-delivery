import { useState, useEffect, useMemo } from 'react'
import { api } from '@utils/api'
import { cart } from '@utils/cart'

export default function Menu({ slug }) {
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

  const categories = data?.categories || []
  const hasProducts = useMemo(() => categories.some((cat) => (cat.products || []).length > 0), [categories])

  function addToCart(product) {
    const updated = cart.add(slug, product)
    setCartItems([...updated])
  }

  function removeFromCart(productId) {
    const updated = cart.remove(slug, productId)
    setCartItems([...updated])
    if (updated.length === 0) setShowCart(false)
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

  if (!data) {
    return <div className="flex h-screen items-center justify-center bg-slate-950 font-sans text-slate-400">Loading menu...</div>
  }

  const restaurant = data.restaurant
  const totalFormatted = `$${(totalCents() / 100).toFixed(2)}`
  const itemCount = cartItems.reduce((s, i) => s + i.quantity, 0)

  return (
    <div className="min-h-screen bg-slate-950 pb-28 font-sans text-slate-200">
      <header className="border-b border-slate-700 bg-slate-900">
        <div className="h-28 bg-gradient-to-br from-slate-700 to-slate-800" />
        <div className="mx-auto -mt-8 flex max-w-6xl flex-wrap justify-between gap-5 px-4 pb-5">
          <div className="flex min-w-0 flex-1 gap-4">
            <div className="grid h-[72px] w-[72px] shrink-0 place-items-center rounded-full border-2 border-amber-500 bg-slate-900 font-bold">
              {initials(restaurant.name)}
            </div>
            <div className="min-w-0">
              <h1 className="mb-2 text-4xl font-bold text-slate-50">{restaurant.name}</h1>
              <div className="flex flex-wrap items-center gap-2 text-sm text-slate-400">
                <span>Horarios Hoy 11:30 a 15:00 y 19:15 a 23:00</span>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${restaurant.accepting_orders ? 'bg-green-600 text-green-50' : 'bg-red-700 text-red-100'}`}>
                  {restaurant.accepting_orders ? 'Abierto' : 'Cerrado'}
                </span>
              </div>
              {!restaurant.accepting_orders && <div className="mt-1 text-sm text-amber-400">Not accepting orders right now</div>}
              <div className="mt-3 flex flex-wrap gap-2">
                {restaurant.phone && (
                  <a href={`tel:${restaurant.phone}`} className="rounded-lg border border-green-700 bg-green-900 px-3 py-2 text-xs font-semibold text-green-300">
                    Llamar
                  </a>
                )}
                {restaurant.phone && (
                  <a href={whatsappUrl(restaurant.phone)} target="_blank" rel="noreferrer" className="rounded-lg border border-green-700 bg-green-900 px-3 py-2 text-xs font-semibold text-green-300">
                    WhatsApp
                  </a>
                )}
                <a href="#menu-sections" className="rounded-lg bg-orange-500 px-3 py-2 text-xs font-bold text-white">Menu</a>
              </div>
            </div>
          </div>

          <div className="w-full overflow-hidden rounded-xl border border-slate-700 bg-slate-900 text-slate-300 sm:w-60">
            <div className="border-b border-slate-700 px-3 py-2 text-xs">Donde estamos</div>
            <div className="min-h-[74px] px-3 py-2 text-sm text-slate-400">{restaurant.address || 'Direccion no disponible'}</div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-7" id="menu-sections">
        {!hasProducts && <EmptyState />}

        {hasProducts && categories.map((cat) => (
          <section key={cat.id} className="mb-8">
            <h2 className="mb-3 text-2xl font-bold text-slate-50">{cat.name}</h2>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {(cat.products || []).map((product) => (
                <ProductCard key={product.id} product={product} onAdd={addToCart} />
              ))}
            </div>
          </section>
        ))}
      </main>

      <footer className="border-t border-slate-700 bg-slate-900 px-4 pb-20 pt-6 text-center">
        <div className="mb-4 font-bold text-slate-50">{restaurant.name}</div>
        <div className="flex flex-wrap justify-center gap-20">
          <div>
            <div className="mb-1 font-bold text-slate-100">Ubicacion</div>
            <div className="text-sm text-slate-400">{restaurant.address || 'No definida'}</div>
          </div>
          <div>
            <div className="mb-1 font-bold text-slate-100">Contacto</div>
            <div className="text-sm text-slate-400">{restaurant.phone || 'No definido'}</div>
          </div>
        </div>
      </footer>

      {itemCount > 0 && hasProducts && (
        <button
          className="fixed bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-4 rounded-full bg-orange-500 px-5 py-3 font-bold text-white shadow-2xl"
          onClick={() => setShowCart(true)}
        >
          <span className="text-sm">{itemCount} productos - {totalFormatted}</span>
          <span className="text-base">🛒 Ver pedido</span>
        </button>
      )}

      <button className="fixed bottom-5 right-4 z-20 h-11 w-11 rounded-full bg-orange-500 text-sm text-white shadow-2xl" aria-label="Open chat">●</button>

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
          onChange={(k, v) => setForm((f) => ({ ...f, [k]: v }))}
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
    <div className="overflow-hidden rounded border border-slate-700 bg-slate-900" data-testid="product-card">
      {product.image_url && <img src={product.image_url} alt={product.name} className="h-36 w-full object-cover" />}
      <div className="p-2.5">
        <h3 className="text-sm font-semibold text-slate-100">{product.name}</h3>
        {product.description && <p className="mb-2 mt-1 min-h-8 text-xs text-slate-400">{product.description}</p>}
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-slate-100">${parseFloat(product.price).toFixed(2)}</span>
          <button className="rounded-md bg-orange-500 px-2.5 py-1.5 text-xs font-bold text-white" onClick={() => onAdd(product)}>+ Add</button>
        </div>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <section className="grid min-h-[380px] place-items-center px-4 text-center text-slate-400">
      <div>
        <div className="text-6xl opacity-70">🍽</div>
        <h2 className="mb-1 mt-2 text-3xl font-bold text-slate-50">¡Este menu esta vacio!</h2>
        <p className="mx-auto max-w-2xl">Si eres el dueno de este restaurante, agrega items y categorias desde el panel de administracion.</p>
      </div>
    </section>
  )
}

function CartDrawer({ items, onRemove, onCheckout, onClose, total }) {
  return (
    <div className="fixed inset-0 z-[100] flex justify-end bg-black/60">
      <div className="flex h-full w-full max-w-[420px] flex-col border-l border-slate-700 bg-slate-900 text-slate-100">
        <div className="flex items-center justify-between border-b border-slate-700 px-6 py-5">
          <h2 className="text-xl font-bold">Your Cart</h2>
          <button onClick={onClose} className="text-slate-300">x</button>
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto px-6 py-4">
          {items.map((item) => (
            <div key={item.product_id} className="flex items-center justify-between text-sm">
              <span>{item.quantity}x {item.product_name}</span>
              <div className="flex items-center gap-2">
                <span>${((item.unit_price_cents * item.quantity) / 100).toFixed(2)}</span>
                <button onClick={() => onRemove(item.product_id)} className="text-slate-400">x</button>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between border-t border-slate-700 px-6 py-5">
          <div className="text-lg font-bold">Total: {total}</div>
          <button className="rounded-lg bg-orange-500 px-5 py-3 text-sm font-bold text-white" onClick={onCheckout}>Checkout →</button>
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
    <div className="fixed inset-0 z-[100] flex bg-black/60">
      <div className="m-auto w-full max-w-xl overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 text-slate-100">
        <div className="flex items-center justify-between border-b border-slate-700 px-6 py-5">
          <h2 className="text-xl font-bold">Checkout</h2>
          <button onClick={onClose} className="text-slate-300">x</button>
        </div>
        <form onSubmit={onSubmit} className="flex flex-col gap-3 p-6">
          {fields.map(({ key, label, type, required }) => (
            <label key={key} className="flex flex-col gap-1 text-sm">
              {label}
              <input
                type={type}
                required={required}
                value={form[key]}
                onChange={(e) => onChange(key, e.target.value)}
                className="rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-slate-100"
              />
            </label>
          ))}
          {error && <div className="text-sm text-red-300">{error}</div>}
          <div className="mt-1 font-bold">Total: {total}</div>
          <button type="submit" disabled={submitting} className="rounded-lg bg-orange-500 px-5 py-3 text-sm font-bold text-white">
            {submitting ? 'Placing order...' : 'Place Order'}
          </button>
        </form>
      </div>
    </div>
  )
}

function whatsappUrl(phone) {
  const cleaned = (phone || '').replace(/[^\d+]/g, '')
  const numeric = cleaned.startsWith('+') ? cleaned.slice(1) : cleaned
  return `https://wa.me/${numeric}`
}

function initials(name) {
  if (!name) return 'R'
  return name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()
}
