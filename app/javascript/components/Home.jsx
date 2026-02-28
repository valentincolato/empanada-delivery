export default function Home() {
  return (
    <div style={{ fontFamily: 'Inter, sans-serif', textAlign: 'center', padding: '4rem 2rem' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 700, color: '#1a1a1a' }}>
        🫔 Empanada Delivery
      </h1>
      <p style={{ color: '#666', marginTop: '1rem', fontSize: '1.1rem' }}>
        Multi-tenant food ordering platform
      </p>
      <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <a href="/admin/orders" style={btnStyle('#2563eb')}>Restaurant Admin</a>
        <a href="/super_admin/restaurants" style={btnStyle('#7c3aed')}>Super Admin</a>
      </div>
    </div>
  )
}

function btnStyle(bg) {
  return {
    background: bg, color: '#fff', padding: '0.75rem 1.5rem',
    borderRadius: '8px', textDecoration: 'none', fontWeight: 600, fontSize: '0.95rem',
  }
}
