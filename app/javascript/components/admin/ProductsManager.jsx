import { useState, useEffect } from 'react'
import { api } from '@utils/api'

export default function ProductsManager() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const [prods, cats] = await Promise.all([
      api.get('/api/v1/admin/products'),
      api.get('/api/v1/admin/categories'),
    ])
    setProducts(Array.isArray(prods) ? prods : [])
    setCategories(Array.isArray(cats) ? cats : [])
  }

  function openNew() {
    setForm({ name: '', description: '', price: '', category_id: categories[0]?.id || '', available: true, position: 0 })
    setModal('new')
    setError(null)
  }

  function openEdit(p) {
    setForm({ name: p.name, description: p.description || '', price: p.price, category_id: p.category_id, available: p.available, position: p.position })
    setModal(p)
    setError(null)
  }

  async function save(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      if (modal === 'new') await api.post('/api/v1/admin/products', { product: form })
      else await api.patch(`/api/v1/admin/products/${modal.id}`, { product: form })
      await loadData()
      setModal(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function destroy(id) {
    if (!confirm('Delete this product?')) return
    await api.delete(`/api/v1/admin/products/${id}`)
    await loadData()
  }

  async function toggleAvailability(product) {
    await api.patch(`/api/v1/admin/products/${product.id}`, { product: { available: !product.available } })
    await loadData()
  }

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
        <div>
          <a href="/admin/orders" className="text-sm text-slate-500">← Orders</a>
          <h1 className="mt-1 text-xl font-bold text-slate-900">Products</h1>
        </div>
        <button onClick={openNew} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">+ New Product</button>
      </div>

      <div className="overflow-x-auto p-6">
        <table className="w-full overflow-hidden rounded-xl bg-white shadow">
          <thead className="bg-slate-50">
            <tr>{['Name', 'Category', 'Price', 'Available', 'Actions'].map((h) => <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">{h}</th>)}</tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t border-slate-200">
                <td className="px-4 py-3 text-sm text-slate-700"><span className="font-semibold">{p.name}</span></td>
                <td className="px-4 py-3 text-sm text-slate-700">{categories.find((c) => c.id === p.category_id)?.name || '—'}</td>
                <td className="px-4 py-3 text-sm text-slate-700">${parseFloat(p.price).toFixed(2)}</td>
                <td className="px-4 py-3 text-sm text-slate-700">
                  <button
                    onClick={() => toggleAvailability(p)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${p.available ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-500'}`}
                  >
                    {p.available ? 'Available' : 'Unavailable'}
                  </button>
                </td>
                <td className="px-4 py-3 text-sm text-slate-700">
                  <button onClick={() => openEdit(p)} className="mr-2 rounded-md bg-slate-100 px-3 py-1 text-xs text-slate-700">Edit</button>
                  <button onClick={() => destroy(p.id)} className="rounded-md bg-red-100 px-3 py-1 text-xs text-red-600">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-xl overflow-hidden rounded-2xl bg-white">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <h2 className="text-xl font-semibold text-slate-900">{modal === 'new' ? 'New Product' : 'Edit Product'}</h2>
              <button onClick={() => setModal(null)} className="text-slate-500">✕</button>
            </div>
            <form onSubmit={save} className="flex flex-col gap-3 p-6">
              <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                Name *
                <input autoFocus required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="rounded-md border border-slate-300 px-3 py-2" />
              </label>
              <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                Description
                <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="h-20 resize-y rounded-md border border-slate-300 px-3 py-2" />
              </label>
              <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                Price *
                <input required type="number" step="0.01" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} className="rounded-md border border-slate-300 px-3 py-2" />
              </label>
              <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                Category *
                <select value={form.category_id} onChange={(e) => setForm((f) => ({ ...f, category_id: Number(e.target.value) }))} className="rounded-md border border-slate-300 px-3 py-2">
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                Position
                <input type="number" value={form.position} onChange={(e) => setForm((f) => ({ ...f, position: Number(e.target.value) }))} className="rounded-md border border-slate-300 px-3 py-2" />
              </label>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <input type="checkbox" checked={form.available} onChange={(e) => setForm((f) => ({ ...f, available: e.target.checked }))} />
                Available
              </label>
              {error && <div className="text-sm text-red-600">{error}</div>}
              <div className="mt-1 flex gap-3">
                <button type="submit" disabled={saving} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
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
