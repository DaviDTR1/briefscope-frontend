import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProjects, useCreateProject } from '../hooks/useProjects'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../components/ui/dialog'

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

  const closeModal = () => { setCreating(false); setNewName('') }

  const isEmpty = !isLoading && projects.length === 0

  return (
    <div className="flex-1 overflow-y-auto animate-fade-up relative">
      {/* ── Empty state ──────────────────────────────────────────────── */}
      {isEmpty && (
        <div className="flex flex-col items-center justify-center min-h-full px-6">
          <div className="text-center max-w-[380px]">
            <div className="text-[40px] mb-4 opacity-50">📁</div>
            <h2 className="text-[18px] font-semibold text-text tracking-[-0.3px] mb-2">
              Sin proyectos todavía
            </h2>
            <p className="text-[13px] text-text-dim mb-7">
              Crea tu primer proyecto para comenzar a analizar documentos.
            </p>

            {creating ? (
              <form onSubmit={handleCreate} className="flex flex-col gap-2.5">
                <Input
                  autoFocus
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Nombre del proyecto…"
                  className="text-center text-[14px] py-2.5"
                />
                <div className="flex gap-2">
                  <Button type="submit" size="full" disabled={!newName.trim() || createProject.isPending}>
                    {createProject.isPending ? 'Creando…' : 'Crear proyecto'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="full"
                    onClick={() => { setCreating(false); setNewName('') }}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            ) : (
              <Button size="lg" onClick={() => setCreating(true)}>
                + Nuevo proyecto
              </Button>
            )}
          </div>
        </div>
      )}

      {/* ── Project list ─────────────────────────────────────────────── */}
      {!isEmpty && (
        <div style={{ maxWidth: 640, margin: '0 auto', padding: '32px 24px' }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-[20px] font-semibold text-text tracking-[-0.3px]">Proyectos</h1>
              <p className="text-[13px] text-text-dim mt-0.5">
                {projects.length} proyecto{projects.length !== 1 ? 's' : ''}
              </p>
            </div>
            <Button variant="outline" onClick={() => setCreating(true)}>
              + Nuevo proyecto
            </Button>
          </div>

          {isLoading && <p className="text-[13px] text-text-dim">Cargando…</p>}

          <div className="flex flex-col gap-2">
            {projects.map((p) => (
              <button
                key={p.id}
                onClick={() => navigate(`/projects/${p.id}`)}
                className="text-left w-full border border-border rounded-queai px-[18px] py-3.5 cursor-pointer transition-colors hover:border-[#444]"
                style={{ background: 'var(--bg-card)', fontFamily: 'inherit' }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="text-[14px] font-medium text-text truncate">{p.name}</h2>
                    {p.description && (
                      <p className="text-[13px] text-text-muted mt-0.5 line-clamp-2">
                        {p.description}
                      </p>
                    )}
                  </div>
                  <div className="text-right text-[11px] font-mono text-text-dim shrink-0">
                    <p>{p.document_count} doc{p.document_count !== 1 ? 's' : ''}</p>
                    <p>{(p.total_tokens / 1000).toFixed(0)}k tokens</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── New project modal (when list is visible) ──────────────────── */}
      <Dialog open={creating && !isEmpty} onOpenChange={(open) => { if (!open) closeModal() }}>
        <DialogContent showClose={false}>
          <DialogHeader>
            <DialogTitle>Nuevo proyecto</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate}>
            <Input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Nombre del proyecto…"
              className="text-[14px] py-[9px] mb-1"
            />
            <DialogFooter>
              <Button type="submit" size="full" disabled={!newName.trim() || createProject.isPending}>
                {createProject.isPending ? 'Creando…' : 'Crear'}
              </Button>
              <Button type="button" variant="outline" size="full" onClick={closeModal}>
                Cancelar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
