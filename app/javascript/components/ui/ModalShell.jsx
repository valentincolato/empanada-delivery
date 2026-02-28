export default function ModalShell({ title, onClose, children, maxWidthClass = 'max-w-xl', titleClassName = '' }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[1px]">
      <div className={`max-h-[90vh] w-full overflow-y-auto rounded-3xl border border-[var(--line-soft)] bg-[var(--panel)] ${maxWidthClass}`}>
        <div className="flex items-center justify-between border-b border-[var(--line-soft)] px-6 py-5">
          <h2 className={`font-display text-4xl font-semibold text-[var(--ink-900)] ${titleClassName}`.trim()}>{title}</h2>
          <button onClick={onClose} className="rounded-full border border-[var(--line-soft)] px-2.5 py-1 text-[var(--ink-500)]">x</button>
        </div>
        {children}
      </div>
    </div>
  )
}
