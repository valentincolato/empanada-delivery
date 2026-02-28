import { useState, useEffect } from 'react'
import { api } from '@utils/api'

export default function CategoriesManager() {
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

  function openNew() { setForm({ name: '', position: 0, active: true }); setModal('new'); setError(null) }
  function openEdit(c) { setForm({ name: c.name, position: c.position, active: c.active }); setModal(c); setError(null) }

  async function save(e) {
    e.preventDefault(); setSaving(true); setError(null)
    try {
      if (modal === 'new') await api.post('/api/v1/admin/categories', { category: form })
      else await api.patch(`/api/v1/admin/categories/${modal.id}`, { category: form })
      await loadCategories(); setModal(null)
    } catch (err) { setError(err.message) } finally { setSaving(false) }
  }

  async function destroy(id) {
    if (!confirm('Delete this category? All products in it will also be deleted.')) return
    await api.delete(`/api/v1/admin/categories/${id}`)
    await loadCategories()
  }

  return (
    <div style={s.page}>
      <div style={s.topbar}>
        <div>
          <a href="/admin/orders" style={s.back}>← Orders</a>
          <h1 style={s.title}>Categories</h1>
        </div>
        <button onClick={openNew} style={s.primaryBtn}>+ New Category</button>
      </div>
      <div style={s.content}>
        <table style={s.table}>
          <thead><tr style={s.thead}>{['Name', 'Position', 'Active', 'Actions'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
          <tbody>
            {categories.map(c => (
              <tr key={c.id} style={s.tr}>
                <td style={s.td}><strong>{c.name}</strong></td>
                <td style={s.td}>{c.position}</td>
                <td style={s.td}>{c.active ? '✅ Active' : '⏸ Inactive'}</td>
                <td style={s.td}>
                  <button onClick={() => openEdit(c)} style={s.editBtn}>Edit</button>
                  <button onClick={() => destroy(c.id)} style={s.deleteBtn}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {modal && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <div style={s.modalHeader}>
              <h2 style={{ margin: 0 }}>{modal === 'new' ? 'New Category' : 'Edit Category'}</h2>
              <button onClick={() => setModal(null)} style={s.closeBtn}>✕</button>
            </div>
            <form onSubmit={save} style={s.modalBody}>
              <label style={s.label}>Name *<input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={s.input} /></label>
              <label style={s.label}>Position<input type="number" value={form.position} onChange={e => setForm(f => ({ ...f, position: Number(e.target.value) }))} style={s.input} /></label>
              <label style={{ ...s.label, flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
                <input type="checkbox" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} />Active
              </label>
              {error && <div style={s.errorMsg}>{error}</div>}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="submit" disabled={saving} style={s.primaryBtn}>{saving ? 'Saving…' : 'Save'}</button>
                <button type="button" onClick={() => setModal(null)} style={s.secondaryBtn}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

const s = {
  page: { fontFamily: 'Inter, sans-serif', minHeight: '100vh', background: '#f1f5f9' },
  topbar: { background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  back: { color: '#6b7280', textDecoration: 'none', fontSize: '0.85rem' },
  title: { margin: '0.25rem 0 0', fontSize: '1.25rem', fontWeight: 700, color: '#111' },
  content: { padding: '1.5rem', overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.07)' },
  thead: { background: '#f9fafb' }, th: { padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.8rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' },
  tr: { borderTop: '1px solid #e5e7eb' }, td: { padding: '0.85rem 1rem', fontSize: '0.9rem', color: '#374151' },
  primaryBtn: { background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.6rem 1.1rem', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' },
  secondaryBtn: { background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '8px', padding: '0.6rem 1rem', fontWeight: 500, cursor: 'pointer', fontSize: '0.9rem' },
  editBtn: { background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '6px', padding: '0.3rem 0.7rem', cursor: 'pointer', marginRight: '0.4rem', fontSize: '0.85rem' },
  deleteBtn: { background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', padding: '0.3rem 0.7rem', cursor: 'pointer', fontSize: '0.85rem' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', justifyContent: 'center', alignItems: 'center' },
  modal: { background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '420px', overflow: 'hidden' },
  modalHeader: { padding: '1.25rem 1.5rem', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  modalBody: { padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' },
  label: { display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.9rem', fontWeight: 500, color: '#374151' },
  input: { border: '1px solid #d1d5db', borderRadius: '6px', padding: '0.5rem 0.75rem', fontSize: '0.95rem', outline: 'none' },
  closeBtn: { background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#6b7280' },
  errorMsg: { color: '#dc2626', fontSize: '0.85rem' },
}
