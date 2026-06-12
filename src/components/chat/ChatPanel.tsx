import { useEffect, useRef } from 'react'
import { useChat } from '../../hooks/useChat'
import { useConfig } from '../../hooks/useConfig'
import MessageBubble from './MessageBubble'
import ThinkingIndicator from './ThinkingIndicator'
import ChatInput from './ChatInput'
import { Button } from '../ui/button'
import { RotateCcw } from '../ui/icons'

interface Props {
  projectId: number
  projectName: string
}

const PROVIDER_LABELS: Record<string, string> = {
  anthropic: 'Claude',
  openai:    'OpenAI',
  google:    'Gemini',
}

function shortModel(model: string) {
  return model
    .replace(/^claude-/, '')
    .replace(/^gpt-/, 'GPT-')
    .replace(/^gemini-/, '')
    .replace(/-(\d{8})$/, '')
    .replace(/-preview.*$/, '')
    .replace(/-/g, ' ')
}

export default function ChatPanel({ projectId, projectName }: Props) {
  const { messages, streaming, thinkingMessage, loadingHistory, send, reset } = useChat(projectId)
  const { data: config } = useConfig()
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, thinkingMessage])

  const providerLabel = config ? (PROVIDER_LABELS[config.cloud_provider] ?? config.cloud_provider) : null
  const modelLabel    = config ? shortModel(config.cloud_model) : null

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 h-[52px] shrink-0"
        style={{ borderBottom: '1px solid var(--border-subtle)' }}
      >
        <span className="text-[13.5px] font-medium text-text">{projectName}</span>

        <div className="flex items-center gap-4">
          {config && (
            <div
              className="flex items-center gap-1.5 text-[11.5px] font-mono text-text-dim rounded-sm px-2.5 py-[3px] select-none"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
              title={`${config.cloud_provider} / ${config.cloud_model}`}
            >
              <span className="text-text-muted">{providerLabel}</span>
              <span style={{ color: 'var(--border)', margin: '0 1px' }}>·</span>
              <span>{modelLabel}</span>
            </div>
          )}

          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={reset}
              title="Borra la conversación actual y comienza desde cero"
              className="gap-1.5 px-0"
            >
              <RotateCcw className="h-3 w-3" />
              Reiniciar conversación
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-5">
        {loadingHistory && (
          <div className="flex items-center justify-center h-full text-text-dim text-[13px]">
            Cargando conversación…
          </div>
        )}
        {!loadingHistory && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-text-dim text-center">
            <span className="text-[36px]">🔍</span>
            <p className="text-[13.5px]">Haz una pregunta sobre tus documentos</p>
            <p className="text-[12px] font-mono text-text-dim">
              Enter para enviar · Shift+Enter para nueva línea
            </p>
          </div>
        )}

        {messages.map((msg, i) => {
          const isCurrentAssistant = streaming && i === messages.length - 1 && msg.role === 'assistant'
          // While thinking indicator is active and no content yet — skip rendering the bubble
          // (ThinkingIndicator renders below and serves as the visual placeholder)
          if (isCurrentAssistant && thinkingMessage && !msg.content.trim() && !msg.filesReady?.length) {
            return null
          }
          return (
            <MessageBubble
              key={msg.id}
              msg={msg}
              streaming={isCurrentAssistant}
            />
          )
        })}

        {/* Thinking indicator — agent is working, no content yet */}
        {thinkingMessage && streaming && (
          <ThinkingIndicator message={thinkingMessage} />
        )}

        <div ref={bottomRef} />
      </div>

      <ChatInput onSend={send} disabled={streaming} />
    </div>
  )
}
