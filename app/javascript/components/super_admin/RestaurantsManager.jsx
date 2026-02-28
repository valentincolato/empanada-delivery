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
    setModal('new'); setError(null)
  }

  function openEdit(r) {
    setForm({ name: r.name, slug: r.slug, address: r.address || '', phone: r.phone || '', description: r.description || '', currency: r.currency, active: r.active })
    setModal(r); setError(null)
  }

  async function save(e) {
    e.preventDefault(); setSaving(true); setError(null)
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
      await loadRestaurants(); setModal(null)
    } catch (err) { setError(err.message) } finally { setSaving(false) }
  }

  async function destroy(id) {
    if (!confirm('Delete this restaurant? This cannot be undone.')) return
    await api.delete(`/api/v1/super_admin/restaurants/${id}`)
    await loadRestaurants()
  }

  return (
    <div style={s.page}>
      <div style={s.topbar}>
        <h1 style={s.title}>Restaurants</h1>
        <button onClick={openNew} style={s.primaryBtn}>+ New Restaurant</button>
      </div>
      <div style={s.content}>
        <table style={s.table}>
          <thead><tr style={s.thead}>{['Name', 'Slug', 'Currency', 'Active', 'Actions'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
          <tbody>
            {restaurants.map(r => (
              <tr key={r.id} style={s.tr}>
                <td style={s.td}><strong>{r.name}</strong></td>
                <td style={s.td}><code style={s.code}>{r.slug}</code></td>
                <td style={s.td}>{r.currency}</td>
                <td style={s.td}>{r.active ? '✅' : '⏸'}</td>
                <td style={s.td}>
                  <a href={`/r/${r.slug}`} target="_blank" style={s.viewLink}>View menu</a>
                  <button onClick={() => openEdit(r)} style={s.editBtn}>Edit</button>
                  <button onClick={() => destroy(r.id)} style={s.deleteBtn}>Delete</button>
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
              <h2 style={{ margin: 0 }}>{modal === 'new' ? 'New Restaurant' : `Edit: ${modal.name}`}</h2>
              <button onClick={() => setModal(null)} style={s.closeBtn}>✕</button>
            </div>
            <form onSubmit={save} style={s.modalBody}>
              {[['name','Name *',true],['slug','Slug'],['address','Address'],['phone','Phone'],['description','Description']].map(([key,label,req]) => (
                <label key={key} style={s.label}>{label}
                  <input required={req} value={form[key] || ''} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} style={s.input} />
                </label>
              ))}
              <label style={s.label}>Currency
                <select value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))} style={s.input}>
                  {['ARS','USD','EUR'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </label>
              {modal === 'new' && (
                <>
                  <hr />
                  <p style={{ margin: 0, fontWeight: 600, color: '#374151' }}>Admin User</p>
                  {[['admin_email','Admin Email *',true,'email'],['admin_password','Admin Password *',true,'password'],['admin_name','Admin Name']].map(([key,label,req,type='text']) => (
                    <label key={key} style={s.label}>{label}
                      <input required={req} type={type} value={form[key] || ''} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} style={s.input} />
                    </label>
                  ))}
                </>
              )}
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
  title: { margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#111' },
  content: { padding: '1.5rem', overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.07)' },
  thead: { background: '#f9fafb' }, th: { padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.8rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' },
  tr: { borderTop: '1px solid #e5e7eb' }, td: { padding: '0.85rem 1rem', fontSize: '0.9rem', color: '#374151' },
  code: { background: '#f3f4f6', padding: '0.15rem 0.4rem', borderRadius: '4px', fontSize: '0.85rem' },
  viewLink: { color: '#2563eb', textDecoration: 'none', marginRight: '0.5rem', fontSize: '0.85rem' },
  primaryBtn: { background: '#7c3aed', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.6rem 1.1rem', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' },
  secondaryBtn: { background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '8px', padding: '0.6rem 1rem', fontWeight: 500, cursor: 'pointer', fontSize: '0.9rem' },
  editBtn: { background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '6px', padding: '0.3rem 0.7rem', cursor: 'pointer', marginRight: '0.4rem', fontSize: '0.85rem' },
  deleteBtn: { background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', padding: '0.3rem 0.7rem', cursor: 'pointer', fontSize: '0.85rem' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' },
  modal: { background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '520px', overflow: 'hidden', maxHeight: '90vh', overflowY: 'auto' },
  modalHeader: { padding: '1.25rem 1.5rem', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  modalBody: { padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  label: { display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.9rem', fontWeight: 500, color: '#374151' },
  input: { border: '1px solid #d1d5db', borderRadius: '6px', padding: '0.5rem 0.75rem', fontSize: '0.95rem', outline: 'none' },
  closeBtn: { background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#6b7280' },
  errorMsg: { color: '#dc2626', fontSize: '0.85rem' },
}
