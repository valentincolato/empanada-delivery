import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { api } from '@utils/api'
import { cart } from '@utils/cart'

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

  useEffect(() => {
    if (!data?.restaurant || data.restaurant.accepting_orders) return
    cart.clear(slug)
    setCartItems([])
    setShowCart(false)
    setCheckout(false)
    setProductModal(null)
  }, [data, slug])

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
    if (!data?.restaurant?.accepting_orders) {
      setError(t('menu.notAccepting'))
      return
    }
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
    return <div className="grid h-screen place-items-center text-sm text-[var(--ink-700)]">{t('menu.loading')}</div>
  }

  const restaurant = data.restaurant
  const isOpen = restaurant.accepting_orders
  const totalFormatted = `$${(totalCents() / 100).toFixed(2)}`
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="min-h-screen pb-28 text-[var(--ink-900)]">
      <header className="border-b border-[var(--line-soft)] bg-[linear-gradient(180deg,#171b23,#10141b)]">
        <div className="mx-auto max-w-6xl px-4 pb-7 pt-8 sm:px-6">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="flex min-w-0 flex-1 gap-4">
              <div className="grid h-[74px] w-[74px] shrink-0 place-items-center rounded-full border border-[var(--gold-600)] bg-[var(--panel)] font-display text-2xl font-semibold text-[var(--gold-700)] shadow-sm">
                {initials(restaurant.name)}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--gold-700)]">Signature Menu</p>
                <h1 className="font-display text-5xl font-semibold leading-none text-[var(--ink-900)] sm:text-6xl">{restaurant.name}</h1>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-medium text-[var(--ink-500)]">
                  <span>Today 11:30 - 15:00 and 19:15 - 23:00</span>
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${restaurant.accepting_orders ? 'border border-emerald-800/40 bg-emerald-900/30 text-emerald-300' : 'border border-red-900/50 bg-red-950/35 text-red-300'}`}>
                    {restaurant.accepting_orders ? t('menu.open') : t('menu.closed')}
                  </span>
                </div>
                {!restaurant.accepting_orders && <div className="mt-1 text-sm text-red-300">{t('menu.notAccepting')}</div>}
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {restaurant.phone && (
                    <a href={`tel:${restaurant.phone}`} className="elegant-button-secondary !rounded-lg !px-4 !py-2 !text-xs">
                      {t('menu.call')}
                    </a>
                  )}
                  {restaurant.phone && (
                    <a href={whatsappUrl(restaurant.phone)} target="_blank" rel="noreferrer" className="elegant-button-secondary !rounded-lg !px-4 !py-2 !text-xs">
                      WhatsApp
                    </a>
                  )}
                  <a href="#menu-sections" className="elegant-button-primary !rounded-lg !px-4 !py-2 !text-xs">
                    Menu
                  </a>
                </div>
              </div>
            </div>

            <div className="elegant-card w-full bg-[var(--panel)] p-4 sm:w-[260px]">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ink-500)]">{t('menu.location')}</div>
              <div className="mt-2 text-sm leading-relaxed text-[var(--ink-700)]">{restaurant.address || t('menu.addressNotAvailable')}</div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-7 sm:px-6" id="menu-sections">
        {!isOpen && <ClosedState />}
        {isOpen && !hasProducts && <EmptyState />}

        {isOpen && hasProducts && categories.map((cat) => (
          <section key={cat.id} className="mb-10">
            <h2 className="mb-4 font-display text-4xl font-semibold text-[var(--ink-900)]">{cat.name}</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {(cat.products || []).map((product) => (
                <ProductCard key={product.id} product={product} onAdd={openProductModal} />
              ))}
            </div>
          </section>
        ))}
      </main>

      <footer className="border-t border-[var(--line-soft)] bg-[var(--panel)] px-4 pb-20 pt-7 text-center sm:px-6">
        <div className="font-display text-3xl font-semibold text-[var(--ink-900)]">{restaurant.name}</div>
        <div className="mt-4 flex flex-wrap justify-center gap-12 text-left">
          <div>
            <div className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--ink-500)]">{t('menu.location')}</div>
            <div className="text-sm text-[var(--ink-700)]">{restaurant.address || t('common.notDefined')}</div>
          </div>
          <div>
            <div className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--ink-500)]">{t('menu.contact')}</div>
            <div className="text-sm text-[var(--ink-700)]">{restaurant.phone || t('common.notDefined')}</div>
          </div>
        </div>
      </footer>

      {isOpen && itemCount > 0 && hasProducts && (
        <button
          className="fixed bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3 rounded-full border border-[#be9f70] bg-[linear-gradient(135deg,#8b6a38,#a68046)] px-5 py-3 text-white shadow-[0_14px_28px_rgba(80,56,22,0.32)]"
          onClick={() => setShowCart(true)}
        >
          <span className="text-xs font-medium uppercase tracking-[0.08em]">{t('menu.itemsCount', { count: itemCount, total: totalFormatted })}</span>
          <span className="text-sm font-semibold">{t('menu.viewOrder')}</span>
        </button>
      )}

      {isOpen && showCart && !checkout && (
        <CartDrawer
          items={cartItems}
          onUpdateQuantity={updateQuantity}
          onCheckout={() => { setShowCart(false); setCheckout(true) }}
          onClose={() => setShowCart(false)}
          total={totalFormatted}
        />
      )}

      {isOpen && checkout && (
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

      {isOpen && productModal && (
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
    <div className="elegant-card overflow-hidden bg-[var(--panel)]" data-testid="product-card">
      {product.image_url && <img src={product.image_url} alt={product.name} className="h-40 w-full object-cover" />}
      <div className="p-3">
        <h3 className="font-display text-2xl font-semibold text-[var(--ink-900)]">{product.name}</h3>
        {product.description && <p className="mb-2 mt-1 min-h-8 text-xs leading-relaxed text-[var(--ink-700)]">{product.description}</p>}
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-[var(--ink-900)]">${parseFloat(product.price).toFixed(2)}</span>
          <button className="elegant-button-primary !rounded-lg !px-3 !py-1.5 !text-xs" onClick={() => onAdd(product)}>{t('menu.add')}</button>
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
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div data-testid="product-modal" className="w-full max-w-lg overflow-hidden rounded-3xl border border-[var(--line-soft)] bg-[var(--panel)] text-[var(--ink-900)] shadow-[0_24px_52px_rgba(22,18,10,0.26)]">
        {product.image_url && (
          <img src={product.image_url} alt={product.name} className="h-56 w-full object-cover" />
        )}

        <div className="p-5">
          <div className="mb-3 flex items-start justify-between gap-4">
            <div>
              <h3 className="font-display text-4xl font-semibold">{product.name}</h3>
              <p className="mt-1 text-sm font-semibold text-[var(--gold-700)]">${parseFloat(product.price).toFixed(2)}</p>
            </div>
            <button onClick={onClose} className="rounded-full border border-[var(--line-soft)] px-2.5 py-1 text-[var(--ink-500)]">x</button>
          </div>

          {product.description && (
            <p className="mb-5 text-sm leading-relaxed text-[var(--ink-700)]">{product.description}</p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                data-testid="product-modal-quantity-decrease"
                onClick={decreaseQuantity}
                className="h-9 w-9 rounded-md border border-[var(--line-soft)] text-lg font-semibold text-[var(--ink-700)]"
              >
                -
              </button>
              <span data-testid="product-modal-quantity-value" className="min-w-8 text-center text-sm font-semibold text-[var(--ink-900)]">
                {quantity}
              </span>
              <button
                type="button"
                data-testid="product-modal-quantity-increase"
                onClick={increaseQuantity}
                className="h-9 w-9 rounded-md border border-[var(--line-soft)] text-lg font-semibold text-[var(--ink-700)]"
              >
                +
              </button>
            </div>
            <button onClick={onClose} className="elegant-button-secondary !rounded-lg !px-4 !py-2 !text-sm">
              {t('common.cancel')}
            </button>
            <button data-testid="product-modal-add" onClick={() => onAdd(quantity)} className="elegant-button-primary !rounded-lg !px-4 !py-2 !text-sm">
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
    <section className="grid min-h-[380px] place-items-center px-4 text-center text-[var(--ink-700)]">
      <div>
        <div className="font-display text-7xl text-[var(--gold-700)]">Menu</div>
        <h2 className="mb-1 mt-2 font-display text-4xl font-semibold text-[var(--ink-900)]">{t('menu.emptyMenuTitle')}</h2>
        <p className="mx-auto max-w-2xl text-sm">{t('menu.emptyMenuDesc')}</p>
      </div>
    </section>
  )
}

function ClosedState() {
  const { t } = useTranslation()
  return (
    <section className="grid min-h-[380px] place-items-center px-4 text-center text-[var(--ink-700)]">
      <div>
        <h2 className="mb-1 mt-2 font-display text-4xl font-semibold text-[var(--ink-900)]">{t('menu.closed')}</h2>
        <p className="mx-auto max-w-2xl text-sm">{t('menu.notAccepting')}</p>
      </div>
    </section>
  )
}

function CartDrawer({ items, onUpdateQuantity, onCheckout, onClose, total }) {
  const { t } = useTranslation()
  return (
    <div className="fixed inset-0 z-[100] flex justify-end bg-black/40 backdrop-blur-[1px]">
      <div data-testid="cart-drawer" className="flex h-full w-full max-w-[440px] flex-col border-l border-[var(--line-soft)] bg-[var(--panel)] text-[var(--ink-900)]">
        <div className="flex items-center justify-between border-b border-[var(--line-soft)] px-6 py-5">
          <h2 className="font-display text-4xl font-semibold">{t('menu.cart.title')}</h2>
          <button onClick={onClose} className="rounded-full border border-[var(--line-soft)] px-2.5 py-1 text-[var(--ink-500)]">x</button>
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto px-6 py-4">
          {items.map((item) => (
            <div key={item.product_id} data-testid="cart-item" className="rounded-xl border border-[var(--line-soft)] bg-[var(--panel-strong)] p-3 text-sm">
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="font-medium text-[var(--ink-900)]">{item.product_name}</span>
                <span className="font-semibold text-[var(--ink-900)]">${((item.unit_price_cents * item.quantity) / 100).toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-2">
                <button data-testid="quantity-decrease" onClick={() => onUpdateQuantity(item.product_id, item.quantity - 1)} className="rounded border border-[var(--line-soft)] px-2 py-1 text-xs">-</button>
                <span className="min-w-7 text-center text-[var(--ink-700)]">{item.quantity}</span>
                <button data-testid="quantity-increase" onClick={() => onUpdateQuantity(item.product_id, item.quantity + 1)} className="rounded border border-[var(--line-soft)] px-2 py-1 text-xs">+</button>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between border-t border-[var(--line-soft)] px-6 py-5">
          <div className="text-base font-semibold text-[var(--ink-900)]">{t('menu.cart.total', { total })}</div>
          <button className="elegant-button-primary !rounded-lg !px-5 !py-2.5 !text-sm" onClick={onCheckout}>{t('menu.cart.checkout')}</button>
        </div>
      </div>
    </div>
  )
}

function CheckoutModal({ form, items, onChange, onUpdateQuantity, onSubmit, onClose, submitting, error, total }) {
  const { t } = useTranslation()
  return (
    <div className="fixed inset-0 z-[100] flex bg-black/40 p-4 backdrop-blur-[1px]">
      <div className="m-auto grid w-full max-w-5xl overflow-hidden rounded-3xl border border-[var(--line-soft)] bg-[var(--panel)] text-[var(--ink-900)] md:grid-cols-[1.08fr_0.92fr]">
        <div className="border-b border-[var(--line-soft)] p-6 md:border-b-0 md:border-r">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-4xl font-semibold">{t('menu.checkout.title')}</h2>
            <button onClick={onClose} className="rounded-full border border-[var(--line-soft)] px-2.5 py-1 text-[var(--ink-500)]">x</button>
          </div>
          <form onSubmit={onSubmit} className="flex flex-col gap-3">
            <div className="rounded-2xl border border-[var(--line-soft)] bg-[var(--panel-strong)] p-4">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-500)]">{t('menu.checkout.yourData')}</h3>
              <div className="grid gap-3">
                <label className="flex flex-col gap-1 text-sm text-[var(--ink-700)]">
                  {t('menu.checkout.fullName')}
                  <input
                    type="text"
                    required
                    value={form.customer_name}
                    onChange={(e) => onChange('customer_name', e.target.value)}
                    className="rounded-md border border-[var(--line-soft)] bg-[var(--panel-strong)] px-3 py-2 text-sm text-[var(--ink-900)] outline-none focus:border-[var(--gold-600)]"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm text-[var(--ink-700)]">
                  {t('menu.checkout.email')}
                  <input
                    type="email"
                    required
                    value={form.customer_email}
                    onChange={(e) => onChange('customer_email', e.target.value)}
                    className="rounded-md border border-[var(--line-soft)] bg-[var(--panel-strong)] px-3 py-2 text-sm text-[var(--ink-900)] outline-none focus:border-[var(--gold-600)]"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm text-[var(--ink-700)]">
                  {t('menu.checkout.phone')}
                  <input
                    type="tel"
                    required
                    value={form.customer_phone}
                    onChange={(e) => onChange('customer_phone', e.target.value)}
                    className="rounded-md border border-[var(--line-soft)] bg-[var(--panel-strong)] px-3 py-2 text-sm text-[var(--ink-900)] outline-none focus:border-[var(--gold-600)]"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm text-[var(--ink-700)]">
                  {t('menu.checkout.deliveryAddress')}
                  <input
                    type="text"
                    required
                    value={form.customer_address}
                    onChange={(e) => onChange('customer_address', e.target.value)}
                    className="rounded-md border border-[var(--line-soft)] bg-[var(--panel-strong)] px-3 py-2 text-sm text-[var(--ink-900)] outline-none focus:border-[var(--gold-600)]"
                  />
                </label>
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--line-soft)] bg-[var(--panel-strong)] p-4">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-500)]">{t('menu.checkout.payment')}</h3>
              <div className="grid gap-2 text-sm text-[var(--ink-700)]">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="payment_method"
                    checked={form.payment_method === 'cash'}
                    onChange={() => onChange('payment_method', 'cash')}
                  />
                  {t('menu.checkout.cash')}
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="payment_method"
                    checked={form.payment_method === 'transfer'}
                    onChange={() => onChange('payment_method', 'transfer')}
                  />
                  {t('menu.checkout.transfer')}
                </label>

                {form.payment_method === 'cash' && (
                  <label className="mt-2 flex flex-col gap-1 text-sm text-[var(--ink-700)]">
                    {t('menu.checkout.changeFor')}
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.cash_change_for}
                      onChange={(e) => onChange('cash_change_for', e.target.value)}
                      placeholder={t('menu.checkout.changeForPlaceholder')}
                      className="rounded-md border border-[var(--line-soft)] bg-[var(--panel-strong)] px-3 py-2 text-sm text-[var(--ink-900)] outline-none focus:border-[var(--gold-600)]"
                    />
                  </label>
                )}
              </div>
            </div>

            <label className="flex flex-col gap-1 text-sm text-[var(--ink-700)]">
              {t('menu.checkout.notes')}
              <input
                type="text"
                value={form.notes}
                onChange={(e) => onChange('notes', e.target.value)}
                className="rounded-md border border-[var(--line-soft)] bg-[var(--panel-strong)] px-3 py-2 text-sm text-[var(--ink-900)] outline-none focus:border-[var(--gold-600)]"
              />
            </label>
            {error && <div className="text-sm text-red-300">{error}</div>}
            <div className="mt-1 text-sm font-semibold text-[var(--ink-900)]">{t('menu.cart.total', { total })}</div>
            <button type="submit" disabled={submitting} className="elegant-button-primary !rounded-lg !px-5 !py-3 !text-sm">
              {submitting ? t('menu.checkout.placingOrder') : t('menu.checkout.placeOrder')}
            </button>
          </form>
        </div>

        <aside className="p-6">
          <h3 className="mb-4 font-display text-3xl font-semibold">{t('menu.checkout.orderSummary')}</h3>
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.product_id} className="rounded-xl border border-[var(--line-soft)] bg-[var(--panel-strong)] p-3 text-sm">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="font-medium text-[var(--ink-900)]">{item.product_name}</span>
                  <span className="font-semibold text-[var(--ink-900)]">${((item.unit_price_cents * item.quantity) / 100).toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => onUpdateQuantity(item.product_id, item.quantity - 1)} type="button" className="rounded border border-[var(--line-soft)] px-2 py-1 text-xs">-</button>
                  <span className="min-w-7 text-center text-[var(--ink-700)]">{item.quantity}</span>
                  <button onClick={() => onUpdateQuantity(item.product_id, item.quantity + 1)} type="button" className="rounded border border-[var(--line-soft)] px-2 py-1 text-xs">+</button>
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
