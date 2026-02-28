import { useTranslation } from 'react-i18next'

export default function LanguageSwitcher({ className = '' }) {
  const { i18n } = useTranslation()
  const current = i18n.language

  function toggle(lang) {
    i18n.changeLanguage(lang)
    localStorage.setItem('locale', lang)
  }

  return (
    <div className={`flex items-center gap-1 rounded-full border border-slate-600 bg-slate-800 p-0.5 text-xs font-bold ${className}`}>
      <button
        onClick={() => toggle('es')}
        className={`rounded-full px-2.5 py-1 transition ${current === 'es' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-slate-200'}`}
      >
        ES
      </button>
      <button
        onClick={() => toggle('en')}
        className={`rounded-full px-2.5 py-1 transition ${current === 'en' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-slate-200'}`}
      >
        EN
      </button>
    </div>
  )
}
