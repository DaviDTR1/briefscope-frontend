import { useState } from 'react'
import { Button } from '../ui/button'
import { Textarea } from '../ui/textarea'

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
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKey}
        disabled={disabled}
        placeholder={disabled ? 'Generando respuesta…' : 'Escribe tu mensaje… (Enter para enviar)'}
        rows={1}
        className="flex-1 min-h-[38px] max-h-[160px] overflow-y-auto"
        style={{ opacity: disabled ? 0.5 : 1 }}
        onInput={(e) => {
          const t = e.currentTarget
          t.style.height = 'auto'
          t.style.height = `${Math.min(t.scrollHeight, 160)}px`
        }}
      />
      <Button
        type="submit"
        variant="outline"
        disabled={disabled || !text.trim()}
        className="shrink-0"
      >
        {disabled ? '…' : 'Enviar'}
      </Button>
    </form>
  )
}
