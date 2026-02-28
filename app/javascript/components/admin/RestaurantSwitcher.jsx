import { useState } from 'react'
import { api } from '@utils/api'
import { notifyError } from '@utils/notify'

export default function RestaurantSwitcher({ restaurants }) {
  const [switchingId, setSwitchingId] = useState(null)

  async function switchRestaurant(restaurantId) {
    setSwitchingId(restaurantId)
    try {
      const data = await api.post('/api/v1/admin/switch_restaurant', { restaurant_id: restaurantId })
      window.location.href = data.redirect_to || '/admin/orders'
    } catch (err) {
      notifyError(err.message)
    } finally {
      setSwitchingId(null)
    }
  }

  return (
    <div className="mb-8 rounded-2xl border border-[var(--line-soft)] bg-[var(--panel-strong)] p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand-700)]">Restaurant context</p>
      <h3 className="mt-1 font-display text-3xl font-semibold text-[var(--ink-900)]">Seleccioná restaurante</h3>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {(restaurants || []).map((restaurant) => (
          <button
            key={restaurant.id}
            onClick={() => switchRestaurant(restaurant.id)}
            disabled={switchingId === restaurant.id}
            className="rounded-xl border border-[var(--line-soft)] bg-[var(--panel-strong)] px-4 py-3 text-left transition hover:-translate-y-0.5"
          >
            <div className="font-semibold text-[var(--ink-900)]">{restaurant.name}</div>
            <div className="text-xs text-[var(--ink-500)]">/{restaurant.slug}</div>
          </button>
        ))}
      </div>
    </div>
  )
}
