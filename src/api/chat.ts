/**
 * SSE streaming chat client.
 *
 * Backend SSE format (per event):
 *   event: <type>\n
 *   data: <payload>\n
 *   \n
 *
 * Events:
 *   meta      - {conversation_id, rag_active}
 *   thinking  - string describing current agent action ("" = done thinking)
 *   token     - text chunk
 *   file_ready - {filename, formato}
 *   error     - error message
 *   done      - stream complete
 */
declare global {
  interface Window { __ROOT_PATH__: string }
}

const rootPath = () => window.__ROOT_PATH__ || ''

export interface ChatStreamCallbacks {
  onMeta?: (conversationId: number, ragActive: boolean) => void
  onThinking?: (message: string) => void
  onToken: (token: string) => void
  onFileReady?: (filename: string, url: string, label: string) => void
  onError?: (msg: string) => void
  onDone?: () => void
}

function dispatch(event: string, data: string, callbacks: ChatStreamCallbacks, projectId: number) {
  switch (event) {
    case 'meta': {
      try {
        const meta = JSON.parse(data)
        callbacks.onMeta?.(meta.conversation_id, meta.rag_active)
      } catch { /* ignore */ }
      break
    }
    case 'thinking':
      callbacks.onThinking?.(data)
      break
    case 'token':
      if (data) callbacks.onToken(data)
      break
    case 'file_ready': {
      try {
        const f = JSON.parse(data)
        // Bare path only; MessageBubble prepends ROOT_PATH once when rendering.
        // (Prepending it here too produced a doubled prefix → 404.)
        // Scoped by project so a file only downloads from its owning project.
        const url = `/files/${encodeURIComponent(f.filename)}?project_id=${projectId}`
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

export function streamChat(
  projectId: number,
  message: string,
  conversationId: number | undefined,
  callbacks: ChatStreamCallbacks,
  agentContext?: string,
  webSearch?: boolean,
): () => void {
  const url = `${rootPath()}/projects/${projectId}/chat`
  const controller = new AbortController()

  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
    // `agent_context` is an ephemeral note (e.g. an attachment reference) the
    // backend forwards to the agent for this turn only — it is NOT persisted
    // as part of the user's stored/displayed message.
    body: JSON.stringify({
      message,
      conversation_id: conversationId ?? null,
      agent_context: agentContext && agentContext.trim() ? agentContext.trim() : null,
      web_search: webSearch ?? false,
    }),
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
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const rawLine of lines) {
          const line = rawLine.endsWith('\r') ? rawLine.slice(0, -1) : rawLine

          if (line.startsWith('event: ')) {
            currentEvent = line.slice(7).trim()
          } else if (line.startsWith('data: ')) {
            currentDataLines.push(line.slice(6))
          } else if (line === '') {
            if (currentEvent) {
              dispatch(currentEvent, currentDataLines.join('\n'), callbacks, projectId)
            }
            currentEvent = ''
            currentDataLines = []
          }
        }
      }

      if (currentEvent && currentDataLines.length > 0) {
        dispatch(currentEvent, currentDataLines.join('\n'), callbacks, projectId)
      }

      callbacks.onDone?.()
    })
    .catch((err) => {
      if (err.name !== 'AbortError') callbacks.onError?.(String(err))
    })

  return () => controller.abort()
}
