import { useState } from 'react'
import { useTranslation } from 'react-i18next'

export default function ProductDetailModal({ product, onClose, onAdd }) {
  const { t } = useTranslation()
  const [quantity, setQuantity] = useState(1)

  function decreaseQuantity() {
    setQuantity((current) => Math.max(1, current - 1))
  }

  function increaseQuantity() {
    setQuantity((current) => current + 1)
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div data-testid="product-modal" className="w-full max-w-lg overflow-hidden rounded-3xl border border-[var(--line-soft)] bg-[var(--panel)] text-[var(--ink-900)] shadow-[0_24px_52px_rgba(22,18,10,0.26)]">
        {product.image_url && (
          <img src={product.image_url} alt={product.name} className="h-56 w-full object-cover" />
        )}

        <div className="p-5">
          <div className="mb-3 flex items-start justify-between gap-4">
            <div>
              <h3 className="font-display text-4xl font-semibold">{product.name}</h3>
              <p className="mt-1 text-sm font-semibold text-[var(--brand-700)]">${parseFloat(product.price).toFixed(2)}</p>
            </div>
            <button onClick={onClose} className="rounded-full border border-[var(--line-soft)] px-2.5 py-1 text-[var(--ink-500)]">x</button>
          </div>

          {product.description && (
            <p className="mb-5 text-sm leading-relaxed text-[var(--ink-700)]">{product.description}</p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                data-testid="product-modal-quantity-decrease"
                onClick={decreaseQuantity}
                className="h-9 w-9 rounded-md border border-[var(--line-soft)] text-lg font-semibold text-[var(--ink-700)]"
              >
                -
              </button>
              <span data-testid="product-modal-quantity-value" className="min-w-8 text-center text-sm font-semibold text-[var(--ink-900)]">
                {quantity}
              </span>
              <button
                type="button"
                data-testid="product-modal-quantity-increase"
                onClick={increaseQuantity}
                className="h-9 w-9 rounded-md border border-[var(--line-soft)] text-lg font-semibold text-[var(--ink-700)]"
              >
                +
              </button>
            </div>
            <button onClick={onClose} className="elegant-button-secondary !rounded-lg !px-4 !py-2 !text-sm">
              {t('common.cancel')}
            </button>
            <button data-testid="product-modal-add" onClick={() => onAdd(quantity)} className="elegant-button-primary !rounded-lg !px-4 !py-2 !text-sm">
              {t('menu.add')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
