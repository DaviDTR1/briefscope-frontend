import { useState, useCallback, useRef } from 'react'
import { streamChat } from '../api/chat'

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
  const abortRef = useRef<(() => void) | null>(null)

  const send = useCallback(
    (text: string) => {
      if (streaming) return

      // Add user message immediately
      const userMsg: ChatMessage = { id: crypto.randomUUID(), role: 'user', content: text }
      // Placeholder for assistant response
      const assistantId = crypto.randomUUID()
      const assistantMsg: ChatMessage = { id: assistantId, role: 'assistant', content: '' }

      setMessages((prev) => [...prev, userMsg, assistantMsg])
      setStreaming(true)

      abortRef.current = streamChat(projectId, text, conversationId, {
        onMeta: (convId) => setConversationId(convId),
        onToken: (token) => {
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantId ? { ...m, content: m.content + token } : m)),
          )
        },
        onFileReady: (filename, url, label) => {
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantId ? { ...m, fileReady: { filename, url, label } } : m)),
          )
          window.dispatchEvent(new CustomEvent('briefscope:file_ready', { detail: filename }))
        },
        onError: (err) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: `⚠️ Error: ${err}` } : m,
            ),
          )
          setStreaming(false)
        },
        onDone: () => setStreaming(false),
      })
    },
    [projectId, conversationId, streaming],
  )

  const reset = useCallback(() => {
    abortRef.current?.()
    setMessages([])
    setConversationId(undefined)
    setStreaming(false)
  }, [])

  return { messages, streaming, conversationId, send, reset }
}
