const CART_PREFIX = 'empanada_cart_'

function key(slug) {
  return `${CART_PREFIX}${slug}`
}

export const cart = {
  get(slug) {
    try {
      return JSON.parse(localStorage.getItem(key(slug))) || []
    } catch {
      return []
    }
  },

  add(slug, product, quantity = 1) {
    const items = cart.get(slug)
    const existing = items.find((i) => i.product_id === product.id)
    if (existing) {
      existing.quantity += quantity
    } else {
      items.push({
        product_id: product.id,
        product_name: product.name,
        unit_price_cents: Math.round(product.price * 100),
        quantity,
        notes: '',
      })
    }
    cart.save(slug, items)
    return items
  },

  remove(slug, productId) {
    const items = cart.get(slug).filter((i) => i.product_id !== productId)
    cart.save(slug, items)
    return items
  },

  updateQuantity(slug, productId, quantity) {
    if (quantity <= 0) return cart.remove(slug, productId)
    const items = cart.get(slug).map((i) =>
      i.product_id === productId ? { ...i, quantity } : i
    )
    cart.save(slug, items)
    return items
  },

  clear(slug) {
    localStorage.removeItem(key(slug))
  },

  save(slug, items) {
    localStorage.setItem(key(slug), JSON.stringify(items))
  },

  total(slug) {
    return cart.get(slug).reduce((sum, i) => sum + i.unit_price_cents * i.quantity, 0)
  },

  count(slug) {
    return cart.get(slug).reduce((sum, i) => sum + i.quantity, 0)
  },
}
