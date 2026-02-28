import { useState } from 'react'
import { confirmAction } from '@utils/confirmAction'

export default function ConfirmButton({
  message,
  onConfirm,
  children,
  className = '',
  disabled = false,
  type = 'button',
}) {
  const [processing, setProcessing] = useState(false)

  async function handleClick() {
    if (disabled || processing) return
    const approved = await confirmAction(message)
    if (!approved) return

    try {
      setProcessing(true)
      await onConfirm()
    } finally {
      setProcessing(false)
    }
  }

  return (
    <button type={type} disabled={disabled || processing} onClick={handleClick} className={className}>
      {children}
    </button>
  )
}
