import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useProjects, useCreateProject, useDeleteProject } from '../../hooks/useProjects'

export default function Sidebar() {
  const { data: projects = [], isLoading } = useProjects()
  const createProject = useCreateProject()
  const deleteProject = useDeleteProject()
  const navigate = useNavigate()
  const [modalOpen, setModalOpen] = useState(false)
  const [newName, setNewName] = useState('')

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return
    const proj = await createProject.mutateAsync({ name: newName.trim() })
    setNewName('')
    setModalOpen(false)
    navigate(`/projects/${proj.id}`)
  }

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm('¿Eliminar este proyecto?')) return
    await deleteProject.mutateAsync(id)
    navigate('/')
  }

  return (
    <>
      <aside
        className="flex flex-col h-full w-56 shrink-0"
        style={{ background: 'var(--bg-card)', borderRight: '1px solid var(--border-subtle)' }}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-2.5 px-5 h-[60px] shrink-0"
          style={{ borderBottom: '1px solid var(--border-subtle)' }}
        >
          <span style={{ fontWeight: 600, fontSize: 15, letterSpacing: '-0.3px', color: 'var(--text)' }}>
            Brief<span style={{ color: 'var(--accent)' }}>Scope</span>
          </span>
        </div>

        {/* Project list */}
        <nav className="flex-1 overflow-y-auto py-2 px-2">
          {isLoading && (
            <p style={{ fontSize: 12, color: 'var(--text-dim)', padding: '8px 10px' }}>Cargando…</p>
          )}
          {projects.map((p) => (
            <NavLink
              key={p.id}
              to={`/projects/${p.id}`}
              className="group flex items-center justify-between px-3 py-2 rounded-[7px] mb-0.5 transition-colors"
              style={({ isActive }) => ({
                background: isActive ? 'var(--surface)' : 'transparent',
                color: isActive ? 'var(--text)' : 'var(--text-muted)',
                fontSize: 13.5,
                fontWeight: isActive ? 500 : 400,
              })}
            >
              <span className="truncate">{p.name}</span>
              <button
                onClick={(e) => handleDelete(e, p.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity ml-1 shrink-0"
                style={{ fontSize: 11, color: 'var(--text-dim)', background: 'none', border: 'none' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-dim)')}
              >
                ✕
              </button>
            </NavLink>
          ))}
          {!isLoading && projects.length === 0 && (
            <p style={{ fontSize: 12, color: 'var(--text-dim)', padding: '8px 10px' }}>
              Sin proyectos
            </p>
          )}
        </nav>

        {/* New project button */}
        <div className="p-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <button
            onClick={() => setModalOpen(true)}
            className="w-full transition-colors"
            style={{
              background: 'transparent',
              border: '1px solid var(--border)',
              color: 'var(--text-muted)',
              borderRadius: 7,
              padding: '7px 0',
              fontSize: 13,
              fontFamily: 'inherit',
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

        {/* Settings */}
        <div className="px-3 pb-3">
          <NavLink
            to="/settings"
            style={({ isActive }) => ({
              display: 'block',
              textAlign: 'center',
              fontSize: 12,
              fontFamily: "'DM Mono', monospace",
              color: isActive ? 'var(--text-muted)' : 'var(--text-dim)',
              padding: '6px 0',
              letterSpacing: '0.02em',
            })}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-muted)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-dim)')}
          >
            ⚙ Configuración
          </NavLink>
        </div>
      </aside>

      {/* Modal — centered new project form */}
      {modalOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 50,
            background: 'rgba(0,0,0,0.55)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onClick={() => { setModalOpen(false); setNewName('') }}
        >
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              padding: '28px',
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
                  onClick={() => { setModalOpen(false); setNewName('') }}
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
          </div>
        </div>
      )}
    </>
  )
}
