import { useRef, useState } from 'react'
import { useTranslation } from '../../i18n'
import { useUploadDocument } from '../../hooks/useDocuments'
import { Button } from '../ui/button'
import { Textarea } from '../ui/textarea'

interface Props {
  projectId: number
  onSend: (msg: string) => void
  disabled?: boolean
}

export default function ChatInput({ projectId, onSend, disabled }: Props) {
  const { t } = useTranslation()
  const [text, setText] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const upload = useUploadDocument(projectId)

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

  const handleFiles = (files: FileList | null) => {
    if (!files) return
    Array.from(files).forEach((f) => upload.mutate(f))
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-end gap-2 px-4 py-3 shrink-0"
      style={{ borderTop: '1px solid var(--border-subtle)', background: 'var(--bg)' }}
    >
      <input
        ref={fileRef}
        type="file"
        multiple
        className="hidden"
        accept=".pdf,.txt,.md,.docx,.xlsx,.csv"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={disabled || upload.isPending}
        className="shrink-0"
        title={t('chat.attach')}
        aria-label={t('chat.attach')}
        onClick={() => fileRef.current?.click()}
      >
        {upload.isPending ? <span className="animate-spin-queai inline-block">⟳</span> : '＋'}
      </Button>
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKey}
        disabled={disabled}
        placeholder={disabled ? t('chat.generating') : t('chat.placeholder')}
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
        {disabled ? '…' : t('chat.send')}
      </Button>
    </form>
  )
}
