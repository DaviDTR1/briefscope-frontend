import { useState, useCallback, useRef, useEffect } from 'react'
import { useTranslation } from '../i18n'
import { streamChat } from '../api/chat'
import { getConversations, getConversation } from '../api/conversations'

export interface FileReady {
  filename: string
  url: string
  label: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  filesReady?: FileReady[]
}

/** Parse "[Archivo generado: filename]" markers saved to DB back into filesReady. */
function parseAssistantContent(content: string): { cleanContent: string; filesReady?: FileReady[] } {
  const pattern = /\[Archivo generado:\s*([^\]]+)\]/g
  const filesReady: FileReady[] = []

  const cleanContent = content
    .replace(pattern, (_, filename) => {
      filename = filename.trim()
      const ext = filename.split('.').pop()?.toUpperCase() ?? 'FILE'
      filesReady.push({
        filename,
        url: `/files/${encodeURIComponent(filename)}`,
        label: ext,
      })
      return ''
    })
    .trim()

  return {
    cleanContent,
    filesReady: filesReady.length > 0 ? filesReady : undefined,
  }
}

export function useChat(projectId: number) {
  const { t } = useTranslation()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [conversationId, setConversationId] = useState<number | undefined>()
  const [streaming, setStreaming] = useState(false)
  const [thinkingMessage, setThinkingMessage] = useState<string | null>(null)
  const [loadingHistory, setLoadingHistory] = useState(true)
  const abortRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoadingHistory(true)
    setMessages([])
    setConversationId(undefined)
    setThinkingMessage(null)

    const load = async () => {
      try {
        const convs = await getConversations(projectId)
        if (cancelled || convs.length === 0) return
        const latest = convs[0]
        const detail = await getConversation(projectId, latest.id)
        if (cancelled) return

        const loaded: ChatMessage[] = detail.messages.map((m) => {
          if (m.role === 'assistant' && m.content.includes('[Archivo generado:')) {
            const { cleanContent, filesReady } = parseAssistantContent(m.content)
            return { id: `server-${m.id}`, role: m.role as 'assistant', content: cleanContent, filesReady }
          }
          return { id: `server-${m.id}`, role: m.role as 'user' | 'assistant', content: m.content }
        })

        setMessages(loaded)
        setConversationId(latest.id)
      } catch {
        // No conversations yet — start fresh
      } finally {
        if (!cancelled) setLoadingHistory(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [projectId])

  const send = useCallback(
    (text: string) => {
      if (streaming) return

      const userMsg: ChatMessage = { id: crypto.randomUUID(), role: 'user', content: text }
      const assistantId = crypto.randomUUID()
      const assistantMsg: ChatMessage = { id: assistantId, role: 'assistant', content: '' }

      setMessages((prev) => [...prev, userMsg, assistantMsg])
      setStreaming(true)
      setThinkingMessage(t('chat.analyzing'))

      abortRef.current = streamChat(projectId, text, conversationId, {
        onMeta: (convId) => setConversationId(convId),

        onThinking: (msg) => {
          setThinkingMessage(msg || null)
        },

        onToken: (token) => {
          setThinkingMessage(null)
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: m.content + token } : m,
            ),
          )
        },

        onFileReady: (filename, url, label) => {
          setThinkingMessage(null)
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, filesReady: [...(m.filesReady ?? []), { filename, url, label }] }
                : m,
            ),
          )
          window.dispatchEvent(new CustomEvent('briefscope:file_ready', { detail: filename }))
        },

        onError: (err) => {
          setThinkingMessage(null)
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: `⚠️ ${err}` } : m,
            ),
          )
          setStreaming(false)
        },

        onDone: () => {
          setThinkingMessage(null)
          setStreaming(false)
        },
      })
    },
    [projectId, conversationId, streaming, t],
  )

  const reset = useCallback(() => {
    abortRef.current?.()
    setMessages([])
    setConversationId(undefined)
    setStreaming(false)
    setThinkingMessage(null)
  }, [])

  return { messages, streaming, thinkingMessage, loadingHistory, conversationId, send, reset }
}
