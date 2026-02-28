import { useTranslation } from 'react-i18next'

export default function ProductFormModal({
  modal,
  form,
  categories,
  imageFile,
  imagePreview,
  fileInputRef,
  error,
  saving,
  onClose,
  onSubmit,
  onChange,
  onImageChange,
}) {
  const { t } = useTranslation()

  if (!modal) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[1px]">
      <div className="w-full max-w-xl overflow-hidden rounded-3xl border border-[var(--line-soft)] bg-[var(--panel)]">
        <div className="flex items-center justify-between border-b border-[var(--line-soft)] px-6 py-5">
          <h2 data-testid="product-modal-title" data-mode={modal === 'new' ? 'new' : 'edit'} className="font-display text-4xl font-semibold text-[var(--ink-900)]">{modal === 'new' ? t('admin.products.newProductTitle') : t('admin.products.editProductTitle')}</h2>
          <button onClick={onClose} className="rounded-full border border-[var(--line-soft)] px-2.5 py-1 text-[var(--ink-500)]">x</button>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-3 p-6">
          <label className="flex flex-col gap-1 text-sm font-medium text-[var(--ink-700)]">
            {t('admin.products.form.name')}
            <input data-testid="product-name-input" autoFocus required value={form.name} onChange={(event) => onChange('name', event.target.value)} className="rounded-md border border-[var(--line-soft)] bg-[var(--panel-strong)] px-3 py-2" />
          </label>

          <label className="flex flex-col gap-1 text-sm font-medium text-[var(--ink-700)]">
            {t('admin.products.form.description')}
            <textarea value={form.description} onChange={(event) => onChange('description', event.target.value)} className="h-20 resize-y rounded-md border border-[var(--line-soft)] bg-[var(--panel-strong)] px-3 py-2" />
          </label>

          <label className="flex flex-col gap-1 text-sm font-medium text-[var(--ink-700)]">
            {t('admin.products.form.price')}
            <input data-testid="product-price-input" required type="number" step="0.01" value={form.price} onChange={(event) => onChange('price', event.target.value)} className="rounded-md border border-[var(--line-soft)] bg-[var(--panel-strong)] px-3 py-2" />
          </label>

          <label className="flex flex-col gap-1 text-sm font-medium text-[var(--ink-700)]">
            {t('admin.products.form.category')}
            <select value={form.category_id} onChange={(event) => onChange('category_id', Number(event.target.value))} className="rounded-md border border-[var(--line-soft)] bg-[var(--panel-strong)] px-3 py-2">
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm font-medium text-[var(--ink-700)]">
            {t('admin.products.form.position')}
            <input type="number" value={form.position} onChange={(event) => onChange('position', Number(event.target.value))} className="rounded-md border border-[var(--line-soft)] bg-[var(--panel-strong)] px-3 py-2" />
          </label>

          <div className="flex flex-col gap-1 text-sm font-medium text-[var(--ink-700)]">
            {t('admin.products.form.image')}
            <div className="flex items-center gap-3">
              {imagePreview && <img src={imagePreview} alt="preview" className="h-16 w-16 rounded-lg border border-[var(--line-soft)] object-cover" />}
              <label className="cursor-pointer rounded-md border border-[var(--line-soft)] bg-[var(--panel-strong)] px-3 py-2 text-sm text-[var(--ink-500)] hover:bg-[var(--panel-strong)]">
                {imageFile ? imageFile.name : t('admin.products.form.chooseImage')}
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onImageChange} />
              </label>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm font-medium text-[var(--ink-700)]">
            <input type="checkbox" checked={form.available} onChange={(event) => onChange('available', event.target.checked)} />
            {t('admin.products.form.available')}
          </label>

          {error && <div className="text-sm text-red-900">{error}</div>}

          <div className="mt-1 flex gap-3">
            <button data-testid="save-product-button" type="submit" disabled={saving} className="elegant-button-primary !rounded-lg !px-4 !py-2 !text-sm">
              {saving ? t('common.saving') : t('common.save')}
            </button>
            <button data-testid="cancel-product-button" type="button" onClick={onClose} className="elegant-button-secondary !rounded-lg !px-4 !py-2 !text-sm">{t('common.cancel')}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
