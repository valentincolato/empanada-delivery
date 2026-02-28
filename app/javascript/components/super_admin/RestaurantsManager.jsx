import { useEffect, useMemo, useState } from 'react'
import { api } from '@utils/api'

const PAGE_SIZE = 8

export default function RestaurantsManager() {
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
    if (!confirm('Delete this restaurant? This cannot be undone.')) return
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
    <div className="min-h-screen bg-slate-100">
      <div className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Super Admin</p>
            <h1 className="text-2xl font-bold text-slate-900">Restaurants Grid</h1>
            <p className="mt-1 text-sm text-slate-600">Card-based view with search and pagination.</p>
          </div>
          <button onClick={openNew} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700">+ New Restaurant</button>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">
        <div className="mb-5 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_auto]">
          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-700">Search restaurants</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Name, slug, phone, currency..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none ring-indigo-200 transition focus:ring"
            />
          </label>
          <div className="grid grid-cols-3 gap-2 md:min-w-72">
            <StatCard label="Total" value={restaurants.length} />
            <StatCard label="Active" value={restaurants.filter((r) => r.active).length} />
            <StatCard label="Inactive" value={restaurants.filter((r) => !r.active).length} />
          </div>
        </div>

        <div className="mb-4 flex items-center justify-between text-sm text-slate-600">
          <span>
            Showing {pageItems.length === 0 ? 0 : startIndex + 1}-{startIndex + pageItems.length} of {filtered.length}
          </span>
          <span>Page {safePage} of {pageCount}</span>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        {pageItems.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm">
            No restaurants matched your search.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {pageItems.map((r) => (
              <article key={r.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow">
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{r.name}</h3>
                    <p className="mt-1 inline-flex rounded bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-600">{r.slug}</p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${r.active ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {r.active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="space-y-1 text-sm text-slate-600">
                  <p><span className="font-medium text-slate-700">Currency:</span> {r.currency}</p>
                  <p><span className="font-medium text-slate-700">Phone:</span> {r.phone || 'Not set'}</p>
                  <p><span className="font-medium text-slate-700">Address:</span> {r.address || 'Not set'}</p>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button onClick={() => manageOperations(r.id)} className="rounded-md bg-indigo-600 px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-700">
                    Manage operations
                  </button>
                  <a href={`/r/${r.slug}`} target="_blank" rel="noreferrer" className="rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50">View menu</a>
                  <button onClick={() => openEdit(r)} className="rounded-md bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-200">Edit</button>
                  <button onClick={() => destroy(r.id)} className="rounded-md bg-red-100 px-2.5 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-200">Delete</button>
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
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            « First
          </button>
          <button
            type="button"
            disabled={safePage === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            ‹ Prev
          </button>

          {Array.from({ length: pageCount }, (_, i) => i + 1)
            .filter((n) => Math.abs(n - safePage) <= 2 || n === 1 || n === pageCount)
            .map((n, idx, arr) => (
              <span key={n} className="inline-flex items-center">
                {idx > 0 && arr[idx - 1] !== n - 1 && <span className="px-1 text-slate-400">…</span>}
                <button
                  type="button"
                  onClick={() => setPage(n)}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium ${safePage === n ? 'bg-indigo-600 text-white' : 'border border-slate-300 bg-white text-slate-700'}`}
                >
                  {n}
                </button>
              </span>
            ))}

          <button
            type="button"
            disabled={safePage === pageCount}
            onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next ›
          </button>
          <button
            type="button"
            disabled={safePage === pageCount}
            onClick={() => setPage(pageCount)}
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Last »
          </button>
        </div>
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <h2 className="text-xl font-semibold text-slate-900">{modal === 'new' ? 'New Restaurant' : `Edit: ${modal.name}`}</h2>
              <button onClick={() => setModal(null)} className="text-slate-500">✕</button>
            </div>
            <form onSubmit={save} className="flex flex-col gap-3 p-6">
              {[['name', 'Name *', true], ['slug', 'Slug'], ['address', 'Address'], ['phone', 'Phone'], ['description', 'Description']].map(([key, label, req]) => (
                <label key={key} className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                  {label}
                  <input required={req} value={form[key] || ''} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} className="rounded-md border border-slate-300 px-3 py-2" />
                </label>
              ))}

              <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                Currency
                <select value={form.currency} onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))} className="rounded-md border border-slate-300 px-3 py-2">
                  {['ARS', 'USD', 'EUR'].map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </label>

              {modal === 'new' && (
                <>
                  <hr className="my-2 border-slate-200" />
                  <p className="font-semibold text-slate-700">Admin User</p>
                  {[['admin_email', 'Admin Email *', true, 'email'], ['admin_password', 'Admin Password *', true, 'password'], ['admin_name', 'Admin Name']].map(([key, label, req, type = 'text']) => (
                    <label key={key} className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                      {label}
                      <input required={req} type={type} value={form[key] || ''} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} className="rounded-md border border-slate-300 px-3 py-2" />
                    </label>
                  ))}
                </>
              )}

              {error && <div className="text-sm text-red-600">{error}</div>}
              <div className="mt-1 flex gap-3">
                <button type="submit" disabled={saving} className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700">
                  {saving ? 'Saving…' : 'Save'}
                </button>
                <button type="button" onClick={() => setModal(null)} className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">Cancel</button>
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
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-center">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="text-lg font-bold text-slate-900">{value}</p>
    </div>
  )
}
