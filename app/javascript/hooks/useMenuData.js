import { useEffect, useMemo, useState } from 'react'
import { api } from '@utils/api'

export function useMenuData(slug) {
  const [data, setData] = useState(null)

  useEffect(() => {
    api.get(`/api/v1/public/menu/${slug}`).then(setData).catch(console.error)
  }, [slug])

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
