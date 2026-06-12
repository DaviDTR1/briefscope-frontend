import type { ChatMessage } from '../../hooks/useChat'

declare global { interface Window { __ROOT_PATH__: string } }

interface Props { msg: ChatMessage; streaming?: boolean }

export default function MessageBubble({ msg, streaming }: Props) {
  const isUser = msg.role === 'user'
  const rootPath = window.__ROOT_PATH__ || ''

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3 animate-fade-up`}>
      {/* Avatar — solo para assistant */}
      {!isUser && (
        <div
          className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center mr-2 mt-0.5"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            fontSize: 11,
            color: 'var(--text-dim)',
          }}
        >
          B
        </div>
      )}

      <div style={{ maxWidth: '78%' }}>
        <div
          className="px-4 py-2.5 text-sm whitespace-pre-wrap leading-relaxed"
          style={{
            background: isUser ? 'var(--surface)' : 'var(--bg-card)',
            border: `1px solid ${isUser ? 'var(--border)' : 'var(--border-subtle)'}`,
            borderRadius: isUser ? '10px 10px 4px 10px' : '10px 10px 10px 4px',
            color: 'var(--text)',
            fontSize: 14,
          }}
        >
          {msg.content}
          {streaming && msg.role === 'assistant' && (
            <span
              className="inline-block ml-0.5 align-middle"
              style={{
                width: 6,
                height: 14,
                background: 'var(--text-dim)',
                borderRadius: 1,
                animation: 'spin 1s steps(2) infinite',
                opacity: 0.7,
              }}
            />
          )}
        </div>

        {/* File ready card */}
        {msg.fileReady && (
          <a
            href={`${rootPath}${msg.fileReady.url}`}
            download={msg.fileReady.filename}
            className="mt-1.5 flex items-center gap-3 transition-colors"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              padding: '10px 14px',
              display: 'flex',
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
          >
            <span style={{ fontSize: 18 }}>📄</span>
            <div className="flex-1 min-w-0">
              <p style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500 }}>
                {msg.fileReady.label}
              </p>
              <p style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: "'DM Mono', monospace" }}>
                {msg.fileReady.filename}
              </p>
            </div>
            <span style={{ fontSize: 12, color: 'var(--accent)', fontFamily: "'DM Mono', monospace" }}>
              ↓
            </span>
          </a>
        )}
      </div>
    </div>
  )
}
