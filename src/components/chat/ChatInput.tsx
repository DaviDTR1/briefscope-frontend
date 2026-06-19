import { useRef, useState } from 'react'
import { useTranslation } from '../../i18n'
import { useUploadDocument } from '../../hooks/useDocuments'
import { Button } from '../ui/button'
import { Textarea } from '../ui/textarea'
import { Globe } from '../ui/icons'

interface Props {
  projectId: number
  onSend: (msg: string, attachments?: string[], webSearch?: boolean) => void
  disabled?: boolean
}

const webSearchKey = (projectId: number) => `briefscope:webSearch:${projectId}`

export default function ChatInput({ projectId, onSend, disabled }: Props) {
  const { t } = useTranslation()
  const [text, setText] = useState('')
  // Filenames attached via the "＋" button since the last sent message. They are
  // referenced in the note sent to the agent and cleared once the turn is sent.
  const [attached, setAttached] = useState<string[]>([])
  const fileRef = useRef<HTMLInputElement>(null)
  const upload = useUploadDocument(projectId)

  // Web search is a per-project master switch remembered in localStorage. It is
  // available in both cloud and local modes (DuckDuckGo needs no API key). It is
  // sent on every chat turn; the backend then grants the `buscar_en_web` tool
  // only to the agents the user permitted in Settings.
  const [webSearch, setWebSearch] = useState<boolean>(() => {
    try {
      return localStorage.getItem(webSearchKey(projectId)) === '1'
    } catch {
      return false
    }
  })

  const toggleWebSearch = () => {
    setWebSearch((prev) => {
      const next = !prev
      try {
        localStorage.setItem(webSearchKey(projectId), next ? '1' : '0')
      } catch { /* ignore */ }
      return next
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed || disabled) return
    onSend(
      trimmed,
      attached.length > 0 ? attached : undefined,
      webSearch,
    )
    setText('')
    setAttached([])
  }

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as unknown as React.FormEvent)
    }
  }

  const handleFiles = (files: FileList | null) => {
    if (!files) return
    Array.from(files).forEach((f) =>
      upload.mutate(f, {
        onSuccess: (doc) =>
          setAttached((prev) =>
            prev.includes(doc.filename) ? prev : [...prev, doc.filename],
          ),
      }),
    )
    if (fileRef.current) fileRef.current.value = ''
  }

  const removeAttached = (name: string) =>
    setAttached((prev) => prev.filter((n) => n !== name))

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-2 px-4 py-3 shrink-0"
      style={{ borderTop: '1px solid var(--border-subtle)', background: 'var(--bg)' }}
    >
      {attached.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {attached.map((name) => (
            <span
              key={name}
              className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs"
              style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)' }}
            >
              <span className="opacity-60">📎</span>
              <span className="max-w-[160px] truncate">{name}</span>
              <button
                type="button"
                onClick={() => removeAttached(name)}
                title={t('chat.removeAttached')}
                aria-label={t('chat.removeAttached')}
                className="ml-0.5 opacity-60 hover:opacity-100"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="flex items-end gap-2">
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
        variant="outline"
        size="icon"
        disabled={disabled || upload.isPending}
        className="shrink-0"
        title={t('chat.attach')}
        aria-label={t('chat.attach')}
        onClick={() => fileRef.current?.click()}
        style={{ borderColor: 'var(--text-dim)' }}
      >
        {upload.isPending ? <span className="animate-spin-queai inline-block">⟳</span> : '＋'}
      </Button>
      <Button
        type="button"
        variant="outline"
        size="icon"
        disabled={disabled}
        className="shrink-0"
        aria-pressed={webSearch}
        title={webSearch ? t('chat.webSearchOn') : t('chat.webSearchOff')}
        aria-label={webSearch ? t('chat.webSearchOn') : t('chat.webSearchOff')}
        onClick={toggleWebSearch}
        style={
          webSearch
            ? { background: 'var(--accent)', borderColor: 'var(--accent)', color: 'var(--bg)' }
            : { borderColor: 'var(--text-dim)' }
        }
      >
        <Globe />
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
      </div>
    </form>
  )
}
