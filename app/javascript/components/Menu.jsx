import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { api } from '@utils/api'
import { useMenuData } from '../hooks/useMenuData'
import { useCartState } from '../hooks/useCartState'
import CartDrawer from './menu/CartDrawer'
import CheckoutModal from './menu/CheckoutModal'
import ProductDetailModal from './menu/ProductDetailModal'
import MenuHeader from './menu/MenuHeader'
import MenuFooter from './menu/MenuFooter'
import ProductCard from './menu/ProductCard'
import { EmptyState, ClosedState } from './menu/MenuStates'

export default function Menu({ slug }) {
  const { t } = useTranslation()
  const { data, categories, restaurant, hasProducts, isOpen } = useMenuData(slug)
  const {
    cartItems,
    showCart,
    checkout,
    productModal,
    setShowCart,
    setCheckout,
    setProductModal,
    addToCart,
    updateQuantity,
    clearCart,
    totalCents,
    itemCount,
  } = useCartState(slug, restaurant?.accepting_orders)

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

  function addFromModal(product, quantity) {
    addToCart(product, quantity)
    setProductModal(null)
  }

  async function placeOrder(e) {
    e.preventDefault()
    if (!restaurant?.accepting_orders) {
      setError(t('menu.notAccepting'))
      return
    }
    setSubmitting(true)
    setError(null)

    try {
      const order = await api.post('/api/v1/orders', {
        order: { restaurant_slug: slug, ...form, items: cartItems }
      })
      clearCart()
      window.location.href = `/orders/${order.token}`
    } catch (err) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  if (!data) {
    return <div className="grid h-screen place-items-center text-sm text-[var(--ink-700)]">{t('menu.loading')}</div>
  }

  const totalFormatted = `$${(totalCents / 100).toFixed(2)}`

  return (
    <div className="min-h-screen pb-28 text-[var(--ink-900)]">
      <MenuHeader restaurant={restaurant} />

      <main className="mx-auto max-w-6xl px-4 py-7 sm:px-6" id="menu-sections">
        {!isOpen && <ClosedState />}
        {isOpen && !hasProducts && <EmptyState />}

        {isOpen && hasProducts && categories.map((cat) => (
          <section key={cat.id} className="mb-10">
            <h2 className="mb-4 font-display text-4xl font-semibold text-[var(--ink-900)]">{cat.name}</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {(cat.products || []).map((product) => (
                <ProductCard key={product.id} product={product} onAdd={setProductModal} />
              ))}
            </div>
          </section>
        ))}
      </main>

      <MenuFooter restaurant={restaurant} />

      {isOpen && itemCount > 0 && hasProducts && (
        <button
          className="fixed bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3 rounded-full border border-[var(--brand-500)] bg-[linear-gradient(135deg,var(--brand-700),var(--brand-600))] px-5 py-3 text-white shadow-[0_14px_28px_rgba(166,41,84,0.34)]"
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
          onClose={() => setProductModal(null)}
          onAdd={(quantity) => addFromModal(productModal, quantity)}
        />
      )}
    </div>
  )
}
