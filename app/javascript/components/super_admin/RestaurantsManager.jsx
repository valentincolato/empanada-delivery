import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { api } from '@utils/api'

const PAGE_SIZE = 8

export default function RestaurantsManager() {
  const { t } = useTranslation()
  const [restaurants, setRestaurants] = useState([])
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => { loadRestaurants() }, [])

  async function loadRestaurants() {
    const data = await api.get('/api/v1/super_admin/restaurants')
    const rows = Array.isArray(data) ? data : []
    rows.sort((a, b) => Number(b.active) - Number(a.active) || a.name.localeCompare(b.name))
    setRestaurants(rows)
  }

  function openNew() {
    setForm({ name: '', slug: '', address: '', phone: '', description: '', currency: 'ARS', admin_email: '', admin_password: '', admin_name: '' })
    setModal('new')
    setError(null)
  }

  function openEdit(r) {
    setForm({ name: r.name, slug: r.slug, address: r.address || '', phone: r.phone || '', description: r.description || '', currency: r.currency, active: r.active })
    setModal(r)
    setError(null)
  }

  async function save(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      if (modal === 'new') {
        await api.post('/api/v1/super_admin/restaurants', {
          restaurant: { name: form.name, slug: form.slug, address: form.address, phone: form.phone, description: form.description, currency: form.currency },
          admin_email: form.admin_email,
          admin_password: form.admin_password,
          admin_name: form.admin_name,
        })
      } else {
        await api.patch(`/api/v1/super_admin/restaurants/${modal.id}`, { restaurant: form })
      }
      await loadRestaurants()
      setModal(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function destroy(id) {
    if (!confirm(t('superAdmin.restaurants.deleteConfirm'))) return
    await api.delete(`/api/v1/super_admin/restaurants/${id}`)
    await loadRestaurants()
  }

  async function manageOperations(restaurantId) {
    try {
      const result = await api.post(`/api/v1/super_admin/restaurants/${restaurantId}/switch_context`, {})
      window.location.href = result?.redirect_to || '/admin/orders'
    } catch (err) {
      setError(err.message)
    }
  }

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return restaurants
    return restaurants.filter((r) =>
      [r.name, r.slug, r.address, r.phone, r.currency]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(term))
    )
  }, [restaurants, query])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, pageCount)
  const startIndex = (safePage - 1) * PAGE_SIZE
  const pageItems = filtered.slice(startIndex, startIndex + PAGE_SIZE)

  useEffect(() => {
    setPage(1)
  }, [query])

  useEffect(() => {
    if (page > pageCount) setPage(pageCount)
  }, [page, pageCount])

  return (
    <div className="min-h-screen">
      <div className="border-b border-[var(--line-soft)] bg-[var(--panel)] px-4 py-4 sm:px-6">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--gold-700)]">{t('superAdmin.restaurants.subtitle')}</p>
            <h1 className="font-display text-5xl font-semibold text-[var(--ink-900)]">{t('superAdmin.restaurants.title')}</h1>
            <p className="mt-1 text-sm text-[var(--ink-700)]">{t('superAdmin.restaurants.description')}</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={openNew} className="elegant-button-primary !rounded-lg !px-4 !py-2 !text-sm">{t('superAdmin.restaurants.newRestaurant')}</button>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">
        <div className="mb-5 grid gap-3 rounded-2xl border border-[var(--line-soft)] bg-[var(--panel)] p-4 shadow-[0_12px_30px_rgba(22,18,10,0.08)] md:grid-cols-[1fr_auto]">
          <label className="text-sm">
            <span className="mb-1 block font-medium text-[var(--ink-700)]">{t('superAdmin.restaurants.search')}</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('superAdmin.restaurants.searchPlaceholder')}
              className="w-full rounded-lg border border-[var(--line-soft)] bg-[var(--panel-strong)] px-3 py-2 text-sm text-[var(--ink-700)] outline-none ring-[rgba(157,122,66,0.2)] transition focus:ring"
            />
          </label>
          <div className="grid grid-cols-3 gap-2 md:min-w-72">
            <StatCard label={t('superAdmin.restaurants.stats.total')} value={restaurants.length} />
            <StatCard label={t('superAdmin.restaurants.stats.active')} value={restaurants.filter((r) => r.active).length} />
            <StatCard label={t('superAdmin.restaurants.stats.inactive')} value={restaurants.filter((r) => !r.active).length} />
          </div>
        </div>

        <div className="mb-4 flex items-center justify-between text-sm text-[var(--ink-700)]">
          <span>
            {t('superAdmin.restaurants.showing', { from: pageItems.length === 0 ? 0 : startIndex + 1, to: startIndex + pageItems.length, total: filtered.length })}
          </span>
          <span>{t('superAdmin.restaurants.page', { current: safePage, total: pageCount })}</span>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-900/50 bg-red-950/35 px-3 py-2 text-sm text-red-300">
            {error}
          </div>
        )}

        {pageItems.length === 0 ? (
          <div className="rounded-2xl border border-[var(--line-soft)] bg-[var(--panel)] p-10 text-center text-[var(--ink-500)] shadow-[0_12px_30px_rgba(22,18,10,0.08)]">
            {t('superAdmin.restaurants.noResults')}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {pageItems.map((r) => (
              <article key={r.id} className="elegant-card bg-[var(--panel)] p-4 transition hover:-translate-y-0.5">
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-display text-3xl font-semibold text-[var(--ink-900)]">{r.name}</h3>
                    <p className="mt-1 inline-flex rounded bg-[var(--panel-strong)] px-2 py-0.5 font-mono text-xs text-[var(--ink-700)]">{r.slug}</p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${r.active ? 'border border-emerald-800/40 bg-emerald-900/30 text-emerald-300' : 'border border-amber-800/40 bg-amber-900/30 text-amber-300'}`}>
                    {r.active ? t('superAdmin.restaurants.active') : t('superAdmin.restaurants.inactive')}
                  </span>
                </div>

                <div className="space-y-1 text-sm text-[var(--ink-700)]">
                  <p><span className="font-medium text-[var(--ink-900)]">{t('superAdmin.restaurants.currency')}:</span> {r.currency}</p>
                  <p><span className="font-medium text-[var(--ink-900)]">{t('superAdmin.restaurants.phone')}:</span> {r.phone || t('superAdmin.restaurants.notSet')}</p>
                  <p><span className="font-medium text-[var(--ink-900)]">{t('superAdmin.restaurants.address')}:</span> {r.address || t('superAdmin.restaurants.notSet')}</p>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button data-testid={`manage-operations-${r.id}`} onClick={() => manageOperations(r.id)} className="elegant-button-primary !rounded-md !px-2.5 !py-1.5 !text-xs">
                    {t('superAdmin.restaurants.manageOperations')}
                  </button>
                  <a href={`/r/${r.slug}`} target="_blank" rel="noreferrer" className="elegant-button-secondary !rounded-md !px-2.5 !py-1.5 !text-xs">{t('superAdmin.restaurants.viewMenu')}</a>
                  <button onClick={() => openEdit(r)} className="rounded-md bg-[var(--panel-strong)] px-2.5 py-1.5 text-xs font-semibold text-[var(--ink-700)]">{t('common.edit')}</button>
                  <button onClick={() => destroy(r.id)} className="rounded-md border border-red-900/50 bg-red-950/35 px-2.5 py-1.5 text-xs font-semibold text-red-300">{t('common.delete')}</button>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            disabled={safePage === 1}
            onClick={() => setPage(1)}
            className="rounded-md border border-[var(--line-soft)] bg-[var(--panel-strong)] px-3 py-1.5 text-sm text-[var(--ink-700)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t('superAdmin.restaurants.pagination.first')}
          </button>
          <button
            type="button"
            disabled={safePage === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-md border border-[var(--line-soft)] bg-[var(--panel-strong)] px-3 py-1.5 text-sm text-[var(--ink-700)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t('superAdmin.restaurants.pagination.prev')}
          </button>

          {Array.from({ length: pageCount }, (_, i) => i + 1)
            .filter((n) => Math.abs(n - safePage) <= 2 || n === 1 || n === pageCount)
            .map((n, idx, arr) => (
              <span key={n} className="inline-flex items-center">
                {idx > 0 && arr[idx - 1] !== n - 1 && <span className="px-1 text-[var(--ink-500)]">...</span>}
                <button
                  type="button"
                  onClick={() => setPage(n)}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium ${safePage === n ? 'bg-[var(--gold-600)] text-white' : 'border border-[var(--line-soft)] bg-[var(--panel-strong)] text-[var(--ink-700)]'}`}
                >
                  {n}
                </button>
              </span>
            ))}

          <button
            type="button"
            disabled={safePage === pageCount}
            onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
            className="rounded-md border border-[var(--line-soft)] bg-[var(--panel-strong)] px-3 py-1.5 text-sm text-[var(--ink-700)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t('superAdmin.restaurants.pagination.next')}
          </button>
          <button
            type="button"
            disabled={safePage === pageCount}
            onClick={() => setPage(pageCount)}
            className="rounded-md border border-[var(--line-soft)] bg-[var(--panel-strong)] px-3 py-1.5 text-sm text-[var(--ink-700)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t('superAdmin.restaurants.pagination.last')}
          </button>
        </div>
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[1px]">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-[var(--line-soft)] bg-[var(--panel)]">
            <div className="flex items-center justify-between border-b border-[var(--line-soft)] px-6 py-5">
              <h2 className="font-display text-4xl font-semibold text-[var(--ink-900)]">{modal === 'new' ? t('superAdmin.restaurants.modal.new') : t('superAdmin.restaurants.modal.edit', { name: modal.name })}</h2>
              <button onClick={() => setModal(null)} className="rounded-full border border-[var(--line-soft)] px-2.5 py-1 text-[var(--ink-500)]">x</button>
            </div>
            <form onSubmit={save} className="flex flex-col gap-3 p-6">
              {[
                ['name', t('superAdmin.restaurants.modal.fields.name'), true],
                ['slug', t('superAdmin.restaurants.modal.fields.slug')],
                ['address', t('superAdmin.restaurants.modal.fields.address')],
                ['phone', t('superAdmin.restaurants.modal.fields.phone')],
                ['description', t('superAdmin.restaurants.modal.fields.description')],
              ].map(([key, label, req]) => (
                <label key={key} className="flex flex-col gap-1 text-sm font-medium text-[var(--ink-700)]">
                  {label}
                  <input required={req} value={form[key] || ''} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} className="rounded-md border border-[var(--line-soft)] bg-[var(--panel-strong)] px-3 py-2" />
                </label>
              ))}

              <label className="flex flex-col gap-1 text-sm font-medium text-[var(--ink-700)]">
                {t('superAdmin.restaurants.modal.fields.currency')}
                <select value={form.currency} onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))} className="rounded-md border border-[var(--line-soft)] bg-[var(--panel-strong)] px-3 py-2">
                  {['ARS', 'USD', 'EUR'].map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </label>

              {modal === 'new' && (
                <>
                  <hr className="my-2 border-[var(--line-soft)]" />
                  <p className="font-semibold text-[var(--ink-700)]">{t('superAdmin.restaurants.modal.adminUser')}</p>
                  {[
                    ['admin_email', t('superAdmin.restaurants.modal.fields.adminEmail'), true, 'email'],
                    ['admin_password', t('superAdmin.restaurants.modal.fields.adminPassword'), true, 'password'],
                    ['admin_name', t('superAdmin.restaurants.modal.fields.adminName'), false, 'text'],
                  ].map(([key, label, req, type]) => (
                    <label key={key} className="flex flex-col gap-1 text-sm font-medium text-[var(--ink-700)]">
                      {label}
                      <input required={req} type={type} value={form[key] || ''} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} className="rounded-md border border-[var(--line-soft)] bg-[var(--panel-strong)] px-3 py-2" />
                    </label>
                  ))}
                </>
              )}

              {error && <div className="text-sm text-red-300">{error}</div>}
              <div className="mt-1 flex gap-3">
                <button type="submit" disabled={saving} className="elegant-button-primary !rounded-lg !px-4 !py-2 !text-sm">
                  {saving ? t('common.saving') : t('common.save')}
                </button>
                <button type="button" onClick={() => setModal(null)} className="elegant-button-secondary !rounded-lg !px-4 !py-2 !text-sm">{t('common.cancel')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-lg border border-[var(--line-soft)] bg-[var(--panel-strong)] px-3 py-2 text-center">
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--ink-500)]">{label}</p>
      <p className="text-lg font-bold text-[var(--ink-900)]">{value}</p>
    </div>
  )
}
