import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { api } from '@utils/api'
import { cart } from '@utils/cart'
import LanguageSwitcher from './LanguageSwitcher'

export default function Menu({ slug }) {
  const { t } = useTranslation()
  const [data, setData] = useState(null)
  const [cartItems, setCartItems] = useState([])
  const [showCart, setShowCart] = useState(false)
  const [checkout, setCheckout] = useState(false)
  const [productModal, setProductModal] = useState(null)
  const [form, setForm] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    customer_address: '',
    payment_method: 'cash',
    cash_change_for: '',
    notes: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.get(`/api/v1/public/menu/${slug}`).then(setData).catch(console.error)
    setCartItems(cart.get(slug))
  }, [slug])

  const categories = data?.categories || []
  const hasProducts = useMemo(() => categories.some((cat) => (cat.products || []).length > 0), [categories])

  function addToCart(product, quantity = 1) {
    const updated = cart.add(slug, product, quantity)
    setCartItems([...updated])
  }

  function openProductModal(product) {
    setProductModal(product)
  }

  function closeProductModal() {
    setProductModal(null)
  }

  function addFromModal(product, quantity) {
    addToCart(product, quantity)
    closeProductModal()
  }

  function updateQuantity(productId, quantity) {
    const updated = cart.updateQuantity(slug, productId, quantity)
    setCartItems([...updated])
    if (updated.length === 0) {
      setShowCart(false)
      setCheckout(false)
    }
  }

  function totalCents() {
    return cartItems.reduce((sum, item) => sum + item.unit_price_cents * item.quantity, 0)
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
    return <div className="flex h-screen items-center justify-center bg-slate-950 text-slate-400">{t('menu.loading')}</div>
  }

  const restaurant = data.restaurant
  const totalFormatted = `$${(totalCents() / 100).toFixed(2)}`
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="min-h-screen bg-[#050608] pb-28 text-slate-200">
      <header className="border-b border-slate-800 bg-slate-900">
        <div className="h-28 bg-[radial-gradient(circle_at_top_left,#334155,transparent_45%),linear-gradient(130deg,#111827,#1f2937)]" />
        <div className="mx-auto -mt-8 flex max-w-6xl flex-wrap justify-between gap-5 px-4 pb-5">
          <div className="flex min-w-0 flex-1 gap-4">
            <div className="grid h-[72px] w-[72px] shrink-0 place-items-center rounded-full border-2 border-orange-400 bg-slate-900 font-bold text-slate-100">
              {initials(restaurant.name)}
            </div>
            <div className="min-w-0">
              <h1 className="mb-2 text-4xl font-bold text-white">{restaurant.name}</h1>
              <div className="flex flex-wrap items-center gap-2 text-sm text-slate-400">
                <span>Today 11:30 - 15:00 and 19:15 - 23:00</span>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${restaurant.accepting_orders ? 'bg-green-600 text-green-50' : 'bg-red-700 text-red-100'}`}>
                  {restaurant.accepting_orders ? t('menu.open') : t('menu.closed')}
                </span>
              </div>
              {!restaurant.accepting_orders && <div className="mt-1 text-sm text-amber-400">{t('menu.notAccepting')}</div>}
              <div className="mt-3 flex flex-wrap gap-2">
                {restaurant.phone && (
                  <a href={`tel:${restaurant.phone}`} className="rounded-lg border border-green-700 bg-green-900/40 px-3 py-2 text-xs font-semibold text-green-300">
                    {t('menu.call')}
                  </a>
                )}
                {restaurant.phone && (
                  <a href={whatsappUrl(restaurant.phone)} target="_blank" rel="noreferrer" className="rounded-lg border border-green-700 bg-green-900/40 px-3 py-2 text-xs font-semibold text-green-300">
                    WhatsApp
                  </a>
                )}
                <a href="#menu-sections" className="rounded-lg bg-orange-500 px-3 py-2 text-xs font-bold text-white">Menu</a>
                <LanguageSwitcher />
              </div>
            </div>
          </div>

          <div className="w-full overflow-hidden rounded-xl border border-slate-700 bg-slate-900 text-slate-300 sm:w-60">
            <div className="border-b border-slate-700 px-3 py-2 text-xs">{t('menu.location')}</div>
            <div className="min-h-[74px] px-3 py-2 text-sm text-slate-400">{restaurant.address || t('menu.addressNotAvailable')}</div>
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
                <ProductCard key={product.id} product={product} onAdd={openProductModal} />
              ))}
            </div>
          </section>
        ))}
      </main>

      <footer className="border-t border-slate-700 bg-slate-900 px-4 pb-20 pt-6 text-center">
        <div className="mb-4 font-bold text-slate-50">{restaurant.name}</div>
        <div className="flex flex-wrap justify-center gap-16">
          <div>
            <div className="mb-1 font-bold text-slate-100">{t('menu.location')}</div>
            <div className="text-sm text-slate-400">{restaurant.address || t('common.notDefined')}</div>
          </div>
          <div>
            <div className="mb-1 font-bold text-slate-100">{t('menu.contact')}</div>
            <div className="text-sm text-slate-400">{restaurant.phone || t('common.notDefined')}</div>
          </div>
        </div>
      </footer>

      {itemCount > 0 && hasProducts && (
        <button
          className="fixed bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-4 rounded-full bg-orange-500 px-5 py-3 font-bold text-white shadow-2xl"
          onClick={() => setShowCart(true)}
        >
          <span className="text-sm">{t('menu.itemsCount', { count: itemCount, total: totalFormatted })}</span>
          <span className="text-base">{t('menu.viewOrder')}</span>
        </button>
      )}

      <button className="fixed bottom-5 right-4 z-20 h-11 w-11 rounded-full bg-orange-500 text-sm text-white shadow-2xl" aria-label="Open chat">●</button>

      {showCart && !checkout && (
        <CartDrawer
          items={cartItems}
          onUpdateQuantity={updateQuantity}
          onCheckout={() => { setShowCart(false); setCheckout(true) }}
          onClose={() => setShowCart(false)}
          total={totalFormatted}
        />
      )}

      {checkout && (
        <CheckoutModal
          form={form}
          items={cartItems}
          onChange={(key, value) => {
            setForm((prev) => {
              const next = { ...prev, [key]: value }
              if (key === 'payment_method' && value === 'transfer') next.cash_change_for = ''
              return next
            })
          }}
          onUpdateQuantity={updateQuantity}
          onSubmit={placeOrder}
          onClose={() => setCheckout(false)}
          submitting={submitting}
          error={error}
          total={totalFormatted}
        />
      )}

      {productModal && (
        <ProductDetailModal
          product={productModal}
          onClose={closeProductModal}
          onAdd={(quantity) => addFromModal(productModal, quantity)}
        />
      )}
    </div>
  )
}

function ProductCard({ product, onAdd }) {
  const { t } = useTranslation()
  return (
    <div className="overflow-hidden rounded border border-slate-700 bg-slate-900" data-testid="product-card">
      {product.image_url && <img src={product.image_url} alt={product.name} className="h-36 w-full object-cover" />}
      <div className="p-2.5">
        <h3 className="text-sm font-semibold text-slate-100">{product.name}</h3>
        {product.description && <p className="mb-2 mt-1 min-h-8 text-xs text-slate-400">{product.description}</p>}
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-slate-100">${parseFloat(product.price).toFixed(2)}</span>
          <button className="rounded-md bg-orange-500 px-2.5 py-1.5 text-xs font-bold text-white" onClick={() => onAdd(product)}>{t('menu.add')}</button>
        </div>
      </div>
    </div>
  )
}

function ProductDetailModal({ product, onClose, onAdd }) {
  const { t } = useTranslation()
  const [quantity, setQuantity] = useState(1)

  function decreaseQuantity() {
    setQuantity((current) => Math.max(1, current - 1))
  }

  function increaseQuantity() {
    setQuantity((current) => current + 1)
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 p-4">
      <div data-testid="product-modal" className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 text-slate-100 shadow-2xl">
        {product.image_url && (
          <img src={product.image_url} alt={product.name} className="h-56 w-full object-cover" />
        )}

        <div className="p-5">
          <div className="mb-3 flex items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold">{product.name}</h3>
              <p className="mt-1 text-sm font-semibold text-orange-300">${parseFloat(product.price).toFixed(2)}</p>
            </div>
            <button onClick={onClose} className="text-slate-300">✕</button>
          </div>

          {product.description && (
            <p className="mb-5 text-sm text-slate-300">{product.description}</p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                data-testid="product-modal-quantity-decrease"
                onClick={decreaseQuantity}
                className="h-9 w-9 rounded-md border border-slate-600 text-lg font-semibold text-slate-200"
              >
                -
              </button>
              <span data-testid="product-modal-quantity-value" className="min-w-8 text-center text-sm font-semibold text-slate-100">
                {quantity}
              </span>
              <button
                type="button"
                data-testid="product-modal-quantity-increase"
                onClick={increaseQuantity}
                className="h-9 w-9 rounded-md border border-slate-600 text-lg font-semibold text-slate-200"
              >
                +
              </button>
            </div>
            <button onClick={onClose} className="rounded-md border border-slate-600 px-4 py-2 text-sm font-medium text-slate-200">
              {t('common.cancel')}
            </button>
            <button data-testid="product-modal-add" onClick={() => onAdd(quantity)} className="rounded-md bg-orange-500 px-4 py-2 text-sm font-bold text-white">
              {t('menu.add')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function EmptyState() {
  const { t } = useTranslation()
  return (
    <section className="grid min-h-[380px] place-items-center px-4 text-center text-slate-400">
      <div>
        <div className="text-6xl opacity-70">🍽</div>
        <h2 className="mb-1 mt-2 text-3xl font-bold text-slate-50">{t('menu.emptyMenuTitle')}</h2>
        <p className="mx-auto max-w-2xl">{t('menu.emptyMenuDesc')}</p>
      </div>
    </section>
  )
}

function CartDrawer({ items, onUpdateQuantity, onCheckout, onClose, total }) {
  const { t } = useTranslation()
  return (
    <div className="fixed inset-0 z-[100] flex justify-end bg-black/60">
      <div data-testid="cart-drawer" className="flex h-full w-full max-w-[440px] flex-col border-l border-slate-700 bg-slate-900 text-slate-100">
        <div className="flex items-center justify-between border-b border-slate-700 px-6 py-5">
          <h2 className="text-xl font-bold">{t('menu.cart.title')}</h2>
          <button onClick={onClose} className="text-slate-300">✕</button>
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto px-6 py-4">
          {items.map((item) => (
            <div key={item.product_id} data-testid="cart-item" className="rounded-lg border border-slate-700 p-3 text-sm">
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="font-medium">{item.product_name}</span>
                <span>${((item.unit_price_cents * item.quantity) / 100).toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-2">
                <button data-testid="quantity-decrease" onClick={() => onUpdateQuantity(item.product_id, item.quantity - 1)} className="rounded border border-slate-600 px-2 py-1 text-xs">-</button>
                <span className="min-w-7 text-center">{item.quantity}</span>
                <button data-testid="quantity-increase" onClick={() => onUpdateQuantity(item.product_id, item.quantity + 1)} className="rounded border border-slate-600 px-2 py-1 text-xs">+</button>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between border-t border-slate-700 px-6 py-5">
          <div className="text-lg font-bold">{t('menu.cart.total', { total })}</div>
          <button className="rounded-lg bg-orange-500 px-5 py-3 text-sm font-bold text-white" onClick={onCheckout}>{t('menu.cart.checkout')}</button>
        </div>
      </div>
    </div>
  )
}

function CheckoutModal({ form, items, onChange, onUpdateQuantity, onSubmit, onClose, submitting, error, total }) {
  const { t } = useTranslation()
  return (
    <div className="fixed inset-0 z-[100] flex bg-black/60 p-4">
      <div className="m-auto grid w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 text-slate-100 md:grid-cols-[1.1fr_0.9fr]">
        <div className="border-b border-slate-700 p-6 md:border-b-0 md:border-r">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">{t('menu.checkout.title')}</h2>
            <button onClick={onClose} className="text-slate-300">✕</button>
          </div>
          <form onSubmit={onSubmit} className="flex flex-col gap-3">
            <div className="rounded-xl border border-slate-700 bg-slate-950/50 p-4">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-300">{t('menu.checkout.yourData')}</h3>
              <div className="grid gap-3">
                <label className="flex flex-col gap-1 text-sm">
                  {t('menu.checkout.fullName')}
                  <input
                    type="text"
                    required
                    value={form.customer_name}
                    onChange={(e) => onChange('customer_name', e.target.value)}
                    className="rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  {t('menu.checkout.email')}
                  <input
                    type="email"
                    required
                    value={form.customer_email}
                    onChange={(e) => onChange('customer_email', e.target.value)}
                    className="rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  {t('menu.checkout.phone')}
                  <input
                    type="tel"
                    required
                    value={form.customer_phone}
                    onChange={(e) => onChange('customer_phone', e.target.value)}
                    className="rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  {t('menu.checkout.deliveryAddress')}
                  <input
                    type="text"
                    required
                    value={form.customer_address}
                    onChange={(e) => onChange('customer_address', e.target.value)}
                    className="rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                  />
                </label>
              </div>
            </div>

            <div className="rounded-xl border border-slate-700 bg-slate-950/50 p-4">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-300">{t('menu.checkout.payment')}</h3>
              <div className="grid gap-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="payment_method"
                    checked={form.payment_method === 'cash'}
                    onChange={() => onChange('payment_method', 'cash')}
                  />
                  {t('menu.checkout.cash')}
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="payment_method"
                    checked={form.payment_method === 'transfer'}
                    onChange={() => onChange('payment_method', 'transfer')}
                  />
                  {t('menu.checkout.transfer')}
                </label>

                {form.payment_method === 'cash' && (
                  <label className="mt-2 flex flex-col gap-1 text-sm">
                    {t('menu.checkout.changeFor')}
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.cash_change_for}
                      onChange={(e) => onChange('cash_change_for', e.target.value)}
                      placeholder={t('menu.checkout.changeForPlaceholder')}
                      className="rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                    />
                  </label>
                )}
              </div>
            </div>

            <label className="flex flex-col gap-1 text-sm">
              {t('menu.checkout.notes')}
              <input
                type="text"
                value={form.notes}
                onChange={(e) => onChange('notes', e.target.value)}
                className="rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-slate-100"
              />
            </label>
            {error && <div className="text-sm text-red-300">{error}</div>}
            <div className="mt-1 font-bold">{t('menu.cart.total', { total })}</div>
            <button type="submit" disabled={submitting} className="rounded-lg bg-orange-500 px-5 py-3 text-sm font-bold text-white">
              {submitting ? t('menu.checkout.placingOrder') : t('menu.checkout.placeOrder')}
            </button>
          </form>
        </div>

        <aside className="p-6">
          <h3 className="mb-4 text-lg font-semibold">{t('menu.checkout.orderSummary')}</h3>
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.product_id} className="rounded-lg border border-slate-700 p-3 text-sm">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="font-medium">{item.product_name}</span>
                  <span>${((item.unit_price_cents * item.quantity) / 100).toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => onUpdateQuantity(item.product_id, item.quantity - 1)} type="button" className="rounded border border-slate-600 px-2 py-1 text-xs">-</button>
                  <span className="min-w-7 text-center">{item.quantity}</span>
                  <button onClick={() => onUpdateQuantity(item.product_id, item.quantity + 1)} type="button" className="rounded border border-slate-600 px-2 py-1 text-xs">+</button>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  )
}

function initials(name) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

function whatsappUrl(phone) {
  const digits = String(phone).replace(/\D/g, '')
  return `https://wa.me/${digits}`
}
