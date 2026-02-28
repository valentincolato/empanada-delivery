import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { api } from '@utils/api'

export default function ProductsManager() {
  const { t } = useTranslation()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({})
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)

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
    setImageFile(null)
    setImagePreview(null)
    setModal('new')
    setError(null)
  }

  function openEdit(p) {
    setForm({ name: p.name, description: p.description || '', price: p.price, category_id: p.category_id, available: p.available, position: p.position })
    setImageFile(null)
    setImagePreview(p.image_url || null)
    setModal(p)
    setError(null)
  }

  function handleImageChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  function buildFormData() {
    const fd = new FormData()
    Object.entries(form).forEach(([k, v]) => fd.append(`product[${k}]`, v))
    fd.append('product[image]', imageFile)
    return fd
  }

  async function save(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      if (imageFile) {
        const fd = buildFormData()
        if (modal === 'new') await api.postForm('/api/v1/admin/products', fd)
        else await api.patchForm(`/api/v1/admin/products/${modal.id}`, fd)
      } else {
        if (modal === 'new') await api.post('/api/v1/admin/products', { product: form })
        else await api.patch(`/api/v1/admin/products/${modal.id}`, { product: form })
      }
      await loadData()
      setModal(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function destroy(id) {
    if (!confirm(t('admin.products.deleteConfirm'))) return
    await api.delete(`/api/v1/admin/products/${id}`)
    await loadData()
  }

  async function toggleAvailability(product) {
    await api.patch(`/api/v1/admin/products/${product.id}`, { product: { available: !product.available } })
    await loadData()
  }

  return (
    <div className="min-h-screen">
      <div className="flex items-center justify-between border-b border-[var(--line-soft)] bg-[var(--panel)] px-6 py-4">
        <div>
          <a href="/admin/orders" className="text-sm text-[var(--ink-500)]">{t('admin.products.backToOrders')}</a>
          <h1 data-testid="products-title" className="mt-1 font-display text-4xl font-semibold text-[var(--ink-900)]">{t('admin.products.title')}</h1>
        </div>
        <button data-testid="new-product-button" onClick={openNew} className="elegant-button-primary !rounded-lg !px-4 !py-2 !text-sm">{t('admin.products.newProduct')}</button>
      </div>

      <div className="overflow-x-auto p-6">
        <table className="w-full overflow-hidden rounded-2xl border border-[var(--line-soft)] bg-[var(--panel)] shadow-[0_12px_30px_rgba(22,18,10,0.08)]">
          <thead className="bg-[var(--panel-strong)]">
            <tr>
              {[t('admin.products.headers.name'), t('admin.products.headers.category'), t('admin.products.headers.price'), t('admin.products.headers.available'), t('admin.products.headers.actions')].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-[var(--ink-500)]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} data-testid={`product-row-${p.id}`} className="border-t border-[var(--line-soft)]">
                <td className="px-4 py-3 text-sm text-[var(--ink-700)]">
                  <div className="flex items-center gap-2">
                    {p.image_url
                      ? <img src={p.image_url} alt={p.name} className="h-9 w-9 rounded-lg object-cover flex-shrink-0" />
                      : <div className="h-9 w-9 rounded-lg bg-[var(--panel-strong)] flex-shrink-0" />}
                    <span className="font-semibold">{p.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-[var(--ink-700)]">{categories.find((c) => c.id === p.category_id)?.name || '—'}</td>
                <td className="px-4 py-3 text-sm text-[var(--ink-700)]">${parseFloat(p.price).toFixed(2)}</td>
                <td className="px-4 py-3 text-sm text-[var(--ink-700)]">
                  <button
                    data-testid={`toggle-availability-${p.id}`}
                    data-available={String(p.available)}
                    onClick={() => toggleAvailability(p)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${p.available ? 'bg-emerald-900/30 text-emerald-700' : 'bg-[var(--panel-soft)] text-[var(--ink-500)]'}`}
                  >
                    {p.available ? t('admin.products.available') : t('admin.products.unavailable')}
                  </button>
                </td>
                <td className="px-4 py-3 text-sm text-[var(--ink-700)]">
                  <button data-testid={`edit-product-${p.id}`} onClick={() => openEdit(p)} className="mr-2 rounded-md bg-[var(--panel-strong)] px-3 py-1 text-xs text-[var(--ink-700)]">{t('common.edit')}</button>
                  <button onClick={() => destroy(p.id)} className="rounded-md border border-red-900/50 bg-red-950/35 px-3 py-1 text-xs text-red-300">{t('common.delete')}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[1px]">
          <div className="w-full max-w-xl overflow-hidden rounded-3xl border border-[var(--line-soft)] bg-[var(--panel)]">
            <div className="flex items-center justify-between border-b border-[var(--line-soft)] px-6 py-5">
              <h2 data-testid="product-modal-title" data-mode={modal === 'new' ? 'new' : 'edit'} className="font-display text-4xl font-semibold text-[var(--ink-900)]">{modal === 'new' ? t('admin.products.newProductTitle') : t('admin.products.editProductTitle')}</h2>
              <button onClick={() => setModal(null)} className="rounded-full border border-[var(--line-soft)] px-2.5 py-1 text-[var(--ink-500)]">x</button>
            </div>
            <form onSubmit={save} className="flex flex-col gap-3 p-6">
              <label className="flex flex-col gap-1 text-sm font-medium text-[var(--ink-700)]">
                {t('admin.products.form.name')}
                <input data-testid="product-name-input" autoFocus required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="rounded-md border border-[var(--line-soft)] bg-[var(--panel-strong)] px-3 py-2" />
              </label>
              <label className="flex flex-col gap-1 text-sm font-medium text-[var(--ink-700)]">
                {t('admin.products.form.description')}
                <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="h-20 resize-y rounded-md border border-[var(--line-soft)] bg-[var(--panel-strong)] px-3 py-2" />
              </label>
              <label className="flex flex-col gap-1 text-sm font-medium text-[var(--ink-700)]">
                {t('admin.products.form.price')}
                <input data-testid="product-price-input" required type="number" step="0.01" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} className="rounded-md border border-[var(--line-soft)] bg-[var(--panel-strong)] px-3 py-2" />
              </label>
              <label className="flex flex-col gap-1 text-sm font-medium text-[var(--ink-700)]">
                {t('admin.products.form.category')}
                <select value={form.category_id} onChange={(e) => setForm((f) => ({ ...f, category_id: Number(e.target.value) }))} className="rounded-md border border-[var(--line-soft)] bg-[var(--panel-strong)] px-3 py-2">
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-sm font-medium text-[var(--ink-700)]">
                {t('admin.products.form.position')}
                <input type="number" value={form.position} onChange={(e) => setForm((f) => ({ ...f, position: Number(e.target.value) }))} className="rounded-md border border-[var(--line-soft)] bg-[var(--panel-strong)] px-3 py-2" />
              </label>
              <div className="flex flex-col gap-1 text-sm font-medium text-[var(--ink-700)]">
                {t('admin.products.form.image')}
                <div className="flex items-center gap-3">
                  {imagePreview && (
                    <img src={imagePreview} alt="preview" className="h-16 w-16 rounded-lg object-cover flex-shrink-0 border border-[var(--line-soft)]" />
                  )}
                  <label className="cursor-pointer rounded-md border border-[var(--line-soft)] bg-[var(--panel-strong)] px-3 py-2 text-sm text-[var(--ink-500)] hover:bg-[var(--panel-strong)]">
                    {imageFile ? imageFile.name : t('admin.products.form.chooseImage')}
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  </label>
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm font-medium text-[var(--ink-700)]">
                <input type="checkbox" checked={form.available} onChange={(e) => setForm((f) => ({ ...f, available: e.target.checked }))} />
                {t('admin.products.form.available')}
              </label>
              {error && <div className="text-sm text-red-300">{error}</div>}
              <div className="mt-1 flex gap-3">
                <button data-testid="save-product-button" type="submit" disabled={saving} className="elegant-button-primary !rounded-lg !px-4 !py-2 !text-sm">
                  {saving ? t('common.saving') : t('common.save')}
                </button>
                <button data-testid="cancel-product-button" type="button" onClick={() => setModal(null)} className="elegant-button-secondary !rounded-lg !px-4 !py-2 !text-sm">{t('common.cancel')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
