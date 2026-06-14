import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useTranslation, type Lang } from '../../i18n'
import { useProjects, useCreateProject, useDeleteProject } from '../../hooks/useProjects'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog'

interface PendingDeleteProject { id: number; name: string }

export default function Sidebar() {
  const { t, lang, setLang } = useTranslation()
  const { data: projects = [], isLoading } = useProjects()
  const createProject = useCreateProject()
  const deleteProject = useDeleteProject()
  const navigate = useNavigate()
  const [modalOpen, setModalOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [pendingDelete, setPendingDelete] = useState<PendingDeleteProject | null>(null)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return
    const proj = await createProject.mutateAsync({ name: newName.trim() })
    setNewName('')
    setModalOpen(false)
    navigate(`/projects/${proj.id}`)
  }

  const handleDeleteClick = (e: React.MouseEvent, id: number, name: string) => {
    e.preventDefault()
    e.stopPropagation()
    setPendingDelete({ id, name })
  }

  const confirmDelete = async () => {
    if (!pendingDelete) return
    const id = pendingDelete.id
    setPendingDelete(null)
    await deleteProject.mutateAsync(id)
    navigate('/')
  }

  const closeModal = () => { setModalOpen(false); setNewName('') }

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
          <span className="font-semibold text-[15px] tracking-[-0.3px] text-text">
            Brief<span style={{ color: 'var(--accent)' }}>Scope</span>
          </span>
        </div>

        {/* Project list */}
        <nav className="flex-1 overflow-y-auto py-2 px-2">
          {isLoading && (
            <p className="text-[12px] text-text-dim px-2.5 py-2">{t('common.loading')}</p>
          )}
          {projects.map((p) => (
            <NavLink
              key={p.id}
              to={`/projects/${p.id}`}
              className="group flex items-center justify-between px-3 py-2 rounded-sm mb-0.5 transition-colors"
              style={({ isActive }) => ({
                background: isActive ? 'var(--surface)' : 'transparent',
                color: isActive ? 'var(--text)' : 'var(--text-muted)',
                fontSize: 13.5,
                fontWeight: isActive ? 500 : 400,
              })}
            >
              <span className="truncate">{p.name}</span>
              <Button
                variant="danger"
                size="icon"
                className="opacity-0 group-hover:opacity-100 transition-opacity ml-1 h-5 w-5 text-[11px]"
                onClick={(e) => handleDeleteClick(e, p.id, p.name)}
              >
                ✕
              </Button>
            </NavLink>
          ))}
          {!isLoading && projects.length === 0 && (
            <p className="text-[12px] text-text-dim px-2.5 py-2">{t('project.none')}</p>
          )}
        </nav>

        {/* New project button */}
        <div className="p-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <Button
            variant="outline"
            className="w-full text-[13px]"
            onClick={() => setModalOpen(true)}
          >
            {t('project.new')}
          </Button>
        </div>

        {/* Language switcher */}
        <div className="px-3 flex items-center justify-center gap-1">
          {(['es', 'en'] as Lang[]).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className="text-[11px] font-mono px-1.5 py-0.5 rounded-sm transition-colors"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
                color: lang === l ? 'var(--text)' : 'var(--text-dim)',
                fontWeight: lang === l ? 600 : 400,
              }}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Settings link */}
        <div className="px-3 pb-3">
          <NavLink
            to="/settings"
            className="block text-center text-[12px] font-mono text-text-dim py-1.5 tracking-[0.02em] hover:text-text-muted transition-colors"
          >
            ⚙ {t('settings.title')}
          </NavLink>
        </div>
      </aside>

      {/* Delete project confirmation dialog */}
      <Dialog open={!!pendingDelete} onOpenChange={(open) => { if (!open) setPendingDelete(null) }}>
        <DialogContent showClose={false}>
          <DialogHeader>
            <DialogTitle>{t('project.deleteTitle')}</DialogTitle>
          </DialogHeader>
          <p className="text-[13px] text-text-dim leading-relaxed">
            {t('project.deleteConfirm', { name: `"${pendingDelete?.name ?? ''}"` })}
            {' '}{t('project.deleteWarning')}
          </p>
          <DialogFooter className="mt-5">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setPendingDelete(null)}
            >
              {t('common.cancel')}
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={confirmDelete}
              disabled={deleteProject.isPending}
            >
              {deleteProject.isPending ? t('common.deleting') : t('common.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New project modal */}
      <Dialog open={modalOpen} onOpenChange={(open) => { if (!open) closeModal() }}>
        <DialogContent showClose={false}>
          <DialogHeader>
            <DialogTitle>{t('project.newTitle')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate}>
            <Input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder={t('project.namePlaceholder')}
              className="text-[14px] py-[9px] mb-1"
            />
            <DialogFooter>
              <Button type="submit" size="full" disabled={!newName.trim() || createProject.isPending}>
                {createProject.isPending ? t('common.creating') : t('common.create')}
              </Button>
              <Button type="button" variant="outline" size="full" onClick={closeModal}>
                {t('common.cancel')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
