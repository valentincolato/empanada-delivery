import { useState, useEffect } from 'react'
import { api } from '@utils/api'

export default function ProductsManager() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [modal, setModal] = useState(null) // null | 'new' | product
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
      if (modal === 'new') {
        await api.post('/api/v1/admin/products', { product: form })
      } else {
        await api.patch(`/api/v1/admin/products/${modal.id}`, { product: form })
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
    if (!confirm('Delete this product?')) return
    await api.delete(`/api/v1/admin/products/${id}`)
    await loadData()
  }

  async function toggleAvailability(product) {
    await api.patch(`/api/v1/admin/products/${product.id}`, { product: { available: !product.available } })
    await loadData()
  }

  return (
    <div style={s.page}>
      <div style={s.topbar}>
        <div>
          <a href="/admin/orders" style={s.back}>← Orders</a>
          <h1 style={s.title}>Products</h1>
        </div>
        <button onClick={openNew} style={s.primaryBtn}>+ New Product</button>
      </div>

      <div style={s.content}>
        <table style={s.table}>
          <thead>
            <tr style={s.thead}>
              {['Name', 'Category', 'Price', 'Available', 'Actions'].map(h => <th key={h} style={s.th}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} style={s.tr}>
                <td style={s.td}><span style={{ fontWeight: 600 }}>{p.name}</span></td>
                <td style={s.td}>{categories.find(c => c.id === p.category_id)?.name || '—'}</td>
                <td style={s.td}>${parseFloat(p.price).toFixed(2)}</td>
                <td style={s.td}>
                  <button onClick={() => toggleAvailability(p)} style={p.available ? s.greenBadge : s.grayBadge}>
                    {p.available ? 'Available' : 'Unavailable'}
                  </button>
                </td>
                <td style={s.td}>
                  <button onClick={() => openEdit(p)} style={s.editBtn}>Edit</button>
                  <button onClick={() => destroy(p.id)} style={s.deleteBtn}>Delete</button>
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
              <h2 style={{ margin: 0 }}>{modal === 'new' ? 'New Product' : 'Edit Product'}</h2>
              <button onClick={() => setModal(null)} style={s.closeBtn}>✕</button>
            </div>
            <form onSubmit={save} style={s.modalBody}>
              <label style={s.label}>Name *
                <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={s.input} />
              </label>
              <label style={s.label}>Description
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={{ ...s.input, height: '80px' }} />
              </label>
              <label style={s.label}>Price *
                <input required type="number" step="0.01" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} style={s.input} />
              </label>
              <label style={s.label}>Category *
                <select value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: Number(e.target.value) }))} style={s.input}>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </label>
              <label style={s.label}>Position
                <input type="number" value={form.position} onChange={e => setForm(f => ({ ...f, position: Number(e.target.value) }))} style={s.input} />
              </label>
              <label style={{ ...s.label, flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
                <input type="checkbox" checked={form.available} onChange={e => setForm(f => ({ ...f, available: e.target.checked }))} />
                Available
              </label>
              {error && <div style={s.errorMsg}>{error}</div>}
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
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
  thead: { background: '#f9fafb' },
  th: { padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.8rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' },
  tr: { borderTop: '1px solid #e5e7eb' },
  td: { padding: '0.85rem 1rem', fontSize: '0.9rem', color: '#374151' },
  primaryBtn: { background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.6rem 1.1rem', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' },
  secondaryBtn: { background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '8px', padding: '0.6rem 1rem', fontWeight: 500, cursor: 'pointer', fontSize: '0.9rem' },
  editBtn: { background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '6px', padding: '0.3rem 0.7rem', cursor: 'pointer', marginRight: '0.4rem', fontSize: '0.85rem' },
  deleteBtn: { background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', padding: '0.3rem 0.7rem', cursor: 'pointer', fontSize: '0.85rem' },
  greenBadge: { background: '#dcfce7', color: '#166534', border: 'none', borderRadius: '9999px', padding: '0.2rem 0.7rem', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 },
  grayBadge: { background: '#f3f4f6', color: '#6b7280', border: 'none', borderRadius: '9999px', padding: '0.2rem 0.7rem', fontSize: '0.8rem', cursor: 'pointer' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', justifyContent: 'center', alignItems: 'center' },
  modal: { background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '480px', overflow: 'hidden' },
  modalHeader: { padding: '1.25rem 1.5rem', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  modalBody: { padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' },
  label: { display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.9rem', fontWeight: 500, color: '#374151' },
  input: { border: '1px solid #d1d5db', borderRadius: '6px', padding: '0.5rem 0.75rem', fontSize: '0.95rem', outline: 'none', resize: 'vertical' },
  closeBtn: { background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#6b7280' },
  errorMsg: { color: '#dc2626', fontSize: '0.85rem' },
}
