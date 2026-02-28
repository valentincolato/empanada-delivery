import { useTranslation } from 'react-i18next'
import RestaurantCard from './RestaurantCard'

export default function RestaurantsGrid({ restaurants, onManageOperations, onOpenEdit, onDelete }) {
  const { t } = useTranslation()

  if (restaurants.length === 0) {
    return (
      <div className="rounded-2xl border border-[var(--line-soft)] bg-[var(--panel)] p-10 text-center text-[var(--ink-500)] shadow-[0_12px_30px_rgba(22,18,10,0.08)]">
        {t('superAdmin.restaurants.noResults')}
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {restaurants.map((restaurant) => (
        <RestaurantCard
          key={restaurant.id}
          restaurant={restaurant}
          onManageOperations={onManageOperations}
          onOpenEdit={onOpenEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
