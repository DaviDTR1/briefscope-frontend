/**
 * ThinkingIndicator
 *
 * Animated pill that shows what the AI agent is currently doing.
 * Appears when `message` is non-null, disappears when null.
 */
interface Props {
  message: string
}

export default function ThinkingIndicator({ message }: Props) {
  return (
    <div
      className="flex items-center gap-2.5 mb-3 animate-fade-up"
      style={{ paddingLeft: 32 }}   /* align with assistant avatar */
    >
      {/* Pulsing orb */}
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: 'var(--accent)',
          animation: 'thinking-pulse 1.4s ease-in-out infinite',
          flexShrink: 0,
        }}
      />

      {/* Action label */}
      <span
        style={{
          fontSize: 12,
          color: 'var(--text-dim)',
          fontFamily: "'DM Mono', monospace",
          letterSpacing: '0.02em',
          animation: 'thinking-fade 1.4s ease-in-out infinite',
        }}
      >
        {message}
      </span>

      {/* Dot trail */}
      <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{
              width: 3,
              height: 3,
              borderRadius: '50%',
              background: 'var(--text-dim)',
              display: 'inline-block',
              animation: `thinking-dot 1.2s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>
    </div>
  )
}
