import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { api } from '@utils/api'

export default function CategoriesManager() {
  const { t } = useTranslation()
  const [categories, setCategories] = useState([])
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({ name: '', position: 0, active: true })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => { loadCategories() }, [])

  async function loadCategories() {
    const data = await api.get('/api/v1/admin/categories')
    setCategories(Array.isArray(data) ? data : [])
  }

  function openNew() {
    setForm({ name: '', position: 0, active: true })
    setModal('new')
    setError(null)
  }

  function openEdit(c) {
    setForm({ name: c.name, position: c.position, active: c.active })
    setModal(c)
    setError(null)
  }

  async function save(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      if (modal === 'new') await api.post('/api/v1/admin/categories', { category: form })
      else await api.patch(`/api/v1/admin/categories/${modal.id}`, { category: form })
      await loadCategories()
      setModal(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function destroy(id) {
    if (!confirm(t('admin.categories.deleteConfirm'))) return
    await api.delete(`/api/v1/admin/categories/${id}`)
    await loadCategories()
  }

  return (
    <div className="min-h-screen">
      <div className="flex items-center justify-between border-b border-[var(--line-soft)] bg-[var(--panel)] px-6 py-4">
        <div>
          <a href="/admin/orders" className="text-sm text-[var(--ink-500)]">{t('admin.categories.backToOrders')}</a>
          <h1 className="mt-1 font-display text-4xl font-semibold text-[var(--ink-900)]">{t('admin.categories.title')}</h1>
        </div>
        <button onClick={openNew} className="elegant-button-primary !rounded-lg !px-4 !py-2 !text-sm">{t('admin.categories.newCategory')}</button>
      </div>

      <div className="overflow-x-auto p-6">
        <table className="w-full overflow-hidden rounded-2xl border border-[var(--line-soft)] bg-white/80 shadow-[0_12px_30px_rgba(22,18,10,0.08)]">
          <thead className="bg-[#faf4e9]">
            <tr>
              {[t('admin.categories.headers.name'), t('admin.categories.headers.position'), t('admin.categories.headers.active'), t('admin.categories.headers.actions')].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-[var(--ink-500)]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id} className="border-t border-[var(--line-soft)]">
                <td className="px-4 py-3 text-sm text-[var(--ink-700)]"><strong>{c.name}</strong></td>
                <td className="px-4 py-3 text-sm text-[var(--ink-700)]">{c.position}</td>
                <td className="px-4 py-3 text-sm text-[var(--ink-700)]">{c.active ? t('admin.categories.activeStatus') : t('admin.categories.inactiveStatus')}</td>
                <td className="px-4 py-3 text-sm text-[var(--ink-700)]">
                  <button onClick={() => openEdit(c)} className="mr-2 rounded-md bg-[#f1e8db] px-3 py-1 text-xs text-[var(--ink-700)]">{t('common.edit')}</button>
                  <button onClick={() => destroy(c.id)} className="rounded-md bg-red-100 px-3 py-1 text-xs text-red-600">{t('common.delete')}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[1px]">
          <div className="w-full max-w-md overflow-hidden rounded-3xl border border-[var(--line-soft)] bg-[var(--panel)]">
            <div className="flex items-center justify-between border-b border-[var(--line-soft)] px-6 py-5">
              <h2 className="font-display text-4xl font-semibold text-[var(--ink-900)]">{modal === 'new' ? t('admin.categories.newCategoryTitle') : t('admin.categories.editCategoryTitle')}</h2>
              <button onClick={() => setModal(null)} className="rounded-full border border-[var(--line-soft)] px-2.5 py-1 text-[var(--ink-500)]">x</button>
            </div>
            <form onSubmit={save} className="flex flex-col gap-3 p-6">
              <label className="flex flex-col gap-1 text-sm font-medium text-[var(--ink-700)]">
                {t('admin.categories.form.name')}
                <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="rounded-md border border-[var(--line-soft)] bg-white px-3 py-2" />
              </label>
              <label className="flex flex-col gap-1 text-sm font-medium text-[var(--ink-700)]">
                {t('admin.categories.form.position')}
                <input type="number" value={form.position} onChange={(e) => setForm((f) => ({ ...f, position: Number(e.target.value) }))} className="rounded-md border border-[var(--line-soft)] bg-white px-3 py-2" />
              </label>
              <label className="flex items-center gap-2 text-sm font-medium text-[var(--ink-700)]">
                <input type="checkbox" checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} />
                {t('admin.categories.form.active')}
              </label>
              {error && <div className="text-sm text-red-700">{error}</div>}
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
