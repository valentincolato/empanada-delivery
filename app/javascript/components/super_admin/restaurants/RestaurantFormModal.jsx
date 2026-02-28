import { useTranslation } from 'react-i18next'
import ModalShell from '../../ui/ModalShell'

const BASE_FIELDS = ['name', 'slug', 'address', 'phone', 'description']

export default function RestaurantFormModal({ modal, form, saving, error, onClose, onSave, onChange }) {
  const { t } = useTranslation()

  if (!modal) return null

  return (
    <ModalShell
      maxWidthClass="max-w-xl"
      onClose={onClose}
      title={modal === 'new'
        ? t('superAdmin.restaurants.modal.new')
        : t('superAdmin.restaurants.modal.edit', { name: modal.name })}
    >

        <form onSubmit={onSave} className="flex flex-col gap-3 p-6">
          {BASE_FIELDS.map((key) => (
            <label key={key} className="flex flex-col gap-1 text-sm font-medium text-[var(--ink-700)]">
              {t(`superAdmin.restaurants.modal.fields.${key}`)}
              <input
                required={key === 'name'}
                value={form[key] || ''}
                onChange={(event) => onChange(key, event.target.value)}
                className="rounded-md border border-[var(--line-soft)] bg-[var(--panel-strong)] px-3 py-2"
              />
            </label>
          ))}

          <label className="flex flex-col gap-1 text-sm font-medium text-[var(--ink-700)]">
            {t('superAdmin.restaurants.modal.fields.currency')}
            <select
              value={form.currency}
              onChange={(event) => onChange('currency', event.target.value)}
              className="rounded-md border border-[var(--line-soft)] bg-[var(--panel-strong)] px-3 py-2"
            >
              {['ARS', 'USD', 'EUR'].map((currency) => <option key={currency} value={currency}>{currency}</option>)}
            </select>
          </label>

          {modal === 'new' && (
            <>
              <hr className="my-2 border-[var(--line-soft)]" />
              <p className="font-semibold text-[var(--ink-700)]">{t('superAdmin.restaurants.modal.adminUser')}</p>

              {[
                ['admin_email', 'adminEmail', true, 'email'],
                ['admin_password', 'adminPassword', true, 'password'],
                ['admin_name', 'adminName', false, 'text'],
              ].map(([key, labelKey, required, type]) => (
                <label key={key} className="flex flex-col gap-1 text-sm font-medium text-[var(--ink-700)]">
                  {t(`superAdmin.restaurants.modal.fields.${labelKey}`)}
                  <input
                    required={required}
                    type={type}
                    value={form[key] || ''}
                    onChange={(event) => onChange(key, event.target.value)}
                    className="rounded-md border border-[var(--line-soft)] bg-[var(--panel-strong)] px-3 py-2"
                  />
                </label>
              ))}
            </>
          )}

          {error && <div className="text-sm text-red-300">{error}</div>}
          <div className="mt-1 flex gap-3">
            <button type="submit" disabled={saving} className="elegant-button-primary !rounded-lg !px-4 !py-2 !text-sm">
              {saving ? t('common.saving') : t('common.save')}
            </button>
            <button type="button" onClick={onClose} className="elegant-button-secondary !rounded-lg !px-4 !py-2 !text-sm">{t('common.cancel')}</button>
          </div>
        </form>
    </ModalShell>
  )
}
