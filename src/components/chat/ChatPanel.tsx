import { useEffect, useRef } from 'react'
import { useChat } from '../../hooks/useChat'
import MessageBubble from './MessageBubble'
import ChatInput from './ChatInput'

interface Props {
  projectId: number
  projectName: string
}

export default function ChatPanel({ projectId, projectName }: Props) {
  const { messages, streaming, send, reset } = useChat(projectId)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 h-[52px] shrink-0"
        style={{ borderBottom: '1px solid var(--border-subtle)' }}
      >
        <span style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text)' }}>
          {projectName}
        </span>
        {messages.length > 0 && (
          <button
            onClick={reset}
            style={{
              fontSize: 12,
              color: 'var(--text-dim)',
              background: 'none',
              border: 'none',
              fontFamily: 'inherit',
              cursor: 'pointer',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-muted)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-dim)')}
          >
            + Nueva conversación
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-5">
        {messages.length === 0 && (
          <div
            className="flex flex-col items-center justify-center h-full gap-3"
            style={{ color: 'var(--text-dim)', textAlign: 'center' }}
          >
            <span style={{ fontSize: 36 }}>🔍</span>
            <p style={{ fontSize: 13.5 }}>Haz una pregunta sobre tus documentos</p>
            <p style={{ fontSize: 12, fontFamily: "'DM Mono', monospace", color: 'var(--text-dim)' }}>
              Enter para enviar · Shift+Enter para nueva línea
            </p>
          </div>
        )}
        {messages.map((msg, i) => (
          <MessageBubble
            key={msg.id}
            msg={msg}
            streaming={streaming && i === messages.length - 1 && msg.role === 'assistant'}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      <ChatInput onSend={send} disabled={streaming} />
    </div>
  )
}
