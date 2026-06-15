/**
 * Global chat store keyed by projectId.
 *
 * Chat state used to live inside the per-project `useChat` hook, so switching
 * projects mid-stream aborted the request and discarded the in-progress
 * assistant message. Lifting the state here means:
 *
 *   - each project keeps its own messages / streaming / thinking state,
 *   - a stream started in project A keeps running (and updating the store)
 *     while the user looks at project B,
 *   - returning to project A shows whatever arrived in the meantime — no reload.
 *
 * Components read a project's slice through `useSyncExternalStore`; the SSE
 * callbacks write into the store by (projectId, assistantId), never through a
 * React closure that could be torn down on a project switch.
 */
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

export interface ProjectChat {
  messages: ChatMessage[]
  conversationId?: number
  streaming: boolean
  thinkingMessage: string | null
  loadingHistory: boolean
  historyLoaded: boolean
  activeAssistantId?: string
  abort?: () => void
}

/** Stable empty slice for projects not yet visited. Frozen so it is never
 *  mutated in place — `useSyncExternalStore` relies on reference stability. */
const EMPTY: ProjectChat = Object.freeze({
  messages: [],
  conversationId: undefined,
  streaming: false,
  thinkingMessage: null,
  loadingHistory: true,
  historyLoaded: false,
})

const store = new Map<number, ProjectChat>()
const listeners = new Map<number, Set<() => void>>()

function notify(projectId: number) {
  listeners.get(projectId)?.forEach((cb) => cb())
}

function update(projectId: number, updater: (s: ProjectChat) => ProjectChat) {
  const current = store.get(projectId) ?? EMPTY
  store.set(projectId, updater(current))
  notify(projectId)
}

export function subscribe(projectId: number, cb: () => void): () => void {
  let set = listeners.get(projectId)
  if (!set) {
    set = new Set()
    listeners.set(projectId, set)
  }
  set.add(cb)
  return () => {
    set!.delete(cb)
  }
}

export function getSnapshot(projectId: number): ProjectChat {
  return store.get(projectId) ?? EMPTY
}

/** Reparse generated-file markers stored in the DB back into filesReady.
 *  Matches both the legacy "[Archivo generado: ...]" and "[Generated file: ...]". */
function parseAssistantContent(
  content: string,
  projectId: number,
): { cleanContent: string; filesReady?: FileReady[] } {
  const pattern = /\[(?:Archivo generado|Generated file):\s*([^\]]+)\]/g
  const filesReady: FileReady[] = []

  const cleanContent = content
    .replace(pattern, (_, filename) => {
      filename = filename.trim()
      const ext = filename.split('.').pop()?.toUpperCase() ?? 'FILE'
      filesReady.push({
        filename,
        url: `/files/${encodeURIComponent(filename)}?project_id=${projectId}`,
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

/** Load the latest conversation for a project, once. Skips reloading if the
 *  project already has messages, an in-flight stream, or loaded history — so a
 *  background stream is never wiped by a late history fetch. */
export async function loadHistory(projectId: number): Promise<void> {
  const cur = store.get(projectId)
  if (cur && (cur.historyLoaded || cur.streaming || cur.messages.length > 0)) {
    return
  }

  update(projectId, (s) => ({ ...s, loadingHistory: true }))

  try {
    const convs = await getConversations(projectId)
    // Re-check: a stream may have started while we were awaiting.
    const now = store.get(projectId)
    if (now && (now.streaming || now.messages.length > 0)) {
      update(projectId, (s) => ({ ...s, loadingHistory: false, historyLoaded: true }))
      return
    }
    if (convs.length === 0) {
      update(projectId, (s) => ({ ...s, loadingHistory: false, historyLoaded: true }))
      return
    }

    const latest = convs[0]
    const detail = await getConversation(projectId, latest.id)
    const after = store.get(projectId)
    if (after && (after.streaming || after.messages.length > 0)) {
      update(projectId, (s) => ({ ...s, loadingHistory: false, historyLoaded: true }))
      return
    }

    const loaded: ChatMessage[] = detail.messages.map((m) => {
      if (
        m.role === 'assistant' &&
        (m.content.includes('[Archivo generado:') || m.content.includes('[Generated file:'))
      ) {
        const { cleanContent, filesReady } = parseAssistantContent(m.content, projectId)
        return { id: `server-${m.id}`, role: 'assistant' as const, content: cleanContent, filesReady }
      }
      return { id: `server-${m.id}`, role: m.role as 'user' | 'assistant', content: m.content }
    })

    update(projectId, (s) => ({
      ...s,
      messages: loaded,
      conversationId: latest.id,
      loadingHistory: false,
      historyLoaded: true,
    }))
  } catch {
    // No conversations yet — start fresh.
    update(projectId, (s) => ({ ...s, loadingHistory: false, historyLoaded: true }))
  }
}

/** Start a streaming turn for a project. The stream keeps running and updating
 *  the store regardless of which project is currently on screen. */
export function sendMessage(projectId: number, text: string, analyzingLabel: string): void {
  const cur = store.get(projectId) ?? EMPTY
  if (cur.streaming) return

  const userMsg: ChatMessage = { id: crypto.randomUUID(), role: 'user', content: text }
  const assistantId = crypto.randomUUID()
  const assistantMsg: ChatMessage = { id: assistantId, role: 'assistant', content: '' }

  update(projectId, (s) => ({
    ...s,
    messages: [...s.messages, userMsg, assistantMsg],
    streaming: true,
    thinkingMessage: analyzingLabel,
    historyLoaded: true,
    activeAssistantId: assistantId,
  }))

  const conversationId = store.get(projectId)?.conversationId

  const abort = streamChat(projectId, text, conversationId, {
    onMeta: (convId) => update(projectId, (s) => ({ ...s, conversationId: convId })),

    onThinking: (msg) =>
      update(projectId, (s) => ({ ...s, thinkingMessage: msg || null })),

    onToken: (token) =>
      update(projectId, (s) => ({
        ...s,
        thinkingMessage: null,
        messages: s.messages.map((m) =>
          m.id === assistantId ? { ...m, content: m.content + token } : m,
        ),
      })),

    onFileReady: (filename, url, label) => {
      update(projectId, (s) => ({
        ...s,
        thinkingMessage: null,
        messages: s.messages.map((m) =>
          m.id === assistantId
            ? { ...m, filesReady: [...(m.filesReady ?? []), { filename, url, label }] }
            : m,
        ),
      }))
      window.dispatchEvent(new CustomEvent('briefscope:file_ready', { detail: filename }))
    },

    onError: (err) =>
      update(projectId, (s) => ({
        ...s,
        thinkingMessage: null,
        streaming: false,
        abort: undefined,
        messages: s.messages.map((m) =>
          m.id === assistantId ? { ...m, content: `⚠️ ${err}` } : m,
        ),
      })),

    onDone: () =>
      update(projectId, (s) => ({
        ...s,
        thinkingMessage: null,
        streaming: false,
        abort: undefined,
      })),
  })

  update(projectId, (s) => ({ ...s, abort }))
}

/** Abort any running stream and clear the project's chat (start a new one). */
export function resetChat(projectId: number): void {
  store.get(projectId)?.abort?.()
  update(projectId, () => ({
    messages: [],
    conversationId: undefined,
    streaming: false,
    thinkingMessage: null,
    loadingHistory: false,
    historyLoaded: true,
  }))
}
