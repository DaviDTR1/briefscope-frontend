/**
 * SSE streaming chat client.
 *
 * Backend SSE format (per event):
 *   event: <type>\n
 *   data: <payload>\n
 *   \n                   ← blank line ends the message
 *
 * Multi-line data (e.g. newlines inside a token) follow the SSE spec:
 * multiple "data:" lines are joined with \n before dispatching.
 */
declare global {
  interface Window { __ROOT_PATH__: string }
}

const rootPath = () => window.__ROOT_PATH__ || ''

export interface ChatStreamCallbacks {
  onMeta?: (conversationId: number, ragActive: boolean) => void
  onToken: (token: string) => void
  onFileReady?: (filename: string, url: string, label: string) => void
  onError?: (msg: string) => void
  onDone?: () => void
}

function dispatch(
  event: string,
  data: string,
  callbacks: ChatStreamCallbacks,
) {
  switch (event) {
    case 'meta': {
      try {
        const meta = JSON.parse(data)
        callbacks.onMeta?.(meta.conversation_id, meta.rag_active)
      } catch { /* ignore malformed */ }
      break
    }
    case 'token':
      if (data) callbacks.onToken(data)
      break
    case 'file_ready': {
      try {
        const f = JSON.parse(data)
        const url = `${rootPath()}/files/${encodeURIComponent(f.filename)}`
        callbacks.onFileReady?.(f.filename, url, f.formato ?? f.filename)
      } catch { /* ignore */ }
      break
    }
    case 'error':
      callbacks.onError?.(data)
      break
    case 'done':
      callbacks.onDone?.()
      break
  }
}

/**
 * Opens a POST+SSE stream. Returns an abort function.
 */
export function streamChat(
  projectId: number,
  message: string,
  conversationId: number | undefined,
  callbacks: ChatStreamCallbacks,
): () => void {
  const url = `${rootPath()}/projects/${projectId}/chat`
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
      let currentEvent = ''
      let currentDataLines: string[] = []

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })

        // Work through complete lines; leave the last incomplete one in buffer
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const rawLine of lines) {
          // Strip carriage return if server sends \r\n
          const line = rawLine.endsWith('\r') ? rawLine.slice(0, -1) : rawLine

          if (line.startsWith('event: ')) {
            currentEvent = line.slice(7).trim()
          } else if (line.startsWith('data: ')) {
            // SSE spec: accumulate multiple data: lines with \n between them
            currentDataLines.push(line.slice(6))
          } else if (line === '') {
            // Blank line → dispatch accumulated event, then reset
            if (currentEvent) {
              const data = currentDataLines.join('\n')
              dispatch(currentEvent, data, callbacks)
            }
            currentEvent = ''
            currentDataLines = []
          }
          // Lines starting with ':' are SSE comments — ignore
        }
      }

      // Stream ended — dispatch any pending buffered event
      if (currentEvent && currentDataLines.length > 0) {
        dispatch(currentEvent, currentDataLines.join('\n'), callbacks)
      }

      callbacks.onDone?.()
    })
    .catch((err) => {
      if (err.name !== 'AbortError') callbacks.onError?.(String(err))
    })

  return () => controller.abort()
}
