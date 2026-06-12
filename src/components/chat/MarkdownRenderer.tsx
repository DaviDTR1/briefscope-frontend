import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Props {
  content: string
  dim?: boolean
}

export default function MarkdownRenderer({ content, dim }: Props) {
  return (
    <div className={`md-body${dim ? ' md-body--dim' : ''}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>
          ),
          code: ({ children, className }) => {
            const isBlock = className?.startsWith('language-')
            if (isBlock) return <code className={className}>{children}</code>
            return <code className="md-code-inline">{children}</code>
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
