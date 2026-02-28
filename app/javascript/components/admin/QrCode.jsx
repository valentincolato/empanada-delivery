import { useState, useEffect } from 'react'
import { api } from '@utils/api'

export default function QrCode() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.get('/api/v1/admin/restaurant/qr_code')
      .then(setData)
      .catch(err => setError(err.message))
  }, [])

  function downloadSvg() {
    const blob = new Blob([data.svg], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'menu-qr.svg'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div style={s.page}>
      <div style={s.topbar}>
        <a href="/admin/orders" style={s.back}>← Orders</a>
        <h1 style={s.title}>QR Code</h1>
      </div>
      <div style={s.content}>
        {error && <div style={s.error}>{error}</div>}
        {data && (
          <div style={s.card}>
            <p style={s.url}>{data.url}</p>
            <div dangerouslySetInnerHTML={{ __html: data.svg }} style={s.svgWrap} />
            <button onClick={downloadSvg} style={s.downloadBtn}>⬇ Download SVG</button>
            <p style={s.hint}>Print and place at tables so customers can scan to order.</p>
          </div>
        )}
      </div>
    </div>
  )
}

const s = {
  page: { fontFamily: 'Inter, sans-serif', minHeight: '100vh', background: '#f1f5f9' },
  topbar: { background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '1rem 1.5rem' },
  back: { color: '#6b7280', textDecoration: 'none', fontSize: '0.85rem', display: 'block', marginBottom: '0.25rem' },
  title: { margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#111' },
  content: { display: 'flex', justifyContent: 'center', padding: '3rem 1rem' },
  card: { background: '#fff', borderRadius: '16px', padding: '2.5rem', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', maxWidth: '400px', width: '100%' },
  url: { color: '#2563eb', fontSize: '0.9rem', wordBreak: 'break-all', marginBottom: '1.5rem' },
  svgWrap: { display: 'inline-block', margin: '0 auto 1.5rem' },
  downloadBtn: { background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.75rem 1.5rem', fontWeight: 600, cursor: 'pointer', fontSize: '0.95rem' },
  hint: { color: '#9ca3af', fontSize: '0.85rem', marginTop: '1rem' },
  error: { color: '#dc2626' },
}
