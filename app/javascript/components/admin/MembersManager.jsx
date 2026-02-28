import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { api } from '@utils/api'
import { confirmAction } from '@utils/confirmAction'
import { fillPath } from '@utils/pathBuilder'

export default function MembersManager({ api_admin_memberships, api_admin_membership_template, admin_orders }) {
  const { t } = useTranslation()
  const [memberships, setMemberships] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ email: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadMembers()
  }, [])

  async function loadMembers() {
    const data = await api.get(api_admin_memberships)
    setMemberships(Array.isArray(data) ? data : [])
  }

  async function inviteMember(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      await api.post(api_admin_memberships, { membership: form })
      await loadMembers()
      setForm({ email: '' })
      setModalOpen(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function removeMembership(membershipId) {
    const approved = await confirmAction(t('admin.members.removeConfirm'))
    if (!approved) return
    await api.delete(fillPath(api_admin_membership_template, { id: membershipId }))
    await loadMembers()
  }

  return (
    <div className="min-h-screen">
      <div className="flex items-center justify-between border-b border-[var(--line-soft)] bg-[var(--panel)] px-6 py-4">
        <div>
          <a href={admin_orders} className="text-sm text-[var(--ink-500)]">{t('admin.members.backToOrders')}</a>
          <h1 className="mt-1 font-display text-4xl font-semibold text-[var(--ink-900)]">{t('admin.members.title')}</h1>
        </div>
        <button onClick={() => setModalOpen(true)} className="elegant-button-primary !rounded-lg !px-4 !py-2 !text-sm">
          {t('admin.members.invite')}
        </button>
      </div>

      <div className="overflow-x-auto p-6">
        <table className="w-full overflow-hidden rounded-2xl border border-[var(--line-soft)] bg-[var(--panel)] shadow-[0_12px_30px_rgba(22,18,10,0.08)]">
          <thead className="bg-[var(--panel-strong)]">
            <tr>
              {[t('admin.members.headers.user'), t('admin.members.headers.role'), t('admin.members.headers.actions')].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-[var(--ink-500)]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {memberships.map((membership) => (
              <tr key={membership.id} className="border-t border-[var(--line-soft)]">
                <td className="px-4 py-3 text-sm text-[var(--ink-700)]">
                  <div className="font-semibold">{membership.user?.email}</div>
                  <div className="text-xs text-[var(--ink-500)]">{membership.user?.name || '—'}</div>
                </td>
                <td className="px-4 py-3 text-sm text-[var(--ink-700)]">
                  {t('admin.members.roles.member')}
                </td>
                <td className="px-4 py-3 text-sm text-[var(--ink-700)]">
                  <button onClick={() => removeMembership(membership.id)} className="rounded-md border border-red-900/50 bg-red-950/35 px-3 py-1 text-xs text-red-300">
                    {t('common.delete')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[1px]">
          <div className="w-full max-w-md overflow-hidden rounded-3xl border border-[var(--line-soft)] bg-[var(--panel)]">
            <div className="flex items-center justify-between border-b border-[var(--line-soft)] px-6 py-5">
              <h2 className="font-display text-4xl font-semibold text-[var(--ink-900)]">{t('admin.members.invite')}</h2>
              <button onClick={() => setModalOpen(false)} className="rounded-full border border-[var(--line-soft)] px-2.5 py-1 text-[var(--ink-500)]">x</button>
            </div>
            <form onSubmit={inviteMember} className="flex flex-col gap-3 p-6">
              <label className="flex flex-col gap-1 text-sm font-medium text-[var(--ink-700)]">
                {t('admin.members.form.email')}
                <input
                  autoFocus
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                  className="rounded-md border border-[var(--line-soft)] bg-[var(--panel-strong)] px-3 py-2"
                />
              </label>
              {error && <div className="text-sm text-red-300">{error}</div>}
              <div className="mt-1 flex gap-3">
                <button type="submit" disabled={saving} className="elegant-button-primary !rounded-lg !px-4 !py-2 !text-sm">
                  {saving ? t('common.saving') : t('common.save')}
                </button>
                <button type="button" onClick={() => setModalOpen(false)} className="elegant-button-secondary !rounded-lg !px-4 !py-2 !text-sm">
                  {t('common.cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
