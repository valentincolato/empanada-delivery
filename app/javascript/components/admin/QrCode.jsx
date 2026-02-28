import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { api } from '@utils/api'

export default function QrCode({ api_admin_restaurant_qr_code, admin_orders }) {
  const { t } = useTranslation()
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.get(api_admin_restaurant_qr_code)
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
    <div className="min-h-screen">
      <div className="border-b border-[var(--line-soft)] bg-[var(--panel)] px-6 py-4">
        <a href={admin_orders} className="mb-1 block text-sm text-[var(--ink-500)]">{t('admin.qr.backToOrders')}</a>
        <h1 className="font-display text-4xl font-semibold text-[var(--ink-900)]">{t('admin.qr.title')}</h1>
      </div>
      <div className="flex justify-center px-4 py-12">
        {error && <div className="text-red-300">{error}</div>}
        {data && (
          <div className="w-full max-w-md rounded-3xl border border-[var(--line-soft)] bg-[var(--panel)] p-10 text-center shadow-[0_12px_30px_rgba(22,18,10,0.08)]">
            <p className="mb-6 break-all text-sm text-[var(--brand-700)]">{data.url}</p>
            <div className="mx-auto mb-6 inline-block" dangerouslySetInnerHTML={{ __html: data.svg }} />
            <button
              onClick={downloadSvg}
              className="elegant-button-primary !rounded-lg !px-6 !py-3 !text-sm"
            >
              {t('admin.qr.download')}
            </button>
            <p className="mt-4 text-sm text-[var(--ink-500)]">{t('admin.qr.instructions')}</p>
          </div>
        )}
      </div>
    </div>
  )
}
