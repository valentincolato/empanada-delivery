import { useEffect, useMemo, useState } from 'react'
import { cart } from '@utils/cart'

export function useCartState(slug, acceptingOrders) {
  const [cartItems, setCartItems] = useState([])
  const [showCart, setShowCart] = useState(false)
  const [checkout, setCheckout] = useState(false)
  const [productModal, setProductModal] = useState(null)

  useEffect(() => {
    setCartItems(cart.get(slug))
  }, [slug])

  useEffect(() => {
    if (acceptingOrders !== false) return
    cart.clear(slug)
    setCartItems([])
    setShowCart(false)
    setCheckout(false)
    setProductModal(null)
  }, [acceptingOrders, slug])

  function addToCart(product, quantity = 1) {
    const updated = cart.add(slug, product, quantity)
    setCartItems([...updated])
  }

  function updateQuantity(productId, quantity) {
    const updated = cart.updateQuantity(slug, productId, quantity)
    setCartItems([...updated])
    if (updated.length === 0) {
      setShowCart(false)
      setCheckout(false)
    }
  }

  function clearCart() {
    cart.clear(slug)
    setCartItems([])
  }

  const totalCents = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.unit_price_cents * item.quantity, 0),
    [cartItems]
  )
  const itemCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  )

  return {
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
  }
}
