import { useState, useEffect } from 'react'
import { api } from '@utils/api'

export default function RestaurantsManager() {
  const [restaurants, setRestaurants] = useState([])
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => { loadRestaurants() }, [])

  async function loadRestaurants() {
    const data = await api.get('/api/v1/super_admin/restaurants')
    setRestaurants(Array.isArray(data) ? data : [])
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

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
        <h1 className="text-xl font-bold text-slate-900">Restaurants</h1>
        <button onClick={openNew} className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700">+ New Restaurant</button>
      </div>

      <div className="overflow-x-auto p-6">
        <table className="w-full overflow-hidden rounded-xl bg-white shadow">
          <thead className="bg-slate-50">
            <tr>{['Name', 'Slug', 'Currency', 'Active', 'Actions'].map((h) => <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">{h}</th>)}</tr>
          </thead>
          <tbody>
            {restaurants.map((r) => (
              <tr key={r.id} className="border-t border-slate-200">
                <td className="px-4 py-3 text-sm text-slate-700"><strong>{r.name}</strong></td>
                <td className="px-4 py-3 text-sm text-slate-700"><code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">{r.slug}</code></td>
                <td className="px-4 py-3 text-sm text-slate-700">{r.currency}</td>
                <td className="px-4 py-3 text-sm text-slate-700">{r.active ? '✅' : '⏸'}</td>
                <td className="px-4 py-3 text-sm text-slate-700">
                  <a href={`/r/${r.slug}`} target="_blank" rel="noreferrer" className="mr-2 text-xs text-blue-600">View menu</a>
                  <button onClick={() => openEdit(r)} className="mr-2 rounded-md bg-slate-100 px-3 py-1 text-xs text-slate-700">Edit</button>
                  <button onClick={() => destroy(r.id)} className="rounded-md bg-red-100 px-3 py-1 text-xs text-red-600">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
