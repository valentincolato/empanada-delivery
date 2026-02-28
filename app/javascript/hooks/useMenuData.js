import { useEffect, useMemo, useState } from 'react'
import { api } from '@utils/api'
import { fillPath } from '@utils/pathBuilder'

export function useMenuData(slug, routes = {}) {
  const [data, setData] = useState(null)

  useEffect(() => {
    api.get(fillPath(routes.api_public_menu_template, { slug })).then(setData).catch(console.error)
  }, [slug, routes.api_public_menu_template])

  const categories = data?.categories || []
  const restaurant = data?.restaurant || null
  const hasProducts = useMemo(() => categories.some((cat) => (cat.products || []).length > 0), [categories])
  const isOpen = restaurant?.accepting_orders

  return {
    data,
    categories,
    restaurant,
    hasProducts,
    isOpen,
  }
}
