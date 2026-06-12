import type { ChatMessage } from '../../hooks/useChat'
import MarkdownRenderer from './MarkdownRenderer'

declare global { interface Window { __ROOT_PATH__: string } }

interface Props { msg: ChatMessage; streaming?: boolean }

export default function MessageBubble({ msg, streaming }: Props) {
  const isUser     = msg.role === 'user'
  const rootPath   = window.__ROOT_PATH__ || ''
  const hasContent = msg.content.trim() !== ''
  const hasFiles   = (msg.filesReady?.length ?? 0) > 0
  // Show bubble: user always; assistant when there's text or actively streaming without files yet
  const showBubble = isUser || hasContent || (streaming && !hasFiles)

  if (!showBubble && !hasFiles) return null

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3 animate-fade-up`}>
      {/* Avatar — assistant only */}
      {!isUser && (showBubble || hasFiles) && (
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
        {/* Text bubble */}
        {showBubble && (
          <div
            className="px-4 py-2.5 text-sm leading-relaxed"
            style={{
              background: isUser ? 'var(--surface)' : 'var(--bg-card)',
              border: `1px solid ${isUser ? 'var(--border)' : 'var(--border-subtle)'}`,
              borderRadius: isUser ? '10px 10px 4px 10px' : '10px 10px 10px 4px',
              color: 'var(--text)',
            }}
          >
            {hasContent ? (
              <MarkdownRenderer content={msg.content} dim={isUser} />
            ) : null}
            {streaming && msg.role === 'assistant' && !hasFiles && (
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
        )}

        {/* File cards — one per generated file */}
        {msg.filesReady?.map((f, i) => (
          <a
            key={f.filename}
            href={`${rootPath}${f.url}`}
            download={f.filename}
            style={{
              marginTop: i === 0 && showBubble ? 6 : i === 0 ? 0 : 6,
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              textDecoration: 'none',
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
          >
            <span style={{ fontSize: 18 }}>📄</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500, margin: 0 }}>
                {f.label.toUpperCase()}
              </p>
              <p style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: "'DM Mono', monospace", margin: 0 }}>
                {f.filename}
              </p>
            </div>
            <span style={{ fontSize: 12, color: 'var(--accent)', fontFamily: "'DM Mono', monospace" }}>
              ↓
            </span>
          </a>
        ))}
      </div>
    </div>
  )
}
