import { useState, useEffect } from 'react'
import { api } from '@utils/api'

export default function QrCode() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.get('/api/v1/admin/restaurant/qr_code')
      .then(setData)
      .catch((err) => setError(err.message))
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
    <div className="min-h-screen bg-slate-100 font-sans">
      <div className="border-b border-slate-200 bg-white px-6 py-4">
        <a href="/admin/orders" className="mb-1 block text-sm text-slate-500">← Orders</a>
        <h1 className="text-xl font-bold text-slate-900">QR Code</h1>
      </div>
      <div className="flex justify-center px-4 py-12">
        {error && <div className="text-red-600">{error}</div>}
        {data && (
          <div className="w-full max-w-md rounded-2xl bg-white p-10 text-center shadow">
            <p className="mb-6 break-all text-sm text-blue-600">{data.url}</p>
            <div className="mx-auto mb-6 inline-block" dangerouslySetInnerHTML={{ __html: data.svg }} />
            <button
              onClick={downloadSvg}
              className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              ⬇ Download SVG
            </button>
            <p className="mt-4 text-sm text-slate-400">Print and place at tables so customers can scan to order.</p>
          </div>
        )}
      </div>
    </div>
  )
}
