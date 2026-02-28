import { useTranslation } from 'react-i18next'
import Card from '../../ui/Card'
import StatusBadge from '../../ui/StatusBadge'
import { fillPath } from '@utils/pathBuilder'

export default function RestaurantCard({ restaurant, public_restaurant_template, onManageOperations, onOpenEdit, onDelete }) {
  const { t } = useTranslation()
  const publicMenuPath = fillPath(public_restaurant_template, { slug: restaurant.slug })

  return (
    <Card as="article" className="bg-[var(--panel)] p-4 transition hover:-translate-y-0.5">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <h3 className="font-display text-3xl font-semibold text-[var(--ink-900)]">{restaurant.name}</h3>
          <p className="mt-1 inline-flex rounded bg-[var(--panel-strong)] px-2 py-0.5 font-mono text-xs text-[var(--ink-700)]">{restaurant.slug}</p>
        </div>
        <StatusBadge variant={restaurant.active ? 'success' : 'warning'}>
          {restaurant.active ? t('superAdmin.restaurants.active') : t('superAdmin.restaurants.inactive')}
        </StatusBadge>
      </div>

      <div className="space-y-1 text-sm text-[var(--ink-700)]">
        <p><span className="font-medium text-[var(--ink-900)]">{t('superAdmin.restaurants.currency')}:</span> {restaurant.currency}</p>
        <p><span className="font-medium text-[var(--ink-900)]">{t('superAdmin.restaurants.phone')}:</span> {restaurant.phone || t('superAdmin.restaurants.notSet')}</p>
        <p><span className="font-medium text-[var(--ink-900)]">{t('superAdmin.restaurants.address')}:</span> {restaurant.address || t('superAdmin.restaurants.notSet')}</p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button data-testid={`manage-operations-${restaurant.id}`} onClick={() => onManageOperations(restaurant.id)} className="elegant-button-primary !rounded-md !px-2.5 !py-1.5 !text-xs">
          {t('superAdmin.restaurants.manageOperations')}
        </button>
        <a href={publicMenuPath} target="_blank" rel="noreferrer" className="elegant-button-secondary !rounded-md !px-2.5 !py-1.5 !text-xs">{t('superAdmin.restaurants.viewMenu')}</a>
        <button onClick={() => onOpenEdit(restaurant)} className="rounded-md bg-[var(--panel-strong)] px-2.5 py-1.5 text-xs font-semibold text-[var(--ink-700)]">{t('common.edit')}</button>
        <button onClick={() => onDelete(restaurant.id)} className="rounded-md border border-red-300 bg-red-100 px-2.5 py-1.5 text-xs font-semibold text-red-900">{t('common.delete')}</button>
      </div>
    </Card>
  )
}
