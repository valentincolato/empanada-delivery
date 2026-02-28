import { useTranslation } from 'react-i18next'

export default function LanguageSwitcher({ className = '' }) {
  const { i18n } = useTranslation()
  const current = i18n.language

  function toggle(lang) {
    i18n.changeLanguage(lang)
    localStorage.setItem('locale', lang)
  }

  return (
    <div className={`flex items-center gap-1 rounded-full border border-[var(--line-soft)] bg-white/70 p-0.5 text-xs font-bold ${className}`}>
      <button
        onClick={() => toggle('es')}
        className={`rounded-full px-2.5 py-1 transition ${current === 'es' ? 'bg-[var(--gold-600)] text-white' : 'text-[var(--ink-500)] hover:text-[var(--ink-700)]'}`}
      >
        ES
      </button>
      <button
        onClick={() => toggle('en')}
        className={`rounded-full px-2.5 py-1 transition ${current === 'en' ? 'bg-[var(--gold-600)] text-white' : 'text-[var(--ink-500)] hover:text-[var(--ink-700)]'}`}
      >
        EN
      </button>
    </div>
  )
}
