import { useTranslation } from 'react-i18next'
import { confirmAction } from '@utils/confirmAction'
import { useRestaurantDirectory } from '../../hooks/useRestaurantDirectory'
import RestaurantsToolbar from './restaurants/RestaurantsToolbar'
import RestaurantsGrid from './restaurants/RestaurantsGrid'
import RestaurantsPagination from './restaurants/RestaurantsPagination'
import RestaurantFormModal from './restaurants/RestaurantFormModal'

export default function RestaurantsManager({ routes = {} }) {
  const { t } = useTranslation()
  const {
    pageItems,
    modal,
    form,
    saving,
    error,
    query,
    pageCount,
    safePage,
    startIndex,
    filteredCount,
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
  } = useRestaurantDirectory(routes)

  async function handleDelete(restaurantId) {
    const approved = await confirmAction(t('superAdmin.restaurants.deleteConfirm'))
    if (!approved) return

    try {
      await destroy(restaurantId)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="min-h-screen">
      <RestaurantsToolbar
        query={query}
        stats={stats}
        onQueryChange={setQuery}
        onOpenNew={openNew}
      />

      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">
        <div className="mb-4 flex items-center justify-between text-sm text-[var(--ink-700)]">
          <span>
            {t('superAdmin.restaurants.showing', {
              from: pageItems.length === 0 ? 0 : startIndex + 1,
              to: startIndex + pageItems.length,
              total: filteredCount,
            })}
          </span>
          <span>{t('superAdmin.restaurants.page', { current: safePage, total: pageCount })}</span>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-900/50 bg-red-950/35 px-3 py-2 text-sm text-red-300">
            {error}
          </div>
        )}

        <RestaurantsGrid
          restaurants={pageItems}
          routes={routes}
          onManageOperations={manageOperations}
          onOpenEdit={openEdit}
          onDelete={handleDelete}
        />

        <RestaurantsPagination
          safePage={safePage}
          pageCount={pageCount}
          onChangePage={setPage}
        />
      </div>

      <RestaurantFormModal
        modal={modal}
        form={form}
        saving={saving}
        error={error}
        onClose={closeModal}
        onSave={save}
        onChange={(key, value) => setForm((prev) => ({ ...prev, [key]: value }))}
      />
    </div>
  )
}
