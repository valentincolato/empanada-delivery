import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { api } from '@utils/api'
import { confirmAction } from '@utils/confirmAction'
import ProductFormModal from './products/ProductFormModal'
import { fillPath } from '@utils/pathBuilder'

export default function ProductsManager({ routes = {} }) {
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
      api.get(routes.api_admin_products),
      api.get(routes.api_admin_categories),
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
        if (modal === 'new') await api.postForm(routes.api_admin_products, fd)
        else await api.patchForm(fillPath(routes.api_admin_product_template, { id: modal.id }), fd)
      } else {
        if (modal === 'new') await api.post(routes.api_admin_products, { product: form })
        else await api.patch(fillPath(routes.api_admin_product_template, { id: modal.id }), { product: form })
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
    const approved = await confirmAction(t('admin.products.deleteConfirm'))
    if (!approved) return
    await api.delete(fillPath(routes.api_admin_product_template, { id }))
    await loadData()
  }

  async function toggleAvailability(product) {
    await api.patch(fillPath(routes.api_admin_product_template, { id: product.id }), { product: { available: !product.available } })
    await loadData()
  }

  return (
    <div className="min-h-screen">
      <div className="flex items-center justify-between border-b border-[var(--line-soft)] bg-[var(--panel)] px-6 py-4">
        <div>
          <a href={routes.admin_orders} className="text-sm text-[var(--ink-500)]">{t('admin.products.backToOrders')}</a>
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

      <ProductFormModal
        modal={modal}
        form={form}
        categories={categories}
        imageFile={imageFile}
        imagePreview={imagePreview}
        fileInputRef={fileInputRef}
        error={error}
        saving={saving}
        onClose={() => setModal(null)}
        onSubmit={save}
        onImageChange={handleImageChange}
        onChange={(key, value) => setForm((prev) => ({ ...prev, [key]: value }))}
      />
    </div>
  )
}
