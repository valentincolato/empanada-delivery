import { useEffect, useMemo, useState } from 'react'
import { api } from '@utils/api'
import { fillPath } from '@utils/pathBuilder'

const PAGE_SIZE = 8

const EMPTY_FORM = {
  name: '',
  slug: '',
  address: '',
  phone: '',
  description: '',
  currency: 'ARS',
  admin_email: '',
  admin_password: '',
  admin_name: '',
}

function buildEditForm(restaurant) {
  return {
    name: restaurant.name,
    slug: restaurant.slug,
    address: restaurant.address || '',
    phone: restaurant.phone || '',
    description: restaurant.description || '',
    currency: restaurant.currency,
    active: restaurant.active,
  }
}

export function useRestaurantDirectory(routes = {}) {
  const [restaurants, setRestaurants] = useState([])
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    loadRestaurants()
  }, [])

  useEffect(() => {
    setPage(1)
  }, [query])

  async function loadRestaurants() {
    try {
      const data = await api.get(routes.api_super_admin_restaurants)
      const rows = Array.isArray(data) ? data : []
      rows.sort((a, b) => Number(b.active) - Number(a.active) || a.name.localeCompare(b.name))
      setRestaurants(rows)
    } catch (err) {
      setError(err.message)
    }
  }

  function openNew() {
    setForm(EMPTY_FORM)
    setModal('new')
    setError(null)
  }

  function openEdit(restaurant) {
    setForm(buildEditForm(restaurant))
    setModal(restaurant)
    setError(null)
  }

  function closeModal() {
    setModal(null)
  }

  async function save(event) {
    event.preventDefault()
    setSaving(true)
    setError(null)

    try {
      if (modal === 'new') {
        await api.post(routes.api_super_admin_restaurants, {
          restaurant: {
            name: form.name,
            slug: form.slug,
            address: form.address,
            phone: form.phone,
            description: form.description,
            currency: form.currency,
          },
          admin_email: form.admin_email,
          admin_password: form.admin_password,
          admin_name: form.admin_name,
        })
      } else {
        await api.patch(fillPath(routes.api_super_admin_restaurant_template, { id: modal.id }), { restaurant: form })
      }

      await loadRestaurants()
      setModal(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function destroy(restaurantId) {
    await api.delete(fillPath(routes.api_super_admin_restaurant_template, { id: restaurantId }))
    await loadRestaurants()
  }

  async function manageOperations(restaurantId) {
    try {
      const result = await api.post(fillPath(routes.api_super_admin_restaurant_switch_context_template, { id: restaurantId }), {})
      window.location.href = result?.redirect_to || routes.admin_orders
    } catch (err) {
      setError(err.message)
    }
  }

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return restaurants

    return restaurants.filter((restaurant) =>
      [restaurant.name, restaurant.slug, restaurant.address, restaurant.phone, restaurant.currency]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(term))
    )
  }, [restaurants, query])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, pageCount)
  const startIndex = (safePage - 1) * PAGE_SIZE
  const pageItems = filtered.slice(startIndex, startIndex + PAGE_SIZE)

  useEffect(() => {
    if (page > pageCount) setPage(pageCount)
  }, [page, pageCount])

  const stats = useMemo(() => {
    const active = restaurants.filter((restaurant) => restaurant.active).length
    return {
      total: restaurants.length,
      active,
      inactive: restaurants.length - active,
    }
  }, [restaurants])

  return {
    restaurants,
    pageItems,
    modal,
    form,
    saving,
    error,
    query,
    page,
    pageCount,
    safePage,
    startIndex,
    filteredCount: filtered.length,
    stats,
    setQuery,
    setPage,
    setForm,
    setError,
    openNew,
    openEdit,
    closeModal,
    save,
    destroy,
    manageOperations,
  }
}
