import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProjects, useCreateProject } from '../hooks/useProjects'

export default function HomePage() {
  const { data: projects = [], isLoading } = useProjects()
  const createProject = useCreateProject()
  const navigate = useNavigate()
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return
    const proj = await createProject.mutateAsync({ name: newName.trim() })
    setNewName('')
    setCreating(false)
    navigate(`/projects/${proj.id}`)
  }

  const isEmpty = !isLoading && projects.length === 0

  return (
    <div className="flex-1 overflow-y-auto animate-fade-up" style={{ position: 'relative' }}>
      {/* Empty state */}
      {isEmpty && (
        <div
          className="flex flex-col items-center justify-center"
          style={{ minHeight: '100%', padding: '0 24px' }}
        >
          <div style={{ textAlign: 'center', maxWidth: 380 }}>
            <div style={{ fontSize: 40, marginBottom: 16, opacity: 0.5 }}>📁</div>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.3px', marginBottom: 8 }}>
              Sin proyectos todavía
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 28 }}>
              Crea tu primer proyecto para comenzar a analizar documentos.
            </p>

            {creating ? (
              <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <input
                  autoFocus
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Nombre del proyecto…"
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '10px 14px',
                    fontSize: 14,
                    fontFamily: 'inherit',
                    width: '100%',
                    outline: 'none',
                    textAlign: 'center',
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = 'var(--text-dim)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    type="submit"
                    disabled={!newName.trim() || createProject.isPending}
                    style={{
                      flex: 1,
                      background: 'var(--accent)',
                      border: 'none',
                      color: '#fff',
                      borderRadius: 'var(--radius-sm)',
                      padding: '9px 0',
                      fontSize: 13.5,
                      fontFamily: 'inherit',
                      fontWeight: 500,
                      cursor: !newName.trim() ? 'not-allowed' : 'pointer',
                      opacity: !newName.trim() ? 0.5 : 1,
                    }}
                  >
                    {createProject.isPending ? 'Creando…' : 'Crear proyecto'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setCreating(false); setNewName('') }}
                    style={{
                      flex: 1,
                      background: 'transparent',
                      border: '1px solid var(--border)',
                      color: 'var(--text-muted)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '9px 0',
                      fontSize: 13.5,
                      fontFamily: 'inherit',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--text-dim)')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setCreating(true)}
                style={{
                  background: 'var(--accent)',
                  border: 'none',
                  color: '#fff',
                  borderRadius: 'var(--radius-sm)',
                  padding: '10px 28px',
                  fontSize: 14,
                  fontFamily: 'inherit',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                + Nuevo proyecto
              </button>
            )}
          </div>
        </div>
      )}

      {/* Project list */}
      {!isEmpty && (
        <div style={{ maxWidth: 640, margin: '0 auto', padding: '32px 24px' }}>
          <div className="flex items-center justify-between" style={{ marginBottom: 24 }}>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.3px' }}>
                Proyectos
              </h1>
              <p style={{ fontSize: 13, color: 'var(--text-dim)', marginTop: 2 }}>
                {projects.length} proyecto{projects.length !== 1 ? 's' : ''}
              </p>
            </div>
            <button
              onClick={() => setCreating(true)}
              style={{
                background: 'transparent',
                border: '1px solid var(--border)',
                color: 'var(--text-muted)',
                borderRadius: 'var(--radius-sm)',
                padding: '7px 16px',
                fontSize: 13.5,
                fontFamily: 'inherit',
                fontWeight: 500,
                cursor: 'pointer',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--accent)'
                e.currentTarget.style.color = 'var(--text)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border)'
                e.currentTarget.style.color = 'var(--text-muted)'
              }}
            >
              + Nuevo proyecto
            </button>
          </div>

          {isLoading && (
            <p style={{ fontSize: 13, color: 'var(--text-dim)' }}>Cargando…</p>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {projects.map((p) => (
              <button
                key={p.id}
                onClick={() => navigate(`/projects/${p.id}`)}
                className="text-left w-full"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  padding: '14px 18px',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'border-color 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = '#444')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ minWidth: 0 }}>
                    <h2 style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.name}
                    </h2>
                    {p.description && (
                      <p style={{
                        fontSize: 13,
                        color: 'var(--text-muted)',
                        marginTop: 2,
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}>
                        {p.description}
                      </p>
                    )}
                  </div>
                  <div style={{ textAlign: 'right', fontSize: 11, fontFamily: "'DM Mono', monospace", color: 'var(--text-dim)', flexShrink: 0 }}>
                    <p>{p.document_count} doc{p.document_count !== 1 ? 's' : ''}</p>
                    <p>{(p.total_tokens / 1000).toFixed(0)}k tokens</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Modal: create project (when list is visible) */}
      {creating && !isEmpty && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 50,
            background: 'rgba(0,0,0,0.55)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onClick={() => { setCreating(false); setNewName('') }}
        >
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              padding: '28px 28px',
              width: 380,
              maxWidth: '90vw',
            }}
            onClick={e => e.stopPropagation()}
          >
            <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', marginBottom: 18, letterSpacing: '-0.3px' }}>
              Nuevo proyecto
            </h2>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Nombre del proyecto…"
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '9px 12px',
                  fontSize: 14,
                  fontFamily: 'inherit',
                  width: '100%',
                  outline: 'none',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = 'var(--text-dim)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
              />
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <button
                  type="submit"
                  disabled={!newName.trim() || createProject.isPending}
                  style={{
                    flex: 1,
                    background: 'var(--accent)',
                    border: 'none',
                    color: '#fff',
                    borderRadius: 'var(--radius-sm)',
                    padding: '9px 0',
                    fontSize: 13.5,
                    fontFamily: 'inherit',
                    fontWeight: 500,
                    cursor: !newName.trim() ? 'not-allowed' : 'pointer',
                    opacity: !newName.trim() ? 0.5 : 1,
                  }}
                >
                  {createProject.isPending ? 'Creando…' : 'Crear'}
                </button>
                <button
                  type="button"
                  onClick={() => { setCreating(false); setNewName('') }}
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: '1px solid var(--border)',
                    color: 'var(--text-muted)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '9px 0',
                    fontSize: 13.5,
                    fontFamily: 'inherit',
                    cursor: 'pointer',
                  }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
