import { useState } from 'react'

interface Props {
  onSend: (msg: string) => void
  disabled?: boolean
}

export default function ChatInput({ onSend, disabled }: Props) {
  const [text, setText] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setText('')
  }

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as unknown as React.FormEvent)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-end gap-2 px-4 py-3 shrink-0"
      style={{ borderTop: '1px solid var(--border-subtle)', background: 'var(--bg)' }}
    >
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKey}
        disabled={disabled}
        placeholder={disabled ? 'Generando respuesta…' : 'Escribe tu mensaje… (Enter para enviar)'}
        rows={1}
        style={{
          flex: 1,
          resize: 'none',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          color: 'var(--text)',
          borderRadius: 'var(--radius-sm)',
          padding: '8px 12px',
          fontSize: 14,
          fontFamily: "'DM Sans', sans-serif",
          lineHeight: 1.5,
          minHeight: 38,
          maxHeight: 160,
          overflowY: 'auto',
          opacity: disabled ? 0.5 : 1,
        }}
        onFocus={e => (e.currentTarget.style.borderColor = 'var(--text-dim)')}
        onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
        onInput={(e) => {
          const t = e.currentTarget
          t.style.height = 'auto'
          t.style.height = `${Math.min(t.scrollHeight, 160)}px`
        }}
      />
      <button
        type="submit"
        disabled={disabled || !text.trim()}
        className="shrink-0 transition-colors"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          color: disabled || !text.trim() ? 'var(--text-dim)' : 'var(--text)',
          borderRadius: 'var(--radius-sm)',
          padding: '8px 16px',
          fontSize: 13.5,
          fontWeight: 500,
          fontFamily: "'DM Sans', sans-serif",
          cursor: disabled || !text.trim() ? 'not-allowed' : 'pointer',
          opacity: disabled || !text.trim() ? 0.5 : 1,
        }}
        onMouseEnter={e => {
          if (!disabled && text.trim()) e.currentTarget.style.borderColor = 'var(--accent)'
        }}
        onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
      >
        {disabled ? '…' : 'Enviar'}
      </button>
    </form>
  )
}
