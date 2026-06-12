// Chat uses SSE (Server-Sent Events) — not axios
declare global {
  interface Window { __ROOT_PATH__: string }
}

const rootPath = () => window.__ROOT_PATH__ || ''

export interface ChatStreamCallbacks {
  onMeta?: (conversationId: number, ragUsed: boolean) => void
  onToken: (token: string) => void
  onFileReady?: (filename: string, url: string, label: string) => void
  onError?: (msg: string) => void
  onDone?: () => void
}

/**
 * Opens an SSE stream to POST /projects/{projectId}/chat
 * Returns a cleanup function that closes the connection.
 */
export function streamChat(
  projectId: number,
  message: string,
  conversationId: number | undefined,
  callbacks: ChatStreamCallbacks,
): () => void {
  const url = `${rootPath()}/projects/${projectId}/chat`

  // SSE requires GET, but our API is POST+SSE via fetch streaming
  const controller = new AbortController()

  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
    body: JSON.stringify({ message, conversation_id: conversationId ?? null }),
    signal: controller.signal,
  })
    .then(async (res) => {
      if (!res.ok || !res.body) {
        callbacks.onError?.(`HTTP ${res.status}`)
        return
      }
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const payload = JSON.parse(line.slice(6))
              switch (payload.type) {
                case 'meta':
                  callbacks.onMeta?.(payload.conversation_id, payload.rag_used)
                  break
                case 'token':
                  callbacks.onToken(payload.content)
                  break
                case 'file_ready':
                  callbacks.onFileReady?.(payload.filename, payload.url, payload.label)
                  break
                case 'error':
                  callbacks.onError?.(payload.content)
                  break
                case 'done':
                  callbacks.onDone?.()
                  break
              }
            } catch {
              // ignore malformed lines
            }
          }
        }
      }
      callbacks.onDone?.()
    })
    .catch((err) => {
      if (err.name !== 'AbortError') callbacks.onError?.(String(err))
    })

  return () => controller.abort()
}
