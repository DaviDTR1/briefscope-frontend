import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useProject } from '../hooks/useProjects'
import DocumentPanel from '../components/documents/DocumentPanel'
import ChatPanel from '../components/chat/ChatPanel'

export default function ProjectPage() {
  const { id } = useParams<{ id: string }>()
  const projectId = Number(id)
  const { data: project, isLoading } = useProject(projectId)
  const [docsOpen, setDocsOpen] = useState(true)

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ color: 'var(--text-dim)', fontSize: 13 }}>
        Cargando proyecto…
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ color: 'var(--text-dim)', fontSize: 13 }}>
        Proyecto no encontrado
      </div>
    )
  }

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Chat — takes remaining space */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <ChatPanel projectId={projectId} projectName={project.name} />
      </div>

      {/* Toggle tab — always visible on the right edge of chat */}
      <button
        onClick={() => setDocsOpen((o) => !o)}
        title={docsOpen ? 'Ocultar documentos' : 'Mostrar documentos'}
        style={{
          width: 22,
          flexShrink: 0,
          background: 'var(--bg-card)',
          border: 'none',
          borderLeft: '1px solid var(--border-subtle)',
          color: 'var(--text-dim)',
          fontSize: 11,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background 0.15s, color 0.15s',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'var(--surface)'
          e.currentTarget.style.color = 'var(--text-muted)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'var(--bg-card)'
          e.currentTarget.style.color = 'var(--text-dim)'
        }}
      >
        {docsOpen ? '›' : '‹'}
      </button>

      {/* Documents panel — right side */}
      <div
        style={{
          width: docsOpen ? 280 : 0,
          overflow: 'hidden',
          transition: 'width 0.22s ease',
          flexShrink: 0,
          borderLeft: docsOpen ? '1px solid var(--border-subtle)' : 'none',
        }}
      >
        {docsOpen && <DocumentPanel projectId={projectId} />}
      </div>
    </div>
  )
}
