import { useCallback, useEffect, useSyncExternalStore } from 'react'
import { useTranslation } from '../i18n'
import {
  subscribe,
  getSnapshot,
  loadHistory,
  sendMessage,
  resetChat,
} from '../stores/chatStore'

// Re-exported so existing imports (e.g. MessageBubble) keep working.
export type { ChatMessage, FileReady } from '../stores/chatStore'

/**
 * Thin subscriber over the global chatStore. Chat state lives in the store
 * (keyed by projectId) so a stream survives project switches; this hook just
 * exposes the active project's slice and the send/reset actions.
 */
export function useChat(projectId: number) {
  const { t } = useTranslation()

  const subscribeFn = useCallback((cb: () => void) => subscribe(projectId, cb), [projectId])
  const snapshotFn = useCallback(() => getSnapshot(projectId), [projectId])
  const state = useSyncExternalStore(subscribeFn, snapshotFn)

  useEffect(() => {
    loadHistory(projectId)
  }, [projectId])

  const send = useCallback(
    (text: string) => sendMessage(projectId, text, t('chat.analyzing')),
    [projectId, t],
  )

  const reset = useCallback(() => resetChat(projectId), [projectId])

  return {
    messages: state.messages,
    streaming: state.streaming,
    thinkingMessage: state.thinkingMessage,
    loadingHistory: state.loadingHistory,
    conversationId: state.conversationId,
    send,
    reset,
  }
}
