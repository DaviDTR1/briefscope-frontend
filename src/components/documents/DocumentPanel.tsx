import { useRef, useState } from 'react'
import { useDocuments, useUploadDocument, useDeleteDocument } from '../../hooks/useDocuments'
import { api } from '../../api/client'
import { Button } from '../ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog'
import { cn } from '../../lib/utils'

interface Props { projectId: number }

type Tab = 'docs' | 'files'

function fileIcon(name: string) {
  const ext = name.split('.').pop()?.toLowerCase()
  if (ext === 'pdf')            return '📄'
  if (ext === 'xlsx' || ext === 'csv') return '📊'
  if (ext === 'docx' || ext === 'doc') return '📝'
  if (ext === 'md')             return '📋'
  return '📃'
}

function fmtTokens(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k tk` : `${n} tk`
}

interface PendingDelete { id: number; filename: string }

export default function DocumentPanel({ projectId }: Props) {
  const { data: docs = [], isLoading } = useDocuments(projectId)
  const upload = useUploadDocument(projectId)
  const remove = useDeleteDocument(projectId)
  const inputRef = useRef<HTMLInputElement>(null)
  const [tab, setTab] = useState<Tab>('docs')
  const [generatedFiles, setGeneratedFiles] = useState<string[]>([])
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null)

  // Listen for file_ready events from chat
  useState(() => {
    const handler = (e: Event) => {
      const filename = (e as CustomEvent<string>).detail
      setGeneratedFiles(prev => prev.includes(filename) ? prev : [filename, ...prev])
      setTab('files')
    }
    window.addEventListener('briefscope:file_ready', handler)
    return () => window.removeEventListener('briefscope:file_ready', handler)
  })

  const handleFiles = (files: FileList | null) => {
    if (!files) return
    Array.from(files).forEach((f) => upload.mutate(f))
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    handleFiles(e.dataTransfer.files)
  }

  const confirmDelete = async () => {
    if (!pendingDelete) return
    setPendingDelete(null)
    setDeletingId(pendingDelete.id)
    try {
      await remove.mutateAsync(pendingDelete.id)
    } finally {
      setDeletingId(null)
    }
  }

  const handleDownload = (filename: string) => {
    const base = api.defaults.baseURL ?? ''
    const a = document.createElement('a')
    a.href = `${base}/files/${encodeURIComponent(filename)}`
    a.download = filename
    a.click()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-card)', width: 280, minWidth: 280 }}>
      {/* ── Tabs ─────────────────────────────────────────────────── */}
      <div className="flex px-4" style={{ borderBottom: '1px solid var(--border-subtle)', flexShrink: 0 }}>
        {(['docs', 'files'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'flex-1 py-2 text-[11px] font-mono tracking-[0.04em] border-b-2 transition-colors',
              tab === t
                ? 'border-text text-text'
                : 'border-transparent text-text-dim hover:text-text-muted',
            )}
            style={{ background: 'none', fontFamily: 'inherit', cursor: 'pointer' }}
          >
            {t === 'docs'
              ? `DOCS${docs.length > 0 ? ` (${docs.length})` : ''}`
              : `ARCHIVOS${generatedFiles.length > 0 ? ` (${generatedFiles.length})` : ''}`}
          </button>
        ))}
      </div>

      {/* ── Documents tab ────────────────────────────────────────── */}
      {tab === 'docs' && (
        <>
          {/* Upload zone */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => !upload.isPending && inputRef.current?.click()}
            className={cn(
              'm-3 mb-1.5 border border-dashed border-border rounded-sm px-3 py-2.5',
              'text-[12px] text-text-dim text-center flex items-center justify-center gap-1.5',
              'transition-colors',
              !upload.isPending && 'cursor-pointer hover:border-accent hover:text-text-muted',
              upload.isPending && 'cursor-wait',
            )}
          >
            {upload.isPending ? (
              <>
                <span className="animate-spin-queai inline-block text-[13px]">⟳</span>
                <span>Subiendo...</span>
              </>
            ) : (
              'Arrastra o haz clic para subir'
            )}
            <input
              ref={inputRef}
              type="file"
              multiple
              className="hidden"
              accept=".pdf,.txt,.md,.docx,.xlsx,.csv"
              onChange={(e) => handleFiles(e.target.files)}
            />
          </div>

          {/* Document list */}
          <ul className="flex-1 overflow-y-auto px-2 pb-2 m-0 list-none">
            {isLoading && (
              <li className="text-[12px] text-text-dim px-2 py-2.5">Cargando...</li>
            )}
            {!isLoading && docs.length === 0 && (
              <li className="text-[12px] text-text-dim text-center px-2 py-6">
                Sin documentos.<br />
                <span className="opacity-60">Sube archivos para analizar.</span>
              </li>
            )}
            {docs.map((doc) => {
              const isDeleting = deletingId === doc.id
              return (
                <li
                  key={doc.id}
                  className={cn(
                    'group flex items-center gap-2 px-2 py-2 rounded-[8px] transition-colors',
                    !isDeleting && 'hover:bg-surface',
                    isDeleting && 'opacity-50',
                  )}
                >
                  <span className="text-[17px] shrink-0">{fileIcon(doc.filename)}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12.5px] text-text truncate" title={doc.filename}>
                      {doc.filename}
                    </p>
                    <p className="text-[10.5px] font-mono text-text-dim mt-px">
                      {fmtTokens(doc.token_count)}
                    </p>
                  </div>

                  {isDeleting ? (
                    <span className="animate-spin-queai text-[13px] text-text-dim shrink-0">⟳</span>
                  ) : (
                    <Button
                      variant="danger"
                      size="icon"
                      className="h-6 w-6 text-[11px] opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                      onClick={() => setPendingDelete({ id: doc.id, filename: doc.filename })}
                      title="Eliminar documento"
                    >
                      ✕
                    </Button>
                  )}
                </li>
              )
            })}
          </ul>
        </>
      )}

      {/* ── Generated files tab ──────────────────────────────────── */}
      {tab === 'files' && (
        <div className="flex-1 overflow-y-auto p-2">
          {generatedFiles.length === 0 && (
            <p className="text-[12px] text-text-dim text-center px-2 py-6">
              Los archivos generados por el agente<br />aparecerán aqui.
            </p>
          )}
          {generatedFiles.map((filename) => {
            const ext = filename.split('.').pop()?.toLowerCase() ?? ''
            const icon = ({ pdf: '📄', xlsx: '📊', md: '📋' } as Record<string, string>)[ext] ?? '📃'
            return (
              <div
                key={filename}
                className="flex items-center gap-2.5 px-2 py-2 rounded-[8px] cursor-pointer transition-colors hover:bg-surface"
                onClick={() => handleDownload(filename)}
                title={`Descargar ${filename}`}
              >
                <span className="text-[17px] shrink-0">{icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[12.5px] text-text truncate" title={filename}>
                    {filename}
                  </p>
                  <p className="text-[10.5px] font-mono text-text-dim mt-px">
                    {ext.toUpperCase()} · clic para descargar
                  </p>
                </div>
                <span className="text-[14px] text-text-dim shrink-0">↓</span>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Delete confirmation dialog ────────────────────────────── */}
      <Dialog open={!!pendingDelete} onOpenChange={(open) => { if (!open) setPendingDelete(null) }}>
        <DialogContent showClose={false}>
          <DialogHeader>
            <DialogTitle>Eliminar documento</DialogTitle>
          </DialogHeader>
          <p className="text-[13px] text-text-dim leading-relaxed">
            ¿Eliminar{' '}
            <span className="text-text font-medium">"{pendingDelete?.filename}"</span>?
            {' '}Esta accion no se puede deshacer.
          </p>
          <DialogFooter className="mt-5">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setPendingDelete(null)}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              onClick={confirmDelete}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
