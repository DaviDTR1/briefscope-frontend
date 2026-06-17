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
    (text: string, attachments?: string[], webSearch?: boolean) => {
      // Build an ephemeral note referencing freshly attached documents. It is
      // sent to the agent for this turn only and is never stored as part of the
      // user's message in the conversation history.
      const agentContext =
        attachments && attachments.length > 0
          ? t('chat.attachedRef', { files: attachments.join(', ') })
          : undefined
      sendMessage(projectId, text, t('chat.analyzing'), agentContext, webSearch)
    },
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
