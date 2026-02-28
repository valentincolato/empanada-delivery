import { useTranslation } from 'react-i18next'

export default function ProductCard({ product, onAdd }) {
  const { t } = useTranslation()

  return (
    <div className="elegant-card overflow-hidden bg-[var(--panel)]" data-testid="product-card">
      {product.image_url && <img src={product.image_url} alt={product.name} className="h-40 w-full object-cover" />}
      <div className="p-3">
        <h3 className="font-display text-2xl font-semibold text-[var(--ink-900)]">{product.name}</h3>
        {product.description && <p className="mb-2 mt-1 min-h-8 text-xs leading-relaxed text-[var(--ink-700)]">{product.description}</p>}
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-[var(--ink-900)]">${parseFloat(product.price).toFixed(2)}</span>
          <button className="elegant-button-primary !rounded-lg !px-3 !py-1.5 !text-xs" onClick={() => onAdd(product)}>{t('menu.add')}</button>
        </div>
      </div>
    </div>
  )
}
