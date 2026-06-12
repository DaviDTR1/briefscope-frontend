import { useState, useCallback, useRef, useEffect } from 'react'
import { streamChat } from '../api/chat'
import { getConversations, getConversation } from '../api/conversations'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  fileReady?: { filename: string; url: string; label: string }
}

export function useChat(projectId: number) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [conversationId, setConversationId] = useState<number | undefined>()
  const [streaming, setStreaming] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(true)
  const abortRef = useRef<(() => void) | null>(null)

  // ─── Load latest conversation on mount / project change ────────────────────
  useEffect(() => {
    let cancelled = false
    setLoadingHistory(true)
    setMessages([])
    setConversationId(undefined)

    const load = async () => {
      try {
        const convs = await getConversations(projectId)
        if (cancelled || convs.length === 0) return

        // convs are ordered by updated_at desc — first one is the latest
        const latest = convs[0]
        const detail = await getConversation(projectId, latest.id)
        if (cancelled) return

        const loaded: ChatMessage[] = detail.messages.map((m) => ({
          id: `server-${m.id}`,
          role: m.role,
          content: m.content,
        }))
        setMessages(loaded)
        setConversationId(latest.id)
      } catch {
        // No conversations yet, or network error — start fresh
      } finally {
        if (!cancelled) setLoadingHistory(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [projectId])

  // ─── Send a message ─────────────────────────────────────────────────────────
  const send = useCallback(
    (text: string) => {
      if (streaming) return

      const userMsg: ChatMessage = { id: crypto.randomUUID(), role: 'user', content: text }
      const assistantId = crypto.randomUUID()
      const assistantMsg: ChatMessage = { id: assistantId, role: 'assistant', content: '' }

      setMessages((prev) => [...prev, userMsg, assistantMsg])
      setStreaming(true)

      abortRef.current = streamChat(projectId, text, conversationId, {
        onMeta: (convId) => setConversationId(convId),
        onToken: (token) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: m.content + token } : m,
            ),
          )
        },
        onFileReady: (filename, url, label) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, fileReady: { filename, url, label } } : m,
            ),
          )
          window.dispatchEvent(new CustomEvent('briefscope:file_ready', { detail: filename }))
        },
        onError: (err) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: `⚠️ ${err}` } : m,
            ),
          )
          setStreaming(false)
        },
        onDone: () => setStreaming(false),
      })
    },
    [projectId, conversationId, streaming],
  )

  // ─── Reset — clear UI state, next message starts a new conversation ─────────
  const reset = useCallback(() => {
    abortRef.current?.()
    setMessages([])
    setConversationId(undefined)
    setStreaming(false)
  }, [])

  return { messages, streaming, loadingHistory, conversationId, send, reset }
}
