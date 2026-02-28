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
    <div className="min-h-screen bg-slate-100 font-sans">
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
        <div>
          <a href="/admin/orders" className="text-sm text-slate-500">{t('admin.categories.backToOrders')}</a>
          <h1 className="mt-1 text-xl font-bold text-slate-900">{t('admin.categories.title')}</h1>
        </div>
        <button onClick={openNew} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">{t('admin.categories.newCategory')}</button>
      </div>

      <div className="overflow-x-auto p-6">
        <table className="w-full overflow-hidden rounded-xl bg-white shadow">
          <thead className="bg-slate-50">
            <tr>
              {[t('admin.categories.headers.name'), t('admin.categories.headers.position'), t('admin.categories.headers.active'), t('admin.categories.headers.actions')].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id} className="border-t border-slate-200">
                <td className="px-4 py-3 text-sm text-slate-700"><strong>{c.name}</strong></td>
                <td className="px-4 py-3 text-sm text-slate-700">{c.position}</td>
                <td className="px-4 py-3 text-sm text-slate-700">{c.active ? t('admin.categories.activeStatus') : t('admin.categories.inactiveStatus')}</td>
                <td className="px-4 py-3 text-sm text-slate-700">
                  <button onClick={() => openEdit(c)} className="mr-2 rounded-md bg-slate-100 px-3 py-1 text-xs text-slate-700">{t('common.edit')}</button>
                  <button onClick={() => destroy(c.id)} className="rounded-md bg-red-100 px-3 py-1 text-xs text-red-600">{t('common.delete')}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <h2 className="text-xl font-semibold text-slate-900">{modal === 'new' ? t('admin.categories.newCategoryTitle') : t('admin.categories.editCategoryTitle')}</h2>
              <button onClick={() => setModal(null)} className="text-slate-500">✕</button>
            </div>
            <form onSubmit={save} className="flex flex-col gap-3 p-6">
              <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                {t('admin.categories.form.name')}
                <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="rounded-md border border-slate-300 px-3 py-2" />
              </label>
              <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                {t('admin.categories.form.position')}
                <input type="number" value={form.position} onChange={(e) => setForm((f) => ({ ...f, position: Number(e.target.value) }))} className="rounded-md border border-slate-300 px-3 py-2" />
              </label>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <input type="checkbox" checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} />
                {t('admin.categories.form.active')}
              </label>
              {error && <div className="text-sm text-red-600">{error}</div>}
              <div className="mt-1 flex gap-3">
                <button type="submit" disabled={saving} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                  {saving ? t('common.saving') : t('common.save')}
                </button>
                <button type="button" onClick={() => setModal(null)} className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">{t('common.cancel')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
